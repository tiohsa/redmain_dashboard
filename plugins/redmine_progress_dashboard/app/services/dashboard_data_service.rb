class DashboardDataService
  def initialize(project, params = {})
    @project = project
    @params = params
    @issues_scope = filter_issues(Issue.visible.where(project_id: @project.self_and_descendants.pluck(:id)))
  end

  def kpi_summary
    issues = @issues_scope
    total_count = issues.count
    closed_count = issues.where(status_id: IssueStatus.where(is_closed: true)).count
    
    # 完了率 (Completion Rate)
    completion_rate = total_count > 0 ? (closed_count.to_f / total_count * 100).round(1) : 0

    # 遅延チケット数 (Delayed Tickets) - Open and due_date < today
    delayed_count = issues.open.where('due_date < ?', User.current.today).count

    # 平均リードタイム (Average Lead Time) - For closed issues: closed_on - created_on
    closed_issues = issues.where(status_id: IssueStatus.where(is_closed: true)).where.not(closed_on: nil)
    avg_lead_time = 0
    created_and_closed_on = closed_issues.pluck(:created_on, :closed_on)
    if created_and_closed_on.any?
      total_days = created_and_closed_on.sum do |created_on, closed_on|
        (closed_on.to_date - created_on.to_date).to_i
      end
      avg_lead_time = (total_days.to_f / created_and_closed_on.size).round(1)
    end

    # WIP数 (WIP Count) - Open issues
    wip_count = issues.open.count

    {
      completion_rate: completion_rate,
      delayed_count: delayed_count,
      avg_lead_time: avg_lead_time,
      wip_count: wip_count
    }
  end

  def burndown_chart
    # Determine date range
    start_date = @params[:start_date].present? ? Date.parse(@params[:start_date]) : 30.days.ago.to_date
    end_date = @params[:end_date].present? ? Date.parse(@params[:end_date]) : Date.today

    issues = @issues_scope
    
    # Pre-fetch needed data
    # We need creation date and closing date (if closed)
    data_points = issues.pluck(:id, :created_on, :closed_on, :status_id)
    
    # Calculate daily open count
    chart_data = []
    (start_date..end_date).each do |date|
      # Count issues created before or on date AND (not closed OR closed after date)
      open_count = data_points.count do |id, created_on, closed_on, status_id|
        created_on.to_date <= date && (closed_on.nil? || closed_on.to_date > date)
      end
      
      chart_data << {
        date: date.to_s,
        count: open_count
      }
    end

    {
      series: chart_data,
      ideal: [] # TODO: Calculate ideal line based on start/end scope
    }
  end

  def status_distribution
    start_date = @params[:start_date].present? ? Date.parse(@params[:start_date]) : 30.days.ago.to_date
    end_date = @params[:end_date].present? ? Date.parse(@params[:end_date]) : Date.today
    
    issues = @issues_scope
    issue_ids = issues.pluck(:id)
    
    # Current status map: issue_id -> status_id
    current_status_map = issues.pluck(:id, :status_id).to_h
    
    # Fetch relevant journals
    # prop_key = 'status_id'
    journals = Journal.joins(:details)
                      .where(journalized_type: 'Issue', journalized_id: issue_ids)
                      .where(journal_details: { prop_key: 'status_id' })
                      .select("journals.created_on, journals.journalized_id, journal_details.old_value, journal_details.value")
                      .order(created_on: :desc)
    
    # Group journals by date (YYYY-MM-DD)
    journals_by_date = journals.group_by { |j| j.created_on.to_date }
    
    # All statuses
    all_statuses = IssueStatus.all.pluck(:id, :name).to_h
    
    # Initialize history data
    history = []
    
    # Working map for replay
    status_map = current_status_map.dup
    
    # Iterate backwards
    (start_date..end_date).to_a.reverse.each do |date|
      # 1. Capture counts for this date
      counts = Hash.new(0)
      status_map.values.each { |sid| counts[sid] += 1 }
      
      history << {
        date: date.to_s,
        counts: counts
      }
      
      # 2. Reverse apply journals of this date (to get state at BEGINNING of next day / END of previous day)
      # Wait, backward logic:
      # Today (End of Day) status is `status_map`.
      # Changes that happened Today need to be reverted to get Yesterday (End of Day).
      # If Journal: Old -> New. We have New. We need Old.
      if journals_by_date[date]
        journals_by_date[date].each do |j|
          # Revert to old value
          # Assuming old_value is present. Redmine usually stores it.
          # Note: journal_details.value is the NEW value. old_value is the PREVIOUS value.
          # We are moving BACKWARDS. So if we see a change New -> Old, we invoke it.
          # Actually, we have current state. The journal says "Changed from A to B".
          # So currently it is B. We want to set it back to A.
          old_val = j.old_value.to_i
          # new_val = j.value.to_i
          
          # Only update if the map still has the 'new' value (to handle multiple changes in one day safely)
          # Actually for simplistic replay, just applying all changes in reverse chronological order (which we have from order desc) is correct.
          # But we grouped by date. Within date, they are DESC specific time.
          # So iteration order within date should be Latest -> Earliest.
          status_map[j.journalized_id] = old_val
        end
      end
    end
    
    # Transform for chart (Series per status)
    # history is reversed (Newest date first). Reverse back for API.
    history.reverse!
    
    series = all_statuses.map do |id, name|
      {
        name: name,
        data: history.map { |h| h[:counts][id] || 0 }
      }
    end
    
    {
      dates: history.map { |h| h[:date] },
      series: series
    }
  end

  def workload_analysis
    issues = @issues_scope.open # Typically workload is about OPEN issues
    
    # Group by assignee
    # Handle nil assignee (Unassigned)
    grouped = issues.group_by { |i| i.assigned_to }
    
    data = grouped.map do |user, user_issues|
      {
        name: user ? user.name : 'Unassigned',
        count: user_issues.count,
        estimated_hours: user_issues.sum { |i| i.estimated_hours || 0 }.round(1)
      }
    end.sort_by { |d| -d[:count] } # Sort by count desc
    
    {
      series: data
    }
  end

  def delay_analysis
    start_date = @params[:start_date].present? ? Date.parse(@params[:start_date]) : 30.days.ago.to_date
    end_date = @params[:end_date].present? ? Date.parse(@params[:end_date]) : Date.today
    
    issues = @issues_scope
    
    # Trend: Count of Delayed Issues over time
    # Delayed = Created <= Date AND (Open OR Closed > Date) AND DueDate < Date
    data_points = issues.where.not(due_date: nil).pluck(:created_on, :closed_on, :due_date)
    
    trend_data = []
    (start_date..end_date).each do |date|
      count = data_points.count do |created_on, closed_on, due_date|
        created_on.to_date <= date && 
        (closed_on.nil? || closed_on.to_date > date) && 
        due_date < date
      end
      trend_data << { date: date.to_s, count: count }
    end
    
    # Histograms
    open_issues = issues.open
    
    delay_days = open_issues.select { |i| i.due_date && i.due_date < Date.today }
                            .map { |i| (Date.today - i.due_date).to_i }
    
    stagnation_days = open_issues.map { |i| (Date.today - i.updated_on.to_date).to_i }
    
    {
      trend: trend_data,
      delay_histogram: histogram_buckets(delay_days),
      stagnation_histogram: histogram_buckets(stagnation_days)
    }
  end

  def issue_list
    @issues_scope.includes(:project, :status, :assigned_to).map do |i|
      {
        id: i.id,
        project_name: i.project.name,
        subject: i.subject,
        status: i.status.name,
        assigned_to: i.assigned_to ? i.assigned_to.name : '',
        due_date: i.due_date,
        delay_days: (i.due_date && i.due_date < Date.today) ? (Date.today - i.due_date).to_i : 0,
        stagnation_days: (Date.today - i.updated_on.to_date).to_i
      }
    end
  end

  def get_summary_data
    {
      kpis: kpi_summary,
      burndown: burndown_chart,
      status_distribution: status_distribution,
      workload: workload_analysis,
      delay_analysis: delay_analysis,
      issues: issue_list
    }
  end

  private

  def histogram_buckets(days_array)
    # 0-3, 4-7, 8-14, 15+
    buckets = { '0-3' => 0, '4-7' => 0, '8-14' => 0, '15+' => 0 }
    days_array.each do |d|
      if d <= 3
        buckets['0-3'] += 1
      elsif d <= 7
        buckets['4-7'] += 1
      elsif d <= 14
        buckets['8-14'] += 1
      else
        buckets['15+'] += 1
      end
    end
    buckets
  end

  def filter_issues(scope)
    # Filter by version if present
    if @params[:version_id].present?
      scope = scope.where(fixed_version_id: @params[:version_id])
    end
    # Filter by tracker if present
    if @params[:tracker_id].present?
      scope = scope.where(tracker_id: @params[:tracker_id])
    end
    # Filter by assignee if present
    if @params[:assigned_to_id].present?
      scope = scope.where(assigned_to_id: @params[:assigned_to_id])
    end
    scope
  end
end

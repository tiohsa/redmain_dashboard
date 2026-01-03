class DashboardDataService
  include Redmine::I18n
  def initialize(project, params = {})
    @project = project
    @params = params
    @issues_scope = filter_issues(Issue.visible.where(project_id: @project.self_and_descendants.pluck(:id)))
    @all_issues_scope = Issue.visible.where(project_id: @project.self_and_descendants.pluck(:id))
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

    # Throughput (Last 7 days)
    throughput = issues.where(status_id: IssueStatus.where(is_closed: true))
                       .where("#{Issue.table_name}.closed_on >= ?", 7.days.ago)
                       .count

    # Due Date Setting Rate (Open issues)
    open_issues = issues.open
    open_count = open_issues.count
    due_date_set_count = open_issues.where.not(due_date: nil).count
    due_date_rate = open_count > 0 ? (due_date_set_count.to_f / open_count * 100).round(1) : 0
    unset_due_date_count = open_count - due_date_set_count

    # Bottleneck Rate (Open issues not updated in last 7 days)
    stagnant_count = open_issues.where("#{Issue.table_name}.updated_on < ?", 7.days.ago).count
    bottleneck_rate = open_count > 0 ? (stagnant_count.to_f / open_count * 100).round(1) : 0

    # Assignee Concentration
    assignee_counts = open_issues.group(:assigned_to_id).count
    max_assignee_count = assignee_counts.values.max || 0
    concentration_high = false
    
    if open_count > 2
      # High if one person has > 50% of tasks OR > 5 tasks
      if (max_assignee_count.to_f / open_count > 0.5) || max_assignee_count > 5
        concentration_high = true
      end
    end

    {
      completion_rate: completion_rate,
      delayed_count: delayed_count,
      avg_lead_time: avg_lead_time,
      wip_count: wip_count,
      throughput: throughput,
      due_date_rate: due_date_rate,
      unset_due_date_count: unset_due_date_count,
      bottleneck_rate: bottleneck_rate,
      stagnant_count: stagnant_count,
      assignee_concentration: concentration_high ? 'High' : 'Normal',
      top_assignee_count: max_assignee_count
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
      ideal: calculate_ideal_line(chart_data, start_date, end_date)
    }
  end

  def calculate_ideal_line(chart_data, start_date, end_date)
    return [] if chart_data.empty?

    start_value = chart_data.first[:count].to_f
    total_days = (end_date - start_date).to_i
    
    return [] if total_days <= 0

    (start_date..end_date).map do |date|
      days_passed = (date - start_date).to_i
      ideal_value = start_value - (start_value * (days_passed.to_f / total_days))
      {
        date: date.to_s,
        count: [ideal_value, 0].max.round(1)
      }
    end
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
        name: user ? user.name : l(:label_unassigned),
        count: user_issues.count,
        estimated_hours: user_issues.sum { |i| i.estimated_hours || 0 }.round(1),
        spent_hours: user_issues.sum { |i| i.spent_hours || 0 }.round(1)
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


  def tracker_distribution
    issues = @issues_scope
    # Group by tracker name directly using SQL
    # This avoids the issue where group(:tracker) returns IDs instead of objects
    grouped = issues.joins(:tracker).group('trackers.name').count
    series = grouped.map do |name, count|
      {
        name: name,
        value: count
      }
    end.sort_by { |d| -d[:value] }

    { series: series }
  end

  def version_progress
    # Get versions shared with this project
    versions = @project.shared_versions.open
    
    data = versions.map do |version|
      # Calculate progress based on issues in the version
      # Redmine Version model has estimated_hours, spent_hours, etc.
      # Redmine Version model compatibility
      completed_rate = if version.respond_to?(:completed_percent)
                         version.completed_percent
                       elsif version.respond_to?(:completed_pourcent)
                         version.completed_pourcent
                       else
                         0
                       end

      est_hours = version.respond_to?(:estimated_hours) ? version.estimated_hours : 0
      sp_hours = version.respond_to?(:spent_hours) ? version.spent_hours : 0
      
      {
        id: version.id,
        name: version.name,
        status: version.status,
        due_date: version.effective_date,
        completed_rate: completed_rate,
        estimated_hours: est_hours || 0,
        spent_hours: sp_hours || 0
      }
    end.sort_by { |v| v[:due_date] || Date.today + 10.years }

    { versions: data }
  end

  def velocity
    # Calculate velocity (completed issues/points per week)
    # Default lookback 12 weeks
    start_date = 12.weeks.ago.beginning_of_week.to_date
    end_date = Date.today.end_of_week.to_date

    # Use @all_issues_scope to ignore current filters if we want general team velocity?
    # Or should we respect filters? Usually velocity is for the team/project regardless of current drill-down, 
    # but if the user filters by "Assignee A", they might want to see Assignee A's velocity.
    # Let's use @issues_scope to respect filters (e.g. subproject selection).
    
    closed_issues = @issues_scope.where(status_id: IssueStatus.where(is_closed: true))
                                 .where('closed_on >= ?', start_date)
    
    # Group by week
    grouped = closed_issues.group_by { |i| i.closed_on.to_date.beginning_of_week }
    
    series = (start_date..end_date).step(7).map do |date|
      week_issues = grouped[date] || []
      {
        week: date.strftime("%Y-%m-%d"),
        count: week_issues.count,
        points: week_issues.sum { |i| i.estimated_hours || 0 }.round(1)
      }
    end

    { series: series }
  end

  def priority_distribution
    issues = @issues_scope
    grouped = issues.joins(:priority).group('enumerations.name', 'enumerations.position').count
    series = grouped.map do |(name, position), count|
      {
        name: name,
        value: count,
        position: position
      }
    end.sort_by { |d| d[:position] }

    { series: series }
  end

  def cumulative_flow
    start_date = @params[:start_date].present? ? Date.parse(@params[:start_date]) : 30.days.ago.to_date
    end_date = @params[:end_date].present? ? Date.parse(@params[:end_date]) : Date.today

    issues = @issues_scope
    issue_ids = issues.pluck(:id)

    # Get all issue status changes from journals
    journals = Journal.joins(:details)
                      .where(journalized_type: 'Issue', journalized_id: issue_ids)
                      .where(journal_details: { prop_key: 'status_id' })
                      .select("journals.created_on, journals.journalized_id, journal_details.old_value, journal_details.value")
                      .order(created_on: :asc)

    # Current status per issue
    current_status_map = issues.pluck(:id, :status_id, :created_on).map { |id, sid, co| [id, { status_id: sid, created_on: co }] }.to_h
    all_statuses = IssueStatus.all.pluck(:id, :name).to_h

    # Build daily snapshots
    series = []
    (start_date..end_date).each do |date|
      status_counts = Hash.new(0)

      current_status_map.each do |issue_id, info|
        next if info[:created_on].to_date > date

        # Find the status as of this date
        status_id = info[:status_id]
        journals.select { |j| j.journalized_id == issue_id && j.created_on.to_date <= date }.each do |j|
          status_id = j.value.to_i
        end

        status_name = all_statuses[status_id] || 'Unknown'
        status_counts[status_name] += 1
      end

      series << {
        date: date.to_s,
        statuses: status_counts
      }
    end

    { series: series, status_names: all_statuses.values }
  end

  def cycle_time
    issues = @issues_scope.where(status_id: IssueStatus.where(is_closed: true))
    issue_ids = issues.pluck(:id)

    # Get all status change journals for closed issues
    journals = Journal.joins(:details)
                      .where(journalized_type: 'Issue', journalized_id: issue_ids)
                      .where(journal_details: { prop_key: 'status_id' })
                      .select("journals.created_on, journals.journalized_id, journal_details.old_value, journal_details.value")
                      .order(:journalized_id, :created_on)

    all_statuses = IssueStatus.all.pluck(:id, :name).to_h

    # Calculate time spent in each status
    status_durations = Hash.new { |h, k| h[k] = [] }

    issue_ids.each do |issue_id|
      issue = issues.find { |i| i.id == issue_id }
      next unless issue

      issue_journals = journals.select { |j| j.journalized_id == issue_id }

      # Track status transitions
      prev_status_id = nil
      prev_time = issue.created_on

      issue_journals.each do |j|
        current_time = j.created_on
        if prev_status_id
          days = ((current_time - prev_time) / 1.day).round(1)
          status_name = all_statuses[prev_status_id] || 'Unknown'
          status_durations[status_name] << days
        end
        prev_status_id = j.value.to_i
        prev_time = current_time
      end

      # Time in final status until closed
      if prev_status_id && issue.closed_on
        days = ((issue.closed_on - prev_time) / 1.day).round(1)
        status_name = all_statuses[prev_status_id] || 'Unknown'
        status_durations[status_name] << days
      end
    end

    # Calculate averages
    statuses = status_durations.map do |name, durations|
      {
        name: name,
        avg_days: durations.any? ? (durations.sum / durations.size).round(1) : 0,
        count: durations.size
      }
    end.sort_by { |s| -s[:avg_days] }

    { statuses: statuses }
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
      tracker_distribution: tracker_distribution,
      version_progress: version_progress,
      velocity: velocity,
      priority_distribution: priority_distribution,
      cumulative_flow: cumulative_flow,
      cycle_time: cycle_time,
      issues: issue_list,
      available_projects: available_projects,
      labels: {
        kpi: l(:label_kpi_summary),
        burndown: l(:label_burndown_chart),
        velocity: l(:label_velocity),
        status_dist: l(:label_status_distribution),
        tracker_dist: l(:label_tracker_distribution),
        workload: l(:label_workload),
        delay: l(:label_delay_analysis),
        version_progress: l(:label_version_progress),
        completion_rate: l(:label_completion_rate),
        delayed_tickets: l(:label_delayed_tickets),
        avg_lead_time: l(:label_avg_lead_time),
        wip_count: l(:label_wip_count),
        days: l(:label_days),
        tooltip_completion_rate: l(:tooltip_completion_rate),
        tooltip_delayed_tickets: l(:tooltip_delayed_tickets),
        tooltip_avg_lead_time: l(:tooltip_avg_lead_time),
        tooltip_wip_count: l(:tooltip_wip_count),
        tooltip_burndown_chart: l(:tooltip_burndown_chart),
        ideal_line: l(:label_ideal_line),
        tooltip_velocity: l(:tooltip_velocity),
        tooltip_version_progress: l(:tooltip_version_progress),
        tooltip_delay_analysis: l(:tooltip_delay_analysis),
        tooltip_tracker_dist: l(:tooltip_tracker_dist),
        tooltip_status_dist: l(:tooltip_status_dist),
        tooltip_workload: l(:tooltip_workload),
        priority_dist: l(:label_priority_distribution),
        cumulative_flow: l(:label_cumulative_flow),
        cycle_time: l(:label_cycle_time),
        tooltip_priority_dist: l(:tooltip_priority_dist),
        tooltip_cumulative_flow: l(:tooltip_cumulative_flow),
        tooltip_cycle_time: l(:tooltip_cycle_time),
        ai_analyze: l(:label_ai_analyze),
        display_settings: l(:label_display_settings),
        panel_display: l(:label_panel_display),
        select_all: l(:label_select_all),
        clear: l(:label_clear),
        loading: l(:label_loading_dashboard),
        error: l(:label_error_loading_data),
        ai_analysis_failed: l(:label_ai_analysis_failed),
        remaining_issues: l(:label_remaining_issues),
        ai_provider: l(:label_ai_provider),
        prompt: l(:label_prompt),
        generate: l(:label_generate),
        generating: l(:label_generating),
        analyzing: l(:label_analyzing),
        close: l(:label_close),
        label_throughput: l(:label_throughput),
        tooltip_throughput: l(:tooltip_throughput),
        label_due_date_rate: l(:label_due_date_rate),
        tooltip_due_date_rate: l(:tooltip_due_date_rate),
        label_bottleneck_rate: l(:label_bottleneck_rate),
        tooltip_bottleneck_rate: l(:tooltip_bottleneck_rate),
        label_assignee_concentration: l(:label_assignee_concentration),
        tooltip_assignee_concentration: l(:tooltip_assignee_concentration),
        text_items_per_week: l(:text_items_per_week),
        text_unset: l(:text_unset),
        text_stagnant_ratio: l(:text_stagnant_ratio),
        text_concentration_high: l(:text_concentration_high),
        label_issue_list: l(:label_issue_list),
        tooltip_issue_list: l(:tooltip_issue_list),
        download_html: l(:label_download_html)
      }
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

  def available_projects
    @project.self_and_descendants.order(:lft).pluck(:id, :name).map do |id, name|
      { id: id, name: name }
    end
  end

  def filter_issues(scope)
    # Filter by target_project_ids if present (for multi-project selection)
    if @params[:target_project_ids].present?
      ids = @params[:target_project_ids].map(&:to_i)
      scope = scope.where(project_id: ids)
    end

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

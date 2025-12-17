require_relative '../test_helper'

class DashboardDataServiceTest < ActiveSupport::TestCase
  fixtures :projects,
           :enabled_modules,
           :users,
           :roles,
           :members,
           :member_roles,
           :issue_statuses,
           :trackers,
           :issues

  def setup
    User.current = User.find(1) # admin
  end

  def teardown
    User.current = nil
  end

  def test_kpi_summary_does_not_raise_and_returns_expected_keys
    project = Project.find(1)
    service = DashboardDataService.new(project, {})

    summary = nil
    assert_nothing_raised do
      summary = service.kpi_summary
    end

    assert summary.key?(:completion_rate)
    assert summary.key?(:delayed_count)
    assert summary.key?(:avg_lead_time)
    assert summary.key?(:wip_count)
  end
end


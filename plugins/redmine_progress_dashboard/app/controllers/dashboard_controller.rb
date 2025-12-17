class DashboardController < ApplicationController
  unloadable if respond_to?(:unloadable)

  before_action :find_project, :authorize

  def index
    # Renders the SPA mount point
  end

  def data
    service = DashboardDataService.new(@project, params)
    render json: service.get_summary_data
  end

  private

  def find_project
    @project = Project.find(params[:project_id])
  rescue ActiveRecord::RecordNotFound
    render_404
  end
end

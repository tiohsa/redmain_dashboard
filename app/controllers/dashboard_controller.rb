class DashboardController < ApplicationController
  unloadable if respond_to?(:unloadable)

  before_action :find_project, :authorize

  def show
    render :index
  end

  def index
    show
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

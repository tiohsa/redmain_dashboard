class AiAnalysisController < ApplicationController
  before_action :find_project_by_project_id

  def analyze
    data = DashboardDataService.new(@project, params).get_summary_data
    analysis = LlmService.analyze(data)

    render json: { analysis: analysis }
  rescue => e
    Rails.logger.error("AI Analysis Error: #{e.message}\n#{e.backtrace.join("\n")}")
    render json: { analysis: 'AI分析に失敗しました。LLM設定（LLM_PROVIDER など）とRedmineログを確認してください。' }, status: 200
  end
end

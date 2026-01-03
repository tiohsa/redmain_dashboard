class AiAnalysisController < ApplicationController
  before_action :find_project_by_project_id

  def analyze
    data = DashboardDataService.new(@project, params).get_summary_data
    
    if params[:mode] == 'preview'
      prompt = LlmService.build_prompt(data)
      render json: { prompt: prompt, analysis: '' }
    else
      result = LlmService.analyze(
        data, 
        provider_type: params[:provider], 
        prompt_override: params[:prompt]
      )
      render json: result
    end
  rescue => e
    Rails.logger.error("AI Analysis Error: #{e.message}\n#{e.backtrace.join("\n")}")
    render json: { 
      analysis: l(:label_ai_analysis_failed),
      prompt: ''
    }, status: 200
  end
end

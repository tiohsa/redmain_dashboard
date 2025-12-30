class LlmService
  def self.analyze(data)
    prompt = build_prompt(data)
    provider = create_provider
    analysis = provider.analyze(prompt)
    { analysis: analysis, prompt: prompt }
  rescue StandardError => e
    Rails.logger.error("LLM Analysis Failed: #{e.class} #{e.message}\n#{e.backtrace.join("\n")}")
    { analysis: MockProvider.new.analyze(prompt), prompt: prompt }
  end

  private

  def self.create_provider
    provider_type = ENV['LLM_PROVIDER'] || 'mock'

    case provider_type.downcase
    when 'gemini'
      api_key = ENV['GEMINI_API_KEY']
      model = ENV['GEMINI_MODEL']
      return GeminiProvider.new(api_key, model: model) if api_key.present?
    when 'azure_openai'
      api_key = ENV['AZURE_OPENAI_API_KEY']
      endpoint = ENV['AZURE_OPENAI_ENDPOINT']
      deployment = ENV['AZURE_OPENAI_DEPLOYMENT_ID']
      return AzureOpenAiProvider.new(api_key, endpoint, deployment) if api_key.present? && endpoint.present? && deployment.present?
    end

    MockProvider.new
  end

  def self.build_prompt(data)
    kpis = data[:kpis]
    burndown = data[:burndown]
    issues = data[:issues]

    <<~PROMPT
      あなたはRedmineプロジェクトの進捗を分析するエキスパートです。
      以下のプロジェクトデータに基づいて、現在の進捗状況や課題、改善に向けたアドバイスを日本語で提供してください。
      回答はMarkdown形式で、要点を絞って出力してください。

      ### KPI
      - 完了率: #{kpis[:completion_rate]}%
      - 遅延チケット数: #{kpis[:delayed_count]}
      - 平均リードタイム: #{kpis[:avg_lead_time]} 日
      - 仕掛り(WIP): #{kpis[:wip_count]}

      ### バーンダウン推移 (直近5日)
      #{burndown[:series].last(5).map { |s| "- #{s[:date]}: 残り #{s[:count]}件" }.join("\n")}

      ### 直近の重要チケット (上位10件)
      #{issues.take(10).map { |i| "- ##{i[:id]} [#{i[:status]}] #{i[:subject]} (遅延: #{i[:delay_days]}日, 滞留: #{i[:stagnation_days]}日)" }.join("\n")}

      分析のポイント:
      1. 期限管理に問題はないか？
      2. プロセスの停滞（ボトルネック）はどこか？
      3. リソースの割り当てや優先度調整が必要な箇所は？
    PROMPT
  end
end

class LlmService
  def self.analyze(data, provider_type: nil, prompt_override: nil)
    Rails.logger.info "LLM Analysis called. Provider: #{provider_type || 'default'}. Key present: #{ENV['GEMINI_API_KEY'].present?}"
    prompt = prompt_override.presence || build_prompt(data)
    provider = create_provider(provider_type)
    analysis = provider.analyze(prompt)
    { analysis: analysis, prompt: prompt }
  rescue StandardError => e
    Rails.logger.error("LLM Analysis Failed: #{e.class} #{e.message}\n#{e.backtrace.join("\n")}")
    { analysis: MockProvider.new.analyze(prompt), prompt: prompt }
  end

  def self.build_prompt(data)
    kpis = data[:kpis]
    burndown = data[:burndown]
    issues = data[:issues]

    <<~PROMPT
      あなたはRedmineプロジェクトの進捗状況を整理し、
      **意思決定者向けの進捗報告レポート**を作成するエキスパートです。

      以下のプロジェクトデータに基づき、
      「現状」「問題点」「対応方針」を **要点のみに絞って** 日本語で出力してください。

      本レポートは、
      - 定例会議
      - 週次／月次進捗報告
      - 上長・ステークホルダー共有

      での利用を想定しています。

      詳細な背景説明・分析プロセス・理論解説は不要です。
      **1〜2分で全体像が把握できる簡潔さ**を最優先してください。

      回答は **Markdown形式** で、以下の出力フォーマットを厳守してください。

      ---

      ## 入力データ

      ### KPI
      - 完了率: #{kpis[:completion_rate]}%
      - 遅延チケット数: #{kpis[:delayed_count]}
      - 平均リードタイム: #{kpis[:avg_lead_time]} 日
      - 仕掛り(WIP): #{kpis[:wip_count]}
      - スループット(直近7日): #{kpis[:throughput]} 件
      - 期日設定率: #{kpis[:due_date_rate]}% (未設定: #{kpis[:unset_due_date_count]}件)
      - ボトルネック率: #{kpis[:bottleneck_rate]}% (滞留: #{kpis[:stagnant_count]}件)
      - 担当者集中度: #{kpis[:assignee_concentration]} (最多担当: #{kpis[:top_assignee_count]}件)

      ### バーンダウン推移 (直近5日)
      #{burndown[:series].last(5).map { |s| "- #{s[:date]}: 残り #{s[:count]}件" }.join("\n")}

      ### 直近の重要チケット (上位10件)
      #{issues.take(10).map { |i| "- ##{i[:id]} [#{i[:status]}] #{i[:subject]} (遅延: #{i[:delay_days]}日, 滞留: #{i[:stagnation_days]}日)" }.join("\n")}

      ---

      ## 出力フォーマット（厳守）

      ### 1. 進捗サマリー
      - 進捗状況: 【順調 / 注意 / 遅延】
      - 要約: 進捗状況を一文で端的に表現する

      ### 2. 注視すべきポイント（最大3点）
      ※ 数値・事実に基づいて簡潔に記載すること

      - ポイント①:
      - ポイント②:
      - ポイント③:

      ### 3. 主なリスク
      - リスク内容:
      - 想定される影響: （納期 / 品質 / 体制 / スコープ など）

      ### 4. 対応方針（次回報告まで）
      ※ 実行予定のもののみ記載すること（最大3件）

      - 対応①:
      - 対応②:
      - 対応③:

      ---

      ## 出力制約・注意事項

      - 全体で **400〜600文字程度**
      - 抽象論・精神論は禁止
      - 「問題 → 判断 → 行動」が読み取れる構成にする
      - 改善案は **Yes / No 判断が可能な具体度** で書く
      - PM・PL・上長がそのまま意思決定に使える内容とする
    PROMPT
  end

  private

  def self.create_provider(provider_type = nil)
    type = provider_type.presence || ENV['LLM_PROVIDER'] || 'mock'

    case type.downcase
    when 'gemini'
      api_key = ENV['GEMINI_API_KEY']
      model = ENV['GEMINI_MODEL']
      return GeminiProvider.new(api_key, model: model) if api_key.present?
    when 'azure_openai', 'azure'
      api_key = ENV['AZURE_OPENAI_API_KEY']
      endpoint = ENV['AZURE_OPENAI_ENDPOINT']
      deployment = ENV['AZURE_OPENAI_DEPLOYMENT']
      api_version = ENV['AZURE_OPENAI_API_VERSION']
      return AzureOpenAiProvider.new(api_key, endpoint, deployment, api_version) if api_key.present? && endpoint.present? && deployment.present?
    end

    MockProvider.new
  end
end

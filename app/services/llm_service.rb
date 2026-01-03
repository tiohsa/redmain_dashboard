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
      ### Role

      あなたは、RedmineやJiraのデータを分析し、**プロジェクト管理者（PM / PL / 管理責任者）が状況を即座に把握し、是正指示を出せる**レベルの
      **進捗報告レポート（Markdown）**を作成する、シニアプロジェクトマネージャーです。

      ### Task

      提供されたプロジェクトの生データ（KPI、チケットリスト、進捗推移）を元に、
      **プロジェクト管理者向けの進捗・問題点・是正判断に特化したMarkdownレポート**を作成してください。

      * HTMLは生成せず、**Markdownのみ**で出力してください
      * レポートは **7セクション（7スライド相当）**で構成してください

      ---

      ## Requirements (Content)

      ### 構成（7セクション）

      1. **Slide 1: 管理者向けサマリー**
         * 現在の進捗ステータス
         * 即時対応が必要かどうか（Yes / No）
         * 管理者判断が必要な論点

      2. **Slide 2: 主要KPI（管理指標）**
         * 進捗・負荷・流量の観点で重要なKPIのみ抽出
         * 管理上の危険信号を明示

      3. **Slide 3: 進捗推移と停滞検知**
         * バーンダウンの停滞・改善有無
         * 管理判断として「放置可能か／介入すべきか」を示す

      4. **Slide 4: ボトルネックと管理課題**
         * 担当者集中
         * 異常滞留チケット
         * プロセス上の問題点

      5. **Slide 5: 管理リスク評価**
         * スケジュール・品質・チーム運用リスク
         * 管理者視点での影響範囲

      6. **Slide 6: 是正案（管理アクション案）**
         * 管理者が指示すべき具体アクション
         * 即時対応／今週対応／継続対応の切り分け

      7. **Slide 7: 管理者への依頼・確認事項**
         * 判断・承認・指示が必要な事項
         * 次回確認ポイント

      ---

      ## 分析トーン（管理者向け）

      * 抽象論・精神論は禁止。**管理判断に必要な事実のみ**を記載
      * 各問題は必ず以下の形式で整理する
        * **Why（管理上の原因）**
        * **What（管理者が打つべき手）**
      * 管理上の優先度を以下で明示する
        * **Critical**：即介入が必要
        * **Warning**：監視＋準備
        * **Normal**：現状維持

      ---

      ## Requirements (Design & Format)

      ### 出力形式（Markdown）

      * 出力は **Markdownのみ**
      * 各セクションは `## Slide X: タイトル` の形式で出力
      * KPIは **Markdown表**
      * 管理アラートは以下の記法を使用：
        * `> [CRITICAL] 管理介入が必要な状態`
        * `> [WARNING] 監視強化が必要`
        * `> [INFO] 参考情報`

      ---

      ## Input Data

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

      ## Output Format（厳守）

      * **Markdownのみを出力**
      * 必ず **7セクション**で出力
      * 最後に以下のセクションを必須で含める：

      ```markdown
      ## 管理者判断事項（Action Required）
      - 判断事項1
      - 判断事項2
      ```
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

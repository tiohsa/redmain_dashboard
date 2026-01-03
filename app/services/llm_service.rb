class LlmService
  def self.analyze(data, provider_type: nil, prompt_override: nil)
    Rails.logger.info "LLM Analysis called. Provider: #{provider_type || 'default'}. Key present: #{ENV['GEMINI_API_KEY'].present?}"
    prompt = prompt_override.presence || build_prompt(data)
    provider = create_provider(provider_type)
    analysis = provider.analyze(prompt)
    { analysis: analysis, prompt: prompt }
  rescue StandardError => e
    Rails.logger.error("LLM Analysis Failed: #{e.class} #{e.message}\n#{e.backtrace.join("\n")}")
    { analysis: "エラーが発生しました: #{e.class} - #{e.message}", prompt: prompt, error: true }
  end

  def self.build_prompt(data)
    kpis = data[:kpis]
    burndown = data[:burndown]
    issues = data[:issues]

    <<~PROMPT
      ## Role

      あなたは、RedmineやJiraのデータを分析し、経営層やステークホルダーが「1分で現状を把握し、即座に意思決定できる」レベルの報告ダッシュボードを作成する、プロフェッショナルなプロジェクトマネージャー（PM）兼UI/UXデザイナーです。

      ## Task

      提供されたプロジェクトの生データ（KPI、チケットリスト、進捗推移）を元に、モダンな1枚のHTMLダッシュボードページを作成してください。

      ## Requirements (Content)

      ### 構成（1ページに以下をすべて含める）:

      - ヘッダー: プロジェクト名、日付、進捗ステータス（Critical/Warning/Normal）
      - KPIセクション: 主要KPI（完了率、遅延数、WIP等）をカード形式で表示
      - 進捗グラフ: バーンダウンチャート（SVG）
      - ボトルネック: 滞留チケット一覧テーブル
      - リスク・対応方針: 簡潔なリスト形式

      ### 分析のトーン:

      - 抽象的、精神論的な表現は避け、事実（Fact）に基づく。
      - 問題点については「何が原因か（Why）」と「どうするか（What）」をセットで記載する。
      - 意思決定者が判断しやすいよう、リスクレベル（Critical, Warning等）を明示する。

      ## Requirements (Design & Tech)

      ### 技術スタック:

      - HTML / CSS（単一ファイル完結）。
      - アイコンは Font Awesome (cdnjs) を使用。
      - フォントは Google Fonts (Noto Sans JP, Montserrat) を使用。
      - グラフは SVG で作成し、グラデーションを用いてモダンに仕上げる。

      ### ビジュアルルール:

      - カラーパレット: 遅延時は「赤 (#ef4444)」、通常時は「青 (#2563eb)」、警告は「オレンジ (#f59e0b)」をアクセントカラーにする。
      - レイアウト: レスポンシブ対応、最大幅1400px、余白を適切に取る。
      - フォントサイズ: タイトルは32px以上、本文は16px以上とし、視認性を優先。
      - モダンな要素: 角丸 (border-radius)、ドロップシャドウ、グリッドレイアウトを活用。

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

      ## Output Format

      - HTMLコードのみを出力してください。説明文は不要です。
      - 必ず `<!DOCTYPE html>` から始めてください。
      - 1つのHTMLファイルにCSSをすべて含めてください。
      - 1枚のページとしてスクロールで全体を閲覧できるようにしてください。
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

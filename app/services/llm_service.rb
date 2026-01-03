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
    locale = I18n.locale.to_s
    language_name = locale == 'ja' ? 'Japanese' : (locale == 'en' ? 'English' : locale)

    <<~PROMPT
      ## Role

      You are a professional Project Manager (PM) and UI/UX Designer who analyzes Redmine/Jira data to create executive-level dashboard reports that enable stakeholders to understand the current status in 1 minute and make immediate decisions.

      ## Task

      Based on the provided raw project data (KPIs, ticket list, progress trends), create a modern single-page HTML dashboard.

      ## Requirements (Content)

      ### Structure (include all on one page):

      - Header: Project name, date, status indicator (Critical/Warning/Normal)
      - KPI Section: Display key KPIs (completion rate, delays, WIP, etc.) as cards
      - Progress Chart: Burndown chart (SVG)
      - Bottlenecks: Table of stagnant tickets
      - Risks & Actions: Concise list format

      ### Analysis Tone:

      - Avoid abstract or philosophical expressions; base everything on facts.
      - For each issue, include both "Why (root cause)" and "What (action to take)".
      - Clearly indicate risk levels (Critical, Warning, etc.) to facilitate decision-making.

      ## Requirements (Design & Tech)

      ### Tech Stack:

      - HTML / CSS (single file, self-contained).
      - Use Font Awesome icons (cdnjs).
      - Use Google Fonts (Noto Sans JP, Montserrat).
      - Create charts using SVG with gradients for a modern look.

      ### Visual Rules:

      - Color Palette: Red (#ef4444) for delays, Blue (#2563eb) for normal, Orange (#f59e0b) for warnings.
      - Layout: Responsive design, max-width 1400px, appropriate margins.
      - Font Size: Titles 32px+, body text 16px+, prioritize readability.
      - Modern Elements: Use border-radius, drop shadows, and grid layout.

      ## Input Data

      ### KPI
      - Completion Rate: #{kpis[:completion_rate]}%
      - Delayed Tickets: #{kpis[:delayed_count]}
      - Average Lead Time: #{kpis[:avg_lead_time]} days
      - WIP (Work In Progress): #{kpis[:wip_count]}
      - Throughput (Last 7 days): #{kpis[:throughput]} tickets
      - Due Date Set Rate: #{kpis[:due_date_rate]}% (Unset: #{kpis[:unset_due_date_count]})
      - Bottleneck Rate: #{kpis[:bottleneck_rate]}% (Stagnant: #{kpis[:stagnant_count]})
      - Assignee Concentration: #{kpis[:assignee_concentration]} (Top assignee: #{kpis[:top_assignee_count]} tickets)

      ### Burndown Trend (Last 5 days)
      #{burndown[:series].last(5).map { |s| "- #{s[:date]}: #{s[:count]} remaining" }.join("\n")}

      ### Recent Important Tickets (Top 10)
      #{issues.take(10).map { |i| "- ##{i[:id]} [#{i[:status]}] #{i[:subject]} (Delay: #{i[:delay_days]}d, Stagnant: #{i[:stagnation_days]}d)" }.join("\n")}

      ## Output Format

      - Output HTML code only. No explanations needed.
      - Must start with `<!DOCTYPE html>`.
      - Include all CSS in a single HTML file.
      - Create a single scrollable page.
      - **IMPORTANT: All text content in the HTML must be in #{language_name}.**
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

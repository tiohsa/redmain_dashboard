class GeminiProvider < LlmProvider
  def initialize(api_key, model: nil)
    @api_key = api_key.to_s.strip
    @model = model.to_s.strip.presence || 'gemini-1.5-flash'
  end

  def analyze(prompt)
    if @api_key.blank?
      Rails.logger.error("Gemini API Key is blank!")
      raise "Gemini API Key is not configured."
    end

    url = "https://generativelanguage.googleapis.com/v1beta/models/#{@model}:generateContent?key=#{@api_key}"
    headers = { 'Content-Type' => 'application/json' }
    body = {
      contents: [{ parts: [{ text: prompt }] }]
    }

    response = post_request(url, headers, body)
    response.dig('candidates', 0, 'content', 'parts', 0, 'text')
  end
end

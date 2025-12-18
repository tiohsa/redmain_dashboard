class AzureOpenAiProvider < LlmProvider
  def initialize(api_key, endpoint, deployment_id)
    @api_key = api_key
    @endpoint = endpoint.chomp('/')
    @deployment_id = deployment_id
  end

  def analyze(prompt)
    url = "#{@endpoint}/openai/deployments/#{@deployment_id}/chat/completions?api-version=2024-02-15-preview"
    headers = {
      'Content-Type' => 'application/json',
      'api-key' => @api_key
    }
    body = {
      messages: [{ role: 'user', content: prompt }]
    }

    response = post_request(url, headers, body)
    response.dig('choices', 0, 'message', 'content')
  end
end

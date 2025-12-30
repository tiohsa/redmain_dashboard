require 'net/http'
require 'json'
require 'uri'

class LlmProvider
  def analyze(_prompt)
    raise NotImplementedError
  end

  protected

  def post_request(url, headers, body)
    uri = URI(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.scheme == 'https')
    http.open_timeout = 10
    http.read_timeout = 60

    request = Net::HTTP::Post.new(uri.request_uri, headers)
    request.body = body.to_json

    response = http.request(request)
    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error("LLM Provider Error: #{response.code} #{response.body}")
      raise "LLM API Error: #{response.code}"
    end

    JSON.parse(response.body)
  end
end

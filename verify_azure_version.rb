ENV['LLM_PROVIDER'] = 'azure'
ENV['AZURE_OPENAI_API_KEY'] = 'test_key'
ENV['AZURE_OPENAI_ENDPOINT'] = 'https://test.endpoint'
ENV['AZURE_OPENAI_DEPLOYMENT'] = 'test_deployment'
ENV['AZURE_OPENAI_API_VERSION'] = '2023-05-15'

begin
  provider = LlmService.send(:create_provider, 'azure')
  puts "Provider Class: #{provider.class}"
  puts "API Version: #{provider.instance_variable_get(:@api_version)}"

  # Test default version
  ENV['AZURE_OPENAI_API_VERSION'] = nil
  provider_default = LlmService.send(:create_provider, 'azure')
  puts "Default API Version: #{provider_default.instance_variable_get(:@api_version)}"
rescue => e
  puts "Error: #{e.message}"
  puts e.backtrace
end

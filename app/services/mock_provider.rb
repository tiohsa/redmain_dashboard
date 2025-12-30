class MockProvider < LlmProvider
  def analyze(_prompt)
    'LLM APIキーが設定されていないため、これはモックの回答です。プロジェクトの状態は概ね良好ですが、遅延チケットが数件見受けられます。'
  end
end

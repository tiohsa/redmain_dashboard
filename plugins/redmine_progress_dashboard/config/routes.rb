resources :projects do
  resource :dashboard, only: [:show], controller: 'dashboard' do
    get :data
    post :analyze, controller: 'ai_analysis'
  end
end

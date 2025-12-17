get 'projects/:project_id/dashboard', to: 'dashboard#index', as: 'project_dashboard'
get 'projects/:project_id/dashboard/data', to: 'dashboard#data', as: 'project_dashboard_data'

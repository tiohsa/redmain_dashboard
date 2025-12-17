require 'redmine'

Redmine::Plugin.register :redmine_progress_dashboard do
  name 'Redmine Progress Dashboard plugin'
  author 'Antigravity'
  description 'A plugin to visualize project progress, delays, and workload.'
  version '0.0.1'
  url 'http://example.com/path/to/plugin'
  author_url 'http://example.com/about'

  project_module :progress_dashboard do
    permission :view_dashboard, { dashboard: [:index, :data] }
  end

  menu :project_menu, :dashboard, { controller: 'dashboard', action: 'index' }, caption: 'Pro Dashboard', after: :activity, param: :project_id
end

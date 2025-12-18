require 'redmine'
require 'fileutils'

Redmine::Plugin.register :redmine_progress_dashboard do
  name 'Redmine Progress Dashboard plugin'
  author 'Antigravity'
  description 'A plugin to visualize project progress, delays, and workload.'
  version '0.0.1'
  url 'http://example.com/path/to/plugin'
  author_url 'http://example.com/about'

  project_module :progress_dashboard do
    permission :view_dashboard, { dashboard: [:show, :index, :data] }
  end

  menu :project_menu, :dashboard, { controller: 'dashboard', action: 'show' }, caption: 'Pro Dashboard', after: :activity, param: :project_id
end

if defined?(Rails) && Rails.respond_to?(:application)
  Rails.application.config.after_initialize do
    public_plugin_assets_dir = Rails.root.join('public', 'plugin_assets')
    FileUtils.mkdir_p(public_plugin_assets_dir)

    link_path = public_plugin_assets_dir.join('redmine_progress_dashboard')
    target_path = Rails.root.join('plugins', 'redmine_progress_dashboard', 'assets')

    next if link_path.exist?

    FileUtils.ln_sf(target_path.to_s, link_path.to_s)
  end
end

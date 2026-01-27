# Redmine Progress Dashboard Plugin

A Redmine plugin that aggregates and analyzes issue information to graphically visualize project progress, delay signals, and workload imbalances.

## Features

- **KPI Summary**: Completion rate, number of delayed issues, average lead time, and WIP count.
- **Burndown Chart**: Trends in the number of remaining issues.
- **Status Distribution (CFD)**: Cumulative flow diagram of issue status over time.
- **Person-wise Workload Analysis**: Number of issues and estimated hours per assignee.
- **Delay & Stagnation Analysis**: Delay trends, and histograms of delay/stagnation days.
- **Issue Detailed List**: Draggable and sortable panels with underlying detailed tables.
- **AI Project Analysis**: Project status analysis and advice using LLM (Supports Gemini / Azure OpenAI).
- **Multi-language Support**: Supports Japanese and English based on user settings.

## Requirements

- Redmine 5.x or later
- Node.js 18+ (for frontend build)

## Installation

1. Copy to the plugin directory:
   ```bash
   cp -r plugins/redmine_progress_dashboard /path/to/redmine/plugins/
   ```

2. Build the frontend:
   ```bash
   cd plugins/redmine_progress_dashboard/frontend
   npm install
   npm run build
   ```

3. Restart Redmine:
   ```bash
   docker compose restart redmine
   # or
   bundle exec rails server
   ```

4. The "Progress Dashboard" tab will appear in the project menu.

## AI Analysis Setup (Optional)

To use the AI-powered project analysis feature, the following environment variables need to be set. If not set, mock data will be displayed.

### LLM Provider Selection

Specify the provider using the `LLM_PROVIDER` environment variable.
- `gemini` (Default: Gemini 1.5 Flash)
- `azure_openai` (Azure OpenAI Service)

### Gemini Settings
- `GEMINI_API_KEY`: API key issued via Google AI Studio, etc.

### Azure OpenAI Settings
- `AZURE_OPENAI_API_KEY`: API key
- `AZURE_OPENAI_ENDPOINT`: Endpoint URL (e.g., `https://YOUR_RESOURCE.openai.azure.com/`)
- `AZURE_OPENAI_DEPLOYMENT`: Deployment name
- `AZURE_OPENAI_API_VERSION`: API Version (e.g., `2024-02-15-preview`)

### Docker Compose Example (`.env.local`)
Add the following to `.env.local` in your project root:
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_api_key_here
```
Then, restart the containers.

## Development

### Development Environment with Docker

```bash
docker compose up -d
```

Redmine is accessible at `http://localhost:3002`.

### Frontend Development

```bash
cd plugins/redmine_progress_dashboard/frontend
npm install
npm run dev  # Start development server
npm run build  # Production build
```

## Plugin Structure

```
plugins/redmine_progress_dashboard/
├── app/
│   ├── controllers/
│   │   └── dashboard_controller.rb
│   ├── services/
│   │   └── dashboard_data_service.rb
│   └── views/
│       └── dashboard/
│           └── index.html.erb
├── assets/
│   ├── javascripts/
│   │   └── dashboard.js (built)
│   └── stylesheets/
│       └── dashboard.css (built)
├── config/
│   ├── locales/
│   │   ├── en.yml
│   │   └── ja.yml
│   └── routes.rb
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── api/
│   ├── package.json
│   └── vite.config.ts
└── init.rb
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /projects/:id/dashboard` | Dashboard screen |
| `GET /projects/:id/dashboard/data` | JSON API (KPI, Burndown, CFD, etc.) |

### Query Parameters

- `version_id`: Filter by version
- `tracker_id`: Filter by tracker
- `assigned_to_id`: Filter by assignee
- `start_date`, `end_date`: Specify date range

## License

GNU General Public License v2.0 (GPLv2)

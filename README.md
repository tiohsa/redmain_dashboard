# Redmine Progress Dashboard Plugin

Redmine のチケット情報を集約・分析し、プロジェクトの進捗状況・遅延兆候・負荷偏重をグラフィカルに可視化するプラグインです。

## Features

- **KPI サマリ**: 完了率、遅延チケット数、平均リードタイム、WIP数
- **バーンダウンチャート**: 残チケット数の推移
- **ステータス分布 (CFD)**: ステータス別チケット数の積み上げ推移
- **担当者別負荷分析**: 担当者ごとのチケット数/予定工数
- **遅延・滞留分析**: 遅延トレンド、遅延日数/滞留日数のヒストグラム
- **チケット一覧表**: ドリルダウン可能な詳細テーブル

## Requirements

- Redmine 5.x 以降
- Node.js 18+ (フロントエンドビルド用)

## Installation

1. プラグインディレクトリにコピー:
   ```bash
   cp -r plugins/redmine_progress_dashboard /path/to/redmine/plugins/
   ```

2. フロントエンドのビルド:
   ```bash
   cd plugins/redmine_progress_dashboard/frontend
   npm install
   npm run build
   ```

3. Redmine を再起動:
   ```bash
   docker compose restart redmine
   # または
   bundle exec rails server
   ```

4. プロジェクトメニューに「Pro Dashboard」タブが表示されます。

## Development

### Docker を使用した開発環境

```bash
docker compose up -d
```

Redmine は `http://localhost:3002` でアクセス可能です。

### フロントエンドの開発

```bash
cd plugins/redmine_progress_dashboard/frontend
npm install
npm run dev  # 開発サーバー起動
npm run build  # 本番ビルド
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
| `GET /projects/:id/dashboard` | ダッシュボード画面 |
| `GET /projects/:id/dashboard/data` | JSON API (KPI, Burndown, CFD等) |

### Query Parameters

- `version_id`: バージョンでフィルタ
- `tracker_id`: トラッカーでフィルタ
- `assigned_to_id`: 担当者でフィルタ
- `start_date`, `end_date`: 期間指定

## License

MIT License

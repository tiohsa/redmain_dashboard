# Redmine Progress Dashboard Plugin

Redmine のチケット情報を集約・分析し、プロジェクトの進捗状況・遅延兆候・負荷偏重をグラフィカルに可視化するプラグインです。

## 主な機能

- **KPI サマリ**: 完了率、遅延チケット数、平均リードタイム、WIP数
- **バーンダウンチャート**: 残チケット数の推移
- **ステータス分布 (CFD)**: ステータス別チケット数の積み上げ推移
- **ベロシティ**: 週ごとの完了チケット数とポイントの推移
- **担当者別負荷分析**: 担当者ごとのチケット数/予定工数
- **チケット種別分布**: トラッカーごとのチケット比率
- **遅延・滞留分析**: 遅延トレンド、遅延日数/滞留日数のヒストグラム
- **バージョン進捗**: 各バージョンの完了率と期日
- **AI プロジェクト分析**: LLMによるプロジェクトの状態分析とアドバイス（Gemini / Azure OpenAI 対応）
- **多言語対応**: 日本語と言語の切り替えに対応（ユーザー設定に依存）

## 必要要件

- Redmine 5.x 以降
- Node.js 18+ (フロントエンドビルド用)

## インストール

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

4. プロジェクトメニューに「進捗ダッシュボード」タブが表示されます。

## AI 分析の設定 (任意)

AIによるプロジェクト分析機能を使用するには、以下の環境変数の設定が必要です。設定されていない場合はサンプルデータによる回答が表示されます。

### LLM プロバイダーの選択

`LLM_PROVIDER` 環境変数でプロバイダーを指定します。
- `gemini` (デフォルト: Gemini 1.5 Flash)
- `azure_openai` (Azure OpenAI Service)

### Gemini の設定
- `GEMINI_API_KEY`: Google AI Studio等で発行した API キー

### Azure OpenAI の設定
- `AZURE_OPENAI_API_KEY`: API キー
- `AZURE_OPENAI_ENDPOINT`: エンドポイント URL (例: `https://YOUR_RESOURCE.openai.azure.com/`)
- `AZURE_OPENAI_DEPLOYMENT`: デプロイメント名
- `AZURE_OPENAI_API_VERSION`: API バージョン (例: `2024-02-15-preview`)

### Docker Compose での設定例 (`.env.local`)
プロジェクトルートの `.env.local` に以下のように記述します：
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_api_key_here
```
その後、コンテナを再起動してください。

## 開発

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

## プラグインの構造

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
│   │   └── dashboard.js (ビルド済み)
│   └── stylesheets/
│       └── dashboard.css (ビルド済み)
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

## API エンドポイント

| エンドポイント | 説明 |
|----------|-------------|
| `GET /projects/:id/dashboard` | ダッシュボード画面 |
| `GET /projects/:id/dashboard/data` | JSON API (KPI, バーンダウン, CFD等) |

### クエリパラメータ

- `version_id`: バージョンでフィルタ
- `tracker_id`: トラッカーでフィルタ
- `assigned_to_id`: 担当者でフィルタ
- `start_date`, `end_date`: 期間指定

## ライセンス

GNU General Public License v2.0 (GPLv2)

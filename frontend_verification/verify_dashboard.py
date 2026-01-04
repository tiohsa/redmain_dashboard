from playwright.sync_api import sync_playwright, expect
import time

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock the dashboard data API
        page.route("**/projects/1/dashboard/data*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='''
            {
                "kpis": {
                    "completion_rate": 75.5,
                    "delayed_count": 5,
                    "avg_lead_time": 12.3,
                    "wip_count": 8,
                    "throughput": 15,
                    "due_date_rate": 80.0,
                    "unset_due_date_count": 2,
                    "bottleneck_rate": 10.0,
                    "stagnant_count": 3,
                    "assignee_concentration": "Normal",
                    "top_assignee_count": 3
                },
                "burndown": { "series": [], "ideal": [] },
                "status_distribution": { "dates": [], "series": [] },
                "workload": { "series": [] },
                "delay_analysis": { "trend": [], "delay_histogram": {}, "stagnation_histogram": {} },
                "tracker_distribution": { "series": [
                    { "name": "Bug", "value": 10 },
                    { "name": "Feature", "value": 20 }
                ] },
                "version_progress": { "versions": [] },
                "velocity": { "series": [] },
                "priority_distribution": { "series": [] },
                "cumulative_flow": { "series": [], "status_names": [] },
                "cycle_time": { "statuses": [] },
                "issues": [
                    {
                        "id": 1,
                        "project_name": "Test Project",
                        "subject": "Delayed Issue",
                        "status": "New",
                        "assigned_to": "User A",
                        "due_date": "2023-01-01",
                        "delay_days": 10,
                        "stagnation_days": 0
                    },
                    {
                        "id": 2,
                        "project_name": "Test Project",
                        "subject": "Normal Issue",
                        "status": "New",
                        "assigned_to": "User B",
                        "due_date": null,
                        "delay_days": 0,
                        "stagnation_days": 0
                    },
                    {
                        "id": 3,
                        "project_name": "Test Project",
                        "subject": "Stagnant Issue",
                        "status": "In Progress",
                        "assigned_to": "User C",
                        "due_date": null,
                        "delay_days": 0,
                        "stagnation_days": 10
                    }
                ],
                "available_projects": [
                    { "id": 1, "name": "Test Project" }
                ],
                "labels": {
                    "display_settings": "表示設定",
                    "panel_display": "パネル表示",
                    "select_all": "すべて選択",
                    "clear": "クリア",
                    "label_issue_list": "チケット一覧",
                    "issue_list": "チケット一覧",
                    "tooltip_issue_list": "プロジェクトのチケット一覧です。遅延や滞留しているチケットは強調表示されます。クリックすると詳細を開きます。",
                    "kpi": "KPIサマリー",
                    "burndown": "バーンダウンチャート",
                    "velocity": "ベロシティ",
                    "status_dist": "ステータス分布",
                    "tracker_dist": "チケット種別",
                    "workload": "稼働状況",
                    "delay": "遅延分析",
                    "version_progress": "バージョン進捗",
                    "priority_dist": "優先度分布",
                    "cumulative_flow": "累積フロー図",
                    "cycle_time": "サイクルタイム分析",
                    "tooltip_tracker_dist": "チケット種別ごとの分布を表示します。",
                    "tooltip_completion_rate": "完了率の説明",
                    "tooltip_delayed_tickets": "遅延チケットの説明",
                    "tooltip_avg_lead_time": "平均リードタイムの説明",
                    "tooltip_wip_count": "WIP数の説明",
                    "tooltip_throughput": "スループットの説明",
                    "tooltip_due_date_rate": "期日設定率の説明",
                    "tooltip_bottleneck_rate": "ボトルネック率の説明",
                    "tooltip_assignee_concentration": "担当者集中度の説明",
                    "completion_rate": "完了率",
                    "delayed_tickets": "遅延チケット",
                    "avg_lead_time": "平均リードタイム",
                    "wip_count": "WIP数",
                    "label_throughput": "スループット",
                    "label_due_date_rate": "期日設定率",
                    "label_bottleneck_rate": "ボトルネック率",
                    "label_assignee_concentration": "担当者集中度",
                    "text_items_per_week": "件/週",
                    "text_unset": "未設定",
                    "text_stagnant_ratio": "滞留チケット比率",
                    "text_concentration_high": "特定個人にタスク集中"
                }
            }
            '''
        ))

        # Navigate to the frontend (Vite default port 5173)
        page.goto("http://localhost:5173")

        # Wait for data to load
        page.wait_for_selector("text=チケット一覧", timeout=10000)

        # Verify "Ticket List" title is present
        expect(page.get_by_text("チケット一覧")).to_be_visible()

        # Verify all 3 tickets are shown (previously only delayed/stagnant were shown)
        expect(page.get_by_text("Delayed Issue")).to_be_visible()
        expect(page.get_by_text("Normal Issue")).to_be_visible() # This proves the filter is removed
        expect(page.get_by_text("Stagnant Issue")).to_be_visible()

        # Open settings menu to verify "Ticket List" is in the filter
        page.get_by_role("button", name="表示設定").click()

        # Verify "チケット一覧" is in the menu
        # It might be in a label.
        expect(page.locator("label").filter(has_text="チケット一覧")).to_be_visible()

        # Take screenshot of the settings menu and the ticket list
        page.screenshot(path="frontend_verification/dashboard_verified.png")
        print("Screenshot saved to frontend_verification/dashboard_verified.png")

        browser.close()

if __name__ == "__main__":
    verify_dashboard()

export interface KpiSummary {
    completion_rate: number;
    delayed_count: number;
    avg_lead_time: number;
    wip_count: number;
}

export interface BurndownData {
    series: { date: string; count: number }[];
    ideal: any[];
}

export interface StatusDistribution {
    dates: string[];
    series: { name: string; data: number[] }[];
}

export interface WorkloadData {
    series: { name: string; count: number; estimated_hours: number }[];
}

export interface DelayAnalysis {
    trend: { date: string; count: number }[];
    delay_histogram: Record<string, number>;
    stagnation_histogram: Record<string, number>;
}

export interface Issue {
    id: number;
    subject: string;
    status: string;
    assigned_to: string;
    due_date: string;
    delay_days: number;
    stagnation_days: number;
}

export interface DashboardData {
    kpis: KpiSummary;
    burndown: BurndownData;
    status_distribution: StatusDistribution;
    workload: WorkloadData;
    delay_analysis: DelayAnalysis;
    issues: Issue[];
}

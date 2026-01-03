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
    series: { name: string; count: number; estimated_hours: number; spent_hours: number }[];
}

export interface TrackerDistribution {
    series: { name: string; value: number }[];
}

export interface VersionProgress {
    versions: {
        id: number;
        name: string;
        status: string;
        due_date: string | null;
        completed_rate: number;
        estimated_hours: number;
        spent_hours: number;
    }[];
}

export interface Velocity {
    series: {
        week: string;
        count: number;
        points: number;
    }[];
}

export interface DelayAnalysis {
    trend: { date: string; count: number }[];
    delay_histogram: Record<string, number>;
    stagnation_histogram: Record<string, number>;
}

export interface Issue {
    id: number;
    project_name: string;
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
    tracker_distribution: TrackerDistribution;
    version_progress: VersionProgress;
    velocity: Velocity;
    priority_distribution: PriorityDistribution;
    cumulative_flow: CumulativeFlow;
    cycle_time: CycleTime;
    issues: Issue[];
    available_projects: { id: number; name: string }[];
    labels: Record<string, string>;
}

export interface PriorityDistribution {
    series: { name: string; value: number; position: number }[];
}

export interface CumulativeFlow {
    series: { date: string; statuses: Record<string, number> }[];
    status_names: string[];
}

export interface CycleTime {
    statuses: { name: string; avg_days: number; count: number }[];
}

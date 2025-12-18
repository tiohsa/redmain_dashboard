import { useEffect, useState } from 'react';
import { fetchDashboardData } from './api/dashboard';
import type { DashboardData } from './types';
import { KPICards } from './components/KPICards';
import { BurndownChart } from './components/BurndownChart';
import { StatusDistribution } from './components/StatusDistribution';
import { WorkloadChart } from './components/WorkloadChart';
import { DelayAnalysis } from './components/DelayAnalysis';
import { IssueTable } from './components/IssueTable';

interface Props {
  projectId: string;
}

function App({ projectId }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters] = useState({});

  useEffect(() => {
    fetchDashboardData(projectId, filters).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [projectId, filters]);

  if (loading) return <div>Loading dashboard data...</div>;
  if (!data) return <div>Error loading data. Check console.</div>;

  return (
    <div className="dashboard-container" style={{ padding: '1rem', fontFamily: 'Sans-Serif', background: '#f6f6f6' }}>
      <KPICards data={data.kpis} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <BurndownChart data={data.burndown} />
        <StatusDistribution data={data.status_distribution} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <WorkloadChart data={data.workload} />
        <DelayAnalysis data={data.delay_analysis} />
      </div>

      <IssueTable data={data.issues} />
    </div>
  );
}

export default App;

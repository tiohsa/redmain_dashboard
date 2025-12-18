import { useEffect, useState } from 'react';
import { fetchDashboardData } from './api/dashboard';
import type { DashboardData } from './types';
import { KPICards } from './components/KPICards';
import { BurndownChart } from './components/BurndownChart';
import { StatusDistribution } from './components/StatusDistribution';
import { WorkloadChart } from './components/WorkloadChart';
import { DelayAnalysis } from './components/DelayAnalysis';
import { IssueTable } from './components/IssueTable';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { analyzeDashboard } from './api/dashboard';

interface Props {
  projectId: string;
}

function App({ projectId }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsModalOpen(true);
    setAnalyzing(true);
    try {
      const result = await analyzeDashboard(projectId);
      setAnalysisText(result.analysis);
    } catch (error) {
      console.error(error);
      setAnalysisText('分析に失敗しました。詳細については管理者に問い合わせてください。');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(projectId, filters).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [projectId, filters]);

  if (loading) return <div>Loading dashboard data...</div>;
  if (!data) return <div>Error loading data. Check console.</div>;

  return (
    <div className="dashboard-container" style={{ padding: '1rem', fontFamily: 'Sans-Serif', background: '#f6f6f6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Project Progress Dashboard</h1>
        <button
          onClick={handleAnalyze}
          style={{
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>✨</span> AIで分析する
        </button>
      </div>

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

      <AiAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={analysisText}
        loading={analyzing}
      />
    </div>
  );
}

export default App;

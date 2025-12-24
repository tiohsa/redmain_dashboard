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
import { ProjectFilter } from './components/ProjectFilter';
import { analyzeDashboard } from './api/dashboard';

interface Props {
  projectId: string;
}

function App({ projectId }: Props) {
  const STORAGE_KEY = `dashboard_projects_${projectId}`;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from LocalStorage if available
  const [targetProjectIds, setTargetProjectIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Track if we have initialized from data (for first load case)
  const [isInitialized, setIsInitialized] = useState(() => !!localStorage.getItem(STORAGE_KEY));

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

  const handleProjectChange = (ids: number[]) => {
    setTargetProjectIds(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    setIsInitialized(true);
  };

  useEffect(() => {
    // If not initialized (no storage), do not pass target_project_ids to get default (All)
    // If initialized and empty, pass [-1] to show nothing (or handle as empty)
    // If initialized and has ids, pass them
    let params: any = {};
    if (isInitialized) {
      params.target_project_ids = targetProjectIds.length > 0 ? targetProjectIds : [-1];
    }

    fetchDashboardData(projectId, params).then(d => {
      setData(d);
      // Initialize selection on first load if not set
      if (!isInitialized && d.available_projects) {
        const allIds = d.available_projects.map(p => p.id);
        setTargetProjectIds(allIds);
        // Save default to storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
        // Mark as initialized so next changes trigger filter
        setIsInitialized(true);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [projectId, targetProjectIds, isInitialized]); // Depend on targetProjectIds to refetch on change

  if (loading) return <div>Loading dashboard data...</div>;
  if (!data) return <div>Error loading data. Check console.</div>;

  return (
    <div className="dashboard-container" style={{ padding: '1rem', fontFamily: 'Sans-Serif', background: '#f6f6f6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Project Progress Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {data.available_projects && (
            <ProjectFilter
              projects={data.available_projects}
              selectedIds={targetProjectIds}
              onChange={handleProjectChange}
            />
          )}
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

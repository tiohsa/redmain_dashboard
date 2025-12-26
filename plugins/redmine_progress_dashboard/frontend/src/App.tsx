import { useEffect, useState, type ReactNode } from 'react';
import { fetchDashboardData } from './api/dashboard';
import type { DashboardData } from './types';
import { KPICards } from './components/KPICards';
import { BurndownChart } from './components/BurndownChart';
import { StatusDistribution } from './components/StatusDistribution';
import { WorkloadChart } from './components/WorkloadChart';
import { DelayAnalysis } from './components/DelayAnalysis';
import { TrackerPieChart } from './components/TrackerPieChart';
import { VersionProgressList } from './components/VersionProgressList';
import { VelocityChart } from './components/VelocityChart';

import { AiAnalysisModal } from './components/AiAnalysisModal';
import { ProjectFilter } from './components/ProjectFilter';
import { analyzeDashboard } from './api/dashboard';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  projectId: string;
}

interface SortableItemProps {
  id: string;
  children: ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

const DEFAULT_PANEL_ORDER = [
  'kpi',
  'burndown',
  'velocity',
  'status_dist',
  'tracker_dist',
  'workload',
  'delay',
  'version_progress',
];

function App({ projectId }: Props) {
  const STORAGE_KEY = `dashboard_projects_${projectId}`;
  const LAYOUT_STORAGE_KEY = `dashboard_panel_order_${projectId}_v1`;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [panelOrder, setPanelOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PANEL_ORDER;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPanelOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  // Initialize from LocalStorage if available
  const [targetProjectIds, setTargetProjectIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Track if we have initialized from data (for first load case)
  const [isInitialized, setIsInitialized] = useState(() => !!localStorage.getItem(STORAGE_KEY));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [promptContent, setPromptContent] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsModalOpen(true);
    setAnalyzing(true);
    try {
      const result = await analyzeDashboard(projectId);
      setAnalysisText(result.analysis);
      setPromptContent(result.prompt);
    } catch (error) {
      console.error(error);
      setAnalysisText('分析に失敗しました。詳細については管理者に問い合わせてください。');
      setPromptContent(null);
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
    const params: { target_project_ids?: number[] } = {};
    if (isInitialized) {
      params.target_project_ids = targetProjectIds.length > 0 ? targetProjectIds : [-1];
    }

    fetchDashboardData(projectId, params).then(d => {
      setData(d);
      if (!isInitialized && d.available_projects) {
        const allIds = d.available_projects.map(p => p.id);
        setTargetProjectIds(allIds);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
        setIsInitialized(true);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [projectId, targetProjectIds, isInitialized, STORAGE_KEY]);

  if (loading) return <div>Loading dashboard data...</div>;
  if (!data) return <div>Error loading data. Check console.</div>;

  const panelComponents: Record<string, ReactNode> = {
    kpi: <KPICards data={data.kpis} />,
    burndown: <BurndownChart data={data.burndown} />,
    velocity: <VelocityChart data={data.velocity} />,
    status_dist: <StatusDistribution data={data.status_distribution} />,
    tracker_dist: <TrackerPieChart data={data.tracker_distribution} />,
    workload: <WorkloadChart data={data.workload} />,
    delay: <DelayAnalysis data={data.delay_analysis} />,
    version_progress: <VersionProgressList data={data.version_progress} />,
  };

  return (
    <div className="dashboard-container" style={{ padding: '1rem', fontFamily: 'Sans-Serif', background: '#f6f6f6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
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
              gap: '8px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <span>✨</span> AIで分析する
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={panelOrder} strategy={rectSortingStrategy}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {panelOrder.map((panelId) => (
              <SortableItem key={panelId} id={panelId}>
                {panelComponents[panelId]}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AiAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={analysisText}
        prompt={promptContent}
        loading={analyzing}
      />
    </div>
  );
}
export default App;

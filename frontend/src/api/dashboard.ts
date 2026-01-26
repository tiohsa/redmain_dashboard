import axios from 'axios';
import { getApiUrl } from '../utils/url';
import type { DashboardData } from '../types';

export const fetchDashboardData = async (projectId: string, filters?: any): Promise<DashboardData> => {
    // Remove leading slash to utilize axios.defaults.baseURL set in main.tsx
    const response = await axios.get(`projects/${projectId}/dashboard/data`, { params: filters });
    return response.data;
};

export const analyzeDashboard = async (projectId: string, options?: { mode?: 'preview', provider?: string, prompt?: string, target_project_ids?: number[] }): Promise<{ analysis: string; prompt: string }> => {
    const response = await fetch(getApiUrl(`projects/${projectId}/dashboard/analyze`), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        },
        body: JSON.stringify(options || {})
    });
    if (!response.ok) throw new Error('AI analysis failed');
    return response.json();
};

import axios from 'axios';
import type { DashboardData } from '../types';

export const fetchDashboardData = async (projectId: string, filters?: any): Promise<DashboardData> => {
    const response = await axios.get(`/projects/${projectId}/dashboard/data`, { params: filters });
    return response.data;
};

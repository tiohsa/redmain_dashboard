import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { WorkloadData } from '../types';

interface Props {
    data: WorkloadData;
}

export const WorkloadChart: React.FC<Props> = ({ data }) => {
    const [metric, setMetric] = useState<'count' | 'estimated_hours'>('count');

    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Workload Analysis</h3>
                <select value={metric} onChange={(e) => setMetric(e.target.value as any)}>
                    <option value="count">Issue Count</option>
                    <option value="estimated_hours">Estimated Hours</option>
                </select>
            </div>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data.series} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={metric} fill="#82ca9d" name={metric === 'count' ? 'Issues' : 'Hours'} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

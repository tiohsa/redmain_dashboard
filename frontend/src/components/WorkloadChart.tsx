import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { WorkloadData } from '../types';

import { InfoTooltip } from './InfoTooltip';

interface Props {
    data: WorkloadData;
    labels: Record<string, string>;
}

export const WorkloadChart: React.FC<Props> = ({ data, labels }) => {
    const [mode, setMode] = useState<'count' | 'hours'>('count');

    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center' }}>
                    {labels.workload}
                    <InfoTooltip text={labels.tooltip_workload || labels.workload} />
                </h3>
                <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
                    <option value="count">{labels.issue_count || 'Issue Count'}</option>
                    <option value="hours">{labels.hours || 'Hours (Est vs Spent)'}</option>
                </select>
            </div>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data.series} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    {mode === 'count' ? (
                        <Bar dataKey="count" fill="#8884d8" name={labels.issue_count || 'Issue Count'} />
                    ) : (
                        <>
                            <Bar dataKey="estimated_hours" fill="#82ca9d" name={labels.estimated_hours || 'Estimated Hours'} />
                            <Bar dataKey="spent_hours" fill="#ffc658" name={labels.spent_hours || 'Spent Hours'} />
                        </>
                    )}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { InfoTooltip } from './InfoTooltip';

interface priorityItem {
    name: string;
    value: number;
    position: number;
    [key: string]: string | number;
}

interface Props {
    data: { series: priorityItem[] };
    labels: Record<string, string>;
}

const PRIORITY_COLORS = ['#f44336', '#ff9800', '#2196f3', '#4caf50', '#9e9e9e'];

export const PriorityChart: React.FC<Props> = ({ data, labels }) => {
    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
                {labels.priority_dist}
                <InfoTooltip text={labels.tooltip_priority_dist || labels.priority_dist} />
            </h3>
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={data.series}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.series.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

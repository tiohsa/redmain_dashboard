import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { InfoTooltip } from './InfoTooltip';

interface StatusTime {
    name: string;
    avg_days: number;
    count: number;
}

interface Props {
    data: { statuses: StatusTime[] };
    labels: Record<string, string>;
}

const BAR_COLORS = ['#f44336', '#ff9800', '#ffc107', '#4caf50', '#2196f3', '#9c27b0', '#607d8b'];

export const CycleTimeChart: React.FC<Props> = ({ data, labels }) => {
    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
                {labels.cycle_time}
                <InfoTooltip text={labels.tooltip_cycle_time || labels.cycle_time} />
            </h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data.statuses} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" unit="日" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip
                        formatter={(value) => [
                            `${value ?? 0}日`,
                            '平均滞在時間'
                        ]}
                    />
                    <Legend />
                    <Bar dataKey="avg_days" name="平均滞在日数">
                        {data.statuses.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

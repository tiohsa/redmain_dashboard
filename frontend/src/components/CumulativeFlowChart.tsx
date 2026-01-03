import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { InfoTooltip } from './InfoTooltip';

interface StatusCount {
    [key: string]: number;
}

interface DataPoint {
    date: string;
    statuses: StatusCount;
}

interface Props {
    data: { series: DataPoint[]; status_names: string[] };
    labels: Record<string, string>;
}

const STATUS_COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#795548', '#607d8b'];

export const CumulativeFlowChart: React.FC<Props> = ({ data, labels }) => {
    // Transform data for stacked area chart
    const chartData = data.series.map(point => ({
        date: point.date,
        ...point.statuses
    }));

    // Get all unique status names
    const statusNames = data.status_names || Object.keys(data.series[0]?.statuses || {});

    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
                {labels.cumulative_flow}
                <InfoTooltip text={labels.tooltip_cumulative_flow || labels.cumulative_flow} />
            </h3>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {statusNames.map((status, index) => (
                        <Area
                            key={status}
                            type="monotone"
                            dataKey={status}
                            stackId="1"
                            stroke={STATUS_COLORS[index % STATUS_COLORS.length]}
                            fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

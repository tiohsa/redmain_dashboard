import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { StatusDistribution as StatusData } from '../types';

import { InfoTooltip } from './InfoTooltip';

interface Props {
    data: StatusData;
}

export const StatusDistribution: React.FC<Props> = ({ data }) => {
    // Transform API data to Recharts format
    // API: { dates: [d1, d2], series: [{name: S1, data: [1,2]}, {name: S2, data: [3,4]}] }
    // Recharts: [{date: d1, S1: 1, S2: 3}, {date: d2, S1: 2, S2: 4}]

    const chartData = data.dates.map((date, index) => {
        const entry: any = { date };
        data.series.forEach(s => {
            entry[s.name] = s.data[index];
        });
        return entry;
    });

    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57"];

    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
                Status Distribution (CFD)
                <InfoTooltip text="ステータスごとのチケット数の推移（累積フロー図）を表示します。プロセスの停滞やボトルネックの特定に役立ちます。" />
            </h3>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {data.series.map((s, i) => (
                        <Area
                            key={s.name}
                            type="monotone"
                            dataKey={s.name}
                            stackId="1"
                            stroke={colors[i % colors.length]}
                            fill={colors[i % colors.length]}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

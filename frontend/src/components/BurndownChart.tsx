import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { BurndownData } from '../types';

import { InfoTooltip } from './InfoTooltip';

interface Props {
    data: BurndownData;
    labels: Record<string, string>;
}

export const BurndownChart: React.FC<Props> = ({ data, labels }) => {
    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
                {labels.burndown}
                <InfoTooltip text={labels.tooltip_burndown_chart} />
            </h3>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" data={data.ideal} stroke="#82ca9d" strokeDasharray="5 5" name={labels.ideal_line} dot={false} />
                    <Line type="monotone" dataKey="count" data={data.series} stroke="#8884d8" name={labels.remaining_issues} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

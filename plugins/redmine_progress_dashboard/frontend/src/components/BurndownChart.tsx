import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { BurndownData } from '../types';

import { InfoTooltip } from './InfoTooltip';

interface Props {
    data: BurndownData;
}

export const BurndownChart: React.FC<Props> = ({ data }) => {
    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
                Burndown Chart
                <InfoTooltip text="プロジェクトの残チケット数の推移を表示します。理想線と比較して進捗の遅れを確認できます。" />
            </h3>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="Remaining Issues" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

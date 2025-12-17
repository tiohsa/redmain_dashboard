import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { BurndownData } from '../types';

interface Props {
    data: BurndownData;
}

export const BurndownChart: React.FC<Props> = ({ data }) => {
    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Burndown Chart</h3>
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

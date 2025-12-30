import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { Velocity } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface Props {
    data: Velocity;
    labels: Record<string, string>;
}

export const VelocityChart: React.FC<Props> = ({ data, labels }) => {
    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
                {labels.velocity}
                <InfoTooltip text={labels.tooltip_velocity || labels.velocity} />
            </h3>
            <ResponsiveContainer width="100%" height="90%">
                <ComposedChart data={data.series}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name={labels.completed_tickets || 'Completed Tickets'} fill="#8884d8" barSize={20} />
                    <Line yAxisId="right" type="monotone" dataKey="points" name={labels.completed_points || 'Completed Points (Hours)'} stroke="#82ca9d" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

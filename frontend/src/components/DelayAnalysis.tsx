import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { DelayAnalysis as DelayData } from '../types';

import { InfoTooltip } from './InfoTooltip';

interface Props {
    data: DelayData;
    labels: Record<string, string>;
}

export const DelayAnalysis: React.FC<Props> = ({ data, labels }) => {
    // Transform histograms
    const delayHistData = Object.entries(data.delay_histogram).map(([key, value]) => ({ range: key, count: value }));
    const stagHistData = Object.entries(data.stagnation_histogram).map(([key, value]) => ({ range: key, count: value }));

    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
                {labels.delay}
                <InfoTooltip text={labels.tooltip_delay_analysis || labels.delay} />
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', height: '100%' }}>
                {/* Trend */}
                <div style={{ height: '80%' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{labels.delay_trend || 'Delay Trend'}</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.trend}>
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#ff0000" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Delay Hist */}
                <div style={{ height: '80%' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{labels.delay_days || 'Delay Days'}</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={delayHistData}>
                            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#ff8042" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Stagnation Hist */}
                <div style={{ height: '80%' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{labels.stagnation_days || 'Stagnation Days'}</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stagHistData}>
                            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

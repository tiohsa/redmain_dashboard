import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { DelayAnalysis as DelayData } from '../types';

import { InfoTooltip } from './InfoTooltip';

interface Props {
    data: DelayData;
}

export const DelayAnalysis: React.FC<Props> = ({ data }) => {
    // Transform histograms
    const delayHistData = Object.entries(data.delay_histogram).map(([key, value]) => ({ range: key, count: value }));
    const stagHistData = Object.entries(data.stagnation_histogram).map(([key, value]) => ({ range: key, count: value }));

    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
                Delay & Stagnation
                <InfoTooltip text="期限超過のトレンド、および遅延・滞留の分布を表示します。遅延件数が減少傾向で、遅延日数が短いほど健全です。右肩上がりの場合は改善が必要です。" />
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', height: '100%' }}>
                {/* Trend */}
                <div style={{ height: '80%' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '5px' }}>Delay Trend</h4>
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
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '5px' }}>Delay Days</h4>
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
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '5px' }}>Stagnation Days</h4>
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

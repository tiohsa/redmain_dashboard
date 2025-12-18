import React from 'react';
import type { KpiSummary } from '../types';

import { InfoTooltip } from './InfoTooltip';

interface Props {
    data: KpiSummary;
}

export const KPICards: React.FC<Props> = ({ data }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card" style={cardStyle}>
                <h3 style={cardTitleStyle}>
                    Completion Rate
                    <InfoTooltip text="全チケットのうち終了したチケットの割合です。" />
                </h3>
                <p style={valueStyle}>{data.completion_rate}%</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3 style={cardTitleStyle}>
                    Delayed Tickets
                    <InfoTooltip text="期日を過ぎても完了していないチケットの数です。" />
                </h3>
                <p style={{ ...valueStyle, color: data.delayed_count > 0 ? 'red' : 'green' }}>{data.delayed_count}</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3 style={cardTitleStyle}>
                    Avg Lead Time
                    <InfoTooltip text="チケット作成から完了までにかかる平均的な日数です。" />
                </h3>
                <p style={valueStyle}>{data.avg_lead_time} days</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3 style={cardTitleStyle}>
                    WIP Count
                    <InfoTooltip text="現在進行中（着手済みかつ未完了）のチケット数です。" />
                </h3>
                <p style={valueStyle}>{data.wip_count}</p>
            </div>
        </div>
    );
};

const cardTitleStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 0 10px 0',
    fontSize: '1rem',
};

const cardStyle = {
    background: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
};

const valueStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0.5rem 0',
};

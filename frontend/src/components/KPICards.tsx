import React from 'react';
import type { KpiSummary } from '../types';

import { InfoTooltip } from './InfoTooltip';

interface Props {
    data: KpiSummary;
    labels: Record<string, string>;
}

export const KPICards: React.FC<Props> = ({ data, labels }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card" style={cardStyle}>
                <h3 style={cardTitleStyle}>
                    {labels.completion_rate}
                    <InfoTooltip position="bottom" text={labels.tooltip_completion_rate} />
                </h3>
                <p style={valueStyle}>{data.completion_rate}%</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3 style={cardTitleStyle}>
                    {labels.delayed_tickets}
                    <InfoTooltip position="bottom" text={labels.tooltip_delayed_tickets} />
                </h3>
                <p style={{ ...valueStyle, color: data.delayed_count > 0 ? 'red' : 'green' }}>{data.delayed_count}</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3 style={cardTitleStyle}>
                    {labels.avg_lead_time}
                    <InfoTooltip position="bottom" text={labels.tooltip_avg_lead_time} />
                </h3>
                <p style={valueStyle}>{data.avg_lead_time} {labels.days}</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3 style={cardTitleStyle}>
                    {labels.wip_count}
                    <InfoTooltip position="bottom" text={labels.tooltip_wip_count} />
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

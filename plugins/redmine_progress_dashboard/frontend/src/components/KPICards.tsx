import React from 'react';
import type { KpiSummary } from '../types';

interface Props {
    data: KpiSummary;
}

export const KPICards: React.FC<Props> = ({ data }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card" style={cardStyle}>
                <h3>Completion Rate</h3>
                <p style={valueStyle}>{data.completion_rate}%</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3>Delayed Tickets</h3>
                <p style={{ ...valueStyle, color: data.delayed_count > 0 ? 'red' : 'green' }}>{data.delayed_count}</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3>Avg Lead Time</h3>
                <p style={valueStyle}>{data.avg_lead_time} days</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3>WIP Count</h3>
                <p style={valueStyle}>{data.wip_count}</p>
            </div>
        </div>
    );
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

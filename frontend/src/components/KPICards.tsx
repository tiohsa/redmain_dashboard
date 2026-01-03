import React from 'react';
import type { KpiSummary } from '../types';

import { InfoTooltip } from './InfoTooltip';

interface Props {
    data: KpiSummary;
    labels: Record<string, string>;
}

const cardTitleStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 0 10px 0',
    fontSize: '0.9rem',
    color: '#666',
};

const cardStyle = {
    background: '#fff',
    padding: '1.25rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    minHeight: '140px',
    position: 'relative' as const,
};

const iconContainerStyle = {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
};

const valueStyle = {
    fontSize: '2.25rem',
    fontWeight: '800',
    margin: '0.5rem 0',
    color: '#1a202c',
    lineHeight: '1.2',
};

const subTextStyle = {
    fontSize: '0.8rem',
    color: '#718096',
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
};

export const KPICards: React.FC<Props> = ({ data, labels }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Row 1 */}
            <div className="card" style={cardStyle}>
                <div style={iconContainerStyle}>
                    <InfoTooltip position="bottom" text={labels.tooltip_completion_rate} />
                </div>
                <h3 style={cardTitleStyle}>
                    {labels.completion_rate}
                </h3>
                <div>
                    <p style={valueStyle}>{data.completion_rate}%</p>
                </div>
            </div>
            <div className="card" style={cardStyle}>
                <div style={iconContainerStyle}>
                    <InfoTooltip position="bottom" text={labels.tooltip_delayed_tickets} />
                </div>
                <h3 style={cardTitleStyle}>
                    {labels.delayed_tickets}
                </h3>
                <div>
                    <p style={{ ...valueStyle, color: data.delayed_count > 0 ? '#e53e3e' : '#38a169' }}>
                        {data.delayed_count}
                    </p>
                </div>
            </div>
            <div className="card" style={cardStyle}>
                <div style={iconContainerStyle}>
                    <InfoTooltip position="bottom" text={labels.tooltip_avg_lead_time} />
                </div>
                <h3 style={cardTitleStyle}>
                    {labels.avg_lead_time}
                </h3>
                <div>
                    <p style={valueStyle}>
                        {data.avg_lead_time}
                        <span style={{ fontSize: '1rem', fontWeight: 'normal', marginLeft: '4px', color: '#718096' }}>{labels.days}</span>
                    </p>
                </div>
            </div>
            <div className="card" style={cardStyle}>
                <div style={iconContainerStyle}>
                    <InfoTooltip position="bottom" text={labels.tooltip_wip_count} />
                </div>
                <h3 style={cardTitleStyle}>
                    {labels.wip_count}
                </h3>
                <div>
                    <p style={valueStyle}>{data.wip_count}</p>
                </div>
            </div>

            {/* Row 2 */}
            <div className="card" style={cardStyle}>
                <div style={iconContainerStyle}>
                    <InfoTooltip position="bottom" text={labels.tooltip_throughput} />
                </div>
                <h3 style={cardTitleStyle}>
                    {labels.label_throughput}
                </h3>
                <div>
                    <p style={valueStyle}>
                        {data.throughput}
                        <span style={{ fontSize: '1rem', fontWeight: 'normal', marginLeft: '4px', color: '#718096' }}>{labels.text_items_per_week}</span>
                    </p>
                    {data.throughput === 0 && (
                        <p style={{ ...subTextStyle, color: '#e53e3e', fontWeight: 'bold' }}>
                            📉 {labels.tooltip_throughput ? labels.tooltip_throughput.split('。')[0] : ''}
                        </p>
                    )}
                </div>
            </div>
            <div className="card" style={cardStyle}>
                <div style={iconContainerStyle}>
                    <InfoTooltip position="bottom" text={labels.tooltip_due_date_rate} />
                </div>
                <h3 style={cardTitleStyle}>
                    {labels.label_due_date_rate}
                </h3>
                <div>
                    <p style={valueStyle}>{data.due_date_rate}%</p>
                    <p style={subTextStyle}>
                        {labels.text_unset}: {data.unset_due_date_count}
                    </p>
                </div>
            </div>
            <div className="card" style={cardStyle}>
                <div style={iconContainerStyle}>
                    <InfoTooltip position="bottom" text={labels.tooltip_bottleneck_rate} />
                </div>
                <h3 style={cardTitleStyle}>
                    {labels.label_bottleneck_rate}
                </h3>
                <div>
                    <p style={{ ...valueStyle, color: data.bottleneck_rate > 20 ? '#d97706' : '#1a202c' }}>
                        {data.bottleneck_rate}%
                    </p>
                    <p style={subTextStyle}>
                        {labels.text_stagnant_ratio}
                    </p>
                </div>
            </div>
            <div className="card" style={cardStyle}>
                <div style={iconContainerStyle}>
                    <InfoTooltip position="bottom" text={labels.tooltip_assignee_concentration} />
                </div>
                <h3 style={cardTitleStyle}>
                    {labels.label_assignee_concentration}
                </h3>
                <div>
                    <p style={{ ...valueStyle, color: data.assignee_concentration === 'High' ? '#e53e3e' : '#38a169' }}>
                        {data.assignee_concentration}
                    </p>
                    {data.assignee_concentration === 'High' && (
                        <p style={{ ...subTextStyle, color: '#e53e3e', fontWeight: 'bold' }}>
                            ⚠️ {labels.text_concentration_high}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};



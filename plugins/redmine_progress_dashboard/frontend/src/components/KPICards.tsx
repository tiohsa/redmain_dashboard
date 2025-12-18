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
                    <InfoTooltip position="bottom" text="全チケットのうち終了したチケットの割合です。100%に近いほど順調ですが、低い場合は着手漏れや停滞の可能性があります。" />
                </h3>
                <p style={valueStyle}>{data.completion_rate}%</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3 style={cardTitleStyle}>
                    Delayed Tickets
                    <InfoTooltip position="bottom" text="期日を過ぎても完了していないチケットの数です。0が理想であり、増えている場合は期限管理やリソースの再検討が必要です。" />
                </h3>
                <p style={{ ...valueStyle, color: data.delayed_count > 0 ? 'red' : 'green' }}>{data.delayed_count}</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3 style={cardTitleStyle}>
                    Avg Lead Time
                    <InfoTooltip position="bottom" text="チケット作成から完了までにかかる平均的な日数です。短いほど効率的ですが、長期化はプロセスの無駄を示唆します。" />
                </h3>
                <p style={valueStyle}>{data.avg_lead_time} days</p>
            </div>
            <div className="card" style={cardStyle}>
                <h3 style={cardTitleStyle}>
                    WIP Count
                    <InfoTooltip position="bottom" text="現在進行中（着手済みかつ未完了）のチケット数です。チームのキャパシティに応じた適正値が必要で、多すぎるとマルチタスクにより効率が低下します。" />
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

import React from 'react';
import type { VersionProgress } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface Props {
    data: VersionProgress;
}

export const VersionProgressList: React.FC<Props> = ({ data }) => {
    return (
        <div style={{ height: '350px', background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1, margin: '0 0 1rem 0', paddingBottom: '0.5rem' }}>
                Version Progress
                <InfoTooltip text="各バージョンの進捗状況を表示します。完了率と期日を確認し、リリースの健全性を評価します。" />
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.versions.map(version => (
                    <div key={version.id} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold' }}>{version.name}</span>
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>
                                Due: {version.due_date || 'N/A'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <div style={{ flex: 1, height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
                                <div
                                    style={{
                                        width: `${version.completed_rate}%`,
                                        height: '100%',
                                        background: version.completed_rate === 100 ? '#4caf50' : '#2196f3',
                                        transition: 'width 0.5s ease-in-out'
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: '0.9rem', width: '40px', textAlign: 'right' }}>{version.completed_rate}%</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#888', display: 'flex', gap: '1rem' }}>
                            <span>Status: {version.status}</span>
                            <span>Est: {version.estimated_hours}h</span>
                            <span>Spent: {version.spent_hours}h</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

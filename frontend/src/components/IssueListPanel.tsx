import React, { useState } from 'react';
import type { Issue } from '../types';
import { InfoTooltip } from './InfoTooltip';
import { IssueShowDialog } from './IssueShowDialog';

interface Props {
    issues: Issue[];
    labels: Record<string, string>;
    baseUrl: string;
}

export const IssueListPanel: React.FC<Props> = ({ issues, labels, baseUrl }) => {
    const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);

    // Filter issues that need attention (delayed or stagnant)
    const attentionIssues = issues.filter(
        (issue) => issue.delay_days > 0 || issue.stagnation_days >= 7
    );

    const handleRowClick = (issueId: number) => {
        setSelectedIssueId(issueId);
    };

    const handleCloseDialog = () => {
        setSelectedIssueId(null);
    };

    return (
        <>
            <div style={containerStyle}>
                <h3 style={titleStyle}>
                    {labels.label_issue_list || '注意が必要なチケット'}
                    <InfoTooltip position="bottom" text={labels.tooltip_issue_list || ''} />
                </h3>
                <div style={tableContainerStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={headerRowStyle}>
                            <th style={thStyle}>ID</th>
                            <th style={{ ...thStyle, textAlign: 'left' }}>件名</th>
                            <th style={thStyle}>ステータス</th>
                            <th style={thStyle}>担当者</th>
                            <th style={thStyle}>期日</th>
                            <th style={thStyle}>遅延日数</th>
                            <th style={thStyle}>滞留日数</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attentionIssues.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#718096' }}>
                                    注意が必要なチケットはありません
                                </td>
                            </tr>
                        ) : (
                            attentionIssues.map((issue) => (
                                <tr
                                    key={issue.id}
                                    style={rowStyle}
                                    onClick={() => handleRowClick(issue.id)}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#edf2f7')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    <td style={tdStyle}>#{issue.id}</td>
                                    <td style={{ ...tdStyle, textAlign: 'left', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {issue.subject}
                                    </td>
                                    <td style={tdStyle}>{issue.status}</td>
                                    <td style={tdStyle}>{issue.assigned_to || '-'}</td>
                                    <td style={tdStyle}>{issue.due_date || '-'}</td>
                                    <td style={{ ...tdStyle, color: issue.delay_days > 0 ? '#e53e3e' : '#1a202c', fontWeight: issue.delay_days > 0 ? 'bold' : 'normal' }}>
                                        {issue.delay_days}
                                    </td>
                                    <td style={{ ...tdStyle, color: issue.stagnation_days >= 7 ? '#d97706' : '#1a202c', fontWeight: issue.stagnation_days >= 7 ? 'bold' : 'normal' }}>
                                        {issue.stagnation_days}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            </div>
            {selectedIssueId && (
                <IssueShowDialog
                    issueId={selectedIssueId}
                    baseUrl={baseUrl}
                    onClose={handleCloseDialog}
                />
            )}
        </>
    );
};

const containerStyle: React.CSSProperties = {
    height: '350px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
};

const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1a202c',
};

const tableContainerStyle: React.CSSProperties = {
    overflowX: 'auto',
    overflowY: 'auto',
    flex: 1,
};

const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
};

const headerRowStyle: React.CSSProperties = {
    backgroundColor: '#f7fafc',
    position: 'sticky',
    top: 0,
};

const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'center',
    fontWeight: '600',
    color: '#4a5568',
    borderBottom: '2px solid #e2e8f0',
    whiteSpace: 'nowrap',
};

const rowStyle: React.CSSProperties = {
    cursor: 'pointer',
    transition: 'background-color 0.15s',
};

const tdStyle: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'center',
    borderBottom: '1px solid #e2e8f0',
    color: '#2d3748',
};

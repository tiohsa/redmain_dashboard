import React from 'react';
import type { Issue } from '../types';

interface Props {
    data: Issue[];
}

export const IssueTable: React.FC<Props> = ({ data }) => {
    return (
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Issue Details</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>Subject</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Assigned To</th>
                            <th style={thStyle}>Due Date</th>
                            <th style={thStyle}>Delay Days</th>
                            <th style={thStyle}>Stagnation Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.slice(0, 50).map(issue => (
                            <tr key={issue.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tdStyle}><a href={`/issues/${issue.id}`} target="_blank" rel="noopener noreferrer">#{issue.id}</a></td>
                                <td style={tdStyle}>{issue.subject}</td>
                                <td style={tdStyle}>{issue.status}</td>
                                <td style={tdStyle}>{issue.assigned_to}</td>
                                <td style={tdStyle}>{issue.due_date}</td>
                                <td style={{ ...tdStyle, color: issue.delay_days > 0 ? 'red' : 'inherit' }}>{issue.delay_days > 0 ? issue.delay_days : '-'}</td>
                                <td style={tdStyle}>{issue.stagnation_days}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length > 50 && <p style={{ textAlign: 'center', color: '#888' }}>Showing first 50 issues</p>}
            </div>
        </div>
    );
};

const thStyle = { padding: '10px' };
const tdStyle = { padding: '10px' };

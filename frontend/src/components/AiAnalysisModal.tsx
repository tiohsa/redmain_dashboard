import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    content: string | null;
    prompt: string | null;
    loading: boolean;
}

export const AiAnalysisModal: React.FC<Props> = ({ isOpen, onClose, content, prompt, loading }) => {
    if (!isOpen) return null;

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.5rem' }}>✨</span>
                        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>AI Project Analysis</h2>
                    </div>
                    <button style={closeButtonStyle} onClick={onClose}>&times;</button>
                </div>
                <div style={contentStyle}>
                    {loading ? (
                        <div style={loadingContainerStyle}>
                            <div className="spinner" style={spinnerStyle} />
                            <p style={{ fontWeight: 500, color: '#666' }}>AIがプロジェクトデータを分析中です...</p>
                        </div>
                    ) : content ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="markdown-container">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content}
                                </ReactMarkdown>
                            </div>

                            {prompt && (
                                <details style={detailsStyle}>
                                    <summary style={summaryStyle}>
                                        <span>🔍 送信プロンプト（デバッグ用）</span>
                                    </summary>
                                    <div style={promptContainerStyle}>
                                        <pre style={preStyle}>{prompt}</pre>
                                    </div>
                                </details>
                            )}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>分析結果が見つかりませんでした。</p>
                    )}
                </div>
                <div style={footerStyle}>
                    <button style={buttonStyle} onClick={onClose}>閉じる</button>
                </div>
            </div>
        </div>
    );
};

const detailsStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    background: '#f8fafc',
    overflow: 'hidden'
};

const summaryStyle: React.CSSProperties = {
    padding: '1rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#64748b',
    userSelect: 'none',
    listStyle: 'none'
};

const promptContainerStyle: React.CSSProperties = {
    padding: '0 1rem 1rem 1rem',
    borderTop: '1px solid #e2e8f0'
};

const preStyle: React.CSSProperties = {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    color: '#334155',
    margin: '1rem 0 0 0',
    padding: '1rem',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    backdropFilter: 'blur(8px)',
    animation: 'fadeIn 0.2s ease-out'
};

const modalStyle: React.CSSProperties = {
    background: '#ffffff',
    width: '95%',
    maxWidth: '1400px',
    height: '92vh',
    maxHeight: '95vh',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
};

const headerStyle: React.CSSProperties = {
    padding: '1.25rem 2rem',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const contentStyle: React.CSSProperties = {
    padding: '2rem',
    overflowY: 'auto',
    flex: 1,
    lineHeight: '1.7',
    color: '#1e293b'
};

const footerStyle: React.CSSProperties = {
    padding: '1rem 2rem',
    background: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'right'
};

const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '0 0.5rem',
    lineHeight: 1,
    transition: 'color 0.2s'
};

const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem 2.5rem',
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)',
    transition: 'all 0.2s'
};

const loadingContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
};

const spinnerStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1.5rem'
};

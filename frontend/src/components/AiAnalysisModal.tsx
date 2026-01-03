import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    content: string | null;
    initialPrompt: string | null;
    loading: boolean;
    onGenerate: (provider: string, prompt: string) => void;
}

export const AiAnalysisModal: React.FC<Props> = ({ isOpen, onClose, content, initialPrompt, loading, onGenerate }) => {
    const [provider, setProvider] = useState<string>('gemini');
    const [promptText, setPromptText] = useState<string>('');

    useEffect(() => {
        if (isOpen && initialPrompt) {
            setPromptText(initialPrompt);
        }
    }, [isOpen, initialPrompt]);

    if (!isOpen) return null;

    const handleGenerateClick = () => {
        onGenerate(provider, promptText);
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.2rem' }}>✨</span>
                        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>AI Project Analysis</h2>
                    </div>
                    <button style={closeButtonStyle} onClick={onClose}>&times;</button>
                </div>

                <div style={bodyContainerStyle}>
                    <div style={settingsContainerStyle}>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>AI提供元</label>
                            <select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="gemini">Gemini</option>
                                <option value="azure">Azure OpenAI</option>
                            </select>
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>プロンプト</label>
                            <textarea
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                style={textareaStyle}
                                rows={15}
                            />
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                            <button
                                style={{ ...buttonStyle, width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                                onClick={handleGenerateClick}
                                disabled={loading}
                            >
                                {loading ? '生成中...' : '生成する'}
                            </button>
                        </div>
                    </div>

                    <div style={contentStyle}>
                        {loading ? (
                            <div style={loadingContainerStyle}>
                                <div className="spinner" style={spinnerStyle} />
                                <p style={{ fontWeight: 500, color: '#666' }}>AIがプロジェクトデータを分析中です...</p>
                            </div>
                        ) : (
                            content && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="markdown-container" style={markdownWrapperStyle}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div style={footerStyle}>
                    <button style={secondaryButtonStyle} onClick={onClose}>閉じる</button>
                </div>
            </div>
        </div>
    );
};

// Styles
const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000,
    backdropFilter: 'blur(8px)',
    animation: 'fadeIn 0.2s ease-out'
};

const modalStyle: React.CSSProperties = {
    background: '#ffffff',
    width: '98%', maxWidth: '1600px',
    height: '92vh', maxHeight: '95vh',
    borderRadius: '16px',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
};

const headerStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};

const bodyContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden'
};

const settingsContainerStyle: React.CSSProperties = {
    width: '450px',
    padding: '1.5rem',
    background: '#f8fafc',
    borderRight: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', gap: '1.25rem',
    overflowY: 'auto'
};

const contentStyle: React.CSSProperties = {
    padding: '1.5rem 2rem',
    overflowY: 'auto',
    flex: 1,
    background: '#fff',
    color: '#1e293b'
};

const footerStyle: React.CSSProperties = {
    padding: '1rem 2rem',
    background: '#fff',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'right'
};

const closeButtonStyle: React.CSSProperties = {
    background: 'none', border: 'none', fontSize: '2rem',
    cursor: 'pointer', color: '#94a3b8', lineHeight: 1
};

const buttonStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '0.75rem 2rem',
    background: '#1e293b', color: '#ffffff',
    border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
    transition: 'all 0.2s'
};

const secondaryButtonStyle: React.CSSProperties = {
    padding: '0.75rem 2rem',
    background: '#fff', color: '#64748b',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
    marginRight: '0.5rem'
};

const formGroupStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '0.5rem'
};

const labelStyle: React.CSSProperties = {
    fontWeight: 600, color: '#475569', fontSize: '0.9rem'
};

const selectStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
    width: '100%',
    maxWidth: '400px',
    background: '#ffffff',
    color: '#334155',
    height: 'auto',
    minHeight: '44px',
    cursor: 'pointer'
};

const textareaStyle: React.CSSProperties = {
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    resize: 'vertical',
    minHeight: '120px',
    lineHeight: '1.5',
    background: '#ffffff',
    color: '#334155'
};

const markdownWrapperStyle: React.CSSProperties = {
    lineHeight: '1.7',
    fontSize: '1rem'
};

const loadingContainerStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'
};

const spinnerStyle: React.CSSProperties = {
    width: '40px', height: '40px',
    border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6',
    borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem'
};

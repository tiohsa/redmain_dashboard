import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
    issueId: number;
    baseUrl: string;
    onClose: () => void;
}

export const IssueShowDialog: React.FC<Props> = ({ issueId, baseUrl, onClose }) => {
    const showUrl = `${baseUrl}/issues/${issueId}`;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        // Only close if the background overlay was clicked directly
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleCloseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    };

    const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
        try {
            const iframe = e.currentTarget;
            const doc = iframe.contentWindow?.document;
            if (doc) {
                const style = doc.createElement('style');
                style.textContent = `
                    #top-menu, #header { display: none !important; }
                    #wrapper { margin: 0 !important; }
                    .flyout-menu { display: none !important; }
                `;
                doc.head.appendChild(style);
            }
        } catch (err) {
            console.warn('Cannot inject styles into iframe (likely CORS):', err);
        }
    };

    return createPortal(
        <div style={overlayStyle} onClick={handleOverlayClick}>
            <div style={dialogStyle}>
                <div style={headerStyle}>
                    <span style={{ fontWeight: 'bold' }}>Issue #{issueId}</span>
                    <button type="button" onClick={handleCloseClick} style={closeButtonStyle}>✕</button>
                </div>
                <iframe
                    src={showUrl}
                    style={iframeStyle}
                    title={`Issue #${issueId}`}
                    onLoad={handleIframeLoad}
                />
            </div>
        </div>,
        document.body
    );
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
};

const dialogStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '95vw',
    height: '95vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f7fafc',
    borderRadius: '8px 8px 0 0',
};

const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#718096',
    padding: '4px 8px',
    borderRadius: '4px',
};

const iframeStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    borderRadius: '0 0 8px 8px',
};

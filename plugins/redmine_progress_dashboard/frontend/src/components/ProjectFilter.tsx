import React, { useState, useRef, useEffect } from 'react';

interface Project {
    id: number;
    name: string;
}

interface Props {
    projects: Project[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
}

export const ProjectFilter: React.FC<Props> = ({ projects, selectedIds, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Outside click handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleProject = (id: number) => {
        const newSelected = selectedIds.includes(id)
            ? selectedIds.filter(pid => pid !== id)
            : [...selectedIds, id];
        onChange(newSelected);
    };

    const selectAll = () => onChange(projects.map(p => p.id));
    const deselectAll = () => onChange([]);

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '0.8rem 1.5rem',
                    background: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: '#333',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>📁</span>
                    Projects ({selectedIds.length}/{projects.length})
                </span>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    minWidth: '280px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '0.8rem',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid #f0f0f0' }}>
                        <button onClick={selectAll} style={textBtnStyle}>Select All</button>
                        <button onClick={deselectAll} style={textBtnStyle}>Clear</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {projects.map(project => (
                            <label
                                key={project.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    transition: 'background 0.2s',
                                    userSelect: 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(project.id)}
                                    onChange={() => toggleProject(project.id)}
                                    style={{
                                        marginRight: '12px',
                                        width: '16px',
                                        height: '16px',
                                        cursor: 'pointer',
                                        accentColor: '#6e8efb'
                                    }}
                                />
                                <span style={{ color: '#444' }}>{project.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const textBtnStyle: React.CSSProperties = {
    background: '#f0f2f5',
    border: 'none',
    color: '#1976d2',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: 500
};

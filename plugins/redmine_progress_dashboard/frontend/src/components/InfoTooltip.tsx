import React, { useState, useRef, useLayoutEffect } from 'react';
import './InfoTooltip.css';

interface Props {
    text: string;
    position?: 'top' | 'bottom';
}

export const InfoTooltip: React.FC<Props> = ({ text, position = 'bottom' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (isVisible && tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Decide final vertical position
            let finalPos = position;
            if (position === 'top' && rect.top < 0) {
                finalPos = 'bottom';
            } else if (position === 'bottom' && rect.bottom > viewportHeight) {
                finalPos = 'top';
            }

            // Apply classes
            tooltipRef.current.classList.remove('top', 'bottom');
            tooltipRef.current.classList.add(finalPos);

            // Re-measure after class application to handle horizontal check
            const newRect = tooltipRef.current.getBoundingClientRect();
            let shift = 0;
            if (newRect.left < 10) {
                shift = 10 - newRect.left;
            } else if (newRect.right > viewportWidth - 10) {
                shift = (viewportWidth - 10) - newRect.right;
            }

            if (shift !== 0) {
                tooltipRef.current.style.transform = `translateX(calc(-50% + ${shift}px))`;
                const arrow = tooltipRef.current.querySelector('.tooltip-arrow') as HTMLElement;
                if (arrow) arrow.style.transform = `translateX(calc(-50% - ${shift}px))`;
            } else {
                tooltipRef.current.style.transform = 'translateX(-50%)';
                const arrow = tooltipRef.current.querySelector('.tooltip-arrow') as HTMLElement;
                if (arrow) arrow.style.transform = 'translateX(-50%)';
            }
        }
    }, [isVisible, position]);

    return (
        <span
            className="info-tooltip-container"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <svg className="info-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {isVisible && (
                <div
                    ref={tooltipRef}
                    role="tooltip"
                    className="tooltip-box"
                >
                    <div className="tooltip-content">
                        {text}
                    </div>
                    <div className="tooltip-arrow" />
                </div>
            )}
        </span>
    );
};

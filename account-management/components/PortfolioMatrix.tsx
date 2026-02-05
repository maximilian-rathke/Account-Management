
import React, { useRef, useMemo } from 'react';
import { CalculatedAccount } from '../types';
import { getCategoryColor } from '../calculations';

interface PortfolioMatrixProps {
  accounts: CalculatedAccount[];
  onSelect: (account: CalculatedAccount | null) => void;
  onEdit: (id: string) => void;
  selectedId?: string;
  showLabels?: boolean;
}

// Fixed dimensions to prevent layout shifts
const SIZE = 600;
const PADDING = 60;
const CHART_SIZE = SIZE - PADDING * 2;
const TOOLTIP_WIDTH = 220;
const TOOLTIP_HEIGHT = 180;

const MIN_BOUND = PADDING;
const MAX_BOUND = PADDING + CHART_SIZE;

export const PortfolioMatrix: React.FC<PortfolioMatrixProps> = ({ 
  accounts, 
  onSelect, 
  onEdit, 
  selectedId, 
  showLabels = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Stable coordinate mapping
  const getPos = (score: number) => PADDING + (score / 100) * CHART_SIZE;

  const selectedAccount = useMemo(() => 
    accounts.find(a => a.id === selectedId) || null, 
    [accounts, selectedId]
  );

  const handlePointClick = (e: React.MouseEvent, acc: CalculatedAccount) => {
    // Crucial: Stop propagation to prevent background click from closing the popup immediately
    e.stopPropagation();
    if (selectedId === acc.id) {
      onSelect(null);
    } else {
      onSelect(acc);
    }
  };

  const handleBackgroundClick = () => {
    onSelect(null);
  };

  const handleEditClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onEdit(id);
  };

  // Logic to determine tooltip positioning strictly within the matrix bounds
  const getTooltipStyle = (acc: CalculatedAccount) => {
    const cx = getPos(acc.volumeScore);
    const cy = getPos(100 - acc.potentialScore);

    let left = cx + 15;
    let top = cy - TOOLTIP_HEIGHT / 2;

    // Flip horizontally if hitting right edge
    if (left + TOOLTIP_WIDTH > SIZE - 10) {
      left = cx - TOOLTIP_WIDTH - 15;
    }

    // Adjust vertically if hitting top or bottom edges
    if (top < 10) {
      top = 10;
    } else if (top + TOOLTIP_HEIGHT > SIZE - 10) {
      top = SIZE - TOOLTIP_HEIGHT - 10;
    }

    return {
      position: 'absolute' as const,
      left: `${left}px`,
      top: `${top}px`,
      width: `${TOOLTIP_WIDTH}px`,
      height: `${TOOLTIP_HEIGHT}px`,
      zIndex: 100,
    };
  };

  // Boundary-aware label style calculation
  const getLabelStyle = (acc: CalculatedAccount) => {
    const cx = getPos(acc.volumeScore);
    const cy = getPos(100 - acc.potentialScore);
    const labelHeight = 16;
    const labelHalfWidth = 45; // Max width is 90
    
    let top = cy + 10; // Default: directly below
    let left = cx;
    let transform = 'translateX(-50%)';

    // Vertical boundary check: if too low, move above point
    if (top + labelHeight > MAX_BOUND) {
      top = cy - 24; 
    }

    // Horizontal boundary checks
    if (cx - labelHalfWidth < MIN_BOUND) {
      // Too far left
      left = cx + 4;
      transform = 'translateX(0)';
    } else if (cx + labelHalfWidth > MAX_BOUND) {
      // Too far right
      left = cx - 4;
      transform = 'translateX(-100%)';
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
      transform,
      zIndex: 5,
    };
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-white p-0 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center select-none overflow-hidden"
      onClick={handleBackgroundClick}
      style={{ width: `${SIZE}px`, height: `${SIZE}px` }}
    >
      <div className="relative" style={{ width: `${SIZE}px`, height: `${SIZE}px` }}>
        <svg 
          width={SIZE} 
          height={SIZE} 
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Grid Background */}
          <rect x={PADDING} y={PADDING} width={CHART_SIZE} height={CHART_SIZE} fill="#fcfdfe" stroke="#e2e8f0" strokeWidth="1" />
          
          {/* Quadrant Separation Lines */}
          <line 
            x1={PADDING + CHART_SIZE / 2} y1={PADDING} 
            x2={PADDING + CHART_SIZE / 2} y2={PADDING + CHART_SIZE} 
            stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 4" 
          />
          <line 
            x1={PADDING} y1={PADDING + CHART_SIZE / 2} 
            x2={PADDING + CHART_SIZE} y2={PADDING + CHART_SIZE / 2} 
            stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 4" 
          />

          {/* Quadrant Labels */}
          <g className="opacity-40">
            <text x={PADDING + CHART_SIZE * 0.75} y={PADDING + CHART_SIZE * 0.25} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700" className="uppercase tracking-widest">Grow & Scale</text>
            <text x={PADDING + CHART_SIZE * 0.25} y={PADDING + CHART_SIZE * 0.25} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700" className="uppercase tracking-widest">Incubate</text>
            <text x={PADDING + CHART_SIZE * 0.75} y={PADDING + CHART_SIZE * 0.75} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700" className="uppercase tracking-widest">Protect</text>
            <text x={PADDING + CHART_SIZE * 0.25} y={PADDING + CHART_SIZE * 0.75} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700" className="uppercase tracking-widest">Maintain / Exit</text>
          </g>

          {/* Axis Labels */}
          <text x={PADDING + CHART_SIZE / 2} y={SIZE - 15} textAnchor="middle" className="fill-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Volume Score</text>
          <text 
            x={20} y={PADDING + CHART_SIZE / 2} 
            transform={`rotate(-90, 20, ${PADDING + CHART_SIZE / 2})`} 
            textAnchor="middle" 
            className="fill-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            Potential Score
          </text>
        </svg>

        {/* Interactive Points and Persistent Labels Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {accounts.map((acc) => {
            const cx = getPos(acc.volumeScore);
            const cy = getPos(100 - acc.potentialScore);
            const isSelected = selectedId === acc.id;
            const labelStyle = getLabelStyle(acc);

            return (
              <React.Fragment key={acc.id}>
                {/* Account Name Label (Conditionally Visible) */}
                {showLabels && (
                  <div
                    className="absolute pointer-events-none text-[9px] font-semibold text-slate-600 whitespace-nowrap px-1 py-0.5 rounded bg-white/70 text-center"
                    style={{
                      ...labelStyle,
                      position: 'absolute',
                      maxWidth: '90px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {acc.name}
                  </div>
                )}

                {/* Account Point */}
                <div
                  className="absolute pointer-events-auto cursor-pointer"
                  style={{
                    left: `${cx}px`,
                    top: `${cy}px`,
                    width: '18px',
                    height: '18px',
                    transform: 'translate(-50%, -50%)',
                    zIndex: isSelected ? 20 : 10,
                  }}
                  onClick={(e) => handlePointClick(e, acc)}
                >
                  <div 
                    className={`w-full h-full rounded-full border-2 transition-colors duration-75 flex items-center justify-center`}
                    style={{ 
                      backgroundColor: getCategoryColor(acc.category),
                      borderColor: isSelected ? '#1e293b' : '#ffffff',
                      boxShadow: isSelected ? `0 0 0 4px ${getCategoryColor(acc.category)}33` : 'none'
                    }}
                  />
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Floating Tooltip strictly within bounds */}
        {selectedAccount && (
          <div 
            className="pointer-events-auto bg-slate-900 text-white p-4 rounded-lg shadow-2xl border border-slate-700 flex flex-col justify-between"
            style={getTooltipStyle(selectedAccount)}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 overflow-hidden">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Account</div>
                  <div className="text-sm font-bold truncate leading-tight pr-2">{selectedAccount.name}</div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button 
                    onClick={(e) => handleEditClick(e, selectedAccount.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Edit Account"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <div 
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: getCategoryColor(selectedAccount.category) }}
                  />
                </div>
              </div>
              
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">ARR</span>
                  <span className="font-mono font-bold text-blue-300">€{selectedAccount.arr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Volume</span>
                  <span className="font-bold">{selectedAccount.volumeScore.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Potential</span>
                  <span className="font-bold">{selectedAccount.potentialScore.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between">
               <div className="text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 bg-white/5 truncate max-w-[130px]">
                 {selectedAccount.category}
               </div>
               <button 
                  onClick={() => onSelect(null)}
                  className="text-slate-500 hover:text-white transition-colors p-1"
               >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

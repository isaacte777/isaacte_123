import { useState, useRef, useCallback } from 'react';
import { MapNode, Transaction, PlacedShape, DraggableShape } from '../types';
import { ShapeSVG } from './ShapePanel';

interface FinanceMapProps {
  nodes: MapNode[];
  selectedNode: string | null;
  onSelectNode: (id: string | null) => void;
  transactions: Transaction[];
  placedShapes: PlacedShape[];
  onPlaceShape: (shape: DraggableShape, x: number, y: number) => void;
  onMoveShape: (id: string, x: number, y: number) => void;
  onRemoveShape: (id: string) => void;
  onSelectShape: (id: string | null) => void;
  selectedShape: string | null;
  onMoveNode: (id: string, x: number, y: number) => void;
}

/* ─── Placed Shape Renderer ─── */
function PlacedShapeItem({
  shape, isSelected, onSelect, onMove, onRemove,
}: {
  shape: PlacedShape;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onRemove: () => void;
}) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: shape.x, origY: shape.y };

    const onMove_ = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      onMove(dragRef.current.origX + dx, dragRef.current.origY + dy);
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove_);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove_);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div
      className="absolute z-30 cursor-grab active:cursor-grabbing"
      style={{ left: shape.x, top: shape.y, transform: 'translate(-50%, -50%)' }}
      onMouseDown={handleMouseDown}
    >
      <div className={`flex flex-col items-center gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}>
        <div className="text-white/60">
          <ShapeSVG type={shape.type} size={36} />
        </div>
        <span className="text-[8px] text-white/30 font-mono max-w-[50px] truncate text-center">{shape.label}</span>
      </div>
      {isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 text-[7px] transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}

/* ─── Draggable Node ─── */
function DraggableNode({
  node, isSelected, isHovered, onSelect, onHover, onMove, containerRef,
}: {
  node: MapNode;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
  onMove: (x: number, y: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const dragRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragRef.current = { startX: e.clientX, startY: e.clientY, moved: false };

    const onMove_ = (ev: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.moved = true;
      }
      if (dragRef.current.moved) {
        const rect = containerRef.current.getBoundingClientRect();
        const newX = ((node.x / 100) * rect.width + dx);
        const newY = ((node.y / 100) * rect.height + dy);
        const pctX = (newX / rect.width) * 100;
        const pctY = (newY / rect.height) * 100;
        onMove(
          Math.max(5, Math.min(95, pctX)),
          Math.max(5, Math.min(95, pctY))
        );
      }
    };
    const onUp = () => {
      if (dragRef.current && !dragRef.current.moved) {
        onSelect();
      }
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove_);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove_);
    document.addEventListener('mouseup', onUp);
  };

  const size = 72 + Math.min(node.transactionCount * 4, 24);

  return (
    <div
      className="absolute z-20 cursor-grab active:cursor-grabbing"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Selection ring */}
      {isSelected && (
        <div className="absolute inset-0 -m-2 rounded-full border border-white/20 animate-pulse" />
      )}

      {/* Node body */}
      <div
        className={`relative flex flex-col items-center justify-center rounded-full border transition-all duration-200 ${
          isSelected
            ? 'bg-white/5 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
            : isHovered
            ? 'bg-white/[0.03] border-white/20'
            : 'bg-transparent border-white/10 hover:border-white/20'
        }`}
        style={{ width: size, height: size }}
      >
        {/* Symbol */}
        <span className={`text-sm font-light transition-colors ${isSelected ? 'text-white/80' : 'text-white/40'}`}>
          {node.symbol}
        </span>
        {/* Name */}
        <span className={`text-[9px] font-mono mt-0.5 transition-colors ${isSelected ? 'text-white/70' : 'text-white/30'}`}>
          {node.name}
        </span>
        {/* Value */}
        <span className={`text-[9px] font-mono font-medium mt-0.5 ${node.total >= 0 ? 'text-white/60' : 'text-white/25'}`}>
          {node.total >= 0 ? '+' : ''}{node.total >= 1000 || node.total <= -1000
            ? `€${(node.total / 1000).toFixed(1)}k`
            : `€${node.total}`}
        </span>

        {/* Count badge */}
        <div className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-black border border-white/15 rounded-full flex items-center justify-center px-0.5">
          <span className="text-[7px] text-white/40 font-mono">{node.transactionCount}</span>
        </div>
      </div>

      {/* Tooltip */}
      {isHovered && !isSelected && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black border border-white/10 rounded px-2.5 py-1.5 whitespace-nowrap z-50 pointer-events-none">
          <p className="text-[10px] text-white/60 font-mono">{node.name}</p>
          <p className="text-[9px] text-white/25 font-mono">{node.transactionCount} transactions</p>
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black border-l border-t border-white/10 rotate-45" />
        </div>
      )}
    </div>
  );
}

/* ─── Main Map ─── */
export default function FinanceMap({
  nodes, selectedNode, onSelectNode, placedShapes,
  onPlaceShape, onMoveShape, onRemoveShape, onSelectShape, selectedShape, onMoveNode,
}: FinanceMapProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBgMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]') || (e.target as HTMLElement).closest('[data-shape]')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    onSelectNode(null);
    onSelectShape(null);
  };

  const handleBgMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleBgMouseUp = () => setIsPanning(false);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.3, Math.min(3, prev + (e.deltaY > 0 ? -0.06 : 0.06))));
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const data = e.dataTransfer.getData('application/json');
    if (!data || !containerRef.current) return;
    try {
      const shape: DraggableShape = JSON.parse(data);
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      onPlaceShape(shape, x, y);
    } catch {}
  };

  const resetView = () => { setPan({ x: 0, y: 0 }); setZoom(1); };

  // Connections
  const connections = [[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,4],[4,5],[0,4]];

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Controls */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-px">
        <button onClick={() => setZoom(p => Math.min(3, p + 0.15))}
          className="w-7 h-7 bg-black border border-[#1a1a1a] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/20 transition-all text-xs font-mono">+</button>
        <button onClick={() => setZoom(p => Math.max(0.3, p - 0.15))}
          className="w-7 h-7 bg-black border border-[#1a1a1a] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/20 transition-all text-xs font-mono">−</button>
        <div className="h-px bg-[#1a1a1a]" />
        <button onClick={resetView}
          className="w-7 h-7 bg-black border border-[#1a1a1a] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/20 transition-all">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 1 9 9"/><path d="M3 3v9h9"/></svg>
        </button>
      </div>

      {/* Status bar */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
        <div className="bg-black border border-[#1a1a1a] px-2 py-1">
          <span className="text-[9px] text-white/20 font-mono">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="bg-black border border-[#1a1a1a] px-2 py-1">
          <span className="text-[9px] text-white/20 font-mono">{placedShapes.length} shapes</span>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-3 left-3 z-30 bg-black/80 border border-[#1a1a1a] px-2.5 py-1.5">
        <p className="text-[9px] text-white/15 font-mono">drag nodes · scroll zoom · drop shapes</p>
      </div>

      {/* Drop overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-20 border border-dashed border-white/10 bg-white/[0.01] flex items-center justify-center pointer-events-none">
          <span className="text-[11px] text-white/30 font-mono border border-white/10 px-3 py-1.5 rounded">drop shape</span>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
        onMouseDown={handleBgMouseDown}
        onMouseMove={handleBgMouseMove}
        onMouseUp={handleBgMouseUp}
        onMouseLeave={handleBgMouseUp}
        onWheel={handleWheel}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
      >
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id="grid-sm" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#0d0d0d" strokeWidth="0.5" />
            </pattern>
            <pattern id="grid-lg" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="120" height="120" fill="url(#grid-sm)" />
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#141414" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-lg)" />
        </svg>

        {/* Transform layer */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map(([a, b], i) => {
              const na = nodes[a], nb = nodes[b];
              if (!na || !nb) return null;
              const active = selectedNode === na.id || selectedNode === nb.id;
              return (
                <line key={i}
                  x1={`${na.x}%`} y1={`${na.y}%`}
                  x2={`${nb.x}%`} y2={`${nb.y}%`}
                  stroke={active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}
                  strokeWidth={active ? 1 : 0.5}
                  strokeDasharray={active ? 'none' : '2,6'}
                  className="transition-all duration-300"
                />
              );
            })}
            {/* Shape-to-node links */}
            {placedShapes.filter(s => s.linkedNode).map(s => {
              const ln = nodes.find(n => n.id === s.linkedNode);
              if (!ln) return null;
              return (
                <line key={`lnk-${s.id}`}
                  x1={s.x} y1={s.y}
                  x2={`${ln.x}%`} y2={`${ln.y}%`}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="0.5"
                  strokeDasharray="3,5"
                />
              );
            })}
          </svg>

          {/* Placed shapes */}
          {placedShapes.map(s => (
            <div key={s.id} data-shape>
              <PlacedShapeItem
                shape={s}
                isSelected={selectedShape === s.id}
                onSelect={() => { onSelectShape(s.id); onSelectNode(null); }}
                onMove={(x, y) => onMoveShape(s.id, x, y)}
                onRemove={() => onRemoveShape(s.id)}
              />
            </div>
          ))}

          {/* Nodes */}
          {nodes.map(node => (
            <div key={node.id} data-node>
              <DraggableNode
                node={node}
                isSelected={selectedNode === node.id}
                isHovered={hoveredNode === node.id}
                onSelect={() => { onSelectNode(selectedNode === node.id ? null : node.id); onSelectShape(null); }}
                onHover={(h) => setHoveredNode(h ? node.id : null)}
                onMove={(x, y) => onMoveNode(node.id, x, y)}
                containerRef={containerRef}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

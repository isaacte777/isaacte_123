import { useState, useRef, useCallback } from 'react';
import { MapNode, Transaction, PlacedShape, DraggableShape, ShapeType } from '../types';
import { ShapeIcon } from './ShapePanel';

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
}

function PlacedShapeRenderer({
  shape,
  isSelected,
  onSelect,
  onMove,
  onRemove,
}: {
  shape: PlacedShape;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onRemove: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    onSelect();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      const parent = (e.currentTarget as HTMLElement).parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      const newX = ev.clientX - parentRect.left - dragOffset.current.x + 30;
      const newY = ev.clientY - parentRect.top - dragOffset.current.y + 30;
      onMove(newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const size = 60;

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-shadow duration-200 ${
        isDragging ? 'z-50' : 'z-30'
      }`}
      style={{ left: shape.x, top: shape.y }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`relative flex flex-col items-center justify-center transition-all duration-200 ${
          isSelected ? 'scale-110' : 'hover:scale-105'
        }`}
      >
        {/* Glow effect */}
        {isSelected && (
          <div className="absolute inset-0 -m-2 rounded-full bg-gray-600/10 animate-pulse" />
        )}

        {/* Shape */}
        <div className={`text-gray-400 ${isSelected ? 'text-gray-200' : ''} transition-colors`}>
          <ShapeIcon type={shape.type} size={size} />
        </div>

        {/* Label */}
        <span className="text-[9px] text-gray-500 font-medium mt-0.5 text-center max-w-[60px] truncate">
          {shape.label}
        </span>

        {/* Linked indicator */}
        {shape.linkedNode && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-600 rounded-full border border-gray-500" />
        )}

        {/* Actions on select */}
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-2 -right-2 w-4 h-4 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-700 text-[8px] transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default function FinanceMap({
  nodes,
  selectedNode,
  onSelectNode,
  placedShapes,
  onPlaceShape,
  onMoveShape,
  onRemoveShape,
  onSelectShape,
  selectedShape,
}: FinanceMapProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-shape]') || (e.target as HTMLElement).closest('[data-node]')) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    onSelectNode(null);
    onSelectShape(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom(prev => Math.max(0.3, Math.min(2.5, prev + delta)));
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const data = e.dataTransfer.getData('application/json');
    if (!data || !containerRef.current) return;

    try {
      const shape: DraggableShape = JSON.parse(data);
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / zoom;
      const y = (e.clientY - rect.top - offset.y) / zoom;
      onPlaceShape(shape, x, y);
    } catch (err) {
      console.error('Error parsing dropped shape data', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  // Connections between nodes
  const connections = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 4], [4, 5], [0, 4]
  ];

  const formatCurrency = (amount: number) => {
    if (Math.abs(amount) >= 1000) {
      return `€${(amount / 1000).toFixed(1)}k`;
    }
    return `€${amount.toFixed(0)}`;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setZoom(prev => Math.min(2.5, prev + 0.15))}
          className="w-8 h-8 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all text-sm font-bold"
        >
          +
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.3, prev - 0.15))}
          className="w-8 h-8 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all text-sm font-bold"
        >
          −
        </button>
        <div className="w-8 h-px bg-gray-800 my-1" />
        <button
          onClick={resetView}
          className="w-8 h-8 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all"
          title="Resetear vista"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 1 9 9" />
            <path d="M3 3v9h9" />
          </svg>
        </button>
      </div>

      {/* Zoom & Position Info */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="bg-gray-900/90 border border-gray-800 rounded-lg px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] text-gray-500 font-mono">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="bg-gray-900/90 border border-gray-800 rounded-lg px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] text-gray-500 font-mono">
            {Math.round(offset.x)}, {Math.round(offset.y)}
          </span>
        </div>
      </div>

      {/* Drop zone indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-10 border-2 border-dashed border-gray-600 bg-gray-900/30 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-900 border border-gray-700 rounded-xl px-6 py-3">
            <p className="text-sm text-gray-300 font-medium">Soltar figura aquí</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-20 bg-gray-900/80 border border-gray-800 rounded-lg px-3 py-2 backdrop-blur-sm">
        <p className="text-[10px] text-gray-600">
          <span className="text-gray-400">⊞</span> Arrastra figuras • <span className="text-gray-400">⊕</span> Scroll para zoom • <span className="text-gray-400">⊙</span> Click en nodos
        </p>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] text-gray-500">{placedShapes.length} figuras</span>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] text-gray-500">{nodes.length} nodos</span>
        </div>
      </div>

      {/* Map Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Grid background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
            </pattern>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="url(#smallGrid)" />
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#222" strokeWidth="1" />
            </pattern>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#centerGlow)" />
        </svg>

        {/* Transformable content */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '100%', minHeight: '100%' }}>
            {connections.map(([from, to], idx) => {
              const fromNode = nodes[from];
              const toNode = nodes[to];
              if (!fromNode || !toNode) return null;
              const isActive = selectedNode === fromNode.id || selectedNode === toNode.id;
              return (
                <g key={idx}>
                  <line
                    x1={`${fromNode.x}%`}
                    y1={`${fromNode.y}%`}
                    x2={`${toNode.x}%`}
                    y2={`${toNode.y}%`}
                    stroke={isActive ? '#555' : '#1f1f1f'}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={isActive ? 'none' : '4,8'}
                    className="transition-all duration-500"
                  />
                  {isActive && (
                    <line
                      x1={`${fromNode.x}%`}
                      y1={`${fromNode.y}%`}
                      x2={`${toNode.x}%`}
                      y2={`${toNode.y}%`}
                      stroke="#444"
                      strokeWidth="1"
                      strokeDasharray="2,6"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}

            {/* Lines from placed shapes to linked nodes */}
            {placedShapes.filter(s => s.linkedNode).map((shape) => {
              const linkedNode = nodes.find(n => n.id === shape.linkedNode);
              if (!linkedNode) return null;
              return (
                <line
                  key={`link-${shape.id}`}
                  x1={shape.x}
                  y1={shape.y}
                  x2={`${linkedNode.x}%`}
                  y2={`${linkedNode.y}%`}
                  stroke="#333"
                  strokeWidth="1"
                  strokeDasharray="3,5"
                />
              );
            })}
          </svg>

          {/* Placed Shapes */}
          {placedShapes.map((shape) => (
            <div key={shape.id} data-shape>
              <PlacedShapeRenderer
                shape={shape}
                isSelected={selectedShape === shape.id}
                onSelect={() => onSelectShape(shape.id)}
                onMove={(x, y) => onMoveShape(shape.id, x, y)}
                onRemove={() => onRemoveShape(shape.id)}
              />
            </div>
          ))}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;
            const baseSize = 90;
            const size = baseSize + Math.min(node.transactionCount * 8, 40);

            return (
              <div
                key={node.id}
                data-node
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isSelected ? 'z-40' : 'z-20'
                }`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                }}
              >
                {/* Outer ring animation for selected */}
                {isSelected && (
                  <>
                    <div className="absolute inset-0 -m-4 rounded-full border border-gray-700 animate-ping opacity-20" />
                    <div className="absolute inset-0 -m-2 rounded-full border border-gray-600" />
                  </>
                )}

                {/* Node button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNode(isSelected ? null : node.id);
                    onSelectShape(null);
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`relative flex flex-col items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isSelected
                      ? 'bg-gray-800 border-gray-400 shadow-[0_0_30px_rgba(100,100,100,0.2)]'
                      : isHovered
                      ? 'bg-gray-900 border-gray-500 shadow-[0_0_15px_rgba(80,80,80,0.15)]'
                      : 'bg-gray-900 border-gray-700 hover:border-gray-500'
                  }`}
                  style={{ width: `${size}px`, height: `${size}px` }}
                >
                  {/* Inner glow */}
                  <div className={`absolute inset-2 rounded-full transition-opacity duration-300 ${
                    isSelected ? 'bg-gray-800/50 opacity-100' : 'opacity-0'
                  }`} />

                  <span className="text-xl mb-0.5 relative z-10">{node.icon}</span>
                  <span className="text-[10px] font-semibold text-gray-300 relative z-10">{node.name}</span>
                  <span className={`text-[10px] font-bold mt-0.5 relative z-10 ${node.total >= 0 ? 'text-gray-200' : 'text-gray-500'}`}>
                    {formatCurrency(node.total)}
                  </span>

                  {/* Count badge */}
                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center px-1">
                    <span className="text-[9px] text-gray-300 font-bold">{node.transactionCount}</span>
                  </div>
                </button>

                {/* Hover tooltip */}
                {isHovered && !isSelected && (
                  <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 whitespace-nowrap shadow-2xl z-50">
                    <p className="text-xs text-gray-200 font-semibold">{node.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{node.transactionCount} transacciones</p>
                    <p className={`text-xs font-bold mt-0.5 ${node.total >= 0 ? 'text-gray-200' : 'text-gray-500'}`}>
                      Balance: {formatCurrency(node.total)}
                    </p>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

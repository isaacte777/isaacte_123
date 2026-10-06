import { useState, useRef, useEffect } from 'react';
import { MapNode, Transaction } from '../types';

interface FinanceMapProps {
  nodes: MapNode[];
  selectedNode: string | null;
  onSelectNode: (id: string | null) => void;
  transactions: Transaction[];
}

export default function FinanceMap({ nodes, selectedNode, onSelectNode, transactions }: FinanceMapProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('map-bg')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  // Draw connections between nodes
  const connections = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 4], [4, 5]
  ];

  const formatCurrency = (amount: number) => {
    if (Math.abs(amount) >= 1000) {
      return `€${(amount / 1000).toFixed(1)}k`;
    }
    return `€${amount}`;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(2, prev + 0.2))}
          className="w-8 h-8 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
          className="w-8 h-8 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="w-8 h-8 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors text-xs"
        >
          ↺
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 z-10 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2">
        <p className="text-xs text-gray-500">Arrastra para mover • Scroll para zoom • Click en nodo para detalles</p>
      </div>

      {/* Map Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full map-bg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={(e) => {
          if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('map-bg')) {
            onSelectNode(null);
          }
        }}
      >
        {/* Grid background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Transformable content */}
        <div
          className="absolute inset-0 transition-transform duration-75"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map(([from, to], idx) => {
              const fromNode = nodes[from];
              const toNode = nodes[to];
              if (!fromNode || !toNode) return null;
              return (
                <line
                  key={idx}
                  x1={`${fromNode.x}%`}
                  y1={`${fromNode.y}%`}
                  x2={`${toNode.x}%`}
                  y2={`${toNode.y}%`}
                  stroke={selectedNode === fromNode.id || selectedNode === toNode.id ? '#6b7280' : '#374151'}
                  strokeWidth={selectedNode === fromNode.id || selectedNode === toNode.id ? 2 : 1}
                  strokeDasharray={selectedNode === fromNode.id || selectedNode === toNode.id ? 'none' : '5,5'}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;
            const size = Math.max(80, Math.min(140, 80 + node.transactionCount * 15));

            return (
              <div
                key={node.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isSelected ? 'z-20' : 'z-10'
                }`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                }}
              >
                {/* Pulse animation for selected */}
                {isSelected && (
                  <div className="absolute inset-0 -m-3 rounded-full bg-gray-500/20 animate-ping" />
                )}
                
                {/* Node */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNode(isSelected ? null : node.id);
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'bg-gray-700 border-gray-400 shadow-lg shadow-gray-500/30 scale-110'
                      : isHovered
                      ? 'bg-gray-800 border-gray-500 scale-105'
                      : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                  }`}
                  style={{ width: `${size}px`, height: `${size}px` }}
                >
                  <span className="text-2xl mb-1">{node.icon}</span>
                  <span className="text-xs font-medium text-gray-300 truncate px-2">{node.name}</span>
                  <span className={`text-xs font-bold mt-0.5 ${node.total >= 0 ? 'text-gray-200' : 'text-gray-400'}`}>
                    {formatCurrency(node.total)}
                  </span>
                  
                  {/* Transaction count badge */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 border border-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-gray-200 font-bold">{node.transactionCount}</span>
                  </div>
                </button>

                {/* Tooltip on hover */}
                {isHovered && !isSelected && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 whitespace-nowrap shadow-xl z-30">
                    <p className="text-xs text-gray-300 font-medium">{node.name}</p>
                    <p className="text-xs text-gray-500">{node.transactionCount} transacciones</p>
                    <p className={`text-xs font-bold ${node.total >= 0 ? 'text-gray-200' : 'text-gray-400'}`}>
                      Total: {formatCurrency(node.total)}
                    </p>
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

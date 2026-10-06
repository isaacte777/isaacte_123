import { DraggableShape, ShapeType } from '../types';

interface ShapePanelProps {
  shapes: DraggableShape[];
  onDragStart: (shape: DraggableShape) => void;
}

function ShapeIcon({ type, size = 32 }: { type: ShapeType; size?: number }) {
  const s = size;
  const half = s / 2;

  switch (type) {
    case 'circle':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half - 2} fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'square':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <rect x="2" y="2" width={s - 4} height={s - 4} fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
        </svg>
      );
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${half},3 ${s - 3},${s - 3} 3,${s - 3}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'hexagon':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon
            points={`${half},2 ${s - 4},${half * 0.5} ${s - 4},${s - half * 0.5} ${half},${s - 2} 4,${s - half * 0.5} 4,${half * 0.5}`}
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
          />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${half},2 ${s - 2},${half} ${half},${s - 2} 2,${half}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'star':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon
            points={`${half},2 ${half + 4},${half - 4} ${s - 2},${half - 2} ${half + 5},${half + 2} ${s - 5},${s - 3} ${half},${half + 5} 5,${s - 3} ${half - 5},${half + 2} 2,${half - 2} ${half - 4},${half - 4}`}
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
          />
        </svg>
      );
    case 'pentagon':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon
            points={`${half},2 ${s - 2},${half * 0.7} ${s - 5},${s - 3} 5,${s - 3} 2,${half * 0.7}`}
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
          />
        </svg>
      );
    case 'octagon':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon
            points={`${half * 0.6},2 ${s - half * 0.6},2 ${s - 2},${half * 0.6} ${s - 2},${s - half * 0.6} ${s - half * 0.6},${s - 2} ${half * 0.6},${s - 2} 2,${s - half * 0.6} 2,${half * 0.6}`}
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export { ShapeIcon };

export default function ShapePanel({ shapes, onDragStart }: ShapePanelProps) {
  return (
    <div className="w-56 bg-black border-r border-gray-800 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Figuras</h2>
        <p className="text-[10px] text-gray-600 mt-1">Arrastra al canvas</p>
      </div>

      {/* Shapes Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {shapes.map((shape) => (
            <div
              key={shape.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(shape));
                onDragStart(shape);
              }}
              className="group relative bg-gray-950 border border-gray-800 rounded-xl p-3 flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing hover:border-gray-600 hover:bg-gray-900 transition-all duration-200"
              title={shape.description}
            >
              <div className="text-gray-400 group-hover:text-gray-200 transition-colors">
                <ShapeIcon type={shape.type} size={36} />
              </div>
              <span className="text-[10px] text-gray-500 group-hover:text-gray-300 font-medium text-center leading-tight transition-colors">
                {shape.label}
              </span>
              {/* Drag indicator */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-600">
                  <circle cx="3" cy="3" r="1" fill="currentColor" />
                  <circle cx="7" cy="3" r="1" fill="currentColor" />
                  <circle cx="3" cy="7" r="1" fill="currentColor" />
                  <circle cx="7" cy="7" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-gray-950 border border-gray-800 rounded-lg">
          <p className="text-[10px] text-gray-600 leading-relaxed">
            <span className="text-gray-400 font-medium">Tip:</span> Arrastra las figuras al mapa para marcar zonas. Puedes vincularlas a nodos financieros y añadir notas.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-600" />
          <span className="text-[10px] text-gray-600">8 figuras disponibles</span>
        </div>
      </div>
    </div>
  );
}

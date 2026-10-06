import { DraggableShape, ShapeType } from '../types';

interface ShapePanelProps {
  shapes: DraggableShape[];
  onDragStart: (shape: DraggableShape) => void;
}

function ShapeSVG({ type, size = 28 }: { type: ShapeType; size?: number }) {
  const s = size;
  const h = s / 2;
  const sw = 1.5;

  const props = {
    width: s, height: s, viewBox: `0 0 ${s} ${s}`,
    fill: 'none', stroke: 'currentColor', strokeWidth: sw,
  };

  switch (type) {
    case 'circle':
      return <svg {...props}><circle cx={h} cy={h} r={h - 3} /></svg>;
    case 'square':
      return <svg {...props}><rect x="3" y="3" width={s - 6} height={s - 6} rx="1" /></svg>;
    case 'triangle':
      return <svg {...props}><polygon points={`${h},3 ${s - 3},${s - 3} 3,${s - 3}`} strokeLinejoin="round" /></svg>;
    case 'hexagon':
      return <svg {...props}><polygon points={`${h},2 ${s - 4},${h * 0.45} ${s - 4},${s - h * 0.45} ${h},${s - 2} 4,${s - h * 0.45} 4,${h * 0.45}`} strokeLinejoin="round" /></svg>;
    case 'diamond':
      return <svg {...props}><polygon points={`${h},2 ${s - 2},${h} ${h},${s - 2} 2,${h}`} strokeLinejoin="round" /></svg>;
    case 'star': {
      const pts = [];
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 72 - 90) * (Math.PI / 180);
        const innerAngle = ((i * 72) + 36 - 90) * (Math.PI / 180);
        pts.push(`${h + (h - 2) * Math.cos(outerAngle)},${h + (h - 2) * Math.sin(outerAngle)}`);
        pts.push(`${h + (h * 0.45) * Math.cos(innerAngle)},${h + (h * 0.45) * Math.sin(innerAngle)}`);
      }
      return <svg {...props}><polygon points={pts.join(' ')} strokeLinejoin="round" /></svg>;
    }
    case 'pentagon': {
      const pts = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 90) * (Math.PI / 180);
        pts.push(`${h + (h - 2) * Math.cos(angle)},${h + (h - 2) * Math.sin(angle)}`);
      }
      return <svg {...props}><polygon points={pts.join(' ')} strokeLinejoin="round" /></svg>;
    }
    case 'octagon': {
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i * 45 - 90) * (Math.PI / 180);
        pts.push(`${h + (h - 2) * Math.cos(angle)},${h + (h - 2) * Math.sin(angle)}`);
      }
      return <svg {...props}><polygon points={pts.join(' ')} strokeLinejoin="round" /></svg>;
    }
  }
}

export { ShapeSVG };

export default function ShapePanel({ shapes, onDragStart }: ShapePanelProps) {
  return (
    <div className="w-48 bg-black border-r border-[#1a1a1a] flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-3 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white/30">
            <rect x="1" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1" />
            <circle cx="9" cy="3" r="2" stroke="currentColor" strokeWidth="1" />
            <polygon points="3,11 1,8 5,8" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
          <span className="text-[11px] text-white/50 font-medium">Shapes</span>
        </div>
        <p className="text-[9px] text-white/20 mt-1 font-mono">drag to canvas</p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-1.5">
          {shapes.map((shape) => (
            <div
              key={shape.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(shape));
                e.dataTransfer.effectAllowed = 'move';
                onDragStart(shape);
              }}
              className="group relative aspect-square bg-[#0a0a0a] border border-[#1a1a1a] rounded-md flex flex-col items-center justify-center gap-1.5 cursor-grab active:cursor-grabbing hover:border-white/20 hover:bg-[#111] transition-all duration-150"
            >
              <div className="text-white/30 group-hover:text-white/70 transition-colors duration-150">
                <ShapeSVG type={shape.type} size={24} />
              </div>
              <span className="text-[8px] text-white/20 group-hover:text-white/50 font-mono transition-colors">
                {shape.label}
              </span>
              {/* Corner indicator */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="6" height="6" viewBox="0 0 6 6" className="text-white/20">
                  <circle cx="1.5" cy="1.5" r="0.7" fill="currentColor" />
                  <circle cx="4.5" cy="1.5" r="0.7" fill="currentColor" />
                  <circle cx="1.5" cy="4.5" r="0.7" fill="currentColor" />
                  <circle cx="4.5" cy="4.5" r="0.7" fill="currentColor" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-[#1a1a1a]">
        <p className="text-[8px] text-white/15 font-mono leading-relaxed">
          drop on canvas to place<br/>drag nodes to reposition
        </p>
      </div>
    </div>
  );
}

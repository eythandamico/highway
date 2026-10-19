"use client";

import { useRef } from "react";

/** Keyboard-accessible splitter; pointer capture keeps dragging predictable. */
export function PanelResizeHandle({ value, min, max, onChange, onDragChange, onReset }: {
  value: number; min: number; max: number; onChange: (value: number) => void;
  onDragChange: (dragging: boolean) => void; onReset: () => void;
}) {
  const drag = useRef<{ x: number; width: number } | null>(null);
  const resize = (width: number) => onChange(Math.round(Math.max(min, Math.min(max, width))));
  return <div className="panel-resize-handle" role="separator" aria-label="Resize information panel" aria-orientation="vertical"
    aria-valuemin={min} aria-valuemax={max} aria-valuenow={Math.round(value)} aria-valuetext={`${Math.round(value)} pixels`} tabIndex={0}
    onPointerDown={event => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { x: event.clientX, width: value };
      onDragChange(true);
    }}
    onPointerMove={event => { if (drag.current) resize(drag.current.width + event.clientX - drag.current.x); }}
    onPointerUp={event => { drag.current = null; onDragChange(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
    onLostPointerCapture={() => { drag.current = null; onDragChange(false); }}
    onPointerCancel={() => { drag.current = null; onDragChange(false); }}
    onDoubleClick={onReset}
    onKeyDown={event => {
      const step = event.shiftKey ? 48 : 16;
      if (event.key === "ArrowLeft") resize(value - step);
      else if (event.key === "ArrowRight") resize(value + step);
      else if (event.key === "Home") resize(min);
      else if (event.key === "End") resize(max);
      else return;
      event.preventDefault();
    }}><span/></div>;
}

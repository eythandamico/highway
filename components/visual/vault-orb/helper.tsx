"use client";
import { VaultOrb } from './avatar';
import { usePebbleAttention } from '../pebble/use-pebble-attention';
import '../pebble/pebble.css';
import './orb.css';

export function MetalHelper({ thinking = false }: { thinking?: boolean }) {
  const attention = usePebbleAttention(thinking);
  return <span ref={attention} className="yw-pebble yw-metal-helper" data-thinking={thinking} aria-hidden="true">
    <VaultOrb thinking={thinking} />
    <svg className="yw-metal-face" viewBox="0 0 48 48" focusable="false">
      <g className="yw-pebble-face-float"><g className="yw-pebble-gaze"><g className="yw-pebble-eyes">
        <ellipse className="yw-pebble-eye yw-pebble-eye-left" cx="17.75" cy="24" rx="3.1" ry="5.3" />
        <ellipse className="yw-pebble-eye yw-pebble-eye-right" cx="30.25" cy="24" rx="3.1" ry="5.3" />
      </g></g></g>
    </svg>
  </span>;
}

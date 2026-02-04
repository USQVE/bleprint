
import React from 'react';

interface ConnectionProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  preview?: boolean;
}

const Connection: React.FC<ConnectionProps> = ({ startX, startY, endX, endY, color, preview }) => {
  const dx = Math.abs(endX - startX);
  const curvature = Math.min(300, Math.max(80, dx * 0.5));

  const path = `M ${startX} ${startY} C ${startX + curvature} ${startY}, ${endX - curvature} ${endY}, ${endX} ${endY}`;

  return (
    <g>
      {/* Outer dark stroke for contrast */}
      <path
        d={path}
        fill="none"
        stroke="rgba(0,0,0,0.8)"
        strokeWidth={preview ? 6 : 7}
        strokeLinecap="round"
      />
      {/* Primary line with glow */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={preview ? 2 : 3}
        strokeOpacity={preview ? 0.5 : 1}
        strokeLinecap="round"
        style={{
          filter: preview ? 'none' : `drop-shadow(0 0 4px ${color}88)`,
        }}
      />
    </g>
  );
};

export default Connection;

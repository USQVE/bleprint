import React from 'react';

interface ConnectionProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  preview?: boolean;
}

const Connection: React.FC<ConnectionProps> = ({
  startX,
  startY,
  endX,
  endY,
  color,
  preview = false
}) => {
  // Calculate Bezier curve control points
  const dx = endX - startX;
  const dy = endY - startY;
  const cp1x = startX + dx * 0.25;
  const cp1y = startY;
  const cp2x = endX - dx * 0.25;
  const cp2y = endY;

  const pathData = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

  return (
    <>
      {/* Shadow layer for depth */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(0, 0, 0, 0.5)"
        strokeWidth={preview ? 2 : 3}
        strokeLinecap="round"
        opacity={0.5}
        filter="blur(2px)"
      />

      {/* Main connection line */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={preview ? 2 : 3}
        strokeLinecap="round"
        opacity={preview ? 0.6 : 1}
        style={{
          filter: `drop-shadow(0 0 6px ${color})`,
          transition: 'stroke-width 0.2s'
        }}
      />

      {/* Arrow head */}
      {!preview && (
        <g>
          <defs>
            <marker
              id={`arrowhead-${color.replace('#', '')}`}
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill={color} />
            </marker>
          </defs>
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={3}
            markerEnd={`url(#arrowhead-${color.replace('#', '')})`}
            opacity={0}
          />
        </g>
      )}

      {/* Glow effect for active connections */}
      {!preview && (
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          opacity={0.1}
          filter="blur(4px)"
        />
      )}
    </>
  );
};

export default Connection;

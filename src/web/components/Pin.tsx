import React from 'react';
import { Pin as PinType } from '../types';

interface PinProps {
  pin: PinType;
  onDisconnect: (pinId: string) => void;
  onMouseDown: (pinId: string, e: React.MouseEvent) => void;
  onMouseUp: (pinId: string, e: React.MouseEvent) => void;
}

const Pin: React.FC<PinProps> = ({ pin, onDisconnect, onMouseDown, onMouseUp }) => {
  const isExec = pin.type === 'exec';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Shift+Click or RMB to disconnect
    if (e.shiftKey || e.button === 2) {
      e.preventDefault();
      onDisconnect(pin.id);
      return;
    }

    if (e.button === 0) {
      onMouseDown(pin.id, e);
    }
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseUp={(e) => onMouseUp(pin.id, e)}
      className="pin-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '3px 12px',
        cursor: 'crosshair',
        flexDirection: pin.isOutput ? 'row-reverse' : 'row',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div
        style={{
          position: 'relative',
          width: 14,
          height: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isExec ? (
          // Arrow shape for Exec pins
          <div
            style={{
              width: 11,
              height: 11,
              border: `2px solid ${pin.color}`,
              clipPath: 'polygon(0% 0%, 65% 0%, 100% 50%, 65% 100%, 0% 100%)',
              background: 'transparent',
              boxShadow: `0 0 8px ${pin.color}44`,
            }}
          />
        ) : (
          // Circle shape for other pins
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: pin.color,
              boxShadow: `0 0 10px ${pin.color}66`,
            }}
          />
        )}
      </div>

      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          pointerEvents: 'none',
        }}
      >
        {pin.name}
      </span>
    </div>
  );
};

export default Pin;

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { NodeData, Pin } from '../types';

interface NodeProps {
  node: NodeData;
  onDrag: (id: string, dx: number, dy: number) => void;
  onDelete: (id: string) => void;
  onDisconnectPin: (pinId: string) => void;
  onPinMouseDown: (nodeId: string, pinId: string, e: React.MouseEvent) => void;
  onPinMouseUp?: (pinId: string, e: React.MouseEvent) => void;
  onNodeMouseUp?: (nodeId: string) => void;
}

const Node: React.FC<NodeProps> = ({
  node,
  onDrag,
  onDelete,
  onDisconnectPin,
  onPinMouseDown,
  onPinMouseUp,
  onNodeMouseUp
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as any).closest('button') || (e.target as any).closest('.pin-circle')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !nodeRef.current) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    onDrag(node.id, dx, dy);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    onNodeMouseUp?.(node.id);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const getHeaderColor = () => {
    switch (node.color) {
      case 'red': return 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)';
      case 'blue': return 'linear-gradient(135deg, #4488ff 0%, #0055ff 100%)';
      case 'gray': return 'linear-gradient(135deg, #666666 0%, #333333 100%)';
      default: return 'linear-gradient(135deg, #444444 0%, #222222 100%)';
    }
  };

  const HEADER_H = 40;
  const PIN_ROW_H = 26;
  const PADDING = 10;

  const getNodeShadow = () => {
    switch (node.color) {
      case 'red': return '0 0 20px rgba(255, 68, 68, 0.3)';
      case 'blue': return '0 0 20px rgba(68, 136, 255, 0.3)';
      default: return '0 0 20px rgba(100, 100, 100, 0.2)';
    }
  };

  return (
    <div
      ref={nodeRef}
      className="node-card"
      style={{
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${node.width}px`,
        minHeight: `${node.height}px`,
        background: 'linear-gradient(135deg, rgba(30, 30, 35, 0.95) 0%, rgba(20, 20, 25, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: getNodeShadow(),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: 'box-shadow 0.2s',
        backdropFilter: 'blur(12px)'
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={() => onNodeMouseUp?.(node.id)}
    >
      {/* Header */}
      <div
        style={{
          height: `${HEADER_H}px`,
          background: getHeaderColor(),
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          minHeight: '40px'
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 900,
            color: 'white',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
            letterSpacing: '0.05em',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {node.title}
        </span>
        <button
          onClick={() => onDelete(node.id)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#ff6666',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginLeft: '8px'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 100, 100, 0.3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
        >
          <X size={14} />
        </button>
      </div>

      {/* Pins Container */}
      <div style={{ flex: 1, display: 'flex', padding: `${PADDING}px 0` }}>
        {/* Input Pins */}
        <div className="pin-row" style={{ flex: 1, borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {node.inputs.map((pin, idx) => (
            <PinRow
              key={pin.id}
              pin={pin}
              isLeft={true}
              y={HEADER_H + (idx + 0.5) * PIN_ROW_H}
              onMouseDown={(e) => onPinMouseDown(node.id, pin.id, e)}
              onMouseUp={(e) => onPinMouseUp?.(pin.id, e)}
              onDisconnect={() => onDisconnectPin(pin.id)}
            />
          ))}
        </div>

        {/* Output Pins */}
        <div className="pin-row" style={{ flex: 1 }}>
          {node.outputs.map((pin, idx) => (
            <PinRow
              key={pin.id}
              pin={pin}
              isLeft={false}
              y={HEADER_H + (idx + 0.5) * PIN_ROW_H}
              onMouseDown={(e) => onPinMouseDown(node.id, pin.id, e)}
              onMouseUp={(e) => onPinMouseUp?.(pin.id, e)}
              onDisconnect={() => onDisconnectPin(pin.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface PinRowProps {
  pin: Pin;
  isLeft: boolean;
  y: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onDisconnect: () => void;
}

const PinRow: React.FC<PinRowProps> = ({ pin, isLeft, y, onMouseDown, onMouseUp, onDisconnect }) => {
  return (
    <div
      className="pin-row"
      style={{
        height: '26px',
        display: 'flex',
        alignItems: 'center',
        paddingRight: isLeft ? '8px' : undefined,
        paddingLeft: !isLeft ? '8px' : undefined,
        justifyContent: isLeft ? 'flex-start' : 'flex-end',
        gap: '6px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDisconnect();
      }}
    >
      {isLeft && (
        <>
          <div
            className="pin-circle"
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: pin.color,
              border: '2px solid rgba(255, 255, 255, 0.4)',
              cursor: 'crosshair',
              boxShadow: `0 0 8px ${pin.color}`,
              transition: 'all 0.2s',
              flex: '0 0 auto'
            }}
            title={`${pin.name} (${pin.type})`}
          />
          <span
            style={{
              fontSize: '10px',
              color: '#aaa',
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0
            }}
          >
            {pin.name}
          </span>
        </>
      )}

      {!isLeft && (
        <>
          <span
            style={{
              fontSize: '10px',
              color: '#aaa',
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
              textAlign: 'right'
            }}
          >
            {pin.name}
          </span>
          <div
            className="pin-circle"
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: pin.color,
              border: '2px solid rgba(255, 255, 255, 0.4)',
              cursor: 'crosshair',
              boxShadow: `0 0 8px ${pin.color}`,
              transition: 'all 0.2s',
              flex: '0 0 auto'
            }}
            title={`${pin.name} (${pin.type})`}
          />
        </>
      )}
    </div>
  );
};

export default Node;

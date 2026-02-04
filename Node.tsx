
import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { NodeData } from '../types';
import Pin from './Pin';

interface NodeProps {
  node: NodeData;
  onDrag: (id: string, dx: number, dy: number) => void;
  onDelete: (id: string) => void;
  onDisconnectPin: (pinId: string) => void;
  onPinMouseDown: (nodeId: string, pinId: string, e: React.MouseEvent) => void;
  onPinMouseUp: (nodeId: string, pinId: string, e: React.MouseEvent) => void;
  onNodeMouseUp: (nodeId: string, e: React.MouseEvent) => void;
}

const Node: React.FC<NodeProps> = ({
  node,
  onDrag,
  onDelete,
  onDisconnectPin,
  onPinMouseDown,
  onPinMouseUp,
  onNodeMouseUp,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const headerBg =
    node.color === 'red'
      ? 'linear-gradient(180deg, #d32f2f 0%, #8b0000 100%)'
      : node.color === 'blue'
      ? 'linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%)'
      : 'linear-gradient(180deg, #525252 0%, #262626 100%)';

  const avatarUrl = `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(node.title)}`;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // movementX/Y is supported in all modern browsers and handles deltas well
      onDrag(node.id, e.movementX, e.movementY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Global listeners ensure we catch the event even if the mouse leaves the node
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, node.id, onDrag]);

  return (
    <div
      className="node-card"
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => onNodeMouseUp(node.id, e)}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: node.height,
        borderRadius: 8,
        background: '#1c1c1c',
        border: isDragging ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.15)',
        boxShadow: isDragging 
          ? '0 30px 60px rgba(0,0,0,0.8), 0 0 20px rgba(59,130,246,0.3)' 
          : '0 10px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: isDragging ? 5000 : 100,
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Glossy Header */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          height: 38,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 12px',
          background: headerBg,
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
          borderBottom: '1px solid rgba(0,0,0,0.3)',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '45%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ 
          width: 22, height: 22, borderRadius: 4, background: 'rgba(0,0,0,0.2)', 
          border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' 
        }}>
          <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%' }} />
        </div>
        
        <div style={{
          flex: 1, fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {node.title}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer', padding: 4, display: 'flex'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <X size={14} />
        </button>
      </div>

      {/* Inputs and Outputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '6px 0', background: 'rgba(0,0,0,0.2)', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {node.inputs.map((pin) => (
            <Pin
              key={pin.id}
              pin={pin}
              onDisconnect={onDisconnectPin}
              onMouseDown={(id, e) => onPinMouseDown(node.id, id, e)}
              onMouseUp={(id, e) => onPinMouseUp(node.id, id, e)}
            />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
          {node.outputs.map((pin) => (
            <Pin
              key={pin.id}
              pin={pin}
              onDisconnect={onDisconnectPin}
              onMouseDown={(id, e) => onPinMouseDown(node.id, id, e)}
              onMouseUp={(id, e) => onPinMouseUp(node.id, id, e)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Node;

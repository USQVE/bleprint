import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw, Copy, Download, Upload, Grid3X3, Maximize2 } from 'lucide-react';
import { NodeData } from '../types';

interface ControlPanelProps {
  nodes: NodeData[];
  onCreateNode: (title: string, color: 'red' | 'blue' | 'gray') => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRecenter: () => void;
  onAutoLayout: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  nodes,
  onCreateNode,
  onClearAll,
  onExport,
  onImport,
  onRecenter,
  onAutoLayout,
}) => {
  const [showCreateNode, setShowCreateNode] = useState(false);
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeColor, setNodeColor] = useState<'red' | 'blue' | 'gray'>('blue');

  const handleCreateNode = () => {
    if (nodeTitle.trim()) {
      onCreateNode(nodeTitle, nodeColor);
      setNodeTitle('');
      setNodeColor('blue');
      setShowCreateNode(false);
    }
  };

  return (
    <>
      {/* Main Control Panel */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
          zIndex: 1000,
          background: 'rgba(10, 10, 12, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 300,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 4,
          }}
        >
          📋 Graph Controls
        </div>

        {/* Node Creation */}
        <button
          onClick={() => setShowCreateNode(true)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#10b981',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
        >
          <Plus size={16} /> Create Node ({nodes.length})
        </button>

        {/* Layout Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onAutoLayout}
            title="Auto Layout"
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              color: 'white',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          >
            <Grid3X3 size={14} style={{ margin: '0 auto' }} />
          </button>
          <button
            onClick={onRecenter}
            title="Recenter"
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              color: 'white',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          >
            <RotateCcw size={14} style={{ margin: '0 auto' }} />
          </button>
        </div>

        {/* Import/Export */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onExport}
            title="Export"
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          >
            <Download size={14} style={{ margin: '0 auto' }} />
          </button>
          <label
            title="Import"
            style={{
              flex: 1,
              padding: '8px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          >
            <Upload size={14} />
            <input
              type="file"
              onChange={onImport}
              accept=".json,.arrow,.tree"
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Clear */}
        <button
          onClick={onClearAll}
          style={{
            width: '100%',
            padding: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 6,
            color: '#ef4444',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 11,
            textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
        >
          <Trash2 size={12} style={{ marginRight: 4 }} />
          Clear All
        </button>
      </div>

      {/* Create Node Modal */}
      {showCreateNode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowCreateNode(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.98), rgba(30, 30, 35, 0.98))',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 32,
              maxWidth: 400,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div>
              <h2 style={{ color: 'white', margin: '0 0 20px 0', fontSize: 18, fontWeight: 800 }}>
                ➕ Create New Node
              </h2>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  color: '#aaa',
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Node Title
              </label>
              <input
                type="text"
                value={nodeTitle}
                onChange={(e) => setNodeTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateNode()}
                placeholder="e.g. GetActorLocation, PrintString..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                autoFocus
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  color: '#aaa',
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Node Type
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['red', 'blue', 'gray'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNodeColor(color)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background:
                        nodeColor === color
                          ? color === 'red'
                            ? '#d32f2f'
                            : color === 'blue'
                            ? '#2563eb'
                            : '#525252'
                          : 'rgba(255,255,255,0.07)',
                      border: nodeColor === color ? `2px solid ${color === 'red' ? '#ff4444' : color === 'blue' ? '#60a5fa' : '#888'}` : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      transition: 'all 0.2s',
                    }}
                  >
                    {color === 'red' ? '🔴' : color === 'blue' ? '🔵' : '⚫'} {color}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowCreateNode(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNode}
                disabled={!nodeTitle.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: nodeTitle.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                  opacity: nodeTitle.trim() ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => nodeTitle.trim() && (e.currentTarget.style.background = '#059669')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
              >
                Create Node
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ControlPanel;

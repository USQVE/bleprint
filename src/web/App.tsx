import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import {
  Database, Play, RotateCcw, Trash2, Plus, Minus, MousePointer2, X, Terminal, ZoomIn, ZoomOut,
  ListTree, Copy, Check, Download, Upload
} from 'lucide-react';

import { CommentBox as CommentBoxType, Connection as ConnectionType, NodeData } from './types';
import {
  parseUniversal, buildAsciiTreeExec, exportToArrow, exportToTree, exportToJSON, importFromJSON
} from './utils/parser';
import { INITIAL_TEXT_DATA } from './constants';

import Node from './components/Node';
import Connection from './components/Connection';
import CommentBox from './components/CommentBox';
import ControlPanel from './components/ControlPanel';

type DragConnection = {
  startNodeId: string;
  startPinId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
} | null;

const CANVAS_W = 10000;
const CANVAS_H = 10000;

const App: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [connections, setConnections] = useState<ConnectionType[]>([]);
  const [commentBoxes, setCommentBoxes] = useState<CommentBoxType[]>([]);
  const [inputText, setInputText] = useState(INITIAL_TEXT_DATA);
  const [treeText, setTreeText] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [exportFormat, setExportFormat] = useState<'arrow' | 'tree' | 'json'>('arrow');
  const [dragConnection, setDragConnection] = useState<DragConnection>(null);
  const [copied, setCopied] = useState(false);

  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const nodesById = useMemo(() => {
    const map = new Map<string, NodeData>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  const applyGraph = useCallback(() => {
    try {
      const parsed = parseUniversal(inputText);
      setNodes(parsed.nodes);
      setConnections(parsed.connections);
      setTreeText(buildAsciiTreeExec(parsed.nodes, parsed.connections));
      setCommentBoxes([
        { id: 'cb1', title: 'Blueprint Logic Stream', x: 100, y: 100, width: 2500, height: 2500 }
      ]);
      setShowEditor(false);
    } catch (e) {
      console.error('Parse error', e);
    }
  }, [inputText]);

  useEffect(() => {
    applyGraph();
  }, [applyGraph]);

  const handleNodeDrag = useCallback((id: string, dx: number, dy: number) => {
    const scale = transformRef.current?.instance.transformState.scale ?? 1;
    setNodes(prev => prev.map(node => node.id === id ? {
      ...node,
      x: node.x + dx / scale,
      y: node.y + dy / scale
    } : node));
  }, []);

  const getPinPos = useCallback((nodeId: string, pinId: string) => {
    const node = nodesById.get(nodeId);
    if (!node) return { x: 0, y: 0 };
    const isInput = node.inputs.some(p => p.id === pinId);
    const list = isInput ? node.inputs : node.outputs;
    const index = list.findIndex(p => p.id === pinId);
    const x = isInput ? node.x + 14 : node.x + node.width - 14;
    const y = node.y + 38 + (index + 0.5) * 26 + 6;
    return { x, y };
  }, [nodesById]);

  const handlePinMouseDown = useCallback((nodeId: string, pinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodesById.get(nodeId);
    const pin = [...(node?.inputs || []), ...(node?.outputs || [])].find(p => p.id === pinId);
    if (!pin) return;
    const { x, y } = getPinPos(nodeId, pinId);
    setDragConnection({ startNodeId: nodeId, startPinId: pinId, startX: x, startY: y, endX: x, endY: y, color: pin.color });
  }, [getPinPos, nodesById]);

  const handleMouseMove = useCallback((e: MouseEvent): void => {
    if (!dragConnection || !transformRef.current || !viewportRef.current) return;
    const { scale, positionX, positionY } = transformRef.current.instance.transformState;
    const rect = viewportRef.current.getBoundingClientRect();
    setDragConnection((prev: DragConnection): DragConnection => prev ? {
      ...prev,
      endX: (e.clientX - rect.left - positionX) / scale,
      endY: (e.clientY - rect.top - positionY) / scale
    } : null);
  }, [dragConnection]);

  const finalizeConnection = (n1: string, p1: string, n2: string, p2: string, color: string): void => {
    const startPin = [...(nodesById.get(n1)?.inputs || []), ...(nodesById.get(n1)?.outputs || [])].find(p => p.id === p1);
    const endPin = [...(nodesById.get(n2)?.inputs || []), ...(nodesById.get(n2)?.outputs || [])].find(p => p.id === p2);
    if (!startPin || !endPin || startPin.isOutput === endPin.isOutput) return;

    setConnections(prev => [
      ...prev.filter(c => c.toPin !== (startPin.isOutput ? p2 : p1)),
      {
        id: `c-${Date.now()}-${Math.random()}`,
        fromNode: startPin.isOutput ? n1 : n2,
        fromPin: startPin.isOutput ? p1 : p2,
        toNode: startPin.isOutput ? n2 : n1,
        toPin: startPin.isOutput ? p2 : p1,
        color
      }
    ]);
    setDragConnection(null);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    const resetDrag = () => setDragConnection(null);
    window.addEventListener('mouseup', resetDrag);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', resetDrag);
    };
  }, [handleMouseMove]);

  const handleCopyTree = (): void => {
    navigator.clipboard.writeText(treeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (): void => {
    let content = '';
    let filename = '';

    try {
      if (exportFormat === 'arrow') {
        content = exportToArrow(nodes, connections);
        filename = 'blueprint_export.arrow';
      } else if (exportFormat === 'tree') {
        content = exportToTree(nodes, connections);
        filename = 'blueprint_export.tree';
      } else {
        content = exportToJSON(nodes, connections);
        filename = 'blueprint_export.json';
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>): void => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const parsed = importFromJSON(content);
          setNodes(parsed.nodes);
          setConnections(parsed.connections);
        } else {
          setInputText(content);
        }
      } catch (error) {
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  // Node Management Functions
  const handleCreateNode = useCallback((title: string, color: 'red' | 'blue' | 'gray'): void => {
    const newNode: NodeData = {
      id: `node_${Date.now()}_${Math.random()}`,
      title,
      x: Math.random() * 2000 + 500,
      y: Math.random() * 2000 + 500,
      width: 250,
      height: 100,
      color,
      inputs: [],
      outputs: [],
    };
    setNodes((prev: NodeData[]): NodeData[] => [...prev, newNode]);
  }, []);

  const handleDeleteNode = useCallback((nodeId: string): void => {
    setNodes((prev: NodeData[]): NodeData[] => prev.filter(n => n.id !== nodeId));
    setConnections((prev: ConnectionType[]): ConnectionType[] => prev.filter(c => c.fromNode !== nodeId && c.toNode !== nodeId));
  }, []);

  const handleClearAll = useCallback((): void => {
    if (window.confirm('Are you sure? This will delete all nodes and connections.')) {
      setNodes([]);
      setConnections([]);
      setTreeText('');
    }
  }, []);

  const handleAutoLayout = useCallback((): void => {
    const cols = Math.ceil(Math.sqrt(nodes.length));

    setNodes((prev: NodeData[]): NodeData[] =>
      prev.map((node: NodeData, idx: number): NodeData => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        return {
          ...node,
          x: 200 + col * 400,
          y: 200 + row * 300,
        };
      })
    );
  }, [nodes.length]);

  const handleRecenter = useCallback((): void => {
    transformRef.current?.resetTransform();
  }, []);

  return (
    <div ref={viewportRef} style={{ width: '100vw', height: '100vh', background: '#0e0e10', overflow: 'hidden', position: 'relative' }}>

      {/* Control Panel */}
      <ControlPanel
        nodes={nodes}
        onCreateNode={handleCreateNode}
        onClearAll={handleClearAll}
        onExport={handleExport}
        onImport={handleImport}
        onRecenter={handleRecenter}
        onAutoLayout={handleAutoLayout}
      />

      {/* Parser Toolbar */}
      <div style={{
        position: 'absolute', top: 20, right: 20, zIndex: 1000, display: 'flex', gap: 8,
        padding: '6px', background: 'rgba(25, 25, 28, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)'
      }}>
        <button onClick={() => setShowEditor(!showEditor)} style={btnStyle} title="Open Parser Tool"><Database size={16} /></button>
        <button onClick={applyGraph} style={{ ...btnStyle, background: '#10b981' }} title="Parse Input"><Play size={16} fill="white" className="ml-0.5" /></button>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', alignSelf: 'center', margin: '0 4px' }} />
        <button onClick={() => transformRef.current?.zoomIn(0.4)} style={btnStyle} title="Zoom In"><Plus size={16} /></button>
        <button onClick={() => transformRef.current?.zoomOut(0.4)} style={btnStyle} title="Zoom Out"><Minus size={16} /></button>
      </div>

      <div style={{
        position: 'absolute', bottom: 20, left: 20, zIndex: 1000,
        padding: '8px 16px', background: 'rgba(0,0,0,0.7)', borderRadius: 20,
        fontSize: 10, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.12em',
        border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 20, alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MousePointer2 size={14} /> RMB: Pan View</div>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        <div>Use + / - buttons to zoom</div>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ color: '#bbb' }}>Shift+Click: Disconnect</div>
      </div>

      <TransformWrapper
        ref={transformRef}
        initialScale={0.7}
        minScale={0.01}
        maxScale={3}
        centerOnInit
        limitToBounds={false}
        wheel={{ disabled: true }}
        zoomAnimation={{ animationType: "easeOut", animationTime: 400 }}
        panning={{ velocityDisabled: true, excluded: ['node-card', 'pin-row', 'textarea', 'button'], activationKeys: [] }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: CANVAS_W, height: CANVAS_H }}>
          <div onContextMenu={e => e.preventDefault()} style={{
            width: CANVAS_W, height: CANVAS_H, position: 'relative', background: '#141417',
            backgroundImage: `
              radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.015) 1.5px, transparent 1.5px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1.5px, transparent 1.5px)
            `,
            backgroundSize: '40px 40px, 200px 200px, 200px 200px'
          }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
              {commentBoxes.map(box => <CommentBox key={box.id} box={box} />)}
            </div>
            <svg style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', width: '100%', height: '100%' }}>
              {connections.map(c => {
                const s = getPinPos(c.fromNode, c.fromPin), e = getPinPos(c.toNode, c.toPin);
                return <Connection key={c.id} startX={s.x} startY={s.y} endX={e.x} endY={e.y} color={c.color} />;
              })}
              {dragConnection && <Connection startX={dragConnection.startX} startY={dragConnection.startY} endX={dragConnection.endX} endY={dragConnection.endY} color={dragConnection.color} preview />}
            </svg>
            <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
              {nodes.map(node => (
                <Node
                  key={node.id} node={node} onDrag={handleNodeDrag} onDelete={id => setNodes(n => n.filter(x => x.id !== id))}
                  onDisconnectPin={id => setConnections(c => c.filter(x => x.fromPin !== id && x.toPin !== id))}
                  onPinMouseDown={handlePinMouseDown}
                  onPinMouseUp={(id, e) => dragConnection && finalizeConnection(dragConnection.startNodeId, dragConnection.startPinId, node.id, id, dragConnection.color)}
                  onNodeMouseUp={(id) => {
                    if (!dragConnection || dragConnection.startNodeId === id) return;
                    const targetNode = nodesById.get(id);
                    if (!targetNode) return;
                    const startPin = [...(nodesById.get(dragConnection.startNodeId)?.inputs || []), ...(nodesById.get(dragConnection.startNodeId)?.outputs || [])].find(p => p.id === dragConnection.startPinId);
                    const candidates = startPin?.isOutput ? targetNode.inputs : targetNode.outputs;
                    const match = candidates.find(p => p.color === dragConnection.color) || candidates[0];
                    if (match) finalizeConnection(dragConnection.startNodeId, dragConnection.startPinId, id, match.id, dragConnection.color);
                  }}
                />
              ))}
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Editor Panel */}
      {showEditor && (
        <div style={{
          position: 'absolute', right: 20, top: 20, bottom: 20, width: 750,
          background: 'rgba(10, 10, 12, 0.98)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, boxShadow: '0 40px 120px rgba(0,0,0,0.9)', zIndex: 2000,
          display: 'flex', flexDirection: 'column', backdropFilter: 'blur(30px)',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Terminal size={18} color="#3b82f6" />
              <span style={{ fontSize: 11, fontWeight: 900, color: '#999', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Universal Node Parser</span>
            </div>
            <button onClick={() => setShowEditor(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Input Side */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ padding: '10px 24px', fontSize: 9, fontWeight: 900, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Source Code</div>
              <textarea
                value={inputText} onChange={(e) => setInputText(e.target.value)} onMouseDown={e => e.stopPropagation()} spellCheck={false}
                style={{
                  flex: 1, background: 'transparent', border: 'none', padding: '10px 24px', color: '#c0c8d4',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.6, outline: 'none', resize: 'none'
                }}
              />
            </div>

            {/* Tree View Side */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ padding: '10px 24px', fontSize: 9, fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ListTree size={12} /> Execution Tree</span>
                <button onClick={handleCopyTree} style={{ background: 'none', border: 'none', color: copied ? '#10b981' : '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <textarea
                value={treeText} readOnly onMouseDown={e => e.stopPropagation()} spellCheck={false}
                style={{
                  flex: 1, background: 'transparent', border: 'none', padding: '10px 24px', color: '#8892b0',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, lineHeight: 1.5, outline: 'none', resize: 'none',
                  cursor: 'default', whiteSpace: 'pre'
                }}
              />
            </div>
          </div>

          <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button onClick={() => setExportFormat('arrow')} style={{
                flex: 1, padding: '8px', background: exportFormat === 'arrow' ? '#2563eb' : 'rgba(255,255,255,0.07)',
                color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                transition: 'all 0.2s'
              }}>Arrow</button>
              <button onClick={() => setExportFormat('tree')} style={{
                flex: 1, padding: '8px', background: exportFormat === 'tree' ? '#2563eb' : 'rgba(255,255,255,0.07)',
                color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                transition: 'all 0.2s'
              }}>Tree</button>
              <button onClick={() => setExportFormat('json')} style={{
                flex: 1, padding: '8px', background: exportFormat === 'json' ? '#2563eb' : 'rgba(255,255,255,0.07)',
                color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                transition: 'all 0.2s'
              }}>JSON</button>
            </div>
            <button onClick={applyGraph} style={{
              width: '100%', padding: '16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 12,
              fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)'
            }} onMouseEnter={e => e.currentTarget.style.background = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
              Parse & Sync Blueprint
            </button>
          </div>
        </div>
      )}

      {/* Version Badge */}
      <div style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        fontSize: '11px',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'monospace',
        zIndex: 999,
        padding: '4px 8px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        v2.0.1
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(80px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        body { background: #0e0e10; color: white; margin: 0; overflow: hidden; font-family: 'Inter', sans-serif; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  width: 38, height: 38, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.07)',
  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
};

export default App;

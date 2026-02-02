import { Graph, Node, PinType, PinDirection } from '../../types';
import { ArrowParser } from '../../parsers/arrowParser';
import { AsciiTreeParser } from '../../parsers/asciiTreeParser';
import { LegacyArrowParser } from '../../parsers/legacyArrowParser';
import { GraphToUIAdapter, NodeData, ConnectionUI } from '../adapter';

/**
 * Universal parser that detects format and uses appropriate parser
 *
 * Supports formats:
 * 1. ASCII Tree: ├── Node1
 * 2. Legacy Arrow (Russian colors): [Node] (Pin - Цвет) → [Node] (Pin - Цвет)
 * 3. Modern Arrow: NodeA[out:Exec] -> NodeB[in:Exec]
 * 4. Simple Arrow: NodeA -> NodeB -> NodeC
 */
export const parseUniversal = (text: string): { nodes: NodeData[]; connections: ConnectionUI[] } => {
  let graph: Graph;

  try {
    // Detect format
    if (text.includes('├──') || text.includes('└──')) {
      // ASCII Tree format
      graph = AsciiTreeParser.parse(text);
    } else if (text.includes('[') && text.includes('(') && (text.includes('→') || text.includes('->'))) {
      // Legacy Arrow format: [NodeName] (PinName - Color) → [NodeName] (PinName - Color)
      // This includes Russian color names like Белый, Зеленый, Желтый, etc.
      graph = LegacyArrowParser.parse(text);
    } else if (text.includes('[') && (text.includes('→') || text.includes('->'))) {
      // Modern Arrow format with type annotations: NodeA[out:Exec] -> NodeB[in:Exec]
      graph = ArrowParser.parse(text);
    } else if (text.includes('->') || text.includes('→')) {
      // Simple Arrow format: NodeA -> NodeB -> NodeC
      graph = ArrowParser.parse(text);
    } else if (text.includes('[') && text.includes(']')) {
      // Try arrow format with brackets
      graph = ArrowParser.parse(text);
    } else {
      // Default: try as arrow format
      graph = ArrowParser.parse(text);
    }
  } catch (error) {
    console.error('Parse error:', error);
    graph = new Graph();
  }

  // Convert to UI format
  const adapter = new GraphToUIAdapter();
  return adapter.adaptGraph(graph);
};

/**
 * Build ASCII tree from nodes and connections (exec flow only)
 */
export const buildAsciiTreeExec = (nodes: NodeData[], connections: ConnectionUI[]): string => {
  // Filter only exec connections
  const execConns = connections.filter(c => {
    const fromNode = nodes.find(n => n.id === c.fromNode);
    const fromPin = fromNode?.outputs.find(p => p.id === c.fromPin);
    return fromPin?.type === 'exec';
  });

  // Build adjacency map
  const outgoing = new Map<string, ConnectionUI[]>();
  const incomingExecCount = new Map<string, number>();

  nodes.forEach(n => {
    outgoing.set(n.id, []);
    incomingExecCount.set(n.id, 0);
  });

  execConns.forEach(c => {
    outgoing.get(c.fromNode)?.push(c);
    incomingExecCount.set(c.toNode, (incomingExecCount.get(c.toNode) || 0) + 1);
  });

  // Find roots
  const roots = nodes.filter(n =>
    (incomingExecCount.get(n.id) ?? 0) === 0 &&
    (outgoing.get(n.id)?.length ?? 0) > 0
  );

  if (roots.length === 0 && nodes.length > 0) {
    // If no roots found, use first node
    roots.push(nodes[0]);
  }

  let result = "";

  const traverse = (
    nodeId: string,
    prefix: string,
    isLast: boolean,
    path: Set<string>,
    globalSeen: Set<string>
  ): string => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return "";

    const connector = isLast ? "└── " : "├── ";

    let line = `${prefix}${connector}${node.title}`;
    if (path.has(nodeId)) return `${line} [loop]\n`;
    if (globalSeen.has(nodeId)) return `${line} [seen]\n`;

    line += "\n";
    globalSeen.add(nodeId);
    const newPath = new Set(path).add(nodeId);
    const childConnections = outgoing.get(nodeId) || [];

    // Group by target
    const groups = new Map<string, { label: string }[]>();
    childConnections.forEach(c => {
      const toNode = nodes.find(n => n.id === c.toNode);
      const fromPin = nodes.find(n => n.id === c.fromNode)?.outputs.find(p => p.id === c.fromPin);
      const toPin = toNode?.inputs.find(p => p.id === c.toPin);

      if (fromPin && toPin) {
        if (!groups.has(c.toNode)) groups.set(c.toNode, []);
        groups.get(c.toNode)!.push({
          label: `${fromPin.name}→${toPin.name}`
        });
      }
    });

    const children = Array.from(groups.entries())
      .sort((a, b) => {
        const nodeA = nodes.find(n => n.id === a[0]);
        const nodeB = nodes.find(n => n.id === b[0]);
        return (nodeA?.title || "").localeCompare(nodeB?.title || "");
      });

    const newPrefix = prefix + (isLast ? "    " : "│   ");

    children.forEach(([toId, labels], idx) => {
      const labelStr = ` (${labels.map(l => l.label).join(', ')})`;
      const childStr = traverse(toId, newPrefix, idx === children.length - 1, newPath, globalSeen);
      const lines = childStr.split('\n');
      if (lines[0]) lines[0] = lines[0] + labelStr;
      line += lines.join('\n');
      if (!childStr.endsWith('\n')) line += '\n';
    });

    return line;
  };

  roots.forEach((root, i) => {
    const globalSeen = new Set<string>();

    let rootLine = `${root.title}\n`;
    const childConnections = outgoing.get(root.id) || [];

    // Group by target
    const groups = new Map<string, { label: string }[]>();
    childConnections.forEach(c => {
      const toNode = nodes.find(n => n.id === c.toNode);
      const fromPin = nodes.find(n => n.id === c.fromNode)?.outputs.find(p => p.id === c.fromPin);
      const toPin = toNode?.inputs.find(p => p.id === c.toPin);

      if (fromPin && toPin) {
        if (!groups.has(c.toNode)) groups.set(c.toNode, []);
        groups.get(c.toNode)!.push({
          label: `${fromPin.name}→${toPin.name}`
        });
      }
    });

    const children = Array.from(groups.entries())
      .sort((a, b) => {
        const nodeA = nodes.find(n => n.id === a[0]);
        const nodeB = nodes.find(n => n.id === b[0]);
        return (nodeA?.title || "").localeCompare(nodeB?.title || "");
      });

    children.forEach(([toId, labels], idx) => {
      const labelStr = ` (${labels.map(l => l.label).join(', ')})`;
      const childStr = traverse(toId, "", idx === children.length - 1, new Set([root.id]), globalSeen);
      const lines = childStr.split('\n');
      if (lines[0]) lines[0] = lines[0] + labelStr;
      rootLine += lines.join('\n');
      if (!childStr.endsWith('\n')) rootLine += '\n';
    });

    result += rootLine;
    if (i < roots.length - 1) result += "\n";
  });

  return result || "No execution flow detected.";
};

/**
 * Export to arrow format
 */
export const exportToArrow = (nodes: NodeData[], connections: ConnectionUI[]): string => {
  // Build a temporary Graph object for exporting
  const { UIToGraphAdapter } = require('../adapter');
  const graph = UIToGraphAdapter.adaptToGraph(nodes, connections);
  return ArrowParser.generate(graph);
};

/**
 * Export to ASCII tree format
 */
export const exportToTree = (nodes: NodeData[], connections: ConnectionUI[]): string => {
  // Build a temporary Graph object for exporting
  const { UIToGraphAdapter } = require('../adapter');
  const graph = UIToGraphAdapter.adaptToGraph(nodes, connections);
  return AsciiTreeParser.generate(graph);
};

/**
 * Export to JSON format
 */
export const exportToJSON = (nodes: NodeData[], connections: ConnectionUI[]): string => {
  return JSON.stringify({ nodes, connections }, null, 2);
};

/**
 * Import from JSON format
 */
export const importFromJSON = (json: string): { nodes: NodeData[]; connections: ConnectionUI[] } => {
  const data = JSON.parse(json);
  return { nodes: data.nodes, connections: data.connections };
};

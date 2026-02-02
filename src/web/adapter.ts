import { Graph, Node, Connection, Pin, PinType } from '../types';

/**
 * React component types - compatible with existing visualization
 */
export interface PinUI {
  id: string;
  name: string;
  type: 'exec' | 'bool' | 'number' | 'vector' | 'string' | 'object' | 'other';
  color: string;
  isOutput: boolean;
}

export interface NodeData {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: 'red' | 'blue' | 'gray';
  inputs: PinUI[];
  outputs: PinUI[];
}

export interface ConnectionUI {
  id: string;
  fromNode: string;
  fromPin: string;
  toNode: string;
  toPin: string;
  color: string;
}

export const PIN_TYPE_TO_UI: Record<PinType, 'exec' | 'bool' | 'number' | 'vector' | 'string' | 'object' | 'other'> = {
  'Exec': 'exec',
  'Boolean': 'bool',
  'Integer': 'number',
  'Float': 'number',
  'String': 'string',
  'Object': 'object',
  'Vector': 'vector',
  'Wildcard': 'other'
};

export const PIN_TYPE_COLORS: Record<string, string> = {
  'exec': '#ff4444',      // Red
  'bool': '#ffff00',      // Yellow
  'number': '#4488ff',    // Blue
  'vector': '#ffff88',    // Light yellow
  'string': '#ff88ff',    // Pink
  'object': '#ff8844',    // Orange
  'other': '#888888'      // Gray
};

/**
 * Adapter: Graph → NodeData/ConnectionUI (for React visualization)
 */
export class GraphToUIAdapter {
  static adaptGraph(graph: Graph): { nodes: NodeData[]; connections: ConnectionUI[] } {
    const nodes = graph.getAllNodes().map(node => this.adaptNode(node, graph));
    const connections = graph.getAllConnections().map(conn => this.adaptConnection(conn, graph));

    return { nodes, connections };
  }

  private static adaptNode(node: Node, graph: Graph): NodeData {
    const getNodeCategory = (title: string): 'red' | 'blue' | 'gray' => {
      const t = title.toLowerCase();
      if (t.includes('event') || t.includes('begin') || t.includes('end')) return 'red';
      if (t.includes('set') || t.includes('get') || t.includes('location')) return 'blue';
      return 'gray';
    };

    return {
      id: node.id,
      title: node.title,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      color: getNodeCategory(node.title),
      inputs: node.inputs.map(pin => this.adaptPin(pin, graph)),
      outputs: node.outputs.map(pin => this.adaptPin(pin, graph))
    };
  }

  private static adaptPin(pin: Pin, graph: Graph): PinUI {
    const uiType = PIN_TYPE_TO_UI[pin.type] || 'other';
    const color = PIN_TYPE_COLORS[uiType];

    return {
      id: pin.id,
      name: pin.name,
      type: uiType,
      color,
      isOutput: pin.direction === 'Output'
    };
  }

  private static adaptConnection(conn: Connection, graph: Graph): ConnectionUI {
    const fromNode = graph.getNode(conn.fromNodeId);
    const fromPin = fromNode?.getPinById(conn.fromPinId);
    const color = fromPin ? PIN_TYPE_COLORS[PIN_TYPE_TO_UI[fromPin.type]] : '#888888';

    return {
      id: conn.id,
      fromNode: conn.fromNodeId,
      fromPin: conn.fromPinId,
      toNode: conn.toNodeId,
      toPin: conn.toPinId,
      color
    };
  }
}

/**
 * Adapter: NodeData/ConnectionUI → Graph (for saving back to core)
 */
export class UIToGraphAdapter {
  static adaptToGraph(nodes: NodeData[], connections: ConnectionUI[]): Graph {
    const graph = new Graph();

    // Create nodes
    const nodeMap = new Map<string, Node>();
    nodes.forEach(nodeData => {
      const node = new Node(nodeData.title, 'UI');
      node.id = nodeData.id;
      node.setPosition(nodeData.x, nodeData.y);
      node.width = nodeData.width;
      node.height = nodeData.height;

      // Add pins
      nodeData.inputs.forEach(pin => {
        const newPin = node.addInputPin(pin.name, this.uiTypeToType(pin.type));
        newPin.id = pin.id;
      });

      nodeData.outputs.forEach(pin => {
        const newPin = node.addOutputPin(pin.name, this.uiTypeToType(pin.type));
        newPin.id = pin.id;
      });

      graph.addNode(node);
      nodeMap.set(node.id, node);
    });

    // Create connections
    connections.forEach(connData => {
      const conn = new Connection(
        connData.fromNode,
        connData.fromPin,
        connData.toNode,
        connData.toPin
      );
      conn.id = connData.id;
      graph.addConnection(conn);
    });

    return graph;
  }

  private static uiTypeToType(uiType: string): PinType {
    const typeMap: Record<string, PinType> = {
      'exec': 'Exec',
      'bool': 'Boolean',
      'number': 'Integer',
      'vector': 'Vector',
      'string': 'String',
      'object': 'Object',
      'other': 'Wildcard'
    };
    return typeMap[uiType] || 'Wildcard';
  }
}

export { Graph, Node, Connection, Pin, PinType } from '../types';

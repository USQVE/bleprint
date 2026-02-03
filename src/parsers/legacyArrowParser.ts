import { Graph } from '../graph';
import { Node, Connection, PinType } from '../types';
import { getColorHex } from '../web/constants';

/**
 * Legacy Arrow Parser for extended format with Russian color names
 * Format: [NodeName] (PinName - ColorName) → [OtherNode] (PinName - ColorName)
 *
 * Supported color names (Russian and English):
 * - Белый / white → Exec
 * - Зеленый / Зелёный / green → Integer
 * - Желтый / Жёлтый / yellow → Float
 * - Красный / red → Boolean
 * - Синий / blue → Vector
 */
export class LegacyArrowParser {
  static parse(input: string): Graph {
    const graph = new Graph();
    const lines = input.trim().split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));

    // Track nodes: key -> { node: Node, pinIndex: { [colorType]: index } }
    const nodes = new Map<string, { node: Node; pinsByColor: Map<string, number> }>();
    const connections: Array<{ fromKey: string; fromColor: string; toKey: string; toColor: string }> = [];

    // Process each line
    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('//')) continue;

      // Pattern: [NodeName] (PinName - Color) → [NodeName] (PinName - Color)
      const connPattern = /\[([^\]]+)\]\s*\(([^)]+?)\s*-\s*([^)]+?)\)\s*(?:→|-\>)\s*\[([^\]]+)\]\s*\(([^)]+?)\s*-\s*([^)]+?)\)/;
      // Pattern: [NodeName] (PinName - Color)  - standalone node
      const nodePattern = /^\[([^\]]+)\]\s*\(([^)]+?)\s*-\s*([^)]+?)\)$/;

      const connMatch = line.match(connPattern);
      if (connMatch) {
        const [, fromNodeKey, fromPinName, fromColor, toNodeKey, toPinName, toColor] = connMatch;

        // Get or create nodes
        this.getOrCreateNode(fromNodeKey, nodes, graph);
        this.getOrCreateNode(toNodeKey, nodes, graph);

        // Store connection info (will be resolved later)
        connections.push({
          fromKey: fromNodeKey,
          fromColor: fromColor.trim(),
          toKey: toNodeKey,
          toColor: toColor.trim()
        });

        continue;
      }

      // Check for standalone node
      const nodeMatch = line.match(nodePattern);
      if (nodeMatch) {
        const [, nodeKey] = nodeMatch;
        this.getOrCreateNode(nodeKey, nodes, graph);
      }
    }

    // Create connections
    connections.forEach(({ fromKey, fromColor, toKey, toColor }) => {
      const fromNodeData = nodes.get(fromKey);
      const toNodeData = nodes.get(toKey);

      if (!fromNodeData || !toNodeData) return;

      const fromNode = fromNodeData.node;
      const toNode = toNodeData.node;
      const fromType = this.colorToType(fromColor);
      const toType = this.colorToType(toColor);

      // Ensure nodes have pins of correct type
      const fromPinIndex = this.ensureOutputPin(fromNode, fromType, fromNodeData.pinsByColor);
      const toPinIndex = this.ensureInputPin(toNode, toType, toNodeData.pinsByColor);

      if (fromPinIndex >= 0 && toPinIndex >= 0) {
        const fromPin = fromNode.outputs[fromPinIndex];
        const toPin = toNode.inputs[toPinIndex];

        if (fromPin && toPin) {
          const conn = new Connection(
            fromNode.id,
            fromPin.id,
            toNode.id,
            toPin.id
          );
          graph.addConnection(conn);
        }
      }
    });

    // Layout nodes
    let xPos = 100;
    nodes.forEach(({ node }) => {
      node.setPosition(xPos, 100);
      xPos += 300;
    });

    return graph;
  }

  private static getOrCreateNode(
    key: string,
    nodes: Map<string, { node: Node; pinsByColor: Map<string, number> }>,
    graph: Graph
  ): Node {
    if (nodes.has(key)) {
      return nodes.get(key)!.node;
    }

    const node = new Node(key, 'Legacy');
    graph.addNode(node);
    nodes.set(key, { node, pinsByColor: new Map() });
    return node;
  }

  private static colorToType(colorName: string): PinType {
    const color = colorName.trim().toLowerCase();

    // Russian color names
    if (color.includes('белый')) return PinType.Exec;
    if (color.includes('зелен')) return PinType.Integer; // зеленый, зелёный
    if (color.includes('желт')) return PinType.Float; // желтый, жёлтый
    if (color.includes('красн')) return PinType.Boolean;
    if (color.includes('синий')) return PinType.Vector;

    // English color names
    if (color.includes('white')) return PinType.Exec;
    if (color.includes('green')) return PinType.Integer;
    if (color.includes('yellow')) return PinType.Float;
    if (color.includes('red')) return PinType.Boolean;
    if (color.includes('blue')) return PinType.Vector;

    return PinType.Wildcard;
  }

  private static ensureOutputPin(
    node: Node,
    type: PinType,
    pinsByColor: Map<string, number>
  ): number {
    const typeKey = type.toString();

    // Check if pin of this type already exists
    if (pinsByColor.has(typeKey)) {
      return pinsByColor.get(typeKey)!;
    }

    // Create new output pin
    const pin = node.addOutputPin(`out_${type}`, type);
    const index = node.outputs.length - 1;
    pinsByColor.set(typeKey, index);
    return index;
  }

  private static ensureInputPin(
    node: Node,
    type: PinType,
    pinsByColor: Map<string, number>
  ): number {
    const typeKey = `in_${type.toString()}`;

    // Check if pin of this type already exists
    if (pinsByColor.has(typeKey)) {
      return pinsByColor.get(typeKey)!;
    }

    // Create new input pin
    const pin = node.addInputPin(`in_${type}`, type);
    const index = node.inputs.length - 1;
    pinsByColor.set(typeKey, index);
    return index;
  }

  /**
   * Generate arrow format from graph
   */
  static generate(graph: Graph): string {
    const lines: string[] = [];

    const nodes = graph.getAllNodes();
    const connections = graph.getAllConnections();

    // Generate node definitions with pins
    nodes.forEach(node => {
      let line = node.title;

      if (node.inputs.length > 0 || node.outputs.length > 0) {
        const parts: string[] = [];

        if (node.inputs.length > 0) {
          const inTypes = node.inputs.map(p => p.type).join(',');
          parts.push(`in:${inTypes}`);
        }

        if (node.outputs.length > 0) {
          const outTypes = node.outputs.map(p => p.type).join(',');
          parts.push(`out:${outTypes}`);
        }

        if (parts.length > 0) {
          line += `[${parts.join('|')}]`;
        }
      }

      lines.push(line);
    });

    // Generate connections
    connections.forEach(conn => {
      const fromNode = graph.getNode(conn.fromNodeId);
      const toNode = graph.getNode(conn.toNodeId);

      if (fromNode && toNode) {
        lines.push(`${fromNode.title} -> ${toNode.title}`);
      }
    });

    return lines.join('\n');
  }
}

import { Graph } from '../graph';
import { Node, PinType } from '../types';

export interface ArrowGraphDefinition {
  nodes: Array<{
    id: string;
    title: string;
    category?: string;
    inputs?: string[];
    outputs?: string[];
  }>;
  connections: Array<{
    fromNode: string;
    toNode: string;
  }>;
}

export class ArrowParser {
  /**
   * Parse arrow format: "NodeA -> NodeB" or "NodeA[Label] -> NodeB[Label]"
   * Can also include pin definitions:
   * "NodeA[in:Exec|out:Data] -> NodeB[in:Data]"
   */
  static parse(input: string): Graph {
    const graph = new Graph();
    const lines = input.trim().split('\n').filter(line => line.trim());

    // Track nodes and their pin definitions
    const nodeDefinitions = new Map<string, { title: string; inputs: string[]; outputs: string[] }>();

    // First pass: extract node definitions and create nodes
    const nodeRegex = /(\w+)\s*\[(.*?)\]/g;
    const arrowRegex = /(\w+)\s*->\s*(\w+)/g;

    // Extract all node definitions with pins
    let match;
    const processedNodes = new Set<string>();

    for (const line of lines) {
      // Match: NodeName[in:Type1,Type2|out:Type3]
      const nodeWithPins = line.match(/(\w+)\s*\[\s*((?:in:|out:)[^\]]*)\]/g);
      if (nodeWithPins) {
        nodeWithPins.forEach(definition => {
          const nodeMatch = definition.match(/(\w+)\s*\[(.*?)\]/);
          if (nodeMatch) {
            const nodeId = nodeMatch[1];
            const pinDef = nodeMatch[2];

            if (!nodeDefinitions.has(nodeId) && !processedNodes.has(nodeId)) {
              const inputs: string[] = [];
              const outputs: string[] = [];

              // Parse pin definitions
              const inMatch = pinDef.match(/in:\s*([^|]*)/);
              const outMatch = pinDef.match(/out:\s*([^|]*)/);

              if (inMatch) {
                inputs.push(...inMatch[1].split(',').map(p => p.trim()).filter(Boolean));
              }
              if (outMatch) {
                outputs.push(...outMatch[1].split(',').map(p => p.trim()).filter(Boolean));
              }

              nodeDefinitions.set(nodeId, {
                title: nodeId,
                inputs,
                outputs
              });
              processedNodes.add(nodeId);
            }
          }
        });
      }

      // Match: NodeA -> NodeB
      const arrows = line.match(arrowRegex);
      if (arrows) {
        arrows.forEach(arrow => {
          const [from, to] = arrow.split('->').map(s => s.trim());
          if (from && to && !processedNodes.has(from)) {
            nodeDefinitions.set(from, { title: from, inputs: [], outputs: [] });
            processedNodes.add(from);
          }
          if (to && !processedNodes.has(to)) {
            nodeDefinitions.set(to, { title: to, inputs: [], outputs: [] });
            processedNodes.add(to);
          }
        });
      }
    }

    // Create nodes
    const nodeMap = new Map<string, string>(); // Map nodeId to node.id
    let xPos = 0;
    for (const [nodeId, def] of nodeDefinitions) {
      const node = new Node(def.title, 'Arrow');
      node.setPosition(xPos, 0);
      xPos += 250;

      // Add input pins
      def.inputs.forEach((pinType, index) => {
        const type = this.parseType(pinType);
        node.addInputPin(`in_${index}`, type);
      });

      // Add output pins
      def.outputs.forEach((pinType, index) => {
        const type = this.parseType(pinType);
        node.addOutputPin(`out_${index}`, type);
      });

      graph.addNode(node);
      nodeMap.set(nodeId, node.id);
    }

    // Second pass: create connections
    for (const line of lines) {
      const arrows = line.match(arrowRegex);
      if (arrows) {
        arrows.forEach(arrow => {
          const [fromNodeId, toNodeId] = arrow.split('->').map(s => s.trim());
          const fromNode = graph.getNode(nodeMap.get(fromNodeId)!);
          const toNode = graph.getNode(nodeMap.get(toNodeId)!);

          if (fromNode && toNode && fromNode.outputs.length > 0 && toNode.inputs.length > 0) {
            // Connect first output to first input
            const fromPin = fromNode.outputs[0];
            const toPin = toNode.inputs[0];

            const conn = new (require('../types')).Connection(
              fromNode.id,
              fromPin.id,
              toNode.id,
              toPin.id
            );
            graph.addConnection(conn);
          }
        });
      }
    }

    return graph;
  }

  private static parseType(typeStr: string): PinType {
    const type = typeStr.trim().toUpperCase();
    const typeMap: Record<string, PinType> = {
      'EXEC': PinType.Exec,
      'BOOL': PinType.Boolean,
      'BOOLEAN': PinType.Boolean,
      'INT': PinType.Integer,
      'INTEGER': PinType.Integer,
      'FLOAT': PinType.Float,
      'STRING': PinType.String,
      'OBJECT': PinType.Object,
      'VECTOR': PinType.Vector,
      'WILDCARD': PinType.Wildcard
    };
    return typeMap[type] || PinType.Wildcard;
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

import { Graph } from '../graph';
import { Node, PinType } from '../types';

export class AsciiTreeParser {
  /**
   * Parse ASCII tree format:
   * ├── NodeA
   * │   ├── NodeB
   * │   └── NodeC
   * └── NodeD
   */
  static parse(input: string): Graph {
    const graph = new Graph();
    const lines = input.trim().split('\n');

    interface TreeNode {
      id: string;
      title: string;
      level: number;
      parentId?: string;
    }

    const treeNodes: TreeNode[] = [];
    const parentStack: Array<{ level: number; id: string }> = [];

    // Parse tree structure
    lines.forEach(line => {
      if (!line.trim()) return;

      // Calculate indentation level
      const indentMatch = line.match(/^(\s*)/);
      const level = indentMatch ? Math.floor(indentMatch[1].length / 2) : 0;

      // Extract node title (remove tree characters)
      const nodeMatch = line.match(/[└├│]\s*─*\s*(.+?)(?:\[.*?\])?$/);
      const title = nodeMatch ? nodeMatch[1].trim() : line.replace(/[└├│─\s]/g, '').trim();

      if (!title) return;

      // Update parent stack
      while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= level) {
        parentStack.pop();
      }

      const nodeId = `node_${treeNodes.length}`;
      const parentId = parentStack.length > 0 ? parentStack[parentStack.length - 1].id : undefined;

      const treeNode: TreeNode = { id: nodeId, title, level, parentId };
      treeNodes.push(treeNode);
      parentStack.push({ level, id: nodeId });
    });

    // Create nodes and calculate positions based on tree structure
    const nodeMap = new Map<string, string>();
    let yPos = 0;

    treeNodes.forEach((treeNode, index) => {
      const node = new Node(treeNode.title, 'Tree');
      const xPos = treeNode.level * 200;
      node.setPosition(xPos, yPos);
      yPos += 120;

      // Add default pins
      node.addInputPin('in', PinType.Exec);
      node.addOutputPin('out', PinType.Exec);

      graph.addNode(node);
      nodeMap.set(treeNode.id, node.id);
    });

    // Create connections between parent and child nodes
    treeNodes.forEach((treeNode) => {
      if (treeNode.parentId) {
        const parentNode = graph.getNode(nodeMap.get(treeNode.parentId)!);
        const childNode = graph.getNode(nodeMap.get(treeNode.id)!);

        if (parentNode && childNode && parentNode.outputs.length > 0 && childNode.inputs.length > 0) {
          const conn = new (require('../types')).Connection(
            parentNode.id,
            parentNode.outputs[0].id,
            childNode.id,
            childNode.inputs[0].id
          );
          graph.addConnection(conn);
        }
      }
    });

    return graph;
  }

  /**
   * Generate ASCII tree format from graph
   */
  static generate(graph: Graph): string {
    const nodes = graph.getAllNodes();
    const connections = graph.getAllConnections();

    // Build tree structure
    interface TreeNodeWithChildren {
      title: string;
      children: TreeNodeWithChildren[];
    }

    // Find root nodes (nodes with no incoming connections)
    const incomingCount = new Map<string, number>();
    nodes.forEach(node => incomingCount.set(node.id, 0));
    connections.forEach(conn => {
      incomingCount.set(conn.toNodeId, (incomingCount.get(conn.toNodeId) || 0) + 1);
    });

    const rootNodes = nodes.filter(node => incomingCount.get(node.id) === 0);

    // Build tree from roots
    const buildTree = (nodeId: string, visited = new Set<string>()): TreeNodeWithChildren | null => {
      if (visited.has(nodeId)) return null;
      visited.add(nodeId);

      const node = graph.getNode(nodeId);
      if (!node) return null;

      const children: TreeNodeWithChildren[] = [];
      const outgoingConns = connections.filter(conn => conn.fromNodeId === nodeId);

      outgoingConns.forEach(conn => {
        const childTree = buildTree(conn.toNodeId, visited);
        if (childTree) children.push(childTree);
      });

      return { title: node.title, children };
    };

    const lines: string[] = [];

    const renderTree = (tree: TreeNodeWithChildren, prefix = '', isLast = true): void => {
      const connector = isLast ? '└── ' : '├── ';
      lines.push(prefix + connector + tree.title);

      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      tree.children.forEach((child, index) => {
        renderTree(child, newPrefix, index === tree.children.length - 1);
      });
    };

    rootNodes.forEach((rootNode, index) => {
      const tree = buildTree(rootNode.id);
      if (tree) {
        renderTree(tree, '', index === rootNodes.length - 1);
      }
    });

    return lines.join('\n');
  }
}

import chalk from 'chalk';
import { Graph } from './graph';
import { Node, PIN_COLORS, PinDirection } from './types';

export class Visualizer {
  private graph: Graph;
  private width: number = 120;
  private height: number = 40;

  constructor(graph: Graph) {
    this.graph = graph;
  }

  /**
   * Generate ASCII diagram of the graph with nodes and connections
   */
  generateDiagram(): string {
    const nodes = this.graph.getAllNodes();
    const connections = this.graph.getAllConnections();

    if (nodes.length === 0) {
      return chalk.yellow('Graph is empty');
    }

    // Calculate bounds
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x + node.width);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y + node.height);
    });

    const padding = 20;
    const canvas: string[][] = [];
    const width = Math.max(this.width, maxX - minX + padding * 2);
    const height = Math.max(this.height, maxY - minY + padding * 2);

    // Initialize canvas
    for (let i = 0; i < height; i++) {
      canvas[i] = new Array(width).fill(' ');
    }

    // Draw connections first (so they appear behind nodes)
    connections.forEach(conn => {
      const fromNode = this.graph.getNode(conn.fromNodeId);
      const toNode = this.graph.getNode(conn.toNodeId);

      if (fromNode && toNode) {
        this.drawConnection(canvas, fromNode, toNode, padding, minX, minY);
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      this.drawNode(canvas, node, padding, minX, minY);
    });

    // Convert canvas to string
    return this.canvasToString(canvas);
  }

  /**
   * Generate detailed node information panel
   */
  generateNodeInfo(nodeId: string): string {
    const node = this.graph.getNode(nodeId);
    if (!node) {
      return chalk.red(`Node ${nodeId} not found`);
    }

    const lines: string[] = [];
    lines.push(chalk.bold.blue(`╔═══ Node: ${node.title} ═══╗`));
    lines.push(`║ ID: ${node.id}`);
    lines.push(`║ Category: ${node.category}`);
    lines.push(`║ Position: (${node.x}, ${node.y})`);
    lines.push(`║`);

    if (node.inputs.length > 0) {
      lines.push(chalk.cyan(`║ Input Pins:`));
      node.inputs.forEach(pin => {
        const color = PIN_COLORS[pin.type];
        const state = pin.isConnected ? chalk.green('●') : chalk.gray('○');
        lines.push(`║   ${color} ${pin.name} (${pin.type}) ${state}`);
      });
    } else {
      lines.push(chalk.gray(`║ Input Pins: none`));
    }

    lines.push(`║`);

    if (node.outputs.length > 0) {
      lines.push(chalk.yellow(`║ Output Pins:`));
      node.outputs.forEach(pin => {
        const color = PIN_COLORS[pin.type];
        const state = pin.isConnected ? chalk.green('●') : chalk.gray('○');
        lines.push(`║   ${color} ${pin.name} (${pin.type}) ${state}`);
      });
    } else {
      lines.push(chalk.gray(`║ Output Pins: none`));
    }

    lines.push(chalk.bold.blue(`╚════════════════════════╝`));

    return lines.join('\n');
  }

  /**
   * Generate statistics
   */
  generateStats(): string {
    const stats = this.graph.getStatistics();
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('═══ Graph Statistics ═══'));
    lines.push(`Nodes: ${stats.nodeCount}`);
    lines.push(`Connections: ${stats.connectionCount}`);
    lines.push(`Categories: ${stats.categories.join(', ') || 'None'}`);

    return lines.join('\n');
  }

  /**
   * List all nodes with their basic info
   */
  generateNodeList(): string {
    const nodes = this.graph.getAllNodes();

    if (nodes.length === 0) {
      return chalk.yellow('No nodes in graph');
    }

    const lines: string[] = [];
    lines.push(chalk.bold.cyan('═══ Nodes List ═══'));

    nodes.forEach((node, index) => {
      const inputCount = node.inputs.length;
      const outputCount = node.outputs.length;
      lines.push(`${index + 1}. ${chalk.bold(node.title)} [${node.id.substring(0, 8)}...]`);
      lines.push(`   Category: ${node.category} | In: ${inputCount} | Out: ${outputCount}`);
    });

    return lines.join('\n');
  }

  /**
   * List all connections
   */
  generateConnectionList(): string {
    const connections = this.graph.getAllConnections();

    if (connections.length === 0) {
      return chalk.yellow('No connections in graph');
    }

    const lines: string[] = [];
    lines.push(chalk.bold.cyan('═══ Connections List ═══'));

    connections.forEach((conn, index) => {
      const fromNode = this.graph.getNode(conn.fromNodeId);
      const toNode = this.graph.getNode(conn.toNodeId);

      if (fromNode && toNode) {
        const fromPin = fromNode.getPinById(conn.fromPinId);
        const toPin = toNode.getPinById(conn.toPinId);

        const fromLabel = fromPin?.name || 'unknown';
        const toLabel = toPin?.name || 'unknown';

        lines.push(`${index + 1}. ${chalk.green(fromNode.title)}.${fromLabel} → ${chalk.blue(toNode.title)}.${toLabel}`);
      }
    });

    return lines.join('\n');
  }

  // Private helper methods
  private drawNode(canvas: string[][], node: Node, padding: number, minX: number, minY: number): void {
    const x = Math.round(node.x - minX + padding);
    const y = Math.round(node.y - minY + padding);
    const w = node.width;
    const h = node.height;

    // Draw node box
    const corners = { topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝', horizontal: '═', vertical: '║' };

    if (y >= 0 && y < canvas.length) {
      if (x >= 0 && x < canvas[y].length) canvas[y][x] = corners.topLeft;
      if (x + w - 1 >= 0 && x + w - 1 < canvas[y].length) canvas[y][x + w - 1] = corners.topRight;
    }

    if (y + h - 1 >= 0 && y + h - 1 < canvas.length) {
      if (x >= 0 && x < canvas[y + h - 1].length) canvas[y + h - 1][x] = corners.bottomLeft;
      if (x + w - 1 >= 0 && x + w - 1 < canvas[y + h - 1].length) canvas[y + h - 1][x + w - 1] = corners.bottomRight;
    }

    // Draw horizontal lines
    for (let i = x + 1; i < x + w - 1; i++) {
      if (i >= 0 && i < canvas[y].length && y >= 0 && y < canvas.length) canvas[y][i] = corners.horizontal;
      if (i >= 0 && i < canvas[y + h - 1].length && y + h - 1 >= 0 && y + h - 1 < canvas.length) {
        canvas[y + h - 1][i] = corners.horizontal;
      }
    }

    // Draw vertical lines
    for (let i = y + 1; i < y + h - 1; i++) {
      if (i >= 0 && i < canvas.length) {
        if (x >= 0 && x < canvas[i].length) canvas[i][x] = corners.vertical;
        if (x + w - 1 >= 0 && x + w - 1 < canvas[i].length) canvas[i][x + w - 1] = corners.vertical;
      }
    }

    // Draw title (centered)
    const titleMaxLen = Math.max(1, w - 4);
    const title = node.title.substring(0, titleMaxLen);
    const titleX = x + Math.floor((w - title.length) / 2);
    if (y + 1 >= 0 && y + 1 < canvas.length) {
      for (let i = 0; i < title.length; i++) {
        if (titleX + i >= 0 && titleX + i < canvas[y + 1].length) {
          canvas[y + 1][titleX + i] = title[i];
        }
      }
    }

    // Draw pins on sides
    const inputY = y + Math.floor(h / 2) - 1;
    const outputY = y + Math.floor(h / 2) - 1;

    // Input pins (left side)
    node.inputs.forEach((pin, i) => {
      const pinY = inputY + i;
      if (pinY >= 0 && pinY < canvas.length && x - 1 >= 0 && x - 1 < canvas[pinY].length) {
        canvas[pinY][x - 1] = '●';
      }
    });

    // Output pins (right side)
    node.outputs.forEach((pin, i) => {
      const pinY = outputY + i;
      if (pinY >= 0 && pinY < canvas.length && x + w >= 0 && x + w < canvas[pinY].length) {
        canvas[pinY][x + w] = '●';
      }
    });
  }

  private drawConnection(canvas: string[][], fromNode: Node, toNode: Node, padding: number, minX: number, minY: number): void {
    const x1 = Math.round(fromNode.x - minX + padding + fromNode.width);
    const y1 = Math.round(fromNode.y - minY + padding + Math.floor(fromNode.height / 2));
    const x2 = Math.round(toNode.x - minX + padding);
    const y2 = Math.round(toNode.y - minY + padding + Math.floor(toNode.height / 2));

    // Draw horizontal line from x1 to middle
    const midX = Math.floor((x1 + x2) / 2);
    for (let x = Math.min(x1, midX); x <= Math.max(x1, midX); x++) {
      if (x >= 0 && x < canvas[y1].length && y1 >= 0 && y1 < canvas.length) {
        if (canvas[y1][x] === ' ') canvas[y1][x] = '─';
      }
    }

    // Draw vertical line from y1 to y2
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      if (y >= 0 && y < canvas.length && midX >= 0 && midX < canvas[y].length) {
        if (canvas[y][midX] === ' ') canvas[y][midX] = '│';
      }
    }

    // Draw horizontal line from middle to x2
    for (let x = Math.min(midX, x2); x <= Math.max(midX, x2); x++) {
      if (x >= 0 && x < canvas[y2].length && y2 >= 0 && y2 < canvas.length) {
        if (canvas[y2][x] === ' ') canvas[y2][x] = '─';
      }
    }

    // Draw arrowhead
    if (x2 >= 0 && x2 < canvas[y2].length && y2 >= 0 && y2 < canvas.length) {
      canvas[y2][x2] = '→';
    }
  }

  private canvasToString(canvas: string[][]): string {
    return canvas.map(row => row.join('')).join('\n');
  }
}

import chalk from 'chalk';
import { Graph } from './graph';
import { Node, Connection, PinType, PinDirection } from './types';
import { Visualizer } from './visualizer';

export class Editor {
  private graph: Graph;
  private visualizer: Visualizer;

  constructor(graph?: Graph) {
    this.graph = graph || new Graph();
    this.visualizer = new Visualizer(this.graph);
  }

  // Node operations
  createNode(title: string, category: string = 'Default'): string {
    const node = new Node(title, category);
    this.graph.addNode(node);
    console.log(chalk.green(`✓ Created node: ${chalk.bold(title)} (${node.id.substring(0, 8)}...)`));
    return node.id;
  }

  deleteNode(nodeId: string): boolean {
    const node = this.graph.getNode(nodeId);
    if (!node) {
      console.log(chalk.red(`✗ Node ${nodeId} not found`));
      return false;
    }

    this.graph.removeNode(nodeId);
    console.log(chalk.green(`✓ Deleted node: ${node.title}`));
    return true;
  }

  renameNode(nodeId: string, newTitle: string): boolean {
    const node = this.graph.getNode(nodeId);
    if (!node) {
      console.log(chalk.red(`✗ Node ${nodeId} not found`));
      return false;
    }

    const oldTitle = node.title;
    node.title = newTitle;
    console.log(chalk.green(`✓ Renamed: ${chalk.bold(oldTitle)} → ${chalk.bold(newTitle)}`));
    return true;
  }

  moveNode(nodeId: string, x: number, y: number): boolean {
    const node = this.graph.getNode(nodeId);
    if (!node) {
      console.log(chalk.red(`✗ Node ${nodeId} not found`));
      return false;
    }

    node.setPosition(x, y);
    console.log(chalk.green(`✓ Moved node to position (${x}, ${y})`));
    return true;
  }

  // Pin operations
  addInputPin(nodeId: string, pinName: string, pinType: PinType = PinType.Wildcard): boolean {
    const node = this.graph.getNode(nodeId);
    if (!node) {
      console.log(chalk.red(`✗ Node ${nodeId} not found`));
      return false;
    }

    const pin = node.addInputPin(pinName, pinType);
    console.log(chalk.green(`✓ Added input pin: ${chalk.bold(pinName)} (${pinType})`));
    return true;
  }

  addOutputPin(nodeId: string, pinName: string, pinType: PinType = PinType.Wildcard): boolean {
    const node = this.graph.getNode(nodeId);
    if (!node) {
      console.log(chalk.red(`✗ Node ${nodeId} not found`));
      return false;
    }

    const pin = node.addOutputPin(pinName, pinType);
    console.log(chalk.green(`✓ Added output pin: ${chalk.bold(pinName)} (${pinType})`));
    return true;
  }

  removePin(nodeId: string, pinId: string): boolean {
    const node = this.graph.getNode(nodeId);
    if (!node) {
      console.log(chalk.red(`✗ Node ${nodeId} not found`));
      return false;
    }

    // Remove any connections to this pin
    const connectionsToRemove = this.graph.getAllConnections().filter(
      conn => conn.fromPinId === pinId || conn.toPinId === pinId
    );
    connectionsToRemove.forEach(conn => this.graph.removeConnection(conn.id));

    const removed = node.removeInputPin(pinId) || node.removeOutputPin(pinId);
    if (removed) {
      console.log(chalk.green(`✓ Removed pin`));
      return true;
    } else {
      console.log(chalk.red(`✗ Pin ${pinId} not found in node`));
      return false;
    }
  }

  // Connection operations
  connect(fromNodeId: string, fromPinIndex: number, toNodeId: string, toPinIndex: number): boolean {
    const fromNode = this.graph.getNode(fromNodeId);
    const toNode = this.graph.getNode(toNodeId);

    if (!fromNode || !toNode) {
      console.log(chalk.red(`✗ One or both nodes not found`));
      return false;
    }

    if (fromPinIndex >= fromNode.outputs.length || toPinIndex >= toNode.inputs.length) {
      console.log(chalk.red(`✗ Pin index out of range`));
      return false;
    }

    const fromPin = fromNode.outputs[fromPinIndex];
    const toPin = toNode.inputs[toPinIndex];

    const connection = new Connection(fromNode.id, fromPin.id, toNode.id, toPin.id);
    if (this.graph.addConnection(connection)) {
      console.log(chalk.green(`✓ Connected: ${chalk.bold(fromNode.title)}.${fromPin.name} → ${chalk.bold(toNode.title)}.${toPin.name}`));
      return true;
    } else {
      console.log(chalk.red(`✗ Failed to connect pins (incompatible types?)`));
      return false;
    }
  }

  disconnect(connectionId: string): boolean {
    const connection = this.graph.getConnection(connectionId);
    if (!connection) {
      console.log(chalk.red(`✗ Connection ${connectionId} not found`));
      return false;
    }

    const fromNode = this.graph.getNode(connection.fromNodeId);
    const toNode = this.graph.getNode(connection.toNodeId);

    this.graph.removeConnection(connectionId);
    if (fromNode && toNode) {
      const fromPin = fromNode.getPinById(connection.fromPinId);
      const toPin = toNode.getPinById(connection.toPinId);
      console.log(chalk.green(`✓ Disconnected: ${fromNode.title}.${fromPin?.name} → ${toNode.title}.${toPin?.name}`));
    }
    return true;
  }

  reconnect(connectionId: string, toNodeId: string, toPinIndex: number): boolean {
    const connection = this.graph.getConnection(connectionId);
    if (!connection) {
      console.log(chalk.red(`✗ Connection ${connectionId} not found`));
      return false;
    }

    const toNode = this.graph.getNode(toNodeId);
    if (!toNode || toPinIndex >= toNode.inputs.length) {
      console.log(chalk.red(`✗ Target node or pin not found`));
      return false;
    }

    const toPin = toNode.inputs[toPinIndex];
    if (this.graph.reconnectPin(connectionId, toNode.id, toPin.id)) {
      const fromNode = this.graph.getNode(connection.fromNodeId);
      const fromPin = fromNode?.getPinById(connection.fromPinId);
      console.log(chalk.green(`✓ Reconnected: ${fromNode?.title}.${fromPin?.name} → ${chalk.bold(toNode.title)}.${toPin.name}`));
      return true;
    } else {
      console.log(chalk.red(`✗ Failed to reconnect (incompatible types?)`));
      return false;
    }
  }

  // Visualization
  display(): void {
    console.log('\n' + this.visualizer.generateDiagram() + '\n');
  }

  showNodeInfo(nodeId: string): void {
    console.log('\n' + this.visualizer.generateNodeInfo(nodeId) + '\n');
  }

  showStats(): void {
    console.log('\n' + this.visualizer.generateStats() + '\n');
  }

  listNodes(): void {
    console.log('\n' + this.visualizer.generateNodeList() + '\n');
  }

  listConnections(): void {
    console.log('\n' + this.visualizer.generateConnectionList() + '\n');
  }

  // Query methods
  getNode(nodeId: string): Node | undefined {
    return this.graph.getNode(nodeId);
  }

  getAllNodes(): Node[] {
    return this.graph.getAllNodes();
  }

  getAllConnections(): Connection[] {
    return this.graph.getAllConnections();
  }

  getGraph(): Graph {
    return this.graph;
  }

  setGraph(graph: Graph): void {
    this.graph = graph;
    this.visualizer = new Visualizer(this.graph);
  }

  clear(): void {
    this.graph.clear();
    console.log(chalk.green(`✓ Cleared graph`));
  }
}

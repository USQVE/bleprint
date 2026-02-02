import { Node, Connection, Pin, PinType } from './types';

export class Graph {
  nodes: Map<string, Node>;
  connections: Map<string, Connection>;

  constructor() {
    this.nodes = new Map();
    this.connections = new Map();
  }

  // Node operations
  addNode(node: Node): void {
    this.nodes.set(node.id, node);
  }

  removeNode(nodeId: string): boolean {
    // Remove all connections connected to this node
    const connectionsToRemove = Array.from(this.connections.values()).filter(
      conn => conn.fromNodeId === nodeId || conn.toNodeId === nodeId
    );

    connectionsToRemove.forEach(conn => {
      this.removeConnection(conn.id);
    });

    return this.nodes.delete(nodeId);
  }

  getNode(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  // Connection operations
  addConnection(connection: Connection): boolean {
    const fromNode = this.getNode(connection.fromNodeId);
    const toNode = this.getNode(connection.toNodeId);

    if (!fromNode || !toNode) {
      console.error('One or both nodes not found');
      return false;
    }

    const fromPin = fromNode.getPinById(connection.fromPinId);
    const toPin = toNode.getPinById(connection.toPinId);

    if (!fromPin || !toPin) {
      console.error('One or both pins not found');
      return false;
    }

    // Validate pin compatibility
    if (!this.arePinsCompatible(fromPin, toPin)) {
      console.error('Pins are not compatible');
      return false;
    }

    // Mark pins as connected
    fromPin.isConnected = true;
    toPin.isConnected = true;

    this.connections.set(connection.id, connection);
    return true;
  }

  removeConnection(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    const fromNode = this.getNode(connection.fromNodeId);
    const toNode = this.getNode(connection.toNodeId);

    if (fromNode && toNode) {
      const fromPin = fromNode.getPinById(connection.fromPinId);
      const toPin = toNode.getPinById(connection.toPinId);

      if (fromPin) fromPin.isConnected = false;
      if (toPin) toPin.isConnected = false;
    }

    return this.connections.delete(connectionId);
  }

  getConnection(connectionId: string): Connection | undefined {
    return this.connections.get(connectionId);
  }

  getAllConnections(): Connection[] {
    return Array.from(this.connections.values());
  }

  getConnectionsForNode(nodeId: string): Connection[] {
    return Array.from(this.connections.values()).filter(
      conn => conn.fromNodeId === nodeId || conn.toNodeId === nodeId
    );
  }

  // Reconnection operation
  reconnectPin(connectionId: string, newToNodeId: string, newToPinId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    const oldToNode = this.getNode(connection.toNodeId);
    const newToNode = this.getNode(newToNodeId);

    if (!newToNode) return false;

    const oldToPin = oldToNode?.getPinById(connection.toPinId);
    const newToPin = newToNode.getPinById(newToPinId);
    const fromPin = this.getNode(connection.fromNodeId)?.getPinById(connection.fromPinId);

    if (!newToPin || !fromPin) return false;

    // Validate compatibility
    if (!this.arePinsCompatible(fromPin, newToPin)) return false;

    // Update old pin connection state
    if (oldToPin) {
      const otherConnections = this.getAllConnections().filter(
        conn => (conn.toPinId === oldToPin.id) && conn.id !== connectionId
      );
      if (otherConnections.length === 0) {
        oldToPin.isConnected = false;
      }
    }

    // Update connection
    connection.toNodeId = newToNodeId;
    connection.toPinId = newToPinId;
    newToPin.isConnected = true;

    return true;
  }

  // Helper methods
  private arePinsCompatible(fromPin: Pin, toPin: Pin): boolean {
    if (fromPin.type === PinType.Wildcard || toPin.type === PinType.Wildcard) {
      return true;
    }
    return fromPin.type === toPin.type;
  }

  clear(): void {
    this.nodes.clear();
    this.connections.clear();
  }

  getNodesByCategory(category: string): Node[] {
    return this.getAllNodes().filter(node => node.category === category);
  }

  getStatistics() {
    return {
      nodeCount: this.nodes.size,
      connectionCount: this.connections.size,
      categories: [...new Set(this.getAllNodes().map(n => n.category))]
    };
  }
}

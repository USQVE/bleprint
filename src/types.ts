import { v4 as uuidv4 } from 'uuid';

// Pin types with associated colors
export enum PinType {
  Exec = 'Exec',
  Boolean = 'Boolean',
  Integer = 'Integer',
  Float = 'Float',
  String = 'String',
  Object = 'Object',
  Vector = 'Vector',
  Wildcard = 'Wildcard'
}

export const PIN_COLORS: Record<PinType, string> = {
  [PinType.Exec]: '🔴',      // Red
  [PinType.Boolean]: '🟡',    // Yellow
  [PinType.Integer]: '🔵',    // Blue
  [PinType.Float]: '🟢',      // Green
  [PinType.String]: '🟣',     // Purple
  [PinType.Object]: '🟠',     // Orange
  [PinType.Vector]: '⚪',     // White
  [PinType.Wildcard]: '⭕'    // Gray
};

export enum PinDirection {
  Input = 'Input',
  Output = 'Output'
}

export interface IPin {
  id: string;
  name: string;
  type: PinType;
  direction: PinDirection;
  isConnected: boolean;
}

export interface INode {
  id: string;
  title: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  inputs: IPin[];
  outputs: IPin[];
}

export interface IConnection {
  id: string;
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
}

export interface IGraph {
  nodes: Map<string, INode>;
  connections: Map<string, IConnection>;
}

// Pin class
export class Pin implements IPin {
  id: string;
  name: string;
  type: PinType;
  direction: PinDirection;
  isConnected: boolean;

  constructor(name: string, type: PinType, direction: PinDirection) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.direction = direction;
    this.isConnected = false;
  }

  getColorIndicator(): string {
    return PIN_COLORS[this.type];
  }

  getStateIndicator(): string {
    return this.isConnected ? '●' : '○';
  }
}

// Node class
export class Node implements INode {
  id: string;
  title: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  inputs: Pin[];
  outputs: Pin[];

  constructor(title: string, category: string = 'Default') {
    this.id = uuidv4();
    this.title = title;
    this.category = category;
    this.x = 0;
    this.y = 0;
    this.width = 200;
    this.height = 100;
    this.inputs = [];
    this.outputs = [];
  }

  addInputPin(name: string, type: PinType): Pin {
    const pin = new Pin(name, type, PinDirection.Input);
    this.inputs.push(pin);
    return pin;
  }

  addOutputPin(name: string, type: PinType): Pin {
    const pin = new Pin(name, type, PinDirection.Output);
    this.outputs.push(pin);
    return pin;
  }

  removeInputPin(pinId: string): boolean {
    const index = this.inputs.findIndex(p => p.id === pinId);
    if (index > -1) {
      this.inputs.splice(index, 1);
      return true;
    }
    return false;
  }

  removeOutputPin(pinId: string): boolean {
    const index = this.outputs.findIndex(p => p.id === pinId);
    if (index > -1) {
      this.outputs.splice(index, 1);
      return true;
    }
    return false;
  }

  getPinById(pinId: string): Pin | undefined {
    return [...this.inputs, ...this.outputs].find(p => p.id === pinId);
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}

// Connection class
export class Connection implements IConnection {
  id: string;
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;

  constructor(fromNodeId: string, fromPinId: string, toNodeId: string, toPinId: string) {
    this.id = uuidv4();
    this.fromNodeId = fromNodeId;
    this.fromPinId = fromPinId;
    this.toNodeId = toNodeId;
    this.toPinId = toPinId;
  }
}

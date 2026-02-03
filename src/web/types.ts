/**
 * Web UI types - compatible with React visualization
 * Synced with actual React component requirements
 */

export type PinType = 'exec' | 'number' | 'vector' | 'bool' | 'other';
export type NodeColor = 'red' | 'blue' | 'gray';

export interface Pin {
  id: string;
  name: string;
  type: PinType;
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

  color: NodeColor;

  inputs: Pin[];
  outputs: Pin[];
}

export interface Connection {
  id: string;
  fromNode: string;
  fromPin: string;
  toNode: string;
  toPin: string;
  color: string;
}

export interface CommentBox {
  id: string;
  title: string;

  x: number;
  y: number;

  width: number;
  height: number;
}

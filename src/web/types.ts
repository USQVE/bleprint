/**
 * Web UI types - compatible with React visualization
 * Re-export from adapter to avoid duplication
 */

export type { PinType, NodeColor, Pin, NodeData, ConnectionUI as Connection } from './adapter';

export interface CommentBox {
  id: string;
  title: string;

  x: number;
  y: number;

  width: number;
  height: number;
}

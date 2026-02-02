export { Graph } from './graph';
export { Editor } from './editor';
export { Visualizer } from './visualizer';
export { Node, Connection, Pin, PinType, PinDirection, PIN_COLORS } from './types';
export { ArrowParser } from './parsers/arrowParser';
export { AsciiTreeParser } from './parsers/asciiTreeParser';

// CLI entry point
if (require.main === module) {
  require('./cli');
}

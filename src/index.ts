export { Graph } from './graph';
export { Editor } from './editor';
export { Visualizer } from './visualizer';
export { Node, Connection, Pin, PinType, PinDirection, PIN_COLORS } from './types';
export { ArrowParser } from './parsers/arrowParser';
export { AsciiTreeParser } from './parsers/asciiTreeParser';

// CLI entry point
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  import('./cli.js').catch(err => console.error('Failed to load CLI:', err));
}

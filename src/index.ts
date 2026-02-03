export { Graph } from './graph';
export { Editor } from './editor';
export { Visualizer } from './visualizer';
export { Node, Connection, Pin, PinType, PinDirection, PIN_COLORS } from './types';
export { ArrowParser } from './parsers/arrowParser';
export { AsciiTreeParser } from './parsers/asciiTreeParser';

// CLI entry point (Node.js only)
async function initCLI() {
  if (typeof process === 'undefined' || !process.versions || !process.versions.node) {
    return; // Not running in Node.js
  }

  try {
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    if (process.argv[1] === __filename) {
      await import('./cli.js');
    }
  } catch (err) {
    console.error('Failed to load CLI:', err);
  }
}

initCLI().catch(() => {
  // Ignore errors in browser environment
});

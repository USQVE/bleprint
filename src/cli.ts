// Blueprint CLI - Node.js command-line interface
// This file is kept for future CLI implementations
// For interactive graph editing, use the web UI at http://localhost:3000

import chalk from 'chalk';
import { Graph, Node } from './types';

export class BlueprintCLI {
  private graph: Graph;

  constructor() {
    this.graph = new Graph();
  }

  printInfo(): void {
    console.log(chalk.bold.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         Blueprint Node Editor - CLI Interface               ║
║                                                              ║
║  For interactive graph editing, use the web UI:             ║
║  npm run dev                                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `));

    console.log(chalk.yellow('\nNote: The CLI menu has been replaced with a modern web interface.'));
    console.log(chalk.cyan('To start the interactive web editor, run:'));
    console.log(chalk.bold('  npm run dev\n'));
  }

  getGraph(): Graph {
    return this.graph;
  }
}

// Export for programmatic use
export { Graph, Node } from './types';

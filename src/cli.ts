import chalk from 'chalk';
import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { Editor } from './editor';
import { Graph } from './graph';
import { PinType } from './types';
import { ArrowParser } from './parsers/arrowParser';
import { AsciiTreeParser } from './parsers/asciiTreeParser';
import { Visualizer } from './visualizer';

class BlueprintCLI {
  private editor: Editor;
  private running: boolean = false;

  constructor() {
    this.editor = new Editor();
  }

  async start(): Promise<void> {
    this.running = true;
    console.clear();
    this.printHeader();
    await this.mainMenu();
  }

  private printHeader(): void {
    console.log(chalk.bold.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         Blueprint Node Editor - Interactive CLI              ║
║                                                              ║
║  Visualize logic in Unreal Engine style with text commands  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `));
  }

  private async mainMenu(): Promise<void> {
    while (this.running) {
      const choices = [
        new inquirer.Separator('📊 Visualization'),
        { name: 'Display Graph', value: 'display' },
        { name: 'Show Statistics', value: 'stats' },
        new inquirer.Separator('📝 Node Operations'),
        { name: 'Create Node', value: 'create_node' },
        { name: 'Delete Node', value: 'delete_node' },
        { name: 'Rename Node', value: 'rename_node' },
        { name: 'List All Nodes', value: 'list_nodes' },
        { name: 'View Node Info', value: 'node_info' },
        new inquirer.Separator('🔗 Connection Operations'),
        { name: 'Connect Nodes', value: 'connect' },
        { name: 'Disconnect Nodes', value: 'disconnect' },
        { name: 'Reconnect Node', value: 'reconnect' },
        { name: 'List All Connections', value: 'list_connections' },
        new inquirer.Separator('📌 Pin Operations'),
        { name: 'Add Input Pin', value: 'add_input_pin' },
        { name: 'Add Output Pin', value: 'add_output_pin' },
        { name: 'Remove Pin', value: 'remove_pin' },
        new inquirer.Separator('💾 Import/Export'),
        { name: 'Import from Arrow Format', value: 'import_arrow' },
        { name: 'Import from ASCII Tree', value: 'import_tree' },
        { name: 'Export as Arrow Format', value: 'export_arrow' },
        { name: 'Export as ASCII Tree', value: 'export_tree' },
        { name: 'Save to File', value: 'save_file' },
        { name: 'Load from File', value: 'load_file' },
        new inquirer.Separator('🔧 Other'),
        { name: 'Clear Graph', value: 'clear' },
        { name: 'Exit', value: 'exit' }
      ];

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: chalk.bold('What would you like to do?'),
          choices,
          pageSize: 20
        }
      ]);

      await this.handleAction(action);
    }
  }

  private async handleAction(action: string): Promise<void> {
    try {
      switch (action) {
        case 'display':
          this.editor.display();
          break;
        case 'stats':
          this.editor.showStats();
          break;
        case 'create_node':
          await this.createNodeInteractive();
          break;
        case 'delete_node':
          await this.deleteNodeInteractive();
          break;
        case 'rename_node':
          await this.renameNodeInteractive();
          break;
        case 'list_nodes':
          this.editor.listNodes();
          break;
        case 'node_info':
          await this.viewNodeInfoInteractive();
          break;
        case 'connect':
          await this.connectNodesInteractive();
          break;
        case 'disconnect':
          await this.disconnectNodesInteractive();
          break;
        case 'reconnect':
          await this.reconnectNodeInteractive();
          break;
        case 'list_connections':
          this.editor.listConnections();
          break;
        case 'add_input_pin':
          await this.addInputPinInteractive();
          break;
        case 'add_output_pin':
          await this.addOutputPinInteractive();
          break;
        case 'remove_pin':
          await this.removePinInteractive();
          break;
        case 'import_arrow':
          await this.importArrowInteractive();
          break;
        case 'import_tree':
          await this.importTreeInteractive();
          break;
        case 'export_arrow':
          await this.exportArrowInteractive();
          break;
        case 'export_tree':
          await this.exportTreeInteractive();
          break;
        case 'save_file':
          await this.saveFileInteractive();
          break;
        case 'load_file':
          await this.loadFileInteractive();
          break;
        case 'clear':
          await this.clearGraphInteractive();
          break;
        case 'exit':
          this.running = false;
          console.log(chalk.cyan('\nThank you for using Blueprint Node Editor! Goodbye! 👋\n'));
          break;
      }
    } catch (error: any) {
      console.log(chalk.red(`Error: ${error.message}`));
    }

    if (action !== 'exit') {
      await this.pause();
    }
  }

  private async createNodeInteractive(): Promise<void> {
    const { title, category } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter node title:',
        validate: (input: string) => input.length > 0 ? true : 'Title cannot be empty'
      },
      {
        type: 'input',
        name: 'category',
        message: 'Enter node category (default: Default):',
        default: 'Default'
      }
    ]);

    this.editor.createNode(title, category);
  }

  private async deleteNodeInteractive(): Promise<void> {
    const nodes = this.editor.getAllNodes();
    if (nodes.length === 0) {
      console.log(chalk.yellow('No nodes to delete'));
      return;
    }

    const { nodeId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nodeId',
        message: 'Select node to delete:',
        choices: nodes.map(n => ({ name: n.title, value: n.id }))
      }
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure?',
        default: false
      }
    ]);

    if (confirm) {
      this.editor.deleteNode(nodeId);
    }
  }

  private async renameNodeInteractive(): Promise<void> {
    const nodes = this.editor.getAllNodes();
    if (nodes.length === 0) {
      console.log(chalk.yellow('No nodes to rename'));
      return;
    }

    const { nodeId, newTitle } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nodeId',
        message: 'Select node to rename:',
        choices: nodes.map(n => ({ name: n.title, value: n.id }))
      },
      {
        type: 'input',
        name: 'newTitle',
        message: 'Enter new title:',
        validate: (input: string) => input.length > 0 ? true : 'Title cannot be empty'
      }
    ]);

    this.editor.renameNode(nodeId, newTitle);
  }

  private async viewNodeInfoInteractive(): Promise<void> {
    const nodes = this.editor.getAllNodes();
    if (nodes.length === 0) {
      console.log(chalk.yellow('No nodes'));
      return;
    }

    const { nodeId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nodeId',
        message: 'Select node:',
        choices: nodes.map(n => ({ name: n.title, value: n.id }))
      }
    ]);

    this.editor.showNodeInfo(nodeId);
  }

  private async connectNodesInteractive(): Promise<void> {
    const nodes = this.editor.getAllNodes();
    if (nodes.length < 2) {
      console.log(chalk.yellow('Need at least 2 nodes to connect'));
      return;
    }

    const { fromNodeId, toNodeId, fromPinIdx, toPinIdx } = await inquirer.prompt([
      {
        type: 'list',
        name: 'fromNodeId',
        message: 'Select source node:',
        choices: nodes.map(n => ({ name: n.title, value: n.id }))
      },
      {
        type: 'list',
        name: 'toNodeId',
        message: 'Select target node:',
        choices: nodes.filter(n => n.id !== (this.editor.getNode((this as any).lastFromNodeId) ? (this as any).lastFromNodeId : '')).map(n => ({ name: n.title, value: n.id }))
      },
      {
        type: 'input',
        name: 'fromPinIdx',
        message: 'Source pin index (0-based):',
        default: '0',
        validate: (input: string) => /^\d+$/.test(input) ? true : 'Must be a number'
      },
      {
        type: 'input',
        name: 'toPinIdx',
        message: 'Target pin index (0-based):',
        default: '0',
        validate: (input: string) => /^\d+$/.test(input) ? true : 'Must be a number'
      }
    ]);

    this.editor.connect(fromNodeId, parseInt(fromPinIdx), toNodeId, parseInt(toPinIdx));
  }

  private async disconnectNodesInteractive(): Promise<void> {
    const connections = this.editor.getAllConnections();
    if (connections.length === 0) {
      console.log(chalk.yellow('No connections'));
      return;
    }

    const { connectionId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'connectionId',
        message: 'Select connection to remove:',
        choices: connections.map((c, idx) => {
          const fromNode = this.editor.getNode(c.fromNodeId);
          const toNode = this.editor.getNode(c.toNodeId);
          return { name: `${fromNode?.title} → ${toNode?.title}`, value: c.id };
        })
      }
    ]);

    this.editor.disconnect(connectionId);
  }

  private async reconnectNodeInteractive(): Promise<void> {
    const connections = this.editor.getAllConnections();
    if (connections.length === 0) {
      console.log(chalk.yellow('No connections'));
      return;
    }

    const { connectionId, toNodeId, toPinIdx } = await inquirer.prompt([
      {
        type: 'list',
        name: 'connectionId',
        message: 'Select connection to reconnect:',
        choices: connections.map((c, idx) => {
          const fromNode = this.editor.getNode(c.fromNodeId);
          const toNode = this.editor.getNode(c.toNodeId);
          return { name: `${fromNode?.title} → ${toNode?.title}`, value: c.id };
        })
      },
      {
        type: 'list',
        name: 'toNodeId',
        message: 'New target node:',
        choices: this.editor.getAllNodes().map(n => ({ name: n.title, value: n.id }))
      },
      {
        type: 'input',
        name: 'toPinIdx',
        message: 'Target pin index:',
        default: '0',
        validate: (input: string) => /^\d+$/.test(input) ? true : 'Must be a number'
      }
    ]);

    this.editor.reconnect(connectionId, toNodeId, parseInt(toPinIdx));
  }

  private async addInputPinInteractive(): Promise<void> {
    const nodes = this.editor.getAllNodes();
    if (nodes.length === 0) {
      console.log(chalk.yellow('No nodes'));
      return;
    }

    const { nodeId, pinName, pinType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nodeId',
        message: 'Select node:',
        choices: nodes.map(n => ({ name: n.title, value: n.id }))
      },
      {
        type: 'input',
        name: 'pinName',
        message: 'Pin name:',
        validate: (input) => input.length > 0 ? true : 'Name cannot be empty'
      },
      {
        type: 'list',
        name: 'pinType',
        message: 'Pin type:',
        choices: Object.values(PinType)
      }
    ]);

    this.editor.addInputPin(nodeId, pinName, pinType as PinType);
  }

  private async addOutputPinInteractive(): Promise<void> {
    const nodes = this.editor.getAllNodes();
    if (nodes.length === 0) {
      console.log(chalk.yellow('No nodes'));
      return;
    }

    const { nodeId, pinName, pinType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nodeId',
        message: 'Select node:',
        choices: nodes.map(n => ({ name: n.title, value: n.id }))
      },
      {
        type: 'input',
        name: 'pinName',
        message: 'Pin name:',
        validate: (input) => input.length > 0 ? true : 'Name cannot be empty'
      },
      {
        type: 'list',
        name: 'pinType',
        message: 'Pin type:',
        choices: Object.values(PinType)
      }
    ]);

    this.editor.addOutputPin(nodeId, pinName, pinType as PinType);
  }

  private async removePinInteractive(): Promise<void> {
    const nodes = this.editor.getAllNodes();
    if (nodes.length === 0) {
      console.log(chalk.yellow('No nodes'));
      return;
    }

    const { nodeId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nodeId',
        message: 'Select node:',
        choices: nodes.map(n => ({ name: n.title, value: n.id }))
      }
    ]);

    const node = this.editor.getNode(nodeId);
    if (!node || (node.inputs.length === 0 && node.outputs.length === 0)) {
      console.log(chalk.yellow('No pins to remove'));
      return;
    }

    const allPins = [
      ...node.inputs.map(p => ({ name: `IN: ${p.name}`, value: p.id })),
      ...node.outputs.map(p => ({ name: `OUT: ${p.name}`, value: p.id }))
    ];

    const { pinId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'pinId',
        message: 'Select pin:',
        choices: allPins
      }
    ]);

    this.editor.removePin(nodeId, pinId);
  }

  private async importArrowInteractive(): Promise<void> {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: 'Enter arrow format (e.g., "NodeA -> NodeB -> NodeC"):',
        validate: (input) => input.length > 0 ? true : 'Input cannot be empty'
      }
    ]);

    try {
      const graph = ArrowParser.parse(input);
      this.editor.setGraph(graph);
      console.log(chalk.green('✓ Graph imported from arrow format'));
    } catch (error: any) {
      console.log(chalk.red(`Failed to parse: ${error.message}`));
    }
  }

  private async importTreeInteractive(): Promise<void> {
    const { input } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'input',
        message: 'Enter ASCII tree format (paste multi-line tree):'
      }
    ]);

    try {
      const graph = AsciiTreeParser.parse(input);
      this.editor.setGraph(graph);
      console.log(chalk.green('✓ Graph imported from ASCII tree format'));
    } catch (error: any) {
      console.log(chalk.red(`Failed to parse: ${error.message}`));
    }
  }

  private async exportArrowInteractive(): Promise<void> {
    const output = ArrowParser.generate(this.editor.getGraph());
    console.log(chalk.cyan('\n═══ Arrow Format ═══'));
    console.log(output);
    console.log();
  }

  private async exportTreeInteractive(): Promise<void> {
    const output = AsciiTreeParser.generate(this.editor.getGraph());
    console.log(chalk.cyan('\n═══ ASCII Tree Format ═══'));
    console.log(output);
    console.log();
  }

  private async saveFileInteractive(): Promise<void> {
    const { format, filename } = await inquirer.prompt([
      {
        type: 'list',
        name: 'format',
        message: 'Select format:',
        choices: ['JSON', 'Arrow', 'Tree']
      },
      {
        type: 'input',
        name: 'filename',
        message: 'Enter filename (without extension):',
        validate: (input) => input.length > 0 ? true : 'Filename cannot be empty'
      }
    ]);

    try {
      let content: string;
      let ext: string;

      if (format === 'JSON') {
        content = this.serializeGraphToJSON();
        ext = '.json';
      } else if (format === 'Arrow') {
        content = ArrowParser.generate(this.editor.getGraph());
        ext = '.arrow';
      } else {
        content = AsciiTreeParser.generate(this.editor.getGraph());
        ext = '.tree';
      }

      const filepath = path.join(process.cwd(), filename + ext);
      fs.writeFileSync(filepath, content);
      console.log(chalk.green(`✓ Saved to ${filepath}`));
    } catch (error: any) {
      console.log(chalk.red(`Failed to save: ${error.message}`));
    }
  }

  private async loadFileInteractive(): Promise<void> {
    const { filepath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filepath',
        message: 'Enter file path:',
        validate: (input: string) => fs.existsSync(input) ? true : 'File not found'
      }
    ]);

    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      const ext = path.extname(filepath).toLowerCase();

      let graph: Graph;
      if (ext === '.json') {
        graph = this.deserializeGraphFromJSON(content);
      } else if (ext === '.arrow') {
        graph = ArrowParser.parse(content);
      } else if (ext === '.tree') {
        graph = AsciiTreeParser.parse(content);
      } else {
        throw new Error('Unsupported file format');
      }

      this.editor.setGraph(graph);
      console.log(chalk.green(`✓ Loaded from ${filepath}`));
    } catch (error: any) {
      console.log(chalk.red(`Failed to load: ${error.message}`));
    }
  }

  private async clearGraphInteractive(): Promise<void> {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Clear entire graph? This cannot be undone.',
        default: false
      }
    ]);

    if (confirm) {
      this.editor.clear();
    }
  }

  private serializeGraphToJSON(): string {
    const graph = this.editor.getGraph();
    const nodes = graph.getAllNodes().map(n => ({
      id: n.id,
      title: n.title,
      category: n.category,
      x: n.x,
      y: n.y,
      inputs: n.inputs.map(p => ({ name: p.name, type: p.type })),
      outputs: n.outputs.map(p => ({ name: p.name, type: p.type }))
    }));

    const connections = graph.getAllConnections().map(c => ({
      id: c.id,
      fromNodeId: c.fromNodeId,
      toNodeId: c.toNodeId,
      fromPinIndex: this.editor.getNode(c.fromNodeId)?.outputs.findIndex(p => p.id === c.fromPinId),
      toPinIndex: this.editor.getNode(c.toNodeId)?.inputs.findIndex(p => p.id === c.toPinId)
    }));

    return JSON.stringify({ nodes, connections }, null, 2);
  }

  private deserializeGraphFromJSON(json: string): Graph {
    const data = JSON.parse(json);
    const graph = new Graph();

    // Create nodes
    const nodeMap = new Map<string, string>();
    data.nodes.forEach((nodeData: any) => {
      const node = new (require('./types')).Node(nodeData.title, nodeData.category);
      node.setPosition(nodeData.x, nodeData.y);

      nodeData.inputs.forEach((pin: any) => {
        node.addInputPin(pin.name, pin.type);
      });

      nodeData.outputs.forEach((pin: any) => {
        node.addOutputPin(pin.name, pin.type);
      });

      graph.addNode(node);
      nodeMap.set(nodeData.id, node.id);
    });

    // Create connections
    data.connections.forEach((connData: any) => {
      const fromNode = graph.getNode(nodeMap.get(connData.fromNodeId)!);
      const toNode = graph.getNode(nodeMap.get(connData.toNodeId)!);

      if (fromNode && toNode) {
        const fromPin = fromNode.outputs[connData.fromPinIndex];
        const toPin = toNode.inputs[connData.toPinIndex];

        if (fromPin && toPin) {
          const conn = new (require('./types')).Connection(
            fromNode.id,
            fromPin.id,
            toNode.id,
            toPin.id
          );
          graph.addConnection(conn);
        }
      }
    });

    return graph;
  }

  private async pause(): Promise<void> {
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
      }
    ]);
    console.clear();
  }
}

// Run CLI
const cli = new BlueprintCLI();
cli.start().catch(console.error);

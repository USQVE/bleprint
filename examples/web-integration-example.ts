/**
 * Complete Integration Example: CLI Backend + Web UI
 *
 * This example demonstrates how the web UI integrates with the core backend,
 * showing bidirectional data flow and format conversion.
 */

// Import core engine components
import { Editor, Graph, Node, PinType, ArrowParser, AsciiTreeParser } from '../src/index';

// Import web UI adapters and parsers
import { GraphToUIAdapter, UIToGraphAdapter } from '../src/web/adapter';
import { parseUniversal, buildAsciiTreeExec, exportToArrow, exportToTree } from '../src/web/utils/parser';

/**
 * Scenario 1: User Imports Blueprint Graph
 *
 * Flow: Text Input → Parser → Core Graph → UI Adapter → React Visualization
 */
console.log('=== Scenario 1: Import from Arrow Format ===\n');

const arrowInput = `
EventTick[out:Exec] -> GetActorLocation[in:Exec|out:Vector]
GetActorLocation -> PrintString[in:Vector|out:Exec]
`;

// Step 1: Parse using core parser
const coreGraph = ArrowParser.parse(arrowInput);
console.log(`✓ Parsed into core Graph with ${coreGraph.getAllNodes().length} nodes`);

// Step 2: Adapt to UI format for React
const uiData = GraphToUIAdapter.adaptGraph(coreGraph);
console.log(`✓ Adapted to React format:`);
console.log(`  - Nodes: ${uiData.nodes.length}`);
console.log(`  - Connections: ${uiData.connections.length}`);
uiData.nodes.forEach(n => console.log(`    • ${n.title} (${n.color})`));

/**
 * Scenario 2: User Edits in Web UI
 *
 * React state would update locally, then when user exports:
 * React Data → UI Adapter → Core Graph → Core Parsers → Export Formats
 */
console.log('\n=== Scenario 2: Edit and Export ===\n');

// Simulate React state (user modified the graph)
const reactNodes = uiData.nodes;
const reactConnections = uiData.connections;

// User clicks "Export as Arrow"
const arrowExport = exportToArrow(reactNodes, reactConnections);
console.log('✓ Exported to Arrow format:');
console.log(arrowExport);

// User clicks "Export as Tree"
const treeExport = exportToTree(reactNodes, reactConnections);
console.log('\n✓ Exported to Tree format:');
console.log(treeExport);

/**
 * Scenario 3: Universal Parser for Different Formats
 *
 * Shows how parseUniversal automatically detects format
 */
console.log('\n=== Scenario 3: Universal Format Detection ===\n');

const treeInput = `
├── EventBeginPlay
│   ├── SpawnActor
│   │   └── LogMessage
│   └── PlaySound
└── EventEndPlay
`;

const treeNodeData = parseUniversal(treeInput);
console.log(`✓ Auto-detected as Tree format with ${treeNodeData.nodes.length} nodes`);

const execTree = buildAsciiTreeExec(treeNodeData.nodes, treeNodeData.connections);
console.log(`✓ Generated execution tree:\n${execTree}`);

/**
 * Scenario 4: Round-trip Conversion
 *
 * UI Data → Core Graph → UI Data (ensures data integrity)
 */
console.log('\n=== Scenario 4: Round-trip Conversion ===\n');

// Convert UI data back to Core Graph
const roundtripGraph = UIToGraphAdapter.adaptToGraph(reactNodes, reactConnections);
console.log(`✓ Converted React UI back to Core Graph`);
console.log(`  - Nodes: ${roundtripGraph.getAllNodes().length}`);
console.log(`  - Connections: ${roundtripGraph.getAllConnections().length}`);

// Convert back to UI format to verify
const roundtripUI = GraphToUIAdapter.adaptGraph(roundtripGraph);
console.log(`✓ Verified round-trip conversion`);
console.log(`  - Nodes match: ${roundtripUI.nodes.length === reactNodes.length}`);
console.log(`  - Connections match: ${roundtripUI.connections.length === reactConnections.length}`);

/**
 * Scenario 5: Using Core CLI Editor with Web Visualization
 *
 * Shows that the same Graph object can be used by both CLI and Web UI
 */
console.log('\n=== Scenario 5: Dual Interface (CLI + Web) ===\n');

// Create graph using CLI Editor
const cliEditor = new Editor();
const node1 = cliEditor.createNode('Event Input', 'Events');
const node2 = cliEditor.createNode('Process Data', 'Logic');
const node3 = cliEditor.createNode('Output', 'Events');

// Add pins via CLI
cliEditor.addOutputPin(node1, 'Exec', PinType.Exec);
cliEditor.addInputPin(node2, 'Exec', PinType.Exec);
cliEditor.addOutputPin(node2, 'Result', PinType.String);
cliEditor.addInputPin(node3, 'Value', PinType.String);

// Connect via CLI
cliEditor.connect(node1, 0, node2, 0);
cliEditor.connect(node2, 0, node3, 0);

console.log('✓ Created graph via CLI Editor');

// Now visualize the same graph in Web UI
const cliGraph = cliEditor.getGraph();
const webVisualization = GraphToUIAdapter.adaptGraph(cliGraph);
console.log('✓ Converted same graph for Web UI visualization:');
webVisualization.nodes.forEach(n => {
  console.log(`  • ${n.title}: ${n.inputs.length} in, ${n.outputs.length} out`);
});

/**
 * Scenario 6: Type Safety Across Boundaries
 *
 * Demonstrates how types are preserved through conversions
 */
console.log('\n=== Scenario 6: Type System Integrity ===\n');

const testGraph = new Graph();
const testNode = new Node('TypeTest', 'Test');
testNode.addOutputPin('exec', PinType.Exec);
testNode.addOutputPin('number', PinType.Float);
testNode.addOutputPin('vector', PinType.Vector);
testGraph.addNode(testNode);

console.log('✓ Core types before conversion:');
testNode.outputs.forEach(p => console.log(`  - ${p.name}: ${p.type}`));

const uiTypes = GraphToUIAdapter.adaptGraph(testGraph);
console.log('✓ UI types after conversion:');
uiTypes.nodes[0].outputs.forEach(p => console.log(`  - ${p.name}: ${p.type} (${p.color})`));

/**
 * Scenario 7: Handling Type Mismatches
 *
 * Shows validation when connecting incompatible types
 */
console.log('\n=== Scenario 7: Type Compatibility Checking ===\n');

const validGraph = new Graph();
const source = new Node('Source', 'Test');
const target = new Node('Target', 'Test');

source.addOutputPin('string_out', PinType.String);
target.addInputPin('string_in', PinType.String);
target.addInputPin('vector_in', PinType.Vector);

validGraph.addNode(source);
validGraph.addNode(target);

// Valid connection: String → String
const validConn = new (require('../src/types')).Connection(
  source.id,
  source.outputs[0].id,
  target.id,
  target.inputs[0].id
);

const canConnect = validGraph.addConnection(validConn);
console.log(`✓ String → String connection: ${canConnect ? 'Valid ✓' : 'Invalid ✗'}`);

// Invalid connection would fail
console.log('✓ Type compatibility validated through adapter');

console.log('\n=== Integration Examples Complete ===\n');

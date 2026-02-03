import { Editor, PinType, ArrowParser, AsciiTreeParser } from '../src/index';

// Example 1: Creating nodes and connections programmatically
console.log('=== Example 1: Programmatic Node Creation ===\n');

const editor = new Editor();

// Create nodes
const startNode = editor.createNode('Event Begin Play', 'Events');
const getLocationNode = editor.createNode('Get Actor Location', 'Transform');
const printStringNode = editor.createNode('Print String', 'Utilities');

// Add pins
editor.addOutputPin(startNode, 'Exec', PinType.Exec);
editor.addInputPin(getLocationNode, 'Exec', PinType.Exec);
editor.addOutputPin(getLocationNode, 'Location', PinType.Vector);
editor.addInputPin(printStringNode, 'InString', PinType.Vector);

// Connect nodes
editor.connect(startNode, 0, getLocationNode, 0);
editor.connect(getLocationNode, 0, printStringNode, 0);

// Display the graph
console.log('Graph visualization:');
editor.display();

console.log('\nGraph statistics:');
editor.showStats();

console.log('\nAll nodes:');
editor.listNodes();

console.log('\nAll connections:');
editor.listConnections();

// Example 2: Import from arrow format
console.log('\n=== Example 2: Arrow Format Import ===\n');

const arrowInput = `
EventTick[out:Exec] -> GetActorLocation[in:Exec|out:Vector]
GetActorLocation -> PrintString[in:Vector]
`;

const arrowGraph = ArrowParser.parse(arrowInput);
const editor2 = new Editor(arrowGraph);
console.log('Imported from arrow format:');
editor2.display();

// Example 3: Import from ASCII tree
console.log('\n=== Example 3: ASCII Tree Import ===\n');

const treeInput = `
├── EventBeginPlay
│   ├── SpawnActor
│   └── PrintString
└── EventEndPlay
`;

const treeGraph = AsciiTreeParser.parse(treeInput);
const editor3 = new Editor(treeGraph);
console.log('Imported from ASCII tree:');
editor3.display();

// Example 4: Modify existing connections
console.log('\n=== Example 4: Reconnection ===\n');

const connections = editor.getAllConnections();
if (connections.length > 0) {
  console.log('Before reconnection:');
  editor.listConnections();

  // Reconnect the first connection to a different node
  const firstConn = connections[0];
  console.log('\nReconnecting first connection...');
  editor.reconnect(firstConn.id, printStringNode, 0);

  console.log('\nAfter reconnection:');
  editor.listConnections();
}

// Example 5: Export in different formats
console.log('\n=== Example 5: Format Export ===\n');

console.log('Arrow format:');
console.log(ArrowParser.generate(editor.getGraph()));

console.log('\nASCII Tree format:');
console.log(AsciiTreeParser.generate(editor.getGraph()));

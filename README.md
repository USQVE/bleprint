# Blueprint Node Editor

An interactive terminal-based node editor that allows you to visualize and manipulate graph structures in Unreal Engine Blueprint style. Create nodes, connect them with type-safe pins, and work with multiple formats.

## Features

✨ **Interactive CLI Interface**
- Intuitive menu-driven interaction
- Real-time visual feedback
- Multi-format support

📊 **Graph Visualization**
- ASCII diagram generation
- Node and connection display
- Pin state indicators
- Type-based coloring system

🔗 **Node & Connection Management**
- Create and delete nodes
- Connect/disconnect with type validation
- Reconnect existing connections
- Rename and reposition nodes

📌 **Pin System**
- Typed pins (Exec, Bool, Int, Float, String, Object, Vector, Wildcard)
- Input and output pins
- Connection state tracking
- Dynamic pin management

💾 **Import/Export**
- Arrow format: `NodeA -> NodeB`
- ASCII tree format with hierarchical structure
- JSON serialization
- File I/O operations

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Usage

### Interactive CLI

```bash
npm run dev
```

This launches the interactive menu-driven interface where you can:
- Create and manage nodes
- Connect nodes with pins
- Visualize your graph
- Import/export in multiple formats
- Save and load graphs

### Programmatic Usage

```typescript
import { Editor, PinType } from './editor';

const editor = new Editor();

// Create nodes
const nodeA = editor.createNode('Start', 'Logic');
const nodeB = editor.createNode('Process', 'Logic');

// Add pins
editor.addOutputPin(nodeA, 'out_data', PinType.String);
editor.addInputPin(nodeB, 'in_data', PinType.String);

// Connect
editor.connect(nodeA, 0, nodeB, 0);

// Display
editor.display();
```

### Import from Arrow Format

```typescript
import { ArrowParser } from './parsers/arrowParser';

const graph = ArrowParser.parse(`
NodeA[out:Exec] -> NodeB[in:Exec|out:Data]
NodeB -> NodeC[in:Data]
`);
```

### Import from ASCII Tree

```typescript
import { AsciiTreeParser } from './parsers/asciiTreeParser';

const graph = AsciiTreeParser.parse(`
├── Root
│   ├── Child1
│   └── Child2
└── OtherBranch
`);
```

## Architecture

### Core Components

**types.ts** - Data structures
- `Pin` - Individual connection point with type and state
- `Node` - Graph node with input/output pins
- `Connection` - Link between two pins
- `PinType` - Type enumeration with color mapping

**graph.ts** - Graph management
- `Graph` - Node and connection storage and validation
- Pin compatibility checking
- Connection lifecycle management

**editor.ts** - High-level operations
- `Editor` - User-facing API for graph manipulation
- Node CRUD operations
- Pin management
- Visual feedback

**visualizer.ts** - Display generation
- `Visualizer` - ASCII diagram rendering
- Node and connection drawing
- Statistics display
- Information panels

**parsers/**
- `ArrowParser` - Parse/generate `->` format
- `AsciiTreeParser` - Parse/generate tree format

**cli.ts** - Interactive interface
- Menu-driven navigation
- Interactive prompts
- File operations
- Format conversion

## Pin Types

| Type | Color | Use Case |
|------|-------|----------|
| Exec | 🔴 Red | Execution flow |
| Boolean | 🟡 Yellow | True/false values |
| Integer | 🔵 Blue | Whole numbers |
| Float | 🟢 Green | Decimal numbers |
| String | 🟣 Purple | Text data |
| Object | 🟠 Orange | Complex objects |
| Vector | ⚪ White | 3D coordinates |
| Wildcard | ⭕ Gray | Any type |

## Examples

### Create a Simple Flow

```
Create Node 'Start'
Add Output Pin 'exec' as Exec
Create Node 'End'
Add Input Pin 'exec' as Exec
Connect Start → End
```

### Complex Hierarchy

```
Create Node 'EventTick'
Create Node 'GetActorLocation'
Create Node 'PrintString'

EventTick (out: Exec) → GetActorLocation (in: Exec, out: Vector)
GetActorLocation (out: Vector) → PrintString (in: Vector)
```

## Data Formats

### Arrow Format
```
NodeA[in:Exec|out:String] -> NodeB[in:String] -> NodeC[in:String]
```

### ASCII Tree Format
```
├── Root
│   ├── Branch1
│   └── Branch2
└── OtherBranch
```

### JSON Format
```json
{
  "nodes": [
    {
      "id": "uuid",
      "title": "NodeName",
      "category": "Logic",
      "x": 0,
      "y": 0,
      "inputs": [{"name": "in", "type": "Exec"}],
      "outputs": [{"name": "out", "type": "String"}]
    }
  ],
  "connections": [
    {
      "fromNodeId": "uuid1",
      "toNodeId": "uuid2",
      "fromPinIndex": 0,
      "toPinIndex": 0
    }
  ]
}
```

## License

MIT © 2026 EYETH1337

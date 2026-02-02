# Blueprint Node Editor

A comprehensive interactive node editor for visualizing and manipulating graph structures in Unreal Engine Blueprint style. Features both a powerful **CLI interface** and a modern **React-based web UI** with real-time visualization.

## Features

### 🖥️ **Dual Interface**
- **CLI**: Menu-driven terminal interface for scripting and automation
- **Web UI**: Interactive visual editor with drag-and-drop, zoom/pan

✨ **Interactive Editing**
- Intuitive menu-driven CLI interaction
- Real-time visual feedback in React
- Multi-format support (Arrow, Tree, JSON)

📊 **Graph Visualization**
- ASCII diagram generation (CLI)
- Interactive canvas with pan/zoom (Web)
- Bezier curve connections
- Node and connection display
- Pin state indicators
- Type-based color system (Unreal Engine style)

🔗 **Node & Connection Management**
- Create, delete, rename nodes
- Connect/disconnect with type validation
- Reconnect existing connections
- Reposition nodes via drag-and-drop
- Import/export graphs in multiple formats

📌 **Pin System**
- 8 typed pin categories (Exec, Bool, Int, Float, String, Object, Vector, Wildcard)
- Input and output pins with visual separation
- Connection state tracking (connected/disconnected)
- Dynamic pin management
- Color-coded by type

💾 **Multi-Format Support**
- **Arrow format**: `NodeA -> NodeB` with optional pin definitions
- **ASCII tree format**: Hierarchical structure with execution flow
- **JSON format**: Complete graph serialization
- Seamless format conversion and import/export

## Installation & Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# (Optional) Build for web deployment
npm run build:web
```

## Quick Start

### CLI Interface
```bash
npm run dev
```
Browse the interactive menu to create nodes, connect them, and manage your graph.

### Web UI
```bash
# Start development server (requires React/Vite setup)
npm run dev:web
```
Open browser and get an interactive visual editor with drag-and-drop support.

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

### Web UI Interface

The React-based web UI provides an interactive visual editor with:
- **Drag-and-drop** node positioning
- **Pan & zoom** canvas controls
- **Real-time** connection creation by dragging between pins
- **Visual feedback** with node colors and pin type indicators
- **Import/Export** panel for format conversion
- **Execution tree** preview showing control flow
- **Format detection** for automatic parsing

Features:
- Universal format parser (auto-detects Arrow, Tree, JSON)
- Execution tree generation (Exec flow visualization)
- Copy/paste execution tree to clipboard
- Download/upload graphs in multiple formats
- Real-time syntax highlighting

See [Web UI Documentation](./src/web/README.md) for detailed guide.

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

```
┌─────────────────────────────────────────┐
│      Web UI (React Components)          │
│  ├── App.tsx (main interface)          │
│  ├── Node.tsx (visual nodes)           │
│  ├── Connection.tsx (bezier curves)    │
│  └── CommentBox.tsx (annotations)      │
└────────────┬────────────────────────────┘
             │ (uses)
┌────────────▼────────────────────────────┐
│   Adapter Layer (Type Bridge)           │
│  ├── GraphToUIAdapter                  │
│  └── UIToGraphAdapter                  │
└────────────┬────────────────────────────┘
             │ (wraps)
┌────────────▼────────────────────────────┐
│    Core Engine (TypeScript Backend)     │
├─────────────────────────────────────────┤
│ types.ts        - Core data structures  │
│ graph.ts        - Graph management      │
│ editor.ts       - High-level API        │
│ visualizer.ts   - ASCII rendering       │
│ parsers/        - Format conversion     │
│ cli.ts          - CLI interface         │
└─────────────────────────────────────────┘
```

### Core Components

**Backend (src/)**

- **types.ts** - Core data structures
  - `Pin` - Typed connection point with state
  - `Node` - Graph node with pins
  - `Connection` - Link between pins
  - `PinType` - 8 pin type categories

- **graph.ts** - Graph management
  - `Graph` - Node/connection storage
  - Pin compatibility validation
  - Connection lifecycle

- **editor.ts** - High-level API
  - `Editor` - User-facing operations
  - Node/pin/connection CRUD
  - Visualization methods

- **visualizer.ts** - ASCII rendering
  - ASCII diagram generation
  - Node/connection drawing
  - Statistics panels

- **parsers/** - Format conversion
  - `ArrowParser` - Parse/generate Arrow format
  - `AsciiTreeParser` - Parse/generate Tree format

- **cli.ts** - Terminal interface
  - Menu-driven navigation
  - Interactive prompts
  - File I/O

**Web UI (src/web/)**

- **adapter.ts** - Type bridge
  - `GraphToUIAdapter` - Core → React
  - `UIToGraphAdapter` - React → Core

- **App.tsx** - Main React component
  - Canvas rendering
  - Pan/zoom controls
  - Node/connection management

- **components/** - React components
  - `Node.tsx` - Visual node representation
  - `Connection.tsx` - Bezier curve connections
  - `CommentBox.tsx` - Annotations

- **utils/parser.ts** - Format handling
  - Universal format detection
  - Execution tree generation
  - Export/import functions

- **types.ts** - Web UI types
  - `NodeData` - React node format
  - `PinUI` - React pin format
  - `ConnectionUI` - React connection format

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

### Web UI - Arrow Format

Paste this into the Web UI editor:

```
EventTick[out:Exec] -> GetActorLocation[in:Exec|out:Vector]
GetActorLocation -> PrintString[in:Vector]
```

Result: Graph with 3 nodes and 2 connections, ready to edit visually.

### Web UI - Tree Format

```
├── EventBeginPlay
│   ├── SpawnActor
│   │   └── LogMessage
│   └── PlaySound
└── EventEndPlay
```

Result: Hierarchical structure automatically laid out.

### Web UI - JSON Export

```json
{
  "nodes": [
    {
      "id": "node_1",
      "title": "EventTick",
      "x": 0,
      "y": 0,
      "width": 250,
      "height": 100,
      "color": "red",
      "inputs": [],
      "outputs": [
        {
          "id": "pin_1",
          "name": "Exec",
          "type": "exec",
          "color": "#ff4444",
          "isOutput": true
        }
      ]
    }
  ],
  "connections": []
}
```

### CLI - Programmatic Creation

```bash
npm run dev
```

Then use the interactive menu to:
1. Create Node 'Start' category 'Events'
2. Add Output Pin 'exec' type 'Exec'
3. Create Node 'End' category 'Events'
4. Add Input Pin 'exec' type 'Exec'
5. Connect nodes
6. Display graph

### Programmatic Integration

```typescript
import { Editor, PinType, ArrowParser } from 'blueprint-node-editor';

// Parse from Arrow format
const graph = ArrowParser.parse('EventTick -> LogMessage -> End');

// Use Editor API
const editor = new Editor(graph);
editor.display();
editor.listNodes();
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

## Web UI & Core Engine Integration

The system is built with a clean separation between backend engine and frontend visualization:

### How It Works

1. **Parse Input**: User provides text (Arrow/Tree format) or JSON
2. **Core Processing**: `ArrowParser` or `AsciiTreeParser` creates a `Graph` object
3. **Adapt Types**: `GraphToUIAdapter` converts `Graph` → `NodeData[]` for React
4. **Render**: React components display nodes with connections
5. **Edit**: User interacts with UI (drag nodes, create connections)
6. **Save**: When exporting, `UIToGraphAdapter` converts `NodeData[]` → `Graph`
7. **Export**: Core parsers generate output in selected format

### Type Safety

The system maintains type safety throughout the pipeline:

```typescript
// Core types (PinType enum)
Exec, Boolean, Integer, Float, String, Object, Vector, Wildcard

// Conversion to UI
Exec → 'exec' (red, #ff4444)
Boolean → 'bool' (yellow, #ffff00)
Integer/Float → 'number' (blue, #4488ff)
Vector → 'vector' (light yellow, #ffff88)
String → 'string' (pink, #ff88ff)
Object → 'object' (orange, #ff8844)
Wildcard → 'other' (gray, #888888)

// Reverse conversion preserves original types
```

### Data Flow

```
Input Text/JSON
    ↓
Core Parser (ArrowParser/AsciiTreeParser)
    ↓
Graph Object (Core Engine)
    ↓
GraphToUIAdapter
    ↓
NodeData[], ConnectionUI[] (React State)
    ↓
React Components (Visualization)
    ↓
User Edits (Drag, Connect, etc.)
    ↓
UIToGraphAdapter
    ↓
Graph Object (Core Engine)
    ↓
Core Exporter (ArrowParser/AsciiTreeParser)
    ↓
Output Text/JSON
```

### Extensibility

Add custom node types or parsers:

```typescript
// Extend adapter for custom types
class CustomAdapter extends GraphToUIAdapter {
  static adaptNode(node: Node): NodeData {
    // Custom logic
    return { /* ... */ };
  }
}

// Add custom parser
class CustomParser {
  static parse(input: string): Graph { /* ... */ }
  static generate(graph: Graph): string { /* ... */ }
}
```

See [Integration Examples](./examples/web-integration-example.ts) for more details.

## License

MIT © 2026 EYETH1337

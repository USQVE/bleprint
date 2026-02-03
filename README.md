# Blueprint Node Editor

A comprehensive interactive node editor for visualizing and manipulating graph structures in Unreal Engine Blueprint style. Features a modern **React-based web UI** with real-time visualization and interactive graph editing.

## 🚀 Quick Start

### **Open in Stackblitz** (No installation needed!)
[![Open in Stackblitz](https://img.shields.io/badge/Open%20in-Stackblitz-blue?logo=stackblitz)](https://stackblitz.com/github/EYETH1337/blueprint)

Or run locally:
```bash
npm install
npm run dev
```

## Features

### 🎨 **Interactive Web UI**
- Modern React-based visual editor with drag-and-drop
- Pan/zoom canvas controls
- Real-time connection creation
- Multi-format support (Arrow, Tree, JSON)

✨ **Interactive Editing**
- Intuitive drag-and-drop node positioning
- Visual connection creation via pin dragging
- Real-time graph updates and visualization
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

### Local Development

```bash
# Clone and install
git clone https://github.com/EYETH1337/blueprint.git
cd blueprint
npm install

# Start development server
npm run dev
```

Opens at http://localhost:3000

### Build for Production

```bash
npm run build
# Output in ./dist
```

### Online (Stackblitz)

No installation needed! Click the badge above to open in Stackblitz editor in your browser.

## Usage

### Web UI Interface

Once started (locally or on Stackblitz), the React-based editor provides:

**Canvas Controls:**
- **Drag nodes** - Reposition nodes on the canvas
- **Drag pins** - Create connections between nodes
- **Right-click + drag** - Pan the view
- **+/- buttons** - Zoom in/out
- **Auto-layout** - Organize nodes automatically

**Parser Tool:**
- **Database icon** - Open universal parser
- **Play button** - Parse and apply graph
- Supports Arrow, Tree, and JSON formats

**Features:**
- Universal format parser (auto-detects Arrow, Tree, JSON)
- Execution tree generation (Exec flow visualization)
- Copy/paste execution tree to clipboard
- Download/upload graphs in multiple formats
- Real-time syntax highlighting
- Node creation and deletion
- Visual feedback with node colors and pin type indicators

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

- **cli.ts** - Programmatic API
  - Core engine exports
  - Graph manipulation
  - Format parsing

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

### Web UI - Interactive Creation

1. Open the Web UI (local or Stackblitz)
2. Click Database icon to open the Parser Tool
3. In the Source Code editor, paste:
   ```
   Start[out:Exec] -> End[in:Exec]
   ```
4. Click "Parse & Sync Blueprint"
5. Drag nodes around and create new connections by dragging between pins

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

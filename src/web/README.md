# Blueprint Node Editor - Web UI

Interactive React-based visual node editor fully integrated with the TypeScript core engine.

## Architecture

The web UI is built with a clean separation of concerns:

```
┌─────────────────────────────────────────────────┐
│             React Components (UI Layer)          │
│  App.tsx, Node.tsx, Connection.tsx, etc.        │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│           Adapter Layer (Type Bridge)            │
│  adapter.ts: Graph ↔ NodeData/ConnectionUI      │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│         Parser Layer (Format Conversion)         │
│  parser.ts: Universal format detection/export   │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│        Core Engine (TypeScript Backend)          │
│  Graph, Node, Pin, ArrowParser, AsciiTreeParser│
└─────────────────────────────────────────────────┘
```

## File Structure

```
src/web/
├── App.tsx                  # Main React component
├── types.ts                 # Web UI type definitions
├── adapter.ts              # Graph ↔ UI type adapter
├── constants.ts            # UI constants and defaults
├── README.md              # This file
├── components/
│   ├── Node.tsx           # Node visualization component
│   ├── Connection.tsx      # Connection line component
│   └── CommentBox.tsx      # Comment annotation component
└── utils/
    └── parser.ts          # Universal format parser wrapper
```

## Core Components

### App.tsx
Main React application providing:
- Interactive canvas with zoom/pan
- Node and connection rendering
- Drag-and-drop node movement
- Pin connection creation
- Import/Export functionality
- Parser interface

### Node.tsx
Individual node visualization with:
- Draggable node body
- Input/output pins display
- Pin color-coding by type
- Delete button
- Header with gradient based on node type

### Connection.tsx
Connection line rendering with:
- Bezier curve paths
- Pin color matching
- Hover effects and glow
- Arrowhead indication
- Shadow depth effects

### Adapter Layer (adapter.ts)
Bidirectional conversion between:
- `Graph` (core) ↔ `NodeData` (React)
- `Connection` (core) ↔ `ConnectionUI` (React)
- `Pin` (core) ↔ `PinUI` (React)

Type mappings:
- Core `PinType.Exec` → UI `'exec'` (Red)
- Core `PinType.Boolean` → UI `'bool'` (Yellow)
- Core `PinType.Integer/Float` → UI `'number'` (Blue)
- Core `PinType.Vector` → UI `'vector'` (Light Yellow)
- Core `PinType.String` → UI `'string'` (Pink)
- Core `PinType.Object` → UI `'object'` (Orange)
- Core `PinType.Wildcard` → UI `'other'` (Gray)

## Features

### Visual Editing
- **Drag Nodes**: Click and drag nodes to reposition
- **Create Connections**: Click pin → drag to target pin
- **Delete Nodes**: Click X button on node header
- **Disconnect Pins**: Right-click on connection to remove
- **Zoom/Pan**: Mouse wheel to zoom, right-click drag to pan

### Import/Export

**Supported Formats:**
1. **Arrow Format** (`.arrow`)
   ```
   EventTick[out:Exec] -> GetActorLocation[in:Exec|out:Vector]
   GetActorLocation -> PrintString[in:Vector]
   ```

2. **ASCII Tree Format** (`.tree`)
   ```
   ├── EventBeginPlay
   │   ├── SpawnActor
   │   └── LogMessage
   └── EventEndPlay
   ```

3. **JSON Format** (`.json`)
   ```json
   {
     "nodes": [...],
     "connections": [...]
   }
   ```

**Usage:**
- Click **Download** button to export with selected format
- Click **Upload** button to import from file
- Select format using buttons in export panel

### Execution Tree View
Real-time generation of execution flow tree:
- Shows only Exec (white) connections
- Hierarchical tree structure
- Cycle detection
- Copy to clipboard functionality

## Integration with Core

The web UI seamlessly integrates with the TypeScript core:

```typescript
// Core types are used internally
import { Graph, Node, Connection, Pin, PinType } from '../types';

// Adapter converts for React visualization
const { nodes, connections } = GraphToUIAdapter.adaptGraph(graph);

// Universal parser handles all formats
const graph = parseUniversal(inputText);

// Changes can be saved back to core
const graph = UIToGraphAdapter.adaptToGraph(nodes, connections);
```

## Usage Example

### Starting the Web App

```bash
npm install
npm run build
npm run dev:web  # if configured
```

### Programmatic Integration

```typescript
import { parseUniversal, buildAsciiTreeExec, exportToArrow } from './utils/parser';
import { GraphToUIAdapter } from './adapter';

// Parse input
const parsed = parseUniversal(inputText);
const nodes = parsed.nodes;
const connections = parsed.connections;

// Build tree view
const treeText = buildAsciiTreeExec(nodes, connections);

// Export to formats
const arrowText = exportToArrow(nodes, connections);
const treeFormat = exportToTree(nodes, connections);
const jsonData = exportToJSON(nodes, connections);

// Import from JSON
const { nodes: importedNodes, connections: importedConns } = importFromJSON(jsonString);
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click + Drag | Move node |
| Pin Click + Drag | Create connection |
| Right-Click + Pin | Disconnect |
| Mouse Wheel | Zoom in/out |
| + / - Buttons | Manual zoom |
| Recenter Button | Reset camera |
| Clear Button | Remove all nodes |

## Color System

Pin colors correspond to their types (Unreal Engine style):

| Type | Color | RGB |
|------|-------|-----|
| Exec | Red | #ff4444 |
| Boolean | Yellow | #ffff00 |
| Integer/Float | Blue | #4488ff |
| Vector | Light Yellow | #ffff88 |
| String | Pink | #ff88ff |
| Object | Orange | #ff8844 |
| Other | Gray | #888888 |

## Performance Notes

- Supports graphs with 100+ nodes
- Efficient SVG rendering for connections
- Throttled drag updates
- Memoized computations for node positioning
- Canvas grid for visual reference

## Known Limitations

1. No multi-selection (select multiple nodes at once)
2. No copy/paste operations
3. No undo/redo history
4. No custom node types (hardcoded node categories)
5. No real-time collaboration

## Future Enhancements

- [ ] Multi-node selection and bulk operations
- [ ] Copy/paste with keyboard shortcuts
- [ ] Undo/redo stack
- [ ] Node type customization
- [ ] Blueprint library/palette
- [ ] Local storage auto-save
- [ ] Socket.io real-time collaboration
- [ ] Custom node shapes and decorators
- [ ] Property inspector panel
- [ ] Search/filter functionality

## Troubleshooting

**Nodes not appearing?**
- Ensure input format is correct (Arrow, Tree, or JSON)
- Click "Parse & Sync Blueprint" button

**Connections not working?**
- Check pin type compatibility (same type or Wildcard)
- Ensure pins are on opposite sides (Input/Output)

**Performance issues?**
- Reduce number of nodes or connections
- Clear and reload the graph
- Close browser developer tools

## See Also

- [Core Engine Documentation](../README.md)
- [Type Definitions](./types.ts)
- [Parser Documentation](./utils/parser.ts)

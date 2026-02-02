export const COLORS = {
  white: '#ffffff',
  red: '#ff4444',
  green: '#44ff44',
  blue: '#4488ff',
  yellow: '#ffff00',
  orange: '#ff8844',
  pink: '#ff88ff',
  gray: '#888888'
};

export const INITIAL_TEXT_DATA = `// Blueprint Node Editor
// Try these formats:
// Arrow: NodeA -> NodeB -> NodeC
// Tree:  ├── Node1
//        │   ├── Node2
//        │   └── Node3
//        └── Node4

EventTick[out:Exec] -> GetActorLocation[in:Exec|out:Vector]
GetActorLocation -> PrintString[in:Vector]
`;

export const EXAMPLE_ARROW_FORMAT = `// Arrow Format Example
[EventBeginPlay] (Exec - red) -> [GetActorLocation] (Exec - red) -> [PrintString] (Vector - yellow)
`;

export const EXAMPLE_TREE_FORMAT = `// Tree Format Example
├── EventBeginPlay
│   ├── SpawnActor
│   │   └── LogMessage
│   └── PlaySound
└── EventEndPlay
`;

export const EXAMPLE_JSON_FORMAT = `{
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
`;

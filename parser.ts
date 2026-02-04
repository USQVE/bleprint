
import { NodeData, Connection, PinType } from '../types';
import { COLORS } from '../constants';

const getColorHex = (colorName: string): string => {
  if (!colorName) return COLORS.gray;
  const name = colorName.toLowerCase().trim();
  if (name.includes('белый') || name.includes('white')) return COLORS.white;
  if (name.includes('зеленый') || name.includes('зелёный') || name.includes('green')) return COLORS.green;
  if (name.includes('желтый') || name.includes('жёлтый') || name.includes('yellow')) return COLORS.yellow;
  if (name.includes('красный') || name.includes('red')) return COLORS.red;
  if (name.includes('синий') || name.includes('blue')) return COLORS.blue;
  return COLORS.gray;
};

const getPinType = (category: string, subCategory?: string, subCategoryObject?: string): PinType => {
  if (!category) return 'other';
  const cat = category.toLowerCase();
  if (cat === 'exec') return 'exec';
  if (cat === 'bool') return 'bool';
  if (['real', 'int', 'float', 'double', 'byte'].includes(cat)) return 'number';
  if (cat === 'struct') {
    if (subCategoryObject?.toLowerCase().includes('vector')) return 'vector';
    if (subCategoryObject?.toLowerCase().includes('transform')) return 'vector';
  }
  return 'other';
};

const getNodeCategory = (name: string): 'red' | 'blue' | 'gray' => {
  const n = name.toLowerCase();
  if (n.includes('key') || n.includes('inputaction') || n.includes('event') || n.includes('beginplay')) return 'red';
  if (n.includes('location') || n.includes('vector') || n.includes('speed') || n.includes('transform') || n.includes('superhead')) return 'gray';
  return 'blue';
};

const createBaseNode = (id: string, title: string): NodeData => ({
  id,
  title,
  x: 0,
  y: 0,
  width: 250,
  height: 100,
  color: getNodeCategory(title),
  inputs: [],
  outputs: [],
});

const finalizeNodeSizing = (node: NodeData) => {
  const HEADER_H = 40;
  const PIN_ROW_H = 26;
  const PADDING = 10;
  const titleWidth = node.title.length * 9 + 80;
  const rows = Math.max(node.inputs.length, node.outputs.length, 1);
  node.width = Math.max(200, titleWidth);
  node.height = HEADER_H + rows * PIN_ROW_H + PADDING;
};

/**
 * Parses the legacy arrow format: [Node] (Pin - Color) -> [Node] (Pin - Color)
 */
export const parseGraphText = (text: string): { nodes: NodeData[]; connections: Connection[] } => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('//'));
  const nodes: NodeData[] = [];
  const connections: Connection[] = [];
  const nodeInstances: Record<string, NodeData> = {};
  const lastUse: Record<string, { key: string; idx: number }> = {};
  const counters: Record<string, number> = {};
  const WINDOW = 3;

  const getOrCreateNode = (raw: string, pinType: PinType, currentIdx: number): NodeData => {
    const parts = raw.split('#');
    const title = parts[0].trim();
    const explicitId = parts.length > 1 ? parts[1].trim() : null;
    let key = explicitId ? `${title}#${explicitId}` : (pinType === 'exec' ? `${title}#main` : '');

    if (!key) {
      const last = lastUse[title];
      if (last && (currentIdx - last.idx) <= WINDOW) {
        key = last.key;
      } else {
        counters[title] = (counters[title] || 0) + 1;
        key = `${title}#${counters[title]}`;
      }
    }

    if (!nodeInstances[key]) {
      nodeInstances[key] = createBaseNode(key, title);
      nodes.push(nodeInstances[key]);
    }
    lastUse[title] = { key, idx: currentIdx };
    return nodeInstances[key];
  };

  lines.forEach((line, idx) => {
    const connRegex = /^\[(.*?)\]\s*\((.*?)\s*-\s*(.*?)\)\s*(?:->|→)\s*\[(.*?)\]\s*\((.*?)\s*-\s*(.*?)\)\s*$/;
    const match = line.match(connRegex);
    if (match) {
      const [, sRaw, sPin, sCol, tRaw, tPin, tCol] = match;
      const sType = getPinType(sCol), tType = getPinType(tCol);
      const sNode = getOrCreateNode(sRaw, sType, idx), tNode = getOrCreateNode(tRaw, tType, idx);
      const sPinId = `${sNode.id}-out-${sPin.trim()}`, tPinId = `${tNode.id}-in-${tPin.trim()}`;
      
      if (!sNode.outputs.find(p => p.id === sPinId)) sNode.outputs.push({ id: sPinId, name: sPin.trim(), type: sType, color: getColorHex(sCol), isOutput: true });
      if (!tNode.inputs.find(p => p.id === tPinId)) tNode.inputs.push({ id: tPinId, name: tPin.trim(), type: tType, color: getColorHex(tCol), isOutput: false });
      
      connections.push({ id: `conn-${idx}`, fromNode: sNode.id, fromPin: sPinId, toNode: tNode.id, toPin: tPinId, color: getColorHex(sCol) });
    } else {
      const nodeRegex = /^\[(.*?)\](?:\s*\((.*?)\))?$/;
      const m = line.match(nodeRegex);
      if (m) {
        const pinParts = (m[2] ?? '').split('-').map(s => s.trim());
        const node = getOrCreateNode(m[1], pinParts[1] ? getPinType(pinParts[1]) : 'other', idx);
        if (pinParts.length > 0 && pinParts[0]) {
          const pId = `${node.id}-out-${pinParts[0]}`;
          if (!node.outputs.find(p => p.id === pId)) node.outputs.push({ id: pId, name: pinParts[0], type: getPinType(pinParts[1]), color: getColorHex(pinParts[1]), isOutput: true });
        }
      }
    }
  });

  nodes.forEach((n, i) => {
    finalizeNodeSizing(n);
    n.x = 250 + (i % 4) * 420;
    n.y = 250 + Math.floor(i / 4) * 280;
  });
  return { nodes, connections };
};

/**
 * Parses ASCII Tree format: └── ChildNode (Pin→Pin)
 */
const parseAsciiTreeInput = (text: string): { nodes: NodeData[]; connections: Connection[] } => {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const nodes: NodeData[] = [];
  const connections: Connection[] = [];
  const stack: { node: NodeData; depth: number }[] = [];

  lines.forEach((line, idx) => {
    // Detect depth using leading symbols or spaces
    const treeMatch = line.match(/^([\s│]*)[├└]──\s*(.*?)$/);
    let depth = 0;
    let content = line.trim();

    if (treeMatch) {
      depth = Math.floor(treeMatch[1].length / 4) + 1;
      content = treeMatch[2].trim();
    }

    // Parse Title and Pins (multiple mappings supported: Out1→In1, Out2→In2)
    const pinInfoMatch = content.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    const title = (pinInfoMatch ? pinInfoMatch[1] : content).trim();
    const pinString = pinInfoMatch?.[2] || "";

    const nodeId = `${title}_${idx}`;
    const newNode = createBaseNode(nodeId, title);
    nodes.push(newNode);

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    if (stack.length > 0) {
      const parent = stack[stack.length - 1].node;
      const mappings = pinString.split(',').map(m => m.trim()).filter(m => m.length > 0);
      
      if (mappings.length === 0) {
        // Fallback for missing pin info
        mappings.push("then→execute");
      }

      mappings.forEach((mapping, mIdx) => {
        const parts = mapping.split(/→|->/); // Fixed: Invalid regular expression range
        const outPinName = parts[0]?.trim() || "out";
        const inPinName = parts[1]?.trim() || "in";

        const type = getPinType(outPinName);
        const color = getColorHex(outPinName);

        const sPinId = `${parent.id}-out-${outPinName}`;
        const tPinId = `${newNode.id}-in-${inPinName}`;

        if (!parent.outputs.find(p => p.id === sPinId)) {
          parent.outputs.push({ id: sPinId, name: outPinName, type, color, isOutput: true });
        }
        if (!newNode.inputs.find(p => p.id === tPinId)) {
          newNode.inputs.push({ id: tPinId, name: inPinName, type, color, isOutput: false });
        }

        connections.push({
          id: `c-ascii-${idx}-${mIdx}`,
          fromNode: parent.id,
          fromPin: sPinId,
          toNode: newNode.id,
          toPin: tPinId,
          color
        });
      });
    }

    stack.push({ node: newNode, depth });
  });

  // Simple grid layout for ASCII input
  nodes.forEach((n, i) => {
    finalizeNodeSizing(n);
    n.x = 250 + (i % 4) * 420;
    n.y = 250 + Math.floor(i / 4) * 280;
  });

  return { nodes, connections };
};

/**
 * Universal Parser for Blueprint/Material Clipboards, ASCII Tree and Legacy Arrow format
 */
export const parseUniversal = (text: string): { nodes: NodeData[]; connections: Connection[] } => {
  if (text.includes('Begin Object')) {
    const nodes: NodeData[] = [];
    const connections: Connection[] = [];
    const nodeMap: Record<string, NodeData> = {};
    const pinIndex: Record<string, { nodeId: string; pinId: string; isOutput: boolean }> = {};
    const rawConnections: Array<{ fromNode: string; fromPinId: string; toNode: string; toPinId: string }> = [];

    // Parse Begin Object ... End Object blocks
    const objectBlocks: string[] = [];
    let currentBlock = "";
    let depth = 0;
    
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes('Begin Object')) {
        if (depth > 0) {
          currentBlock += line + '\n';
        } else {
          currentBlock = line + '\n';
        }
        depth++;
      } else if (line.includes('End Object')) {
        depth--;
        currentBlock += line + '\n';
        if (depth === 0) {
          objectBlocks.push(currentBlock);
          currentBlock = "";
        }
      } else if (depth > 0) {
        currentBlock += line + '\n';
      }
    }

    objectBlocks.forEach((block, idx) => {
      // Extract internalId from Name="..."
      const nameMatch = block.match(/Name="(.*?)"/);
      const internalId = nameMatch ? nameMatch[1] : `Node_${idx}`;
      
      // Extract position
      const xMatch = block.match(/NodePosX=(-?\d+)/);
      const yMatch = block.match(/NodePosY=(-?\d+)/);
      
      // Determine node title
      let title = "Unknown Node";
      
      // Material node case
      if (internalId.startsWith('MaterialGraphNode')) {
        const exprMatch = block.match(/MaterialExpression=(.*?)\s/);
        if (exprMatch) {
          const exprType = exprMatch[1].replace('MaterialExpression', '');
          const paramMatch = block.match(/ParameterName="(.*?)"/) || block.match(/Name="(.*?)"/);
          title = paramMatch ? `${exprType} (${paramMatch[1]})` : exprType;
        } else {
          title = internalId;
        }
      } 
      // Blueprint node cases
      else {
        // Event node
        const eventMatch = block.match(/EventReference=\(MemberName="(.*?)"\)/);
        if (eventMatch) {
          const eventName = eventMatch[1].replace('Receive', 'Event ').replace(/([A-Z])/g, ' $1').trim();
          title = eventName;
        } 
        // Timeline node
        else if (block.includes('TimelineName')) {
          const timelineMatch = block.match(/TimelineName="(.*?)"/);
          title = timelineMatch ? `Timeline (${timelineMatch[1]})` : "Timeline";
        } 
        // Macro instance
        else if (block.includes('MacroGraphReference')) {
          const macroMatch = block.match(/GraphBlueprint="(.*?)"\)/);
          if (macroMatch) {
            const path = macroMatch[1].split('/');
            title = path[path.length - 1] || "Macro";
          } else {
            title = "Macro";
          }
        } 
        // Function call
        else if (block.includes('FunctionReference')) {
          const funcMatch = block.match(/FunctionReference=\(MemberName="(.*?)"\)/);
          if (funcMatch) {
            let funcName = funcMatch[1];
            // Remove common prefixes
            funcName = funcName.replace(/^K2_/, '').replace(/^Set/, '');
            title = funcName;
          }
        } 
        // Default case
        else {
          const classMatch = block.match(/Class=(.*?)\.(.*?)\s/);
          title = classMatch ? classMatch[2].replace('K2Node_', '') : internalId;
        }
      }

      const node = createBaseNode(internalId, title);
      node.x = xMatch ? parseInt(xMatch[1]) : 0;
      node.y = yMatch ? parseInt(yMatch[1]) : 0;

      // Parse pins
      const pinRegex = /CustomProperties Pin \((.*?)\)/g;
      let pinMatch;
      while ((pinMatch = pinRegex.exec(block)) !== null) {
        const props = pinMatch[1];
        
        // Extract pin properties
        const pinIdMatch = props.match(/PinId=([0-9A-F\-]+)/);
        const pinNameMatch = props.match(/PinName="(.*?)"/);
        const directionMatch = props.match(/Direction="(.*?)"/);
        const pinCategoryMatch = props.match(/PinType.PinCategory="(.*?)"/);
        const pinSubCategoryMatch = props.match(/PinType.PinSubCategory="(.*?)"/);
        const pinSubCategoryObjectMatch = props.match(/PinType.PinSubCategoryObject="(.*?)"/);
        const linkedToMatch = props.match(/LinkedTo=\((.*?)\)/);

        const pinId = pinIdMatch ? pinIdMatch[1] : "pin";
        const pinName = pinNameMatch ? pinNameMatch[1] : pinId;
        const isOutput = directionMatch ? directionMatch[1] === "EGPD_Output" : false;
        const pinCategory = pinCategoryMatch ? pinCategoryMatch[1] : "other";
        const pinSubCategory = pinSubCategoryMatch ? pinSubCategoryMatch[1] : "";
        const pinSubCategoryObject = pinSubCategoryObjectMatch ? pinSubCategoryObjectMatch[1] : "";

        const type = getPinType(pinCategory, pinSubCategory, pinSubCategoryObject);
        const color = type === 'exec' ? COLORS.white : 
                     type === 'bool' ? COLORS.red : 
                     type === 'number' ? COLORS.green : 
                     type === 'vector' ? COLORS.yellow : 
                     COLORS.gray;

        const pin = { 
          id: `${internalId}-${isOutput ? 'out' : 'in'}-${pinId}`, 
          name: pinName, 
          type, 
          color, 
          isOutput 
        };
        
        if (isOutput) {
          node.outputs.push(pin);
        } else {
          node.inputs.push(pin);
        }
        
        // Index pin for connection resolution
        pinIndex[`${internalId}:${pinId}`] = { nodeId: internalId, pinId, isOutput };
        
        // Process connections
        if (linkedToMatch && isOutput && linkedToMatch[1]) {
          const links = linkedToMatch[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
          links.forEach(link => {
            const linkParts = link.split(' ');
            if (linkParts.length >= 2) {
              const targetNodeName = linkParts[0];
              const targetPinId = linkParts[1].replace(/"/g, '');
              rawConnections.push({
                fromNode: internalId,
                fromPinId: pinId,
                toNode: targetNodeName,
                toPinId: targetPinId
              });
            }
          });
        }
      }

      nodeMap[internalId] = node;
      nodes.push(node);
    });

    // Resolve connections using pin index
    rawConnections.forEach(rc => {
      const fromNode = nodeMap[rc.fromNode];
      const toNode = nodeMap[rc.toNode];
      
      if (fromNode && toNode) {
        const fromPinEntry = pinIndex[`${rc.fromNode}:${rc.fromPinId}`];
        const toPinEntry = pinIndex[`${rc.toNode}:${rc.toPinId}`];
        
        if (fromPinEntry && toPinEntry && !toPinEntry.isOutput) {
          const fromPin = fromNode.outputs.find(p => p.id === `${rc.fromNode}-out-${rc.fromPinId}`);
          const toPin = toNode.inputs.find(p => p.id === `${rc.toNode}-in-${rc.toPinId}`);
          
          if (fromPin && toPin) {
            connections.push({
              id: `c_${rc.fromNode}_${rc.fromPinId}_${rc.toNode}_${rc.toPinId}`,
              fromNode: fromNode.id,
              fromPin: fromPin.id,
              toNode: toNode.id,
              toPin: toPin.id,
              color: fromPin.color
            });
          }
        }
      }
    });

    nodes.forEach(finalizeNodeSizing);
    return { nodes, connections };
  }

  if (text.includes('├──') || text.includes('└──')) {
    return parseAsciiTreeInput(text);
  }

  return parseGraphText(text);
};

/**
 * Builds an ASCII Tree based ONLY on execution (white/exec) flows.
 * Handles merging multiple edges, cycle detection, and redundancy.
 */
export const buildAsciiTreeExec = (nodes: NodeData[], connections: Connection[]): string => {
  // Filter exec connections based on pin types, not colors
  const execConns = connections.filter(c => {
    const fromNode = nodes.find(n => n.id === c.fromNode);
    const fromPin = fromNode?.outputs.find(p => p.id === c.fromPin);
    return fromPin?.type === 'exec';
  });

  const outgoing = new Map<string, Connection[]>();
  const incomingExecCount = new Map<string, number>();

  nodes.forEach(n => {
    outgoing.set(n.id, []);
    incomingExecCount.set(n.id, 0);
  });

  execConns.forEach(c => {
    outgoing.get(c.fromNode)?.push(c);
    incomingExecCount.set(c.toNode, (incomingExecCount.get(c.toNode) || 0) + 1);
  });

  const roots = nodes.filter(n => incomingExecCount.get(n.id) === 0 && outgoing.get(n.id)!.length > 0);
  let result = "";

  const traverse = (nodeId: string, prefix: string, isLast: boolean, path: Set<string>, globalSeen: Set<string>): string => {
    const node = nodes.find(n => n.id === nodeId)!;
    const connector = isLast ? "└── " : "├── ";
    
    let line = `${prefix}${connector}${node.title}`;
    if (path.has(nodeId)) return `${line} [loop]\n`;
    if (globalSeen.has(nodeId)) return `${line} [seen]\n`;

    line += "\n";
    globalSeen.add(nodeId);
    const newPath = new Set(path).add(nodeId);
    const childConnections = outgoing.get(nodeId) || [];
    
    // Group connections by target node
    const groups = new Map<string, { conn: Connection; fromPinName: string; toPinName: string }[]>();
    childConnections.forEach(c => {
      const fromNode = nodes.find(n => n.id === c.fromNode);
      const toNode = nodes.find(n => n.id === c.toNode);
      const fromPin = fromNode?.outputs.find(p => p.id === c.fromPin);
      const toPin = toNode?.inputs.find(p => p.id === c.toPin);
      
      if (fromPin && toPin) {
        if (!groups.has(c.toNode)) groups.set(c.toNode, []);
        groups.get(c.toNode)!.push({
          conn: c,
          fromPinName: fromPin.name,
          toPinName: toPin.name
        });
      }
    });

    // Convert to array and sort for deterministic order
    const children = Array.from(groups.entries())
      .map(([toId, connections]) => {
        const labels = connections.map(c => `${c.fromPinName}→${c.toPinName}`);
        return { toId, labels };
      })
      .sort((a, b) => {
        const nodeA = nodes.find(n => n.id === a.toId);
        const nodeB = nodes.find(n => n.id === b.toId);
        if (!nodeA || !nodeB) return 0;
        
        // Sort by child title first, then by label string
        if (nodeA.title !== nodeB.title) {
          return nodeA.title.localeCompare(nodeB.title);
        }
        return a.labels.join(',').localeCompare(b.labels.join(','));
      });

    const newPrefix = prefix + (isLast ? "    " : "│   ");

    children.forEach(({ toId, labels }, idx) => {
      const labelStr = ` (${labels.join(', ')})`;
      const childStr = traverse(toId, newPrefix, idx === children.length - 1, newPath, globalSeen);
      const lines = childStr.split('\n');
      if (lines[0]) lines[0] = lines[0] + labelStr;
      line += lines.join('\n');
      if (!childStr.endsWith('\n')) line += '\n';
    });

    return line;
  };

  roots.forEach((root, i) => {
    // Create new globalSeen for each root to avoid hiding branches between roots
    const globalSeen = new Set<string>();
    
    // For root, don't add prefix connector
    let rootLine = `${root.title}\n`;
    const childConnections = outgoing.get(root.id) || [];
    
    // Group connections by target node
    const groups = new Map<string, { conn: Connection; fromPinName: string; toPinName: string }[]>();
    childConnections.forEach(c => {
      const fromNode = nodes.find(n => n.id === c.fromNode);
      const toNode = nodes.find(n => n.id === c.toNode);
      const fromPin = fromNode?.outputs.find(p => p.id === c.fromPin);
      const toPin = toNode?.inputs.find(p => p.id === c.toPin);
      
      if (fromPin && toPin) {
        if (!groups.has(c.toNode)) groups.set(c.toNode, []);
        groups.get(c.toNode)!.push({
          conn: c,
          fromPinName: fromPin.name,
          toPinName: toPin.name
        });
      }
    });

    // Convert to array and sort for deterministic order
    const children = Array.from(groups.entries())
      .map(([toId, connections]) => {
        const labels = connections.map(c => `${c.fromPinName}→${c.toPinName}`);
        return { toId, labels };
      })
      .sort((a, b) => {
        const nodeA = nodes.find(n => n.id === a.toId);
        const nodeB = nodes.find(n => n.id === b.toId);
        if (!nodeA || !nodeB) return 0;
        
        // Sort by child title first, then by label string
        if (nodeA.title !== nodeB.title) {
          return nodeA.title.localeCompare(nodeB.title);
        }
        return a.labels.join(',').localeCompare(b.labels.join(','));
      });

    children.forEach(({ toId, labels }, idx) => {
      const labelStr = ` (${labels.join(', ')})`;
      const childStr = traverse(toId, "", idx === children.length - 1, new Set([root.id]), globalSeen);
      const lines = childStr.split('\n');
      if (lines[0]) lines[0] = lines[0] + labelStr;
      rootLine += lines.join('\n');
      if (!childStr.endsWith('\n')) rootLine += '\n';
    });

    result += rootLine;
    if (i < roots.length - 1) result += "\n";
  });

  return result || "No execution flow detected.";
};

/**
 * Example of parsing Russian Blueprint format with legacy arrow parser
 *
 * Format: [NodeName] (PinName - Цвет) → [NodeName] (PinName - Цвет)
 *
 * Supported Russian color names:
 * - Белый (white) → Exec type
 * - Зеленый/Зелёный (green) → Integer type
 * - Желтый/Жёлтый (yellow) → Float type
 * - Красный (red) → Boolean type
 * - Синий (blue) → Vector type
 */

import { LegacyArrowParser } from '../src/parsers/legacyArrowParser';
import { Visualizer } from '../src/visualizer';
import { Editor } from '../src/editor';

// Example Russian format Blueprint
const russianBlueprintText = `
[Key One] (Pressed - Белый) → [FindThrowSpots] (execute - Белый)
[FindThrowSpots] (then - Белый) → [ForLoop X] (execute - Белый)
[ForLoop X] (LoopBody - Белый) → [ForLoop Y] (execute - Белый)
[ForLoop X] (Index - Зеленый) → [Multiply X] (A - Зеленый)
[ForLoop Y] (Index - Зеленый) → [Multiply Y] (A - Зеленый)
[Multiply X] (ReturnValue - Зеленый) → [MakeVector] (X - Зеленый)
[Multiply Y] (ReturnValue - Зеленый) → [MakeVector] (Y - Зеленый)
[GetActorLocation] (ReturnValue - Желтый) → [Add Base] (A - Желтый)
[MakeVector] (ReturnValue - Желтый) → [Add Base] (B - Желтый)
[Add Base] (ReturnValue - Желтый) → [Add Height] (A - Желтый)
[ForLoop Y] (LoopBody - Белый) → [LineTraceSingle] (execute - Белый)
[Add Height] (ReturnValue - Желтый) → [LineTraceSingle] (Start - Желтый)
[TargetLocation] (Value - Желтый) → [LineTraceSingle] (End - Желтый)
[LineTraceSingle] (then - Белый) → [Branch Visibility] (execute - Белый)
[LineTraceSingle] (ReturnValue - Красный) → [Branch Visibility] (Condition - Красный)
[Branch Visibility] (true - Белый) → [SuggestProjectileVelocity] (execute - Белый)
[Add Height] (ReturnValue - Желтый) → [SuggestProjectileVelocity] (StartLocation - Желтый)
[TargetLocation] (Value - Желтый) → [SuggestProjectileVelocity] (EndLocation - Желтый)
[ThrowSpeed] (Value - Зеленый) → [SuggestProjectileVelocity] (LaunchSpeed - Зеленый)
[SuggestProjectileVelocity] (then - Белый) → [Branch Ballistics] (execute - Белый)
[SuggestProjectileVelocity] (ReturnValue - Красный) → [Branch Ballistics] (Condition - Красный)
[Branch Ballistics] (true - Белый) → [DrawDebugSphere] (execute - Белый)
[Add Base] (ReturnValue - Желтый) → [DrawDebugSphere] (Center - Желтый)

// Standalone nodes (variables)
[TargetLocation] (Value-Желтый)
[ThrowSpeed] (Value-Зеленый)
[GetActorLocation] (ReturnValue-Желтый)
`.trim();

console.log('=== Russian Blueprint Format Parser ===\n');

try {
  // Parse using LegacyArrowParser
  const graph = LegacyArrowParser.parse(russianBlueprintText);
  console.log(`✓ Successfully parsed Russian format\n`);

  // Create editor
  const editor = new Editor(graph);

  // Display statistics
  console.log('Graph Statistics:');
  editor.showStats();

  // Display diagram
  console.log('\nGraph Diagram:');
  editor.display();

  // List nodes
  console.log('Nodes:');
  editor.listNodes();

  // List connections
  console.log('Connections:');
  editor.listConnections();

  // Export to different formats
  console.log('\n=== Exports ===\n');

  const { ArrowParser } = require('../src/parsers/arrowParser');
  const { AsciiTreeParser } = require('../src/parsers/asciiTreeParser');

  console.log('Arrow Format Export:');
  console.log(ArrowParser.generate(graph));

  console.log('\n\nASCII Tree Format Export:');
  console.log(AsciiTreeParser.generate(graph));

} catch (error) {
  console.error('Parse error:', error);
}

// Example 2: Color mapping demonstration
console.log('\n\n=== Color Mapping ===\n');

const colorExamples = [
  'Белый (white)',
  'Зеленый (green)',
  'Желтый (yellow)',
  'Красный (red)',
  'Синий (blue)',
];

const { ColorName } = { ColorName: 'Russian Color Names' };

colorExamples.forEach((color) => {
  const parts = color.split(' ');
  const russianName = parts[0];

  // Determine type
  let typeName = '';
  if (russianName.includes('Белый')) typeName = 'Exec (white connections)';
  if (russianName.includes('Зеленый')) typeName = 'Integer (calculation results)';
  if (russianName.includes('Желтый')) typeName = 'Float (positional data)';
  if (russianName.includes('Красный')) typeName = 'Boolean (condition checks)';
  if (russianName.includes('Синий')) typeName = 'Vector (direction/location)';

  console.log(`${color} → ${typeName}`);
});

console.log('\n✓ Russian format parsing complete!');

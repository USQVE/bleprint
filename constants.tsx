export const COLORS = {
  white: '#ffffff',
  green: '#2ecc71',
  yellow: '#f1c40f',
  red: '#e74c3c',
  blue: '#3498db',
  gray: '#4b5563',
};

export const INITIAL_TEXT_DATA = `
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

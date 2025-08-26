import type { Shape } from './Shape';

// Shape-level plugin, every instance of a shape has/can have one
export interface ShapePlugin {
  attach(shape: Shape): void;
  detach(): void;
}

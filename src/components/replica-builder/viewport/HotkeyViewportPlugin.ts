import type { ShapeStore } from '../lib/ShapeStore';
import type { ViewportPlugin } from './ViewportPlugin';

export class HotkeyViewportPlugin implements ViewportPlugin {
  private svgElement: SVGSVGElement | null = null;

  constructor(private shapeStore: ShapeStore) {}

  attach(svgElement: SVGSVGElement): void {
    this.svgElement = svgElement;
    document.addEventListener('keydown', this.handleKeyDown);
  }

  detach(): void {
    if (this.svgElement) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    // removing selection or stopping new shape creation
    if (e.key === 'Escape') {
      this.shapeStore.deselectAll();
      this.shapeStore.deleteUnfinishedShapes();
    }
    // deleting selected shapes
    if (e.key === 'Backspace' || e.key === 'Delete') {
      this.shapeStore.selectedShapes.forEach((s) => this.shapeStore.deleteShape(s.id));
    }
    //  moving selected shapes with arrow keys
    const step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowUp') {
      this.shapeStore.selectedShapes.forEach((s) => s.moveBy(0, -step));
    }
    if (e.key === 'ArrowDown') {
      this.shapeStore.selectedShapes.forEach((s) => s.moveBy(0, step));
    }
    if (e.key === 'ArrowLeft') {
      this.shapeStore.selectedShapes.forEach((s) => s.moveBy(-step, 0));
    }
    if (e.key === 'ArrowRight') {
      this.shapeStore.selectedShapes.forEach((s) => s.moveBy(step, 0));
    }
  };
}

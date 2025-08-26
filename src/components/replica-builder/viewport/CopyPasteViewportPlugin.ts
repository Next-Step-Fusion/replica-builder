import type { ShapeStore } from '../lib/ShapeStore';
import type { SerializedShape } from '../shapes/Shape';
import type { ViewportPlugin } from './ViewportPlugin';

export class CopyPasteViewportPlugin implements ViewportPlugin {
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

  copiedShapes: SerializedShape[] | null = null;

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c') {
        this.copiedShapes = this.shapeStore.selectedShapes.map((s) => s.serialize());
      } else if (e.key === 'v') {
        if (this.copiedShapes) {
          this.copiedShapes.forEach((s) => {
            s.points.forEach((p) => {
              p.x += 20;
              p.y += 20;
            });
          });
          this.shapeStore.deserialize(this.copiedShapes);
        }
      }
    }
  };
}

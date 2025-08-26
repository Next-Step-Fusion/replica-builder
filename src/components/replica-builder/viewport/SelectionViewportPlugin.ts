import type { ShapeStore } from '../lib/ShapeStore';
import type { ViewportPlugin } from './ViewportPlugin';

export class SelectionViewportPlugin implements ViewportPlugin {
  private svgElement: SVGSVGElement | null = null;
  private shapeStore: ShapeStore;

  constructor(shapeStore: ShapeStore) {
    this.shapeStore = shapeStore;
  }

  attach(svgElement: SVGSVGElement): void {
    if (!svgElement) {
      return;
    }
    this.svgElement = svgElement;

    this.svgElement.addEventListener('click', this.handleClick);
  }

  detach(): void {
    if (this.svgElement) {
      this.svgElement.removeEventListener('click', this.handleClick);
    }
  }

  private handleClick = (): void => {
    this.shapeStore.deselectAll();
  };
}

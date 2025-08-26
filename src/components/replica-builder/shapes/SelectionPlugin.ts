import type { ShapeStore } from '../lib/ShapeStore';
import type { Shape } from './Shape';
import type { ShapePlugin } from './ShapePlugin';

export class SelectionPlugin implements ShapePlugin {
  private shape: Shape | null = null;
  private shapeStore: ShapeStore;

  constructor(shapeStore: ShapeStore) {
    this.shapeStore = shapeStore;
  }

  attach(shape: Shape): void {
    this.shape = shape;
    if (this.shape.node && this.shape.selectable) {
      console.log('SELECTABLE: attach');
      this.shape.node.addEventListener('click', this.handleClick);
    }
  }

  detach(): void {
    if (this.shape?.node && this.shape.selectable) {
      console.log('SELECTABLE: detach');
      this.shape.node.removeEventListener('click', this.handleClick);
    }
    this.shape = null;
  }

  private handleClick = (event: MouseEvent): void => {
    console.log('SELECTABLE: click');
    if (this.shape?.disableSelection) return;
    // avoid click registering on the viewport or other shapes below
    event.stopPropagation();
    if (!this.shape || this.shape.isBuilding || this.shape.isDragging) return;
    if (!event.shiftKey) {
      this.shapeStore.deselectAll();
    }
    this.shape.toggleSelection();
  };
}

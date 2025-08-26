import type { Shape } from './Shape';
import type { ShapePlugin } from './ShapePlugin';

export class DraggingPlugin implements ShapePlugin {
  private shape: Shape | null = null;
  private dragStartCoords: { x: number; y: number } | null = null;
  private ownerSVGElement: SVGSVGElement | null = null;
  private transformedGElement: SVGGElement | null = null;

  attach(shape: Shape): void {
    console.log('DRAGGABLE: attach');
    this.shape = shape;
    if (this.shape.node && this.shape.draggable) {
      this.shape.node.addEventListener('mousedown', this.handleMouseDown);
      this.ownerSVGElement = this.shape.node.ownerSVGElement;
      this.transformedGElement = this.shape.node.parentNode as SVGGElement;
    }
  }

  detach(): void {
    console.log('DRAGGABLE: detach');
    if (this.shape?.node && this.shape.draggable) {
      this.shape.node.removeEventListener('mousedown', this.handleMouseDown);
    }

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.shape = null;
    this.ownerSVGElement = null;
    this.transformedGElement = null;
  }

  private getSVGCoordinates(event: MouseEvent): { x: number; y: number } | null {
    if (!this.ownerSVGElement || !this.transformedGElement) {
      return null;
    }
    const pt = this.ownerSVGElement.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    return pt.matrixTransform(this.transformedGElement.getScreenCTM()!.inverse());
  }

  private handleMouseDown = (event: MouseEvent): void => {
    console.log('DRAGGABLE: mouse down');
    if (!this.shape || this.shape.isBuilding || !this.shape.node?.ownerSVGElement) {
      return;
    }
    const coords = this.getSVGCoordinates(event);
    if (!coords) {
      return;
    }
    this.dragStartCoords = coords;
    this.shape.isDragging = true;

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  };

  private handleMouseMove = (event: MouseEvent): void => {
    if (
      !this.shape?.isDragging ||
      !this.shape ||
      !this.shape.node?.ownerSVGElement ||
      !this.dragStartCoords
    ) {
      return;
    }

    const currentCoords = this.getSVGCoordinates(event);
    if (!currentCoords) return;

    const dx = event.altKey ? 0 : currentCoords.x - this.dragStartCoords.x;
    const dy = event.metaKey ? 0 : currentCoords.y - this.dragStartCoords.y;

    this.shape.moveBy(dx, dy);

    // Update dragStartCoords for the next move event to represent the new "origin" for deltas
    this.dragStartCoords = currentCoords;
  };

  private handleMouseUp = (_event: MouseEvent): void => {
    console.log('DRAGGABLE: mouse up');
    if (this.shape?.isDragging) {
      this.shape.isDragging = false;
      this.dragStartCoords = null;
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
    }
  };
}

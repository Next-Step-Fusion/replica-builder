import { autorun, makeObservable, observable } from 'mobx';
import { Marker } from './Marker';
import type { Shape } from './Shape';
import type { ShapePlugin } from './ShapePlugin';

type HandlePosition =
  | 'top-left'
  | 'top-middle'
  | 'top-right'
  | 'right-middle'
  | 'bottom-right'
  | 'bottom-middle'
  | 'bottom-left'
  | 'left-middle';

const padding = 12;

//#region Handle Definitions

interface HandleDefinition {
  id: HandlePosition;
  index: number;
  getX: (box: { minX: number; maxX: number; midX: number }, p: number) => number;
  getY: (box: { minY: number; maxY: number; midY: number }, p: number) => number;
  moveRestriction?: 'vertical' | 'horizontal';
}

const handleDefinitions: ReadonlyArray<HandleDefinition> = [
  {
    id: 'top-left',
    index: 0,
    getX: (box, p) => box.minX - p,
    getY: (box, p) => box.minY - p
  },
  {
    id: 'top-middle',
    index: 1,
    getX: (box, _p) => box.midX,
    getY: (box, p) => box.minY - p,
    moveRestriction: 'vertical'
  },
  {
    id: 'top-right',
    index: 2,
    getX: (box, p) => box.maxX + p,
    getY: (box, p) => box.minY - p
  },
  {
    id: 'right-middle',
    index: 3,
    getX: (box, p) => box.maxX + p,
    getY: (box, _p) => box.midY,
    moveRestriction: 'horizontal'
  },
  {
    id: 'bottom-right',
    index: 4,
    getX: (box, p) => box.maxX + p,
    getY: (box, p) => box.maxY + p
  },
  {
    id: 'bottom-middle',
    index: 5,
    getX: (box, _p) => box.midX,
    getY: (box, p) => box.maxY + p,
    moveRestriction: 'vertical'
  },
  {
    id: 'bottom-left',
    index: 6,
    getX: (box, p) => box.minX - p,
    getY: (box, p) => box.maxY + p
  },
  {
    id: 'left-middle',
    index: 7,
    getX: (box, p) => box.minX - p,
    getY: (box, p) => box.midY,
    moveRestriction: 'horizontal'
  }
];
//#endregion

export class ResizePlugin implements ShapePlugin {
  private shape: Shape | null = null;
  private disposer: (() => void) | null = null;

  handles: Marker[] = [];

  constructor() {
    makeObservable(this, {
      handles: observable.shallow
    });
  }

  resizeShape(dx: number, dy: number, handlePosition: HandlePosition, shiftKey: boolean): void {
    const shape = this.shape;
    if (!shape || !shape.boundingBox || shape.points.length === 0) {
      return;
    }

    const oldBox = shape.boundingBox;
    const oldWidth = oldBox.maxX - oldBox.minX;
    const oldHeight = oldBox.maxY - oldBox.minY;

    if (shiftKey && oldWidth !== 0 && oldHeight !== 0) {
      const aspectRatio = oldWidth / oldHeight;

      // For corner handles, we adjust both dx and dy to maintain aspect ratio
      if (!handlePosition.includes('middle')) {
        const isAntiDiagonal = handlePosition === 'top-right' || handlePosition === 'bottom-left';
        const sign = isAntiDiagonal ? -1 : 1;

        // Project the mouse movement vector (dx, dy) onto the aspect ratio line.
        // The line has a direction vector of (aspectRatio, sign).
        const dotProduct = dx * aspectRatio + dy * sign;
        const vecLengthSq = aspectRatio * aspectRatio + 1;
        const scale = dotProduct / vecLengthSq;

        dx = scale * aspectRatio;
        dy = scale * sign;
      }
    }

    let newBoxMinX = oldBox.minX;
    let newBoxMinY = oldBox.minY;
    let newBoxMaxX = oldBox.maxX;
    let newBoxMaxY = oldBox.maxY;

    switch (handlePosition) {
      case 'top-left':
        newBoxMinX = oldBox.minX + dx;
        newBoxMinY = oldBox.minY + dy;
        break;
      case 'top-middle':
        newBoxMinY = oldBox.minY + dy;
        break;
      case 'top-right':
        newBoxMaxX = oldBox.maxX + dx;
        newBoxMinY = oldBox.minY + dy;
        break;
      case 'right-middle':
        newBoxMaxX = oldBox.maxX + dx;
        break;
      case 'bottom-right':
        newBoxMaxX = oldBox.maxX + dx;
        newBoxMaxY = oldBox.maxY + dy;
        break;
      case 'bottom-middle':
        newBoxMaxY = oldBox.maxY + dy;
        break;
      case 'bottom-left':
        newBoxMinX = oldBox.minX + dx;
        newBoxMaxY = oldBox.maxY + dy;
        break;
      case 'left-middle':
        newBoxMinX = oldBox.minX + dx;
        break;
    }

    const minSize = 10;

    // Apply constraints to prevent inversion (width/height < 0)
    // Ensure the new coordinates don't cross over the original opposite side.
    if (handlePosition.includes('left')) {
      // newBoxMinX was moved; newBoxMaxX is effectively oldBox.maxX (or the current value of the right edge) for this comparison
      if (newBoxMaxX - newBoxMinX < minSize) {
        newBoxMinX = newBoxMaxX - minSize;
      }
    }
    if (handlePosition.includes('right')) {
      // newBoxMaxX was moved; newBoxMinX is effectively oldBox.minX for this comparison
      if (newBoxMaxX - oldBox.minX < minSize) {
        newBoxMaxX = oldBox.minX + minSize;
      }
    }
    if (handlePosition.includes('top')) {
      // newBoxMinY was moved; newBoxMaxY is effectively oldBox.maxY (or the current value of the bottom edge) for this comparison
      if (newBoxMaxY - newBoxMinY < minSize) {
        newBoxMinY = newBoxMaxY - minSize;
      }
    }
    if (handlePosition.includes('bottom')) {
      // newBoxMaxY was moved; newBoxMinY is effectively oldBox.minY for this comparison
      if (newBoxMaxY - oldBox.minY < minSize) {
        newBoxMaxY = oldBox.minY + minSize;
      }
    }

    const newWidth = newBoxMaxX - newBoxMinX;
    const newHeight = newBoxMaxY - newBoxMinY;

    shape.points.forEach((p) => {
      let newX = p.x;
      let newY = p.y;

      if (oldWidth === 0) {
        // If the original width was zero, all points were on a vertical line.
        // Their new X-coordinate will be the left edge of the new bounding box.
        newX = newBoxMinX;
      } else {
        // If original width was non-zero, scale normally.
        const normX = (p.x - oldBox.minX) / oldWidth;
        newX = newBoxMinX + normX * newWidth;
      }

      if (oldHeight === 0) {
        // If the original height was zero, all points were on a horizontal line.
        // Their new Y-coordinate will be the top edge of the new bounding box.
        newY = newBoxMinY;
      } else {
        // If original height was non-zero, scale normally.
        const normY = (p.y - oldBox.minY) / oldHeight;
        newY = newBoxMinY + normY * newHeight;
      }

      p.x = newX;
      p.y = newY;
    });

    const { minX, minY, maxX, maxY } = shape.boundingBox;
    const midX = minX + (maxX - minX) / 2;
    const midY = minY + (maxY - minY) / 2;
    const newBoxProps = { minX, minY, maxX, maxY, midX, midY };

    // Ensure the specific marker that initiated the resize reflects the
    // new bounding box dimensions immediately. autorun will also update all markers.
    const activeHandleDef = handleDefinitions.find((def) => def.id === handlePosition);
    if (activeHandleDef) {
      const handle = this.handles[activeHandleDef.index];
      if (handle) {
        handle.x = activeHandleDef.getX(newBoxProps, padding);
        handle.y = activeHandleDef.getY(newBoxProps, padding);
      }
    }
  }

  resize(newDimensions: { x?: number; y?: number }): void {
    const shape = this.shape;
    if (!shape || !shape.boundingBox) {
      return;
    }

    const currentWidth = shape.width;
    const currentHeight = shape.height;

    let dx = 0;
    let dy = 0;
    let needsResize = false;

    if (newDimensions.x !== undefined && newDimensions.x !== currentWidth) {
      dx = newDimensions.x - currentWidth;
      needsResize = true;
    }

    if (newDimensions.y !== undefined && newDimensions.y !== currentHeight) {
      dy = newDimensions.y - currentHeight;
      needsResize = true;
    }

    if (!needsResize) {
      return;
    }

    this.resizeShape(dx, dy, 'bottom-right', false);
  }

  attach(shape: Shape): void {
    this.shape = shape;

    this.disposer = autorun(() => {
      if (!shape.boundingBox) return;

      const { minX, minY, maxX, maxY } = shape.boundingBox;
      const midX = minX + (maxX - minX) / 2;
      const midY = minY + (maxY - minY) / 2;
      const boxProps = { minX, minY, maxX, maxY, midX, midY };

      if (this.handles.length === 0) {
        // Create handles
        this.handles = handleDefinitions.map((def) => {
          return new Marker({
            id: def.index,
            x: def.getX(boxProps, padding),
            y: def.getY(boxProps, padding),
            moveRestriction: def.moveRestriction,
            onMarkerMoved: (dx, dy, event) => this.resizeShape(dx, dy, def.id, event.shiftKey),
            isDerivedPosition: true
          });
        });
      } else {
        // Update existing handles
        handleDefinitions.forEach((def) => {
          const handle = this.handles[def.index];
          if (handle) {
            handle.x = def.getX(boxProps, padding);
            handle.y = def.getY(boxProps, padding);
          }
        });
      }
    });
  }

  detach(): void {
    this.disposer?.();
    this.disposer = null;
    this.shape = null;
    this.handles = [];
  }
}

import { computed, makeObservable, observable, type IObservableArray } from 'mobx';
import type { ShapeStore } from '../lib/ShapeStore';
import { BuildingPlugin } from './BuildingPlugin';
import { DraggingPlugin } from './DraggingPlugin';
import { EditablePlugin } from './EditablePlugin';
import { getDefaultMetadata, type ElementMetadata } from './ElementMetadata';
import { Marker } from './Marker';
import { ResizePlugin } from './ResizePlugin';
import { RotatePlugin } from './RotatePlugin';
import { SelectionPlugin } from './SelectionPlugin';
import type { ShapeType } from './ShapeType';
import type { TokamakElement } from './TokamakElement';

export interface ShapeOptions {
  shapeType: ShapeType;
  element: TokamakElement;
  draggable: boolean;
  selectable: boolean;
  closedShape: boolean;
  editable: boolean;
  resizeable: boolean;
  rotatable: boolean;
}

export type SerializedShape = {
  element: TokamakElement;
  points: { x: number; y: number; isCurveControl?: boolean }[];
  metadata: ElementMetadata<TokamakElement>;
};

export class Shape {
  readonly id: string;
  readonly shapeType: ShapeType;
  readonly element: TokamakElement;
  readonly draggable: boolean;
  readonly selectable: boolean;
  readonly closedShape: boolean;
  readonly editable: boolean;
  readonly resizeable: boolean;
  readonly rotatable: boolean;

  private selectionPlugin: SelectionPlugin | null = null;
  private draggingPlugin: DraggingPlugin | null = null;
  private buildingPlugin: BuildingPlugin;
  private editablePlugin: EditablePlugin | null = null;
  private resizePlugin: ResizePlugin | null = null;
  private rotatePlugin: RotatePlugin | null = null;
  private shapeStore: ShapeStore;

  metadata: ElementMetadata<typeof this.element> | null;

  node: SVGPathElement | null = null;
  points: IObservableArray<Marker> = [] as any;

  get resizeHandles() {
    return this.resizePlugin?.handles;
  }

  get rotateHandle() {
    return this.rotatePlugin?.handle;
  }

  isSelected: boolean = true;
  isBuilding: boolean = true;
  isDragging: boolean = false;
  hasValidationError = false;

  disableSelection: boolean = false;

  // this is an ephemeral angle, it is not saved to the shape, it is only used for the inspector and gets reset to 0 when inspector is closed.
  rotationAngleRad: number = 0;
  get rotationAngleDegrees() {
    return this.rotationAngleRad * (180 / Math.PI);
  }

  serialize(): SerializedShape {
    return {
      element: this.element,
      points: this.points.map((p) => ({ x: p.x, y: -p.y, isCurveControl: p.isCurveControl })),
      metadata: JSON.parse(JSON.stringify(this.metadata))
    };
  }

  constructor(id: string, opts: ShapeOptions, shapeStore: ShapeStore) {
    this.id = id;
    this.shapeStore = shapeStore;
    this.shapeType = opts.shapeType;
    this.selectable = opts.selectable;
    this.draggable = opts.draggable;
    this.closedShape = opts.closedShape;
    this.element = opts.element;
    this.editable = opts.editable ?? false;
    this.resizeable = opts.resizeable ?? false;
    this.rotatable = opts.rotatable ?? false;

    this.metadata = getDefaultMetadata(this.element);

    if (this.selectable) {
      this.selectionPlugin = new SelectionPlugin(this.shapeStore);
    }
    if (this.draggable) {
      this.draggingPlugin = new DraggingPlugin();
    }
    if (this.editable) {
      this.editablePlugin = new EditablePlugin();
    }
    if (this.resizeable) {
      this.resizePlugin = new ResizePlugin();
    }
    if (this.rotatable) {
      this.rotatePlugin = new RotatePlugin();
    }

    this.buildingPlugin = new BuildingPlugin();

    makeObservable(this, {
      node: observable.ref,
      path: computed,
      points: observable.shallow,
      isSelected: observable,
      isBuilding: observable,
      isDragging: observable,
      disableSelection: observable,
      rotationAngleRad: observable,
      hasValidationError: observable,
      boundingBox: computed,
      resizeHandles: computed,
      width: computed,
      height: computed,
      center: computed,
      metadata: observable,
      firstAngle: computed
    });
  }

  setNode = (node: SVGPathElement | null) => {
    this.detach();
    this.node = node;
    this.attach();
    if (this.points.length === 0) {
      this.buildingPlugin.start();
    } else {
      this.stopBuilding();
    }
  };

  get path() {
    if (!this.points.length) return '';
    let path = '';

    switch (this.shapeType) {
      case 'point':
        const radius = 10;
        path += `M ${this.points[0]!.x + radius} ${this.points[0]!.y} `;
        path += `a ${radius},${radius} 0 1,0 ${radius * -2},0 `;
        path += `a ${radius},${radius} 0 1,0 ${radius * 2},0 `;
        break;
      case 'vector':
        path += `M ${this.points[0]!.x} ${this.points[0]!.y} `;

        if (this.points.length === 2) {
          path += `L ${this.points[1]!.x} ${this.points[1]!.y} `;
          // draw an arrowhead
          const P0 = this.points[0]!;
          const P1 = this.points[1]!;
          const dx = P1.x - P0.x;
          const dy = P1.y - P0.y;
          const angle = Math.atan2(dy, dx);
          const arrowheadLength = 10;
          const wingAngle = Math.PI / 6;

          const arrowheadX1 = P1.x - arrowheadLength * Math.cos(angle - wingAngle);
          const arrowheadY1 = P1.y - arrowheadLength * Math.sin(angle - wingAngle);

          const arrowheadX2 = P1.x - arrowheadLength * Math.cos(angle + wingAngle);
          const arrowheadY2 = P1.y - arrowheadLength * Math.sin(angle + wingAngle);

          path += ` M ${arrowheadX1} ${arrowheadY1} L ${P1.x} ${P1.y} L ${arrowheadX2} ${arrowheadY2}`;
        }
        break;
      case 'polygon':
        path += generateSVGPath(this.points);
        break;
      default:
        path += `M ${this.points[0]!.x} ${this.points[0]!.y} `;
        for (let i = 1; i < this.points.length; i++) {
          const p = this.points[i]!;
          path += `L ${p.x} ${p.y} `;
        }
        break;
    }

    if (this.buildingPlugin.ephemeralPoint) {
      path += `L ${this.buildingPlugin.ephemeralPoint.x} ${this.buildingPlugin.ephemeralPoint.y} `;
    }
    if (!this.isBuilding && this.closedShape) path += ' Z';

    return path;
  }

  get rotationOrigin() {
    return this.rotatePlugin?.rotationOrigin;
  }

  get boundingBox() {
    if (!this.points.length) return null;
    const minX = Math.min(...this.points.map((p) => p.x));
    const minY = Math.min(...this.points.map((p) => p.y));
    const maxX = Math.max(...this.points.map((p) => p.x));
    const maxY = Math.max(...this.points.map((p) => p.y));
    return { minX, minY, maxX, maxY };
  }

  get width() {
    if (!this.boundingBox) return 0;
    return this.boundingBox.maxX - this.boundingBox.minX;
  }

  set width(width: number) {
    if (!this.boundingBox) return;
    this.resizePlugin?.resize({ x: width });
  }

  get height() {
    if (!this.boundingBox) return 0;
    return this.boundingBox.maxY - this.boundingBox.minY;
  }

  set height(height: number) {
    if (!this.boundingBox) return;
    this.resizePlugin?.resize({ y: height });
  }

  get center() {
    if (!this.boundingBox) return null;
    const { minX, minY, maxX, maxY } = this.boundingBox;
    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  }

  set center(center: { x: number; y: number } | null) {
    if (!this.boundingBox || !center) return;
    const { minX, minY, maxX, maxY } = this.boundingBox;
    const dx = center.x - (minX + maxX) / 2;
    const dy = center.y - (minY + maxY) / 2;
    this.moveBy(dx, dy);
  }

  // this is only for parallelograms, the smaller angle that the first 3 points make in degrees.
  get firstAngle(): number {
    if (this.shapeType !== 'parallelogram' || this.points.length < 3) {
      return 0;
    }
    const p0 = this.points[0]!;
    const p1 = this.points[1]!;
    const p2 = this.points[2]!;

    const v1 = { x: p0.x - p1.x, y: p0.y - p1.y };
    const v2 = { x: p2.x - p1.x, y: p2.y - p1.y };

    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 === 0 || mag2 === 0) {
      return 0;
    }

    const cosTheta = dotProduct / (mag1 * mag2);
    // Clamp cosTheta to the range [-1, 1] to avoid Math.acos domain errors
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosTheta)));

    return angleRad * (180 / Math.PI);
  }

  // this is only for parallelograms, the smaller angle that the first 3 points make,
  // setting this changes the point coordinates to change the angle.
  set firstAngle(angle: number) {
    if (this.shapeType !== 'parallelogram' || this.points.length < 4) {
      return;
    }
    // we need to make sure the angle is between 0 and 180 degrees
    angle = Math.max(0, Math.min(180, angle));

    const angleRad = angle * (Math.PI / 180);

    const p0 = this.points[0]!;
    const p1 = this.points[1]!;
    const p2 = this.points[2]!;
    const p3 = this.points[3]!;

    const vRef = { x: p0.x - p1.x, y: p0.y - p1.y };
    const vRot = { x: p2.x - p1.x, y: p2.y - p1.y };

    // Preserve the length of the p1-p2 side
    const lenRot = Math.sqrt(vRot.x * vRot.x + vRot.y * vRot.y);
    if (lenRot === 0) return;

    // Determine orientation to preserve it
    const crossProduct = vRef.x * vRot.y - vRef.y * vRot.x;
    const sign = Math.sign(crossProduct) || 1;

    const angleRef = Math.atan2(vRef.y, vRef.x);
    const newAngleRot = angleRef + sign * angleRad;

    const newVRot = {
      x: lenRot * Math.cos(newAngleRot),
      y: lenRot * Math.sin(newAngleRot)
    };

    // Update p2
    p2.x = p1.x + newVRot.x;
    p2.y = p1.y + newVRot.y;

    // Update p3 to maintain the parallelogram shape (p3 = p0 + p2 - p1)
    p3.x = p0.x + p2.x - p1.x;
    p3.y = p0.y + p2.y - p1.y;
  }

  rotate(newAngle: number) {
    this.rotatePlugin?.rotateTo(newAngle);
  }

  rotateDegrees(newAngle: number) {
    this.rotate(newAngle * (Math.PI / 180));
  }

  private attach() {
    this.detach();
    // order matters because we want some plugins to receive events before others
    if (this.node) {
      this.buildingPlugin.attach(this);
      this.editablePlugin?.attach(this);
      this.draggingPlugin?.attach(this);
      this.selectionPlugin?.attach(this);
      this.resizePlugin?.attach(this);
      this.rotatePlugin?.attach(this);
    }
  }

  private detach() {
    this.selectionPlugin?.detach();
    this.draggingPlugin?.detach();
    this.buildingPlugin.detach();
    this.editablePlugin?.detach();
    this.resizePlugin?.detach();
    this.rotatePlugin?.detach();
  }

  select(): void {
    if (!this.selectable) return;
    this.isSelected = true;
  }

  deselect(): void {
    this.isSelected = false;
  }

  toggleSelection(): void {
    if (!this.selectable) return;
    this.isSelected = !this.isSelected;
  }

  removePoint = (id: number) => {
    if (this.isBuilding) return;
    if (this.shapeType !== 'polygon') return;

    const point = this.points.find((p) => p.id === id);
    if (!point) return;
    if (!point.isCurveControl && this.points.filter((p) => !p.isCurveControl).length === 3) {
      return;
    }

    const index = this.points.indexOf(point);
    const prevPoint = this.points[index > 0 ? index - 1 : this.points.length - 1]!;
    const nextPoint = this.points[index < this.points.length - 1 ? index + 1 : 0]!;

    if (prevPoint.isCurveControl) {
      this.points.remove(prevPoint);
    }
    if (nextPoint.isCurveControl) {
      this.points.remove(nextPoint);
    }
    this.points.remove(point);
  };

  /** Coordinates are local */
  addPoint = (
    { x, y }: { x: number; y: number },
    position?: number,
    isCurveControl?: boolean,
    deserialize?: boolean
  ) => {
    // correcting isCurveControl
    if (!deserialize && isCurveControl) {
      //curve control requires 2 anchor points and position defined
      //we don't add control points during building phase
      //adding point is always called with position >0
      if (
        this.points.filter((p) => !p.isCurveControl).length < 2 ||
        position === undefined ||
        position === 0
      ) {
        isCurveControl = false;
      } else {
        // next test - control point should be between 2 anchor points
        const prevPoint = this.points[position === 0 ? this.points.length - 1 : position - 1]!;
        const nextPoint = this.points[position >= this.points.length ? 0 : position]!;
        if (prevPoint.isCurveControl || nextPoint.isCurveControl) {
          isCurveControl = false;
        }
      }
    }

    let onFirstPointClick: undefined | (() => void) = undefined;

    if (!deserialize && this.points.length === 0 && this.closedShape) {
      onFirstPointClick = () => {
        this.stopBuilding();
      };
    }

    const marker = new Marker({
      id: this.points.length,
      x,
      y,
      onClick: onFirstPointClick,
      onRemove: this.removePoint,
      isCurveControl,
      isDerivedPosition: isCurveControl,
      onMarkerMoved: !isCurveControl
        ? undefined
        : (dx, dy, event) => {
            if (!event.shiftKey) {
              marker.x += dx;
              marker.y += dy;
              return;
            }
            const ind = this.points.indexOf(marker);
            const prevPoint = this.points[ind > 0 ? ind - 1 : this.points.length - 1]!;
            const nextPoint = this.points[ind < this.points.length - 1 ? ind + 1 : 0]!;

            const mouseX = marker.x + dx;
            const mouseY = marker.y + dy;

            const midX = (prevPoint.x + nextPoint.x) / 2;
            const midY = (prevPoint.y + nextPoint.y) / 2;

            const perpDx = prevPoint.y - nextPoint.y;
            const perpDy = nextPoint.x - prevPoint.x;

            const dSq = perpDx * perpDx + perpDy * perpDy;

            let newX: number;
            let newY: number;

            if (dSq > 1e-9) {
              const vx = mouseX - midX;
              const vy = mouseY - midY;
              const dot = vx * perpDx + vy * perpDy;
              const t = dot / dSq;
              newX = midX + t * perpDx;
              newY = midY + t * perpDy;
            } else {
              newX = mouseX;
              newY = mouseY;
            }

            marker.x = newX;
            marker.y = newY;
          }
    });
    if (position === undefined) {
      this.points.push(marker);
    } else {
      this.points.splice(position, 0, marker);
    }
    this.points.forEach((p, i) => {
      p.id = i;
    });
  };

  beforeStopBuilding() {
    if (this.shapeType !== 'parallelogram') return;
    // linking the points to enforce the parallelogram shape
    const linkPoints = (mainPoint: Marker, linkedPoint: Marker) => {
      mainPoint.onMarkerMoved = (dx, dy) => {
        linkedPoint.x += dx;
        linkedPoint.y += dy;
      };
    };

    linkPoints(this.points[0]!, this.points[1]!);
    linkPoints(this.points[1]!, this.points[0]!);
    linkPoints(this.points[2]!, this.points[3]!);
    linkPoints(this.points[3]!, this.points[2]!);
  }

  stopBuilding() {
    this.buildingPlugin.stop();
  }

  moveBy(dx: number, dy: number) {
    this.points.forEach((p) => {
      p.x += dx;
      p.y += dy;
    });
  }
}

function generateSVGPath(points: Marker[]): string {
  if (!points || points.length === 0) return '';

  let pathData = `M ${points[0]!.x.toFixed(3)},${points[0]!.y.toFixed(3)}`;
  if (points.length === 1) return pathData;

  let penPt = { x: points[0]!.x, y: points[0]!.y };

  for (let i = 1; i < points.length; ) {
    const currentProcessingPoint = points[i]!;

    if (currentProcessingPoint.isCurveControl) {
      const P0 = penPt;
      const M = currentProcessingPoint; // M is points[i], the point the curve must pass through.

      let P2: { x: number; y: number };
      let advanceLoopBy: number;

      if (i + 1 < points.length) {
        // M is points[i], P2 is points[i+1]
        P2 = points[i + 1]!;
        advanceLoopBy = 2; // Consumed points[i] (as M) and points[i+1] (as P2)
      } else {
        // M (points[i]) is the last point in the array for this iteration pass.
        // The curve segment should use points[0] as P2 to form a continuous path (e.g. for closure).
        P2 = points[0]!;
        advanceLoopBy = 1; // Consumed points[i]. Loop will naturally terminate as i reaches points.length.
      }

      // Calculate the actual Bezier control point (P1_calc) for the segment P0-P2
      // such that the curve passes through M at t=0.5.
      // P1_calc = 2*M - 0.5*P0 - 0.5*P2
      const P1_calc_x = 2 * M.x - 0.5 * P0.x - 0.5 * P2.x;
      const P1_calc_y = 2 * M.y - 0.5 * P0.y - 0.5 * P2.y;

      pathData += ` Q ${P1_calc_x.toFixed(3)},${P1_calc_y.toFixed(3)} ${P2.x.toFixed(3)},${P2.y.toFixed(3)}`;
      penPt = P2;
      i += advanceLoopBy;
    } else {
      // currentProcessingPoint is a simple anchor. Draw a straight line from penPt to it.
      pathData += ` L ${currentProcessingPoint.x.toFixed(3)},${currentProcessingPoint.y.toFixed(3)}`;
      penPt = currentProcessingPoint;
      i += 1; // Consumed points[i]
    }
  }
  return pathData;
}

import { autorun, makeObservable, observable, type IReactionDisposer } from 'mobx';
import { Shape } from '../shapes/Shape';
import type { ShapeStore } from './ShapeStore';

export enum ValidationIssueType {
  ParallelogramOverlap = 'ParallelogramOverlap',
  ShapeInsideLimiter = 'ShapeInsideLimiter',
  PolygonSelfIntersection = 'PolygonSelfIntersection'
}

export type ValidationIssue = {
  type: ValidationIssueType;
  shapes: Shape[];
  message: string;
};

type Vector = { x: number; y: number };
type Projection = { min: number; max: number };

export class ValidationService {
  private shapeStore: ShapeStore;
  private disposer: IReactionDisposer;
  validationIssues: ValidationIssue[] = [];

  constructor(shapeStore: ShapeStore) {
    this.shapeStore = shapeStore;
    makeObservable(this, {
      validationIssues: observable
    });

    this.disposer = autorun(() => {
      this.runValidation();
    });
  }

  dispose() {
    this.disposer();
  }

  private runValidation() {
    const shapes = this.shapeStore.shapes;

    if (this.shapeStore.interacting || this.shapeStore.unfinishedShape) {
      return;
    }

    shapes.forEach((shape) => (shape.hasValidationError = false));
    const newIssues: ValidationIssue[] = [];

    // Rule 1: Parallelograms can't overlap.
    const parallelograms = shapes.filter((s) => s.shapeType === 'parallelogram');
    for (let i = 0; i < parallelograms.length; i++) {
      for (let j = i + 1; j < parallelograms.length; j++) {
        const shape1 = parallelograms[i]!;
        const shape2 = parallelograms[j]!;
        const points1 = shape1.points.map((p) => ({ x: p.x, y: p.y }));
        const points2 = shape2.points.map((p) => ({ x: p.x, y: p.y }));

        if (this.checkPolygonCollision(points1, points2)) {
          newIssues.push({
            type: ValidationIssueType.ParallelogramOverlap,
            shapes: [shape1, shape2],
            message: 'Parallelograms cannot overlap.'
          });
        }
      }
    }

    // Rule 2: Nothing can be inside of TokamakElement "limiter".
    const limiters = shapes.filter((s) => s.element === 'limiter');
    if (limiters.length > 0) {
      const otherShapes = shapes.filter((s) => s.element !== 'limiter');
      for (const limiter of limiters) {
        for (const otherShape of otherShapes) {
          if (this.isShapeInside(otherShape, limiter)) {
            newIssues.push({
              type: ValidationIssueType.ShapeInsideLimiter,
              shapes: [otherShape, limiter],
              message: 'Shapes cannot be inside a limiter.'
            });
          }
        }
      }
    }

    // Rule 3: Polygon's shape can't intersect itself.
    const polygons = shapes.filter((s) => s.shapeType === 'polygon');
    for (const polygon of polygons) {
      if (this.isPolygonSelfIntersecting(polygon)) {
        newIssues.push({
          type: ValidationIssueType.PolygonSelfIntersection,
          shapes: [polygon],
          message: 'Polygon should not intersect itself.'
        });
      }
    }

    // Update validation flags on shapes
    newIssues.forEach((issue) => {
      issue.shapes.forEach((shape) => {
        shape.hasValidationError = true;
      });
    });

    this.validationIssues = newIssues;
  }

  private isPolygonSelfIntersecting(shape: Shape): boolean {
    const points = shape.points.map((p) => ({ x: p.x, y: p.y }));
    const n = points.length;
    if (n < 4) {
      return false;
    }

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const p1 = points[i]!;
        const q1 = points[(i + 1) % n]!;
        const p2 = points[j]!;
        const q2 = points[(j + 1) % n]!;

        if (j === i + 1 || (i === 0 && j === n - 1)) {
          continue;
        }

        if (this.doSegmentsIntersect(p1, q1, p2, q2)) {
          return true;
        }
      }
    }

    return false;
  }

  private doSegmentsIntersect(p1: Vector, q1: Vector, p2: Vector, q2: Vector): boolean {
    const o1 = this.orientation(p1, q1, p2);
    const o2 = this.orientation(p1, q1, q2);
    const o3 = this.orientation(p2, q2, p1);
    const o4 = this.orientation(p2, q2, q1);

    if (o1 !== o2 && o3 !== o4) {
      return true;
    }

    if (o1 === 0 && this.onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && this.onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && this.onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && this.onSegment(p2, q1, q2)) return true;

    return false;
  }

  private orientation(p: Vector, q: Vector, r: Vector): number {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0; // Collinear
    return val > 0 ? 1 : 2; // Clockwise or Counter-clockwise
  }

  private onSegment(p: Vector, q: Vector, r: Vector): boolean {
    return (
      q.x <= Math.max(p.x, r.x) &&
      q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) &&
      q.y >= Math.min(p.y, r.y)
    );
  }

  private isShapeInside(innerShape: Shape, outerShape: Shape): boolean {
    const innerPoints = innerShape.points.map((p) => ({ x: p.x, y: p.y }));
    const outerPoints = outerShape.points.map((p) => ({ x: p.x, y: p.y }));

    if (outerPoints.length < 3) {
      return false; // Not a valid polygon to contain anything.
    }

    return innerPoints.every((point) => this.isPointInPolygon(point, outerPoints));
  }

  private isPointInPolygon(point: Vector, polygon: Vector[]): boolean {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i]!.x,
        yi = polygon[i]!.y;
      const xj = polygon[j]!.x,
        yj = polygon[j]!.y;

      const intersect =
        yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

      if (intersect) {
        isInside = !isInside;
      }
    }
    return isInside;
  }

  private checkPolygonCollision(polygon1: Vector[], polygon2: Vector[]): boolean {
    const axes = this.getAxes(polygon1).concat(this.getAxes(polygon2));

    for (const axis of axes) {
      const p1 = this.project(polygon1, axis);
      const p2 = this.project(polygon2, axis);

      if (!this.overlap(p1, p2)) {
        return false; // Found a separating axis
      }
    }

    return true; // No separating axis found
  }

  private getAxes(points: Vector[]): Vector[] {
    const axes: Vector[] = [];
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i]!;
      const p2 = points[i + 1 === points.length ? 0 : i + 1]!;
      const edge = { x: p1.x - p2.x, y: p1.y - p2.y };
      const normal = { x: -edge.y, y: edge.x };
      axes.push(this.normalize(normal));
    }
    return axes;
  }

  private project(points: Vector[], axis: Vector): Projection {
    let min = this.dotProduct(points[0]!, axis);
    let max = min;

    for (let i = 1; i < points.length; i++) {
      const p = this.dotProduct(points[i]!, axis);
      if (p < min) {
        min = p;
      } else if (p > max) {
        max = p;
      }
    }
    return { min, max };
  }

  private overlap(p1: Projection, p2: Projection): boolean {
    return p1.max > p2.min && p2.max > p1.min;
  }

  private dotProduct(v1: Vector, v2: Vector): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  private normalize(v: Vector): Vector {
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: v.x / length, y: v.y / length };
  }
}

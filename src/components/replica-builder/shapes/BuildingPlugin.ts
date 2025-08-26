import { makeObservable, observable } from 'mobx';
import { Marker } from './Marker';
import type { Shape } from './Shape';
import type { ShapePlugin } from './ShapePlugin';

export class BuildingPlugin implements ShapePlugin {
  private shape: Shape | null = null;
  private ownerSVGElement: SVGSVGElement | null = null;
  private transformedGElement: SVGGElement | null = null;

  ephemeralPoint: Marker | null = null;

  constructor() {
    makeObservable(this, {
      ephemeralPoint: observable.ref
    });
  }

  attach(shape: Shape): void {
    this.shape = shape;
    this.ownerSVGElement = shape.node?.ownerSVGElement ?? null;
    this.transformedGElement = shape.node?.parentNode?.parentNode as SVGGElement | null;
  }

  detach(): void {
    console.log('BUILDABLE: detach');
    this.ownerSVGElement?.removeEventListener('click', this.handleViewportClick);
    document.removeEventListener('mousemove', this.handleMouseMove);

    this.shape = null;
    this.ownerSVGElement = null;
    this.transformedGElement = null;
  }

  start(): void {
    if (!this.shape || !this.ownerSVGElement) return;
    this.shape.isBuilding = true;
    console.log('BUILDABLE: start');
    this.ownerSVGElement.addEventListener('click', this.handleViewportClick);
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  stop(): void {
    if (!this.shape) return;
    this.shape.isBuilding = false;
    this.ephemeralPoint = null;

    this.detach();
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

  private handleViewportClick = (event: MouseEvent): void => {
    console.log('BUILDABLE: viewport click');
    if (!this.shape?.isBuilding || !this.ownerSVGElement || !this.ephemeralPoint) {
      return;
    }

    const newPoint = { x: this.ephemeralPoint.x, y: this.ephemeralPoint.y }; //this.getSVGCoordinates(event);
    if (!newPoint) return;
    switch (this.shape.shapeType) {
      case 'polygon':
        this.shape.addPoint(newPoint);
        break;

      case 'parallelogram':
        this.shape.addPoint(newPoint);

        if (this.shape.points.length === 3) {
          //calculate the fourth point
          const p1 = this.shape.points[0]!;
          const p2 = this.shape.points[1]!;
          const p3 = this.shape.points[2]!;
          const fourthPoint = {
            x: p3.x - (p2.x - p1.x),
            y: p3.y - (p2.y - p1.y)
          };
          this.shape.addPoint(fourthPoint);
          this.shape.beforeStopBuilding();
          this.stop();
        }
        break;

      case 'point':
        this.shape.addPoint(newPoint);
        this.stop();
        break;

      case 'vector':
        this.shape.addPoint(newPoint);
        if (this.shape.points.length === 2) {
          this.stop();
        }
        break;
    }
  };

  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.shape?.isBuilding || !this.ownerSVGElement) {
      return;
    }
    const coords = this.getSVGCoordinates(event);
    if (!coords) {
      return;
    }
    if (!this.ephemeralPoint) {
      this.ephemeralPoint = new Marker({ ...coords, id: -100000 });
    } else {
      this.ephemeralPoint.x = event.altKey ? this.ephemeralPoint.x : coords.x;
      this.ephemeralPoint.y = event.metaKey ? this.ephemeralPoint.y : coords.y;
    }
  };
}

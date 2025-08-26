import { screenToSVGCoordinates } from '../lib/screenToSVGCoordinates';
import type { Shape } from './Shape';
import type { ShapePlugin } from './ShapePlugin';

export class EditablePlugin implements ShapePlugin {
  private shape: Shape | null = null;
  private maxClickToProjectionDistance: number = 20; // Default: 10 SVG units

  attach(shape: Shape): void {
    console.log('EDITABLE: attach');
    this.shape = shape;
    if (this.shape.node && this.shape.editable) {
      this.shape.node.addEventListener('click', this.handleAltClickOnStroke);
    }
  }

  detach(): void {
    console.log('EDITABLE: detach');
    if (this.shape?.node && this.shape.editable) {
      this.shape.node.removeEventListener('click', this.handleAltClickOnStroke);
    }
    this.shape = null;
  }

  private handleAltClickOnStroke = (event: MouseEvent): void => {
    console.log('EDITABLE: click');
    if (
      !event.altKey ||
      !this.shape?.isSelected ||
      !this.shape.node?.ownerSVGElement ||
      this.shape.isBuilding
    ) {
      return;
    }

    event.stopImmediatePropagation();

    const svgRoot = this.shape.node.ownerSVGElement;
    let clickCoordsInSvgRoot = screenToSVGCoordinates(event.clientX, event.clientY, svgRoot);

    if (!clickCoordsInSvgRoot) return;

    const shapeCTM = (this.shape.node as SVGGraphicsElement).getCTM();
    if (!shapeCTM) {
      console.error('Shape CTM is not available for coordinate transformation.');
      return;
    }
    const clickCoords = clickCoordsInSvgRoot.matrixTransform(shapeCTM.inverse());

    let bestSegmentIndex = -1;
    let minDistanceSq = Infinity;
    let closestPointOnSegment: { x: number; y: number } | null = null;

    for (let i = 0; i < this.shape.points.length; i++) {
      const p1 = this.shape.points[i]!;
      const p2 =
        i === this.shape.points.length - 1 && this.shape.closedShape && this.shape.points.length > 1
          ? this.shape.points[0]!
          : i < this.shape.points.length - 1
            ? this.shape.points[i + 1]!
            : null;

      if (!p2) continue;

      const segmentVec = { x: p2.x - p1.x, y: p2.y - p1.y };
      const clickVec = { x: clickCoords.x - p1.x, y: clickCoords.y - p1.y };

      const segmentLengthSq = segmentVec.x * segmentVec.x + segmentVec.y * segmentVec.y;

      if (segmentLengthSq === 0) {
        const distSq = clickVec.x * clickVec.x + clickVec.y * clickVec.y;
        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          bestSegmentIndex = i;
          closestPointOnSegment = { x: p1.x, y: p1.y };
        }
        continue;
      }

      let t = (clickVec.x * segmentVec.x + clickVec.y * segmentVec.y) / segmentLengthSq;
      t = Math.max(0, Math.min(1, t));

      const projection = {
        x: p1.x + t * segmentVec.x,
        y: p1.y + t * segmentVec.y
      };

      const distToProjectionSq =
        (clickCoords.x - projection.x) * (clickCoords.x - projection.x) +
        (clickCoords.y - projection.y) * (clickCoords.y - projection.y);

      if (distToProjectionSq < minDistanceSq) {
        minDistanceSq = distToProjectionSq;
        bestSegmentIndex = i;
        closestPointOnSegment = projection;
      }
    }

    if (bestSegmentIndex !== -1 && closestPointOnSegment) {
      const maxDistSq = this.maxClickToProjectionDistance * this.maxClickToProjectionDistance;

      if (minDistanceSq <= maxDistSq) {
        this.shape.addPoint(closestPointOnSegment, bestSegmentIndex + 1, event.shiftKey);
      }
    }
  };
}

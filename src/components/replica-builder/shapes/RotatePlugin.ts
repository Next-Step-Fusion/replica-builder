import { autorun, makeObservable, observable, reaction } from 'mobx';
import { Marker } from './Marker';
import type { Shape } from './Shape';
import type { ShapePlugin } from './ShapePlugin';

const HANDLE_LENGTH = 100; // Fixed length of the rotation arm

export class RotatePlugin implements ShapePlugin {
  private shape: Shape | null = null;
  private disposers: (() => void)[] = [];
  handle: Marker | null = null;
  handleLength: number = 100;
  rotationOrigin: { x: number; y: number } | null = null;

  constructor() {
    makeObservable(this, {
      handle: observable.ref,
      handleLength: observable,
      rotationOrigin: observable
    });
  }

  private rotatePoints(angleDelta: number): void {
    if (!this.shape || !this.rotationOrigin) return;

    const centerX = this.rotationOrigin.x;
    const centerY = this.rotationOrigin.y;

    this.shape.points.forEach((point) => {
      const x = point.x - centerX;
      const y = point.y - centerY;

      const rotatedX = x * Math.cos(angleDelta) - y * Math.sin(angleDelta);
      const rotatedY = x * Math.sin(angleDelta) + y * Math.cos(angleDelta);

      point.x = rotatedX + centerX;
      point.y = rotatedY + centerY;
      // point.x = Math.round(rotatedX + centerX);
      // point.y = Math.round(rotatedY + centerY);
    });
  }

  private onHandleMove = (dx: number, dy: number, _event?: MouseEvent): void => {
    if (!this.shape || !this.handle || !this.rotationOrigin) return;

    // Calculate the current mouse position in SVG coordinates
    const mouseX = this.handle.x + dx;
    const mouseY = this.handle.y + dy;

    // Calculate the new angle based on the mouse's position relative to the FIXED rotationOrigin
    const deltaXFromOrigin = mouseX - this.rotationOrigin.x;
    const deltaYFromOrigin = mouseY - this.rotationOrigin.y;
    const newAngle = Math.atan2(deltaYFromOrigin, deltaXFromOrigin);

    const oldAngle = this.shape.rotationAngleRad;
    const angleDelta = newAngle - oldAngle;

    // Tolerance for floating point comparison
    if (Math.abs(angleDelta) < 1e-9) {
      return;
    }

    this.rotatePoints(angleDelta);
    this.shape.rotationAngleRad = newAngle;
  };

  public rotateTo(newAngle: number): void {
    if (!this.shape) return;

    const oldAngle = this.shape.rotationAngleRad;
    const angleDelta = newAngle - oldAngle;

    if (Math.abs(angleDelta) < 1e-9) {
      return;
    }

    this.rotatePoints(angleDelta);
    this.shape.rotationAngleRad = newAngle;
  }

  attach(shape: Shape): void {
    this.shape = shape;

    this.disposers.push(
      autorun(() => {
        if (!this.shape || !this.shape.center || !this.shape.isSelected || !this.rotationOrigin) {
          this.handle = null;
          return;
        }

        const anchorX = this.rotationOrigin.x;
        const anchorY = this.rotationOrigin.y;

        const currentAngle = this.shape.rotationAngleRad;

        const handleX = anchorX + this.handleLength * Math.cos(currentAngle);
        const handleY = anchorY + this.handleLength * Math.sin(currentAngle);

        if (!this.handle) {
          this.handle = new Marker({
            id: 0,
            x: handleX,
            y: handleY,
            onMarkerMoved: this.onHandleMove,
            isDerivedPosition: true // This handle's position is controlled by autorun
          });
        } else {
          this.handle.x = handleX;
          this.handle.y = handleY;
        }
      })
    );

    this.disposers.push(
      reaction(
        () => this.shape?.isSelected && !this.shape?.isBuilding,
        (isSelected) => {
          console.log('isSelected', isSelected);
          if (!this.shape) return;
          if (isSelected && this.shape?.center) {
            this.rotationOrigin = this.shape.center;
            this.handleLength = this.shape.width / 2 + 35;
            this.shape.rotationAngleRad = 0;
          } else {
            this.rotationOrigin = null;
            this.shape.rotationAngleRad = 0;
          }
        },
        {
          fireImmediately: true
        }
      )
    );
  }

  detach(): void {
    this.disposers.forEach((disposer) => disposer());
    this.disposers = [];
    this.shape = null;
    this.handle = null;
  }
}

import { makeObservable, observable } from 'mobx';
import { ZOOM_CONFIG } from '../static-elements/constants';
import type { ViewportPlugin } from './ViewportPlugin';

export class ZoomPanPlugin implements ViewportPlugin {
  private svgElement: SVGSVGElement | null = null;
  isPanning = false;
  private lastPosition = { x: 0, y: 0 };
  private onStateChange: (state: { scale: number; translateX: number; translateY: number }) => void;
  scale = 1;
  translateX = 0;
  translateY = 0;

  constructor(
    onStateChange: (state: { scale: number; translateX: number; translateY: number }) => void
  ) {
    this.onStateChange = onStateChange;
    makeObservable(this, {
      scale: observable,
      translateX: observable,
      translateY: observable,
      isPanning: observable
    });
  }

  private constrainTranslateX(translateX: number): number {
    const basePadding = 50;
    const scaledPadding = basePadding * this.scale;
    return Math.min(scaledPadding, translateX);
  }

  attach(svgElement: SVGSVGElement): void {
    this.svgElement = svgElement;
    this.svgElement.addEventListener('wheel', this.handleWheel);
    this.svgElement.addEventListener('mousedown', this.handleMouseDown);
    this.svgElement.addEventListener('mousemove', this.handleMouseMove);
    this.svgElement.addEventListener('mouseup', this.handleMouseUp);
    this.svgElement.addEventListener('mouseleave', this.handleMouseUp);
  }

  detach(): void {
    if (this.svgElement) {
      this.svgElement.removeEventListener('wheel', this.handleWheel);
      this.svgElement.removeEventListener('mousedown', this.handleMouseDown);
      this.svgElement.removeEventListener('mousemove', this.handleMouseMove);
      this.svgElement.removeEventListener('mouseup', this.handleMouseUp);
      this.svgElement.removeEventListener('mouseleave', this.handleMouseUp);
    }
  }

  setZoom = (newScale: number) => {
    if (!this.svgElement) return;
    if (newScale === this.scale) return;
    if (newScale < ZOOM_CONFIG.min || newScale > ZOOM_CONFIG.max) return;

    const rect = this.svgElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newTranslateX = centerX - (centerX - this.translateX) * (newScale / this.scale);
    const newTranslateY = centerY - (centerY - this.translateY) * (newScale / this.scale);

    this.scale = newScale;

    this.translateX = this.constrainTranslateX(newTranslateX);
    this.translateY = newTranslateY;
    this.onStateChange({
      scale: this.scale,
      translateX: this.translateX,
      translateY: this.translateY
    });
  };

  resetPan = () => {
    const rect = this.svgElement!.getBoundingClientRect();
    this.translateX = this.constrainTranslateX(50);
    this.translateY = rect.height - 30;
    this.onStateChange({
      scale: this.scale,
      translateX: this.translateX,
      translateY: this.translateY
    });
  };

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    const scaleAmount = ZOOM_CONFIG.factor;
    const newScale =
      event.deltaY < 0 ? this.scale * (1 + scaleAmount) : this.scale * (1 - scaleAmount);

    if (newScale < ZOOM_CONFIG.min || newScale > ZOOM_CONFIG.max) return;
    if (this.scale === newScale) return;

    const rect = this.svgElement!.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const newTranslateX = mouseX - (mouseX - this.translateX) * (newScale / this.scale);
    const newTranslateY = mouseY - (mouseY - this.translateY) * (newScale / this.scale);

    this.scale = newScale;
    this.translateX = this.constrainTranslateX(newTranslateX);
    this.translateY = newTranslateY;
    this.onStateChange({
      scale: this.scale,
      translateX: this.translateX,
      translateY: this.translateY
    });
  };

  private handleMouseDown = (event: MouseEvent) => {
    // Pan with middle mouse button or spacebar + left mouse
    if (event.button === 1 || (event.button === 0 && event.altKey)) {
      this.isPanning = true;
      this.lastPosition = { x: event.clientX, y: event.clientY };
      if (this.svgElement) {
        this.svgElement.style.cursor = 'grabbing';
      }
    }
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (this.isPanning) {
      const dx = event.clientX - this.lastPosition.x;
      const dy = event.clientY - this.lastPosition.y;

      this.translateX = this.constrainTranslateX(this.translateX + dx);
      this.translateY += dy;

      this.lastPosition = { x: event.clientX, y: event.clientY };

      this.onStateChange({
        scale: this.scale,
        translateX: this.translateX,
        translateY: this.translateY
      });
    }
  };

  private handleMouseUp = () => {
    this.isPanning = false;
    if (this.svgElement) {
      this.svgElement.style.cursor = 'default';
    }
  };
}

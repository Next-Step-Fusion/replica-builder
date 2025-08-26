import { makeObservable, observable } from 'mobx';
import type { ShapeStore } from '../lib/ShapeStore';
import { screenToSVGCoordinates } from '../lib/screenToSVGCoordinates';
import type { ViewportPlugin } from './ViewportPlugin';

export class DragSelectionViewportPlugin implements ViewportPlugin {
  private svgElement: SVGSVGElement | null = null;
  private shapeStore: ShapeStore;
  private selectionRect: SVGRectElement | null = null;
  private selectionGroup: SVGGElement | null = null;
  private transformedGElement: SVGGElement | null = null;

  isDragging = false;
  startPoint: { x: number; y: number } | null = null;
  currentPoint: { x: number; y: number } | null = null;
  shouldPreventClick = false;

  constructor(shapeStore: ShapeStore) {
    this.shapeStore = shapeStore;
    makeObservable(this, {
      isDragging: observable,
      startPoint: observable,
      currentPoint: observable
    });
  }

  attach(svgElement: SVGSVGElement): void {
    this.svgElement = svgElement;
    
    // Find the transformed group element (the one with scale/translate transforms)
    const transformedGroup = svgElement.querySelector('g[transform*="translate"]') as SVGGElement;
    this.transformedGElement = transformedGroup;

    // Create selection overlay group (outside the transformed group to avoid scaling)
    this.selectionGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.selectionGroup.style.pointerEvents = 'none';
    svgElement.appendChild(this.selectionGroup);

    // Create selection rectangle
    this.selectionRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.selectionRect.setAttribute('fill', 'rgba(0, 123, 255, 0.1)');
    this.selectionRect.setAttribute('stroke', '#007bff');
    this.selectionRect.setAttribute('stroke-width', '1');
    this.selectionRect.setAttribute('stroke-dasharray', '4,4');
    this.selectionRect.style.display = 'none';
    this.selectionGroup.appendChild(this.selectionRect);

    svgElement.addEventListener('mousedown', this.handleMouseDown);
    svgElement.addEventListener('click', this.handleClick, { capture: true });
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  detach(): void {
    if (this.svgElement) {
      this.svgElement.removeEventListener('mousedown', this.handleMouseDown);
      this.svgElement.removeEventListener('click', this.handleClick, { capture: true });
      if (this.selectionGroup) {
        this.svgElement.removeChild(this.selectionGroup);
      }
    }
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    this.svgElement = null;
    this.transformedGElement = null;
    this.selectionRect = null;
    this.selectionGroup = null;
  }

  private getSVGCoordinates(event: MouseEvent): { x: number; y: number } | null {
    if (!this.svgElement) return null;
    return screenToSVGCoordinates(event.clientX, event.clientY, this.svgElement);
  }

  private getTransformedCoordinates(event: MouseEvent): { x: number; y: number } | null {
    if (!this.svgElement || !this.transformedGElement) return null;
    
    const pt = this.svgElement.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    
    const ctm = this.transformedGElement.getScreenCTM();
    if (!ctm) return null;
    
    return pt.matrixTransform(ctm.inverse());
  }

  private isClickOnShape(event: MouseEvent): boolean {
    const target = event.target as Element;
    
    if (target.closest('svg') !== this.svgElement) {
      return false;
    }

    if (target.closest('.pointer-events-none')) {
      return false;
    }

    const pathElement = target.closest('path');
    if (pathElement) {
      const pointerEventsAttr = pathElement.getAttribute('pointerEvents');
      const pointerEventsStyle = window.getComputedStyle(pathElement).pointerEvents;
      console.log('Path element:', { pointerEventsAttr, pointerEventsStyle });
      return pointerEventsAttr === 'stroke' || pointerEventsStyle === 'stroke';
    }

    const rectElement = target.closest('rect');
    if (rectElement) {
      const pointerEventsAttr = rectElement.getAttribute('pointerEvents');
      const pointerEventsStyle = window.getComputedStyle(rectElement).pointerEvents;
      console.log('Rect element:', { pointerEventsAttr, pointerEventsStyle });
      return (pointerEventsAttr !== 'none' && pointerEventsAttr !== null) || 
             (pointerEventsStyle !== 'none' && pointerEventsStyle !== 'auto');
    }

    return false;
  }

  private handleClick = (event: MouseEvent): void => {
    if (this.shouldPreventClick) {
      event.stopImmediatePropagation();
      this.shouldPreventClick = false;
    }
  };

  private handleMouseDown = (event: MouseEvent): void => {
    // Don't start drag selection if:
    // 1. Alt key is pressed (reserved for panning)
    // 2. Click is on a shape
    // 3. Not left mouse button
    if (event.altKey || event.button !== 0 || this.isClickOnShape(event)) {
      return;
    }

    const coords = this.getSVGCoordinates(event);
    if (!coords) return;

    this.isDragging = true;
    this.startPoint = coords;
    this.currentPoint = coords;

    // Prevent default to avoid text selection
    event.preventDefault();
  };

  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging || !this.startPoint || !this.selectionRect) return;

    const coords = this.getSVGCoordinates(event);
    if (!coords) return;

    this.currentPoint = coords;

    // Update selection rectangle
    const minX = Math.min(this.startPoint.x, coords.x);
    const minY = Math.min(this.startPoint.y, coords.y);
    const width = Math.abs(coords.x - this.startPoint.x);
    const height = Math.abs(coords.y - this.startPoint.y);

    this.selectionRect.setAttribute('x', minX.toString());
    this.selectionRect.setAttribute('y', minY.toString());
    this.selectionRect.setAttribute('width', width.toString());
    this.selectionRect.setAttribute('height', height.toString());
    this.selectionRect.style.display = 'block';
  };

  private handleMouseUp = (event: MouseEvent): void => {
    if (!this.isDragging || !this.startPoint || !this.currentPoint) return;

    this.isDragging = false;

    // Hide selection rectangle
    if (this.selectionRect) {
      this.selectionRect.style.display = 'none';
    }

    // Only proceed with selection if we actually dragged (not just a click)
    const dragDistance = Math.sqrt(
      Math.pow(this.currentPoint.x - this.startPoint.x, 2) +
      Math.pow(this.currentPoint.y - this.startPoint.y, 2)
    );

    if (dragDistance < 5) {
      // This was just a click, not a drag - let the SelectionViewportPlugin handle deselection
      this.startPoint = null;
      this.currentPoint = null;
      return;
    }

    // We did a drag selection, so prevent the subsequent click from deselecting
    this.shouldPreventClick = true;

    // Convert SVG coordinates to transformed coordinates for shape comparison
    if (!this.svgElement || !this.transformedGElement) {
      this.startPoint = null;
      this.currentPoint = null;
      return;
    }

    // Get the transform matrix to convert from SVG to transformed coordinates
    const svgCTM = this.svgElement.getScreenCTM();
    const transformedCTM = this.transformedGElement.getScreenCTM();
    
    if (!svgCTM || !transformedCTM) {
      this.startPoint = null;
      this.currentPoint = null;
      return;
    }

    // Convert selection points to transformed coordinate space
    // First convert from SVG to screen coordinates
    const startSVGPt = this.svgElement.createSVGPoint();
    startSVGPt.x = this.startPoint.x;
    startSVGPt.y = this.startPoint.y;
    const startScreenCoords = startSVGPt.matrixTransform(svgCTM);
    
    const endSVGPt = this.svgElement.createSVGPoint();
    endSVGPt.x = this.currentPoint.x;
    endSVGPt.y = this.currentPoint.y;
    const endScreenCoords = endSVGPt.matrixTransform(svgCTM);

    // Then convert from screen to transformed coordinates
    const transformedStartPt = this.svgElement.createSVGPoint();
    transformedStartPt.x = startScreenCoords.x;
    transformedStartPt.y = startScreenCoords.y;
    const transformedStartCoords = transformedStartPt.matrixTransform(transformedCTM.inverse());

    const transformedEndPt = this.svgElement.createSVGPoint();
    transformedEndPt.x = endScreenCoords.x;
    transformedEndPt.y = endScreenCoords.y;
    const transformedEndCoords = transformedEndPt.matrixTransform(transformedCTM.inverse());

    // Determine selection mode based on drag direction
    const isLeftToRight = this.currentPoint.x > this.startPoint.x;
    
    // Create selection rectangle bounds in transformed coordinates
    const selectionBounds = {
      minX: Math.min(transformedStartCoords.x, transformedEndCoords.x),
      maxX: Math.max(transformedStartCoords.x, transformedEndCoords.x),
      minY: Math.min(transformedStartCoords.y, transformedEndCoords.y),
      maxY: Math.max(transformedStartCoords.y, transformedEndCoords.y)
    };

    // Select shapes based on mode
    const shapesToSelect = this.shapeStore.shapes.filter(shape => {
      if (shape.isBuilding || !shape.selectable) return false;

      const boundingBox = shape.boundingBox;
      if (!boundingBox) return false;

      if (isLeftToRight) {
        // Left-to-right: select if any part intersects
        return this.intersectsRectangle(boundingBox, selectionBounds);
      } else {
        // Right-to-left: select only if entirely contained
        return this.containedInRectangle(boundingBox, selectionBounds);
      }
    });

    // Update selection
    if (!event.shiftKey) {
      // If shift is not held, clear current selection
      this.shapeStore.deselectAll();
    }

    shapesToSelect.forEach(shape => shape.select());

    this.startPoint = null;
    this.currentPoint = null;
  };

  private intersectsRectangle(
    shapeBounds: { minX: number; maxX: number; minY: number; maxY: number },
    selectionBounds: { minX: number; maxX: number; minY: number; maxY: number }
  ): boolean {
    return !(shapeBounds.maxX < selectionBounds.minX ||
             shapeBounds.minX > selectionBounds.maxX ||
             shapeBounds.maxY < selectionBounds.minY ||
             shapeBounds.minY > selectionBounds.maxY);
  }

  private containedInRectangle(
    shapeBounds: { minX: number; maxX: number; minY: number; maxY: number },
    selectionBounds: { minX: number; maxX: number; minY: number; maxY: number }
  ): boolean {
    return shapeBounds.minX >= selectionBounds.minX &&
           shapeBounds.maxX <= selectionBounds.maxX &&
           shapeBounds.minY >= selectionBounds.minY &&
           shapeBounds.maxY <= selectionBounds.maxY;
  }
}

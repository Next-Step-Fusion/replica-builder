import { reaction } from 'mobx';
import type { BuilderSettingsStore } from '../lib/getBuilderSettingsStore';
import { screenToSVGCoordinates } from '../lib/screenToSVGCoordinates';
import type { ViewportPlugin } from './ViewportPlugin';
const PADDING_X = 4;
const PADDING_Y = 2;
const CURSOR_TOOLTIP_OFFSET_X = 15;
const CURSOR_TOOLTIP_OFFSET_Y = 25; // Represents the amount to shift the tooltip up from the cursor

export class CoordinatesViewportPlugin implements ViewportPlugin {
  private svgElement: SVGSVGElement | null = null;
  private groupEl: SVGGElement | null = null;
  private textEl: SVGTextElement | null = null;
  private bgEl: SVGRectElement | null = null;
  private animationFrameId: number | null = null;
  private transformedGElement: SVGGElement | null = null;

  constructor(builderSettingsStore: BuilderSettingsStore) {
    reaction(
      () => builderSettingsStore.showCoordinates,
      (showCoordinates) => {
        if (showCoordinates && this.svgElement) {
          this.attach(this.svgElement);
        } else {
          this.detach(true);
        }
      }
    );
  }

  attach(svgElement: SVGSVGElement): void {
    if (!svgElement) {
      return;
    }
    this.svgElement = svgElement;
    this.transformedGElement = this.svgElement.querySelector('g');

    this.groupEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.groupEl.style.pointerEvents = 'none';
    this.groupEl.style.zIndex = '100000000';

    this.bgEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.bgEl.setAttribute('fill', 'rgba(100, 100, 220, 0.8)');
    this.bgEl.setAttribute('rx', '3');
    this.bgEl.setAttribute('ry', '3');
    this.groupEl.appendChild(this.bgEl);

    this.textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this.textEl.style.fontSize = '10px';
    this.textEl.style.fontFamily = 'monospace';
    this.textEl.style.fill = 'white';
    this.groupEl.appendChild(this.textEl);

    // Add to DOM to allow measurements
    this.svgElement.appendChild(this.groupEl);

    // Measure text metrics once
    const sampleText = 'Xgjpqy'; // Text with ascenders/descenders for accurate height
    this.textEl.textContent = sampleText;
    const textBBox = this.textEl.getBBox();
    const measuredTextVisualTopY = textBBox.y; // Y-coordinate of the top of the text's bounding box relative to its baseline
    const measuredTextVisualHeight = textBBox.height;

    // Set fixed attributes for text and background positioning/sizing
    this.textEl.setAttribute('x', PADDING_X.toString());
    // Calculate baseline Y to position text with top padding
    const textBaselineY = PADDING_Y - measuredTextVisualTopY;
    this.textEl.setAttribute('y', textBaselineY.toString());

    this.bgEl.setAttribute('x', '0');
    this.bgEl.setAttribute('y', '0');
    this.bgEl.setAttribute('height', (measuredTextVisualHeight + 2 * PADDING_Y).toString());

    // Set initial text and background width
    this.textEl.textContent = 'x:-- y:--';
    const initialTextWidth = this.textEl.getComputedTextLength();
    this.bgEl.setAttribute('width', (initialTextWidth + 2 * PADDING_X).toString());
    // Initially hide the group; it will be shown on mouse move
    if (this.groupEl) {
      this.groupEl.style.display = 'none';
    }

    this.svgElement.addEventListener('mousemove', this.handleMouseMove);
    this.svgElement.addEventListener('mouseleave', this.handleMouseLeave);
  }

  detach(soft = false): void {
    if (this.svgElement) {
      this.svgElement.removeEventListener('mousemove', this.handleMouseMove);
      this.svgElement.removeEventListener('mouseleave', this.handleMouseLeave);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.groupEl && this.groupEl.parentNode) {
      this.groupEl.parentNode.removeChild(this.groupEl);
    }

    this.textEl = null;
    this.bgEl = null;
    this.groupEl = null;
    if (!soft) {
      this.svgElement = null;
    }
  }

  private handleMouseMove = (event: MouseEvent): void => {
    if (
      !this.svgElement ||
      !this.textEl ||
      !this.bgEl ||
      !this.groupEl ||
      !this.transformedGElement
    ) {
      return;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      if (
        !this.svgElement ||
        !this.textEl ||
        !this.bgEl ||
        !this.groupEl ||
        !this.transformedGElement
      ) {
        // Re-check in case detached
        return;
      }
      const pt = this.svgElement.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const coords = pt.matrixTransform(this.transformedGElement.getScreenCTM()!.inverse());

      if (coords) {
        this.textEl.textContent = `x:${coords.x.toFixed(1)} y:${-coords.y.toFixed(1)}`;
        const textWidth = this.textEl.getComputedTextLength();
        this.bgEl.setAttribute('width', (textWidth + 2 * PADDING_X).toString());

        const screenCoords = screenToSVGCoordinates(event.clientX, event.clientY, this.svgElement);
        if (!screenCoords) return;

        const groupX = screenCoords.x + CURSOR_TOOLTIP_OFFSET_X;
        const groupY = screenCoords.y - CURSOR_TOOLTIP_OFFSET_Y;
        this.groupEl.setAttribute('transform', `translate(${groupX}, ${groupY})`);
        this.groupEl.style.display = 'block';
      } else {
        if (this.groupEl) {
          this.groupEl.style.display = 'none';
        }
      }
      this.animationFrameId = null;
    });
  };

  private handleMouseLeave = (): void => {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.groupEl) {
      this.groupEl.style.display = 'none';
    }
  };
}

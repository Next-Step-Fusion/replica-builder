// Viewport-level plugin, exists only once per viewport
export interface ViewportPlugin {
  attach(viewport: SVGSVGElement): void;
  detach(): void;
}

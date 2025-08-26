import { makeObservable, observable } from 'mobx';

type MarkerOpts = {
  id: number;
  x: number;
  y: number;
  isCurveControl?: boolean;
  moveRestriction?: 'horizontal' | 'vertical' | 'both';
  onClick?: () => void;
  onRemove?: (markerId: number) => void;
  onMarkerMoved?: (dx: number, dy: number, event: MouseEvent) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDerivedPosition?: boolean;
};

export class Marker {
  x: number;
  y: number;
  isCurveControl?: boolean;
  id: number;
  node: SVGElement | null = null;
  isDragging = false;
  moveRestriction: 'horizontal' | 'vertical' | 'both';
  onClick?: () => void;
  onMarkerMoved?: (dx: number, dy: number, event: MouseEvent) => void;
  onRemove?: (markerId: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDerivedPosition: boolean;

  constructor(opts: MarkerOpts) {
    this.id = opts.id;
    this.x = opts.x;
    this.y = opts.y;
    // this.x = Math.round(opts.x);
    // this.y = Math.round(opts.y);
    this.isCurveControl = opts.isCurveControl ?? false;
    this.onClick = opts.onClick;
    this.onMarkerMoved = opts.onMarkerMoved;
    this.onRemove = opts.onRemove;
    this.moveRestriction = opts.moveRestriction || 'both';
    this.onDragStart = opts.onDragStart;
    this.onDragEnd = opts.onDragEnd;
    this.isDerivedPosition = opts.isDerivedPosition ?? false;
    makeObservable(this, {
      x: observable,
      y: observable,
      isDragging: observable
    });
  }

  setNode = (node: SVGElement | null) => {
    this.clearSubscriptions();
    this.node = node;
    this.createSubscriptions();
  };

  private createSubscriptions() {
    if (this.node) {
      this.node.addEventListener('click', this.handleClick, { capture: true });
      this.node.addEventListener('mousedown', this.handleMouseDown);
      document.addEventListener('mouseup', this.handleMouseUp, { capture: true });
      document.addEventListener('mousemove', this.handleMouseMove);
    }
  }

  private clearSubscriptions() {
    if (this.node) {
      this.node.removeEventListener('click', this.handleClick, { capture: true });
      this.node.removeEventListener('mousedown', this.handleMouseDown);
      document.removeEventListener('mouseup', this.handleMouseUp, { capture: true });
      document.removeEventListener('mousemove', this.handleMouseMove);
    }
  }

  private handleClick = (event: MouseEvent) => {
    event.stopImmediatePropagation();
    if (this.onClick) {
      this.onClick();
    }
    if (this.onRemove && event.altKey) {
      this.onRemove(this.id);
    }
  };

  private handleMouseDown = (event: MouseEvent) => {
    event.stopImmediatePropagation();
    this.isDragging = true;
    this.onDragStart?.();
  };

  private handleMouseUp = (event: MouseEvent) => {
    if (this.isDragging) {
      this.isDragging = false;
      this.onDragEnd?.();
    }
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.isDragging) return;
    if (!this.node?.ownerSVGElement) {
      return;
    }
    const svg = this.node.ownerSVGElement;
    const g = this.node.parentNode as SVGGElement;

    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    const newPoint = pt.matrixTransform(g.getScreenCTM()!.inverse());

    if (newPoint) {
      const currentMarkerX = this.x;
      const currentMarkerY = this.y;

      const dx =
        this.moveRestriction === 'vertical' || event.altKey ? 0 : newPoint.x - currentMarkerX;
      const dy =
        this.moveRestriction === 'horizontal' || event.metaKey ? 0 : newPoint.y - currentMarkerY;

      if (!this.isDerivedPosition) {
        this.x = this.moveRestriction === 'vertical' || event.altKey ? currentMarkerX : newPoint.x;
        this.y =
          this.moveRestriction === 'horizontal' || event.metaKey ? currentMarkerY : newPoint.y;
      }

      if (this.onMarkerMoved && (dx !== 0 || dy !== 0)) {
        this.onMarkerMoved(dx, dy, event);
      }
    }
  };
}

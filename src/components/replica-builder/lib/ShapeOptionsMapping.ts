import type { ShapeOptions } from '../shapes/Shape';
import type { TokamakElement } from '../shapes/TokamakElement';

export const ShapeOptionsMapping: Record<TokamakElement, ShapeOptions> = {
  vessel: {
    element: 'vessel',
    shapeType: 'polygon',
    draggable: true,
    selectable: true,
    closedShape: true,
    resizeable: true,
    editable: true,
    rotatable: true
  },
  limiter: {
    element: 'limiter',
    shapeType: 'polygon',
    draggable: true,
    selectable: true,
    closedShape: true,
    resizeable: true,
    editable: true,
    rotatable: true
  },
  coil: {
    element: 'coil',
    shapeType: 'parallelogram',
    draggable: true,
    selectable: true,
    closedShape: true,
    resizeable: true,
    editable: false,
    rotatable: true
  },
  passive: {
    element: 'passive',
    shapeType: 'parallelogram',
    draggable: true,
    selectable: true,
    closedShape: true,
    resizeable: true,
    editable: false,
    rotatable: true
  },
  probe: {
    element: 'probe',
    shapeType: 'vector',
    draggable: true,
    selectable: true,
    closedShape: false,
    resizeable: false,
    editable: false,
    rotatable: false
  },
  loop: {
    element: 'loop',
    shapeType: 'point',
    draggable: true,
    selectable: true,
    closedShape: true,
    resizeable: false,
    editable: false,
    rotatable: false
  },
  tf_coil: {
    element: 'tf_coil',
    shapeType: 'polygon',
    draggable: true,
    selectable: true,
    closedShape: true,
    resizeable: true,
    editable: true,
    rotatable: true
  },
  blanket: {
    element: 'blanket',
    shapeType: 'polygon',
    draggable: true,
    selectable: true,
    closedShape: true,
    resizeable: true,
    editable: true,
    rotatable: true
  }
};

import type { TokamakElement } from '../shapes/TokamakElement';

export function getStrokeWidth(element: TokamakElement) {
  switch (element) {
    case 'probe':
      return 1.5;
    case 'vessel':
      return 1.5;
    default:
      return 2;
  }
}

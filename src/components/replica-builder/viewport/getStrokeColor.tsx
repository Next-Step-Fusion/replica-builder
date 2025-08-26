import type { TokamakElement } from '../shapes/TokamakElement';

export function getStrokeColor(element: TokamakElement, hasValidationError?: boolean) {
  if (hasValidationError) {
    return 'red';
  }
  switch (element) {
    case 'probe':
      return 'blue';
    case 'vessel':
    case 'passive':
      return 'var(--color-shape-blue)';
    case 'coil':
      return 'var(--color-shape-orange)';
    case 'tf_coil':
      return 'var(--color-shape-red)';
    case 'blanket':
      return 'var(--color-shape-green)';
    case 'loop':
      return 'var(--color-shape-red)';
    default:
      return 'black';
  }
}

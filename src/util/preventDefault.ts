import type React from 'react';

export function preventDefault(event: React.SyntheticEvent) {
  event.preventDefault();
}

export function stopPropagation(event: React.SyntheticEvent) {
  event.stopPropagation();
}

export function preventDefaultAndPropagation(event: React.SyntheticEvent) {
  preventDefault(event);
  stopPropagation(event);
}

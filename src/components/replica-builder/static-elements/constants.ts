export const TICK_SIZE = 3;
export const AXIS_MARK_INTERVAL = 50;
export const ARROW_LENGTH = 10;
// axis lengths
export const DEFAULT_DIMENSIONS = {
  width: 440,
  height: 440
};

export const ZOOM_CONFIG = {
  min: 0.1,
  max: 15,
  factor: 0.05,
  range: 0 // don't set, auto calculated
};

ZOOM_CONFIG.range = ZOOM_CONFIG.max - ZOOM_CONFIG.min;

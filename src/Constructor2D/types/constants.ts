/**
 * Константы для Constructor2D
 */

// Константы
export const CONSTRUCTOR2D_CONSTANTS = {
  DEFAULT_SCALE: 1,
  MIN_SCALE: 0.3,
  MAX_SCALE: 2,
  SCALE_STEP: 0.1,
  DEFAULT_WALL_WIDTH: 150,
  DEFAULT_WALL_HEIGHT: 30,
  DEFAULT_WINDOW_WIDTH: 120,
  DEFAULT_WINDOW_HEIGHT: 30,
  DEFAULT_DOOR_WIDTH: 96,
  DEFAULT_DOOR_HEIGHT: 30,
} as const;

// Типы для констант
export type Constructor2DConstants = typeof CONSTRUCTOR2D_CONSTANTS;

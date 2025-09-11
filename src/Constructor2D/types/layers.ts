/**
 * Типы для слоев Constructor2D
 */

import type { Vector2 } from '@/types/constructor2d/interfaсes';

// Базовые типы слоев
export interface LayerConfig {
  scale: number;
  position: Vector2;
  visible: boolean;
}

export interface LayerState {
  isActive: boolean;
  isInitialized: boolean;
  lastUpdate: number;
}

// Типы для Planner (слой стен)
export interface PlannerLayerConfig extends LayerConfig {
  wall: {
    defaultWidth: number;
    defaultHeight: number;
    defaultColor: number;
  };
}

export interface PlannerLayerState extends LayerState {
  activeWall: string | null;
  activePoint: number | null;
}

// Типы для HalfRoom (слой комнат)
export interface HalfRoomLayerConfig extends LayerConfig {
  room: {
    defaultColor: number;
    textStyle: {
      fontSize: number;
      fill: number;
    };
  };
}

export interface HalfRoomLayerState extends LayerState {
  activeRoom: string | null;
}

// Типы для DoorsAndWindows (слой объектов)
export interface DoorsAndWindowsLayerConfig extends LayerConfig {
  window: {
    defaultWidth: number;
    defaultHeight: number;
    defaultColor: number;
  };
  door: {
    defaultWidth: number;
    defaultHeight: number;
    defaultColor: number;
  };
}

export interface DoorsAndWindowsLayerState extends LayerState {
  activeObject: string | null;
  activePoint: number | null;
}

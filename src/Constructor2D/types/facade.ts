/**
 * Типы для Constructor2D Facade
 */

import type { Vector2 } from '@/types/constructor2d/interfaсes';

// Базовые типы
export type WallType = 'wall' | 'wall_vertical' | 'dividing_wall';
export type ObjectType = 'window' | 'door';

// Интерфейсы данных
export interface RoomData {
  id: string | number;
  label: string;
  description?: string;
  points: Vector2[];
}

export interface WallModificationData {
  position?: Vector2;
  width?: number;
  height?: number;
  angleDegrees?: number;
  heightDirection?: -1 | 1;
}

export interface ObjectData {
  id: string | number;
  type: ObjectType;
  position: Vector2;
  width: number;
  height: number;
  belongsToWall?: {
    id: string | number | null;
    distanceFromWallStart: number;
  };
}

export interface ViewportSettings {
  scale: number;
  offset: Vector2;
}

// События
export interface Constructor2DEvents {
  roomAdded: (roomData: RoomData) => void;
  roomModified: (roomData: RoomData) => void;
  roomRemoved: (roomId: string) => void;
  wallAdded: (wallData: any) => void;
  wallModified: (wallData: any) => void;
  wallRemoved: (wallId: string) => void;
  objectAdded: (objectData: ObjectData) => void;
  objectModified: (objectData: ObjectData) => void;
  objectRemoved: (objectId: string) => void;
  viewportChanged: (viewport: ViewportSettings) => void;
}

// Конфигурация
export interface Constructor2DConfig {
  scale: {
    initial: number;
    min: number;
    max: number;
    step: number;
  };
  viewport: {
    initialOffset: Vector2;
  };
  wall: {
    defaultWidth: number;
    defaultHeight: number;
  };
  object: {
    window: {
      defaultWidth: number;
      defaultHeight: number;
    };
    door: {
      defaultWidth: number;
      defaultHeight: number;
    };
  };
}

// Состояние
export interface Constructor2DState {
  isInitialized: boolean;
  activeRoom: string | null;
  activeWall: string | null;
  activeObject: string | null;
  viewport: ViewportSettings;
}

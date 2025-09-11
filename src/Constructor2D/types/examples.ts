/**
 * Примеры использования типов Constructor2D
 */

import type {
  // Основные типы фасада
  RoomData,
  WallType,
  ObjectType,
  WallModificationData,
  ObjectData,
  ViewportSettings,
  
  // Типы операций
  OperationResult,
  RoomOperationResult,
  
  // Типы слоев (для внутреннего использования)
  LayerConfig,
  PlannerLayerConfig,
  
  // Константы
  CONSTRUCTOR2D_CONSTANTS
} from './index';

// Пример создания данных комнаты
export const exampleRoomData: Omit<RoomData, 'id'> = {
  label: 'Гостиная',
  description: 'Основная комната для отдыха',
  points: [
    { x: 0, y: 0 },
    { x: 400, y: 0 },
    { x: 400, y: 300 },
    { x: 0, y: 300 }
  ]
};

// Пример модификации стены
export const exampleWallModification: WallModificationData = {
  position: { x: 100, y: 100 },
  width: 200,
  height: 50,
  angleDegrees: 45,
  heightDirection: 1
};

// Пример данных объекта
export const exampleObjectData: ObjectData = {
  id: '1',
  type: 'window',
  position: { x: 150, y: 150 },
  width: 120,
  height: 30,
  belongsToWall: {
    id: 'wall1',
    distanceFromWallStart: 50
  }
};

// Пример настроек вида
export const exampleViewportSettings: ViewportSettings = {
  scale: 1.5,
  offset: { x: 100, y: 100 }
};

// Пример результата операции
export const exampleOperationResult: RoomOperationResult = {
  success: true,
  roomId: 'room1',
  data: {
    id: 'room1',
    label: 'Комната',
    points: []
  }
};

// Пример конфигурации слоя
export const exampleLayerConfig: LayerConfig = {
  scale: 1,
  position: { x: 0, y: 0 },
  visible: true
};

// Пример использования констант
export const exampleConstants = {
  defaultScale: CONSTRUCTOR2D_CONSTANTS.DEFAULT_SCALE,
  minScale: CONSTRUCTOR2D_CONSTANTS.MIN_SCALE,
  maxScale: CONSTRUCTOR2D_CONSTANTS.MAX_SCALE,
  defaultWallWidth: CONSTRUCTOR2D_CONSTANTS.DEFAULT_WALL_WIDTH
};

// Типы для функций
export type RoomCreator = (data: Omit<RoomData, 'id'>) => string;
export type WallCreator = (position: { x: number; y: number }, type: WallType) => string;
export type ObjectCreator = (position: { x: number; y: number }, type: ObjectType) => string;

// Примеры функций
export const createRoom: RoomCreator = (data) => {
  // Логика создания комнаты
  return 'room_' + Date.now();
};

export const createWall: WallCreator = (position, type) => {
  // Логика создания стены
  return 'wall_' + Date.now();
};

export const createObject: ObjectCreator = (position, type) => {
  // Логика создания объекта
  return 'object_' + Date.now();
};

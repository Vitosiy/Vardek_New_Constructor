/**
 * Централизованный экспорт всех типов Constructor2D
 */

// Экспорт типов фасада
export type {
  WallType,
  ObjectType,
  RoomData,
  WallModificationData,
  ObjectData,
  ViewportSettings,
  Constructor2DEvents,
  Constructor2DConfig,
  Constructor2DState
} from './facade';

// Экспорт типов операций
export type {
  OperationResult,
  RoomOperationResult,
  WallOperationResult,
  ObjectOperationResult,
  Constructor2DUtils
} from './operations';

// Экспорт типов слоев
export type {
  LayerConfig,
  LayerState,
  PlannerLayerConfig,
  PlannerLayerState,
  HalfRoomLayerConfig,
  HalfRoomLayerState,
  DoorsAndWindowsLayerConfig,
  DoorsAndWindowsLayerState
} from './layers';

// Экспорт констант
export { CONSTRUCTOR2D_CONSTANTS } from './constants';
export type { Constructor2DConstants } from './constants';

// Реэкспорт базовых типов
export type { Vector2 } from '@/types/constructor2d/interfaсes';

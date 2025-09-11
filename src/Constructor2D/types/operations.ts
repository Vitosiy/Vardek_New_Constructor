/**
 * Типы для операций Constructor2D
 */

// Результаты операций
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RoomOperationResult extends OperationResult {
  roomId?: string;
}

export interface WallOperationResult extends OperationResult {
  wallId?: string;
}

export interface ObjectOperationResult extends OperationResult {
  objectId?: string;
}

// Утилиты
export interface Constructor2DUtils {
  generateId(): string;
  validateRoomData(data: any): boolean;
  validateWallData(data: any): boolean;
  validateObjectData(data: any): boolean;
  calculateDistance(point1: any, point2: any): number;
  calculateAngle(point1: any, point2: any): number;
}

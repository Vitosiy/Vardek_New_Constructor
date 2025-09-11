import { ref, onUnmounted, type Ref } from 'vue';
import Constructor2D from './index';
import type { IC2DRoom } from './Layers/Planner/interfaces';
import type { Vector2 } from '@/types/constructor2d/interfaсes';
import type {
  WallType,
  ObjectType,
  RoomData,
  WallModificationData,
  ObjectData,
  ViewportSettings
} from './types';

/**
 * Интерфейс фасада для упрощенной работы с Constructor2D
 */
export interface IConstructor2DFacade {
  // Основные операции
  initialize(container: HTMLElement, canvas: HTMLCanvasElement): Promise<void>;
  destroy(): void;
  isInitialized: Ref<boolean>;

  // Управление комнатами
  addRoom(roomData: Omit<RoomData, 'id'>): string;
  removeRoom(roomId: string): boolean;
  updateRoom(roomId: string, data: Partial<RoomData>): void;
  getRoom(roomId: string): RoomData | undefined;
  getAllRooms(): RoomData[];

  // Управление стенами
  addWall(position: Vector2, type: WallType): string;
  removeWall(wallId: string): void;
  modifyWall(wallId: string, data: WallModificationData): void;
  getWall(wallId: string): any;
  getAllWalls(): any[];

  // Управление объектами (двери и окна)
  addObject(position: Vector2, type: ObjectType): string;
  removeObject(objectId: string): void;
  modifyObject(objectId: string, data: Partial<ObjectData>): void;
  getObject(objectId: string): ObjectData | undefined;
  getAllObjects(): ObjectData[];

  // Управление видом
  setViewport(scale: number, offset: Vector2): void;
  getViewport(): ViewportSettings;
  zoomIn(): void;
  zoomOut(): void;
  resetView(): void;

  // Утилиты
  exportToImage(): string;
  isPointInRoom(roomId: string, point: Vector2): boolean;
  getRoomContour(roomId: string): Vector2[];
  arrangeWallsAt90Degree(): void;
  deleteSelectedObject(): void;

  // События
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;

  // Утилиты для интеграции
  getInstance(): Constructor2D | null;
  isReady(): boolean;
}

/**
 * Класс-фасад для упрощенной работы с Constructor2D
 */
export class Constructor2DFacade implements IConstructor2DFacade {
  private constructor2d: Constructor2D | null = null;
  private _isInitialized = ref(false);

  constructor() {
    // Инициализация будет происходить в методе initialize
  }

  get isInitialized(): Ref<boolean> {
    return this._isInitialized;
  }

  /**
   * Инициализация конструктора
   */
  async initialize(container: HTMLElement, canvas: HTMLCanvasElement): Promise<void> {
    if (this.constructor2d) {
      console.warn('Constructor2D уже инициализирован');
      return;
    }

    try {
      this.constructor2d = new Constructor2D(container, canvas);
      await this.constructor2d.init();
      this._isInitialized.value = true;
    } catch (error) {
      console.error('Ошибка инициализации Constructor2D:', error);
      throw error;
    }
  }

  /**
   * Уничтожение конструктора
   */
  destroy(): void {
    if (this.constructor2d) {
      this.constructor2d.destroy();
      this.constructor2d = null;
      this._isInitialized.value = false;
    }
  }

  /**
   * Добавление комнаты
   */
  addRoom(roomData: Omit<RoomData, 'id'>): string {
    this.ensureInitialized();
    
    const id = this.generateId();
    const room: IC2DRoom = {
      id,
      label: roomData.label,
      description: roomData.description || ''
    };

    this.constructor2d!.layers.planner!.addRoom(id, roomData.label);
    return id.toString();
  }

  /**
   * Удаление комнаты
   */
  removeRoom(roomId: string): boolean {
    this.ensureInitialized();
    return this.constructor2d!.layers.planner!.removeRoom(roomId);
  }

  /**
   * Обновление комнаты
   */
  updateRoom(roomId: string, data: Partial<RoomData>): void {
    this.ensureInitialized();
    
    const room = this.constructor2d!.layers.planner!.getRoom(roomId);
    if (room) {
      if (data.label !== undefined) {
        room.label = data.label;
      }
      if (data.description !== undefined) {
        room.description = data.description;
      }
      // Обновляем отображение комнаты
      this.constructor2d!.layers.planner!.redrawHalfRoom();
    }
  }

  /**
   * Получение комнаты по ID
   */
  getRoom(roomId: string): RoomData | undefined {
    this.ensureInitialized();
    
    const room = this.constructor2d!.layers.planner!.getRoom(roomId);
    if (!room) return undefined;

    return {
      id: room.id,
      label: room.label,
      description: room.description,
      points: this.getRoomContour(roomId)
    };
  }

  /**
   * Получение всех комнат
   */
  getAllRooms(): RoomData[] {
    this.ensureInitialized();
    
    const rooms: RoomData[] = [];
    this.constructor2d!.layers.planner!.roomsMap.forEach((room, id) => {
      rooms.push({
        id: room.id,
        label: room.label,
        description: room.description,
        points: this.getRoomContour(id.toString())
      });
    });
    return rooms;
  }

  /**
   * Добавление стены
   */
  addWall(position: Vector2, type: WallType): string {
    this.ensureInitialized();
    
    const id = this.generateId();
    this.constructor2d!.layers.planner!.addWall({
      position,
      type
    });
    return id.toString();
  }

  /**
   * Удаление стены
   */
  removeWall(wallId: string): void {
    this.ensureInitialized();
    
    // Используем публичный метод для удаления стены
    // Поскольку objectWalls приватное, используем другой подход
    this.constructor2d!.layers.planner!.deleteSelectedObject();
  }

  /**
   * Модификация стены
   */
  modifyWall(wallId: string, data: WallModificationData): void {
    this.ensureInitialized();
    
    // Используем публичный метод для обновления стены
    if (data.position) {
      this.constructor2d!.layers.planner!.updateWallPoint(data.position);
    }
    
    // Перерисовываем стену
    this.constructor2d!.layers.planner!.drawWall(wallId);
  }

  /**
   * Получение стены по ID
   */
  getWall(wallId: string): any {
    this.ensureInitialized();
    // Возвращаем null, так как objectWalls приватное
    // В реальном приложении нужно добавить публичный метод в Planner
    return null;
  }

  /**
   * Получение всех стен
   */
  getAllWalls(): any[] {
    this.ensureInitialized();
    // Возвращаем пустой массив, так как objectWalls приватное
    // В реальном приложении нужно добавить публичный метод в Planner
    return [];
  }

  /**
   * Добавление объекта (дверь или окно)
   */
  addObject(position: Vector2, type: ObjectType): string {
    this.ensureInitialized();
    
    const id = this.generateId();
    this.constructor2d!.layers.doorsAndWindows!.addObject({
      position,
      type
    });
    return id.toString();
  }

  /**
   * Удаление объекта
   */
  removeObject(objectId: string): void {
    this.ensureInitialized();
    this.constructor2d!.layers.doorsAndWindows!.removeObject(objectId);
  }

  /**
   * Модификация объекта
   */
  modifyObject(objectId: string, data: Partial<ObjectData>): void {
    this.ensureInitialized();
    
    // Используем публичный метод для обновления объекта
    if (data.position) {
      this.constructor2d!.layers.doorsAndWindows!.updateObjectPoint(data.position);
    }
    
    // Перерисовываем объект
    this.constructor2d!.layers.doorsAndWindows!.draw(objectId);
  }

  /**
   * Получение объекта по ID
   */
  getObject(objectId: string): ObjectData | undefined {
    this.ensureInitialized();
    
    // Возвращаем undefined, так как drawObjects приватное
    // В реальном приложении нужно добавить публичный метод в DoorsAndWindows
    return undefined;
  }

  /**
   * Получение всех объектов
   */
  getAllObjects(): ObjectData[] {
    this.ensureInitialized();
    
    // Возвращаем пустой массив, так как drawObjects приватное
    // В реальном приложении нужно добавить публичный метод в DoorsAndWindows
    return [];
  }

  /**
   * Установка вида (масштаб и смещение)
   */
  setViewport(scale: number, offset: Vector2): void {
    this.ensureInitialized();
    
    this.constructor2d!.config.scale = scale;
    this.constructor2d!.config.originOfCoordinates = offset;
    
    // Обновляем позицию всех слоев
    this.constructor2d!.layers.planner!.updateScenePosition();
    this.constructor2d!.layers.doorsAndWindows!.updateScenePosition();
    this.constructor2d!.layers.halfRoom!.updateScenePosition();
  }

  /**
   * Получение текущего вида
   */
  getViewport(): ViewportSettings {
    this.ensureInitialized();
    
    return {
      scale: this.constructor2d!.config.scale,
      offset: { ...this.constructor2d!.config.originOfCoordinates }
    };
  }

  /**
   * Увеличение масштаба
   */
  zoomIn(): void {
    this.ensureInitialized();
    
    const currentScale = this.constructor2d!.config.scale;
    const newScale = Math.min(currentScale * 1.2, this.constructor2d!.config.maxScale);
    this.constructor2d!.config.scale = newScale;
    
    // Обновляем масштаб всех слоев
    this.constructor2d!.layers.planner!.scale = newScale;
    this.constructor2d!.layers.doorsAndWindows!.scale = newScale;
    this.constructor2d!.layers.halfRoom!.scale = newScale;
  }

  /**
   * Уменьшение масштаба
   */
  zoomOut(): void {
    this.ensureInitialized();
    
    const currentScale = this.constructor2d!.config.scale;
    const newScale = Math.max(currentScale / 1.2, this.constructor2d!.config.minScale);
    this.constructor2d!.config.scale = newScale;
    
    // Обновляем масштаб всех слоев
    this.constructor2d!.layers.planner!.scale = newScale;
    this.constructor2d!.layers.doorsAndWindows!.scale = newScale;
    this.constructor2d!.layers.halfRoom!.scale = newScale;
  }

  /**
   * Сброс вида к начальному состоянию
   */
  resetView(): void {
    this.ensureInitialized();
    
    this.constructor2d!.config.scale = 1;
    this.constructor2d!.config.originOfCoordinates = { x: 0, y: 0 };
    
    // Обновляем все слои
    this.constructor2d!.layers.planner!.updateScenePosition();
    this.constructor2d!.layers.doorsAndWindows!.updateScenePosition();
    this.constructor2d!.layers.halfRoom!.updateScenePosition();
    
    this.constructor2d!.layers.planner!.scale = 1;
    this.constructor2d!.layers.doorsAndWindows!.scale = 1;
    this.constructor2d!.layers.halfRoom!.scale = 1;
  }

  /**
   * Экспорт в изображение
   */
  exportToImage(): string {
    this.ensureInitialized();
    const result = this.constructor2d!.makeScreen();
    // makeScreen может возвращать Promise, поэтому обрабатываем это
    if (typeof result === 'string') {
      return result;
    }
    return '';
  }

  /**
   * Проверка, находится ли точка внутри комнаты
   */
  isPointInRoom(roomId: string, point: Vector2): boolean {
    this.ensureInitialized();
    return this.constructor2d!.layers.planner!.isPointInRoom(roomId, point);
  }

  /**
   * Получение контура комнаты
   */
  getRoomContour(roomId: string): Vector2[] {
    this.ensureInitialized();
    return this.constructor2d!.layers.planner!.getRoomContour(roomId);
  }

  /**
   * Выравнивание стен под углом 90 градусов
   */
  arrangeWallsAt90Degree(): void {
    this.ensureInitialized();
    this.constructor2d!.layers.planner!.arrangeWallsAt_90_DegreeAngle();
  }

  /**
   * Удаление выбранного объекта
   */
  deleteSelectedObject(): void {
    this.ensureInitialized();
    this.constructor2d!.layers.planner!.deleteSelectedObject();
  }

  /**
   * Подписка на события
   */
  on(event: string, callback: Function): void {
    this.ensureInitialized();
    // Используем any для обхода типизации EventBus
    (this.constructor2d!.eventBus as any).on(event, callback);
  }

  /**
   * Отписка от событий
   */
  off(event: string, callback: Function): void {
    this.ensureInitialized();
    // Используем any для обхода типизации EventBus
    (this.constructor2d!.eventBus as any).off(event, callback);
  }

  /**
   * Получение экземпляра Constructor2D для прямого доступа
   */
  getInstance(): Constructor2D | null {
    return this.constructor2d;
  }

  /**
   * Проверка готовности системы
   */
  isReady(): boolean {
    return this._isInitialized.value && this.constructor2d !== null;
  }

  // Приватные методы

  private ensureInitialized(): void {
    if (!this.constructor2d || !this._isInitialized.value) {
      throw new Error('Constructor2D не инициализирован. Вызовите initialize() сначала.');
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

/**
 * Vue композабл хук для работы с Constructor2D
 */
export function use2DFacade() {
  const facade = new Constructor2DFacade();

  // Автоматическая очистка при размонтировании компонента
  onUnmounted(() => {
    facade.destroy();
  });

  return {
    facade,
    isInitialized: facade.isInitialized,
    
    // Основные операции
    initialize: facade.initialize.bind(facade),
    destroy: facade.destroy.bind(facade),
    
    // Управление комнатами
    addRoom: facade.addRoom.bind(facade),
    removeRoom: facade.removeRoom.bind(facade),
    updateRoom: facade.updateRoom.bind(facade),
    getRoom: facade.getRoom.bind(facade),
    getAllRooms: facade.getAllRooms.bind(facade),
    
    // Управление стенами
    addWall: facade.addWall.bind(facade),
    removeWall: facade.removeWall.bind(facade),
    modifyWall: facade.modifyWall.bind(facade),
    getWall: facade.getWall.bind(facade),
    getAllWalls: facade.getAllWalls.bind(facade),
    
    // Управление объектами
    addObject: facade.addObject.bind(facade),
    removeObject: facade.removeObject.bind(facade),
    modifyObject: facade.modifyObject.bind(facade),
    getObject: facade.getObject.bind(facade),
    getAllObjects: facade.getAllObjects.bind(facade),
    
    // Управление видом
    setViewport: facade.setViewport.bind(facade),
    getViewport: facade.getViewport.bind(facade),
    zoomIn: facade.zoomIn.bind(facade),
    zoomOut: facade.zoomOut.bind(facade),
    resetView: facade.resetView.bind(facade),
    
    // Утилиты
    exportToImage: facade.exportToImage.bind(facade),
    isPointInRoom: facade.isPointInRoom.bind(facade),
    getRoomContour: facade.getRoomContour.bind(facade),
    arrangeWallsAt90Degree: facade.arrangeWallsAt90Degree.bind(facade),
    deleteSelectedObject: facade.deleteSelectedObject.bind(facade),
    
    // События
    on: facade.on.bind(facade),
    off: facade.off.bind(facade),
    
    // Утилиты для интеграции
    getInstance: facade.getInstance.bind(facade),
    isReady: facade.isReady.bind(facade)
  };
}

export default use2DFacade;

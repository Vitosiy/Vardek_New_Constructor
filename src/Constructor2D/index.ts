import * as PIXI from 'pixi.js';

import Grid from "./CanvasComponents/Grid";
import Rulers from "./CanvasComponents/Rulers";
import Planner from "./CanvasComponents/Planner";

import {
  DropData
} from "@/types/constructor2d/interfaсes";

import { useConstructor2DStore } from '@/store/constructor2d/store/useConstructor2DStore';
import {
  calculateMouseDistanceByAxes
} from "./utils/Math";

interface Components {
  grid: Grid | null;
  rulers: Rulers | null;
  planner: Planner | null;
}

export default class Constructor2D {

  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private app2d: PIXI.Application | null = null;
  private components: Components = {
    grid: null,
    rulers: null,
    planner: null,
  };

  private constructorStore = useConstructor2DStore(); // constructor2D хранилище

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {

    this.container = container;
    this.canvas = canvas;

  }

  async init(): Promise<void> {

    if (this.app2d) return; // Если уже инициализировано, ничего не делаем

    this.app2d = new PIXI.Application();
    await this.app2d.init({
      canvas: this.canvas, // Используем canvas напрямую, а не view
      resizeTo: this.container, // Рендер автоматически будет менять размер в зависимости от размера контейнера
      backgroundColor: 0xffffff, // Белый фон
      antialias: true, // Сглаживание
      resolution: window.devicePixelRatio || 1
    });
    this.app2d.stage.hitArea = this.app2d.screen;
    this.app2d.stage.eventMode = 'static'; // ???

    this.initComponents();
    this.setupInteractions();

    // Обработчик изменения размера окна
    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));
    
  }

  // инициализация draw-компонентов
  private initComponents(): void {

    // добавляем компонент сетки
    this.components.grid ??= new Grid(this.app2d!);
    
    // добавляем компонент для рисования планировок
    this.components.planner ??= new Planner(this.app2d!);
    
    // добавляем компонент для отображения линеек
    this.components.rulers ??= new Rulers(this.app2d!);

  }

  private handleResize(): void {
    if (this.app2d) {
      this.app2d.renderer.resize(this.container.clientWidth, this.container.clientHeight);
    }
  }

  public addDoor(data: DropData): void {

    if(!this.components.planner) return;

    // добавить в Store товар
    
  }

  /*
  Очистка ресурсов (например, при удалении компонента):
  Метод destroy удаляет экземпляр PIXI и все связанные ресурсы, а также удаляет обработчик события resize, 
  чтобы предотвратить утечки памяти.
  */
  destroy(): void {
    if (this.app2d) {

      // удаляем все обраотчики на объекте this.app2d.stage
      this.removeInteractions();
      
      // Удаляем обработчик событий
      window.removeEventListener('resize', this.handleResize.bind(this));
      this.app2d.destroy(true, { children: true });
      this.app2d = null;
    }
  }

  private setupInteractions(): void {
    const stage = this.app2d?.stage;
  
    if (!stage) return;
  
    stage.on('rightdown', this.onRightDown.bind(this));
    stage.on('rightup', this.onRightUp.bind(this));
    stage.on('pointermove', this.onPointerMove.bind(this));
  }

  private removeInteractions(): void {
    const stage = this.app2d?.stage;

    if (!stage) return;

    // Удаляем все обработчики обработчики
    stage.off('rightdown');
    stage.off('rightup');
    stage.off('pointermove');
  }

  private onRightDown(e: PIXI.FederatedPointerEvent): void {
    e.preventDefault();
    
    this.constructorStore.toggleRightBtn();
    this.constructorStore.updataRightClickPosition(e.global.x, e.global.y);
    this.constructorStore.updatePrevOriginOfCoordinates(
      this.constructorStore.originOfCoordinates.x,
      this.constructorStore.originOfCoordinates.y
    );
    
  }
  
  private onRightUp(e: PIXI.FederatedPointerEvent): void {
    e.preventDefault();
    // Логика отпускания правой кнопки мыши

    this.constructorStore.toggleRightBtn();
    
  }
  
  private onPointerMove(e: PIXI.FederatedPointerEvent): void {
    e.preventDefault();

    // Обновляем текущую позицию мыши в хранилище
    this.constructorStore.updatePositionPoint(e.global.x, e.global.y);

    // Если правая кнопка мыши зажата, перемещаем сцену
    if (this.constructorStore.mouse.rightBtn) {

      this.constructorStore.mouse.positionPoint

      // Вычисляем изменения по осям X и Y
      const { distanceX, distanceY } = calculateMouseDistanceByAxes(
        { // Новая позиция мыши
          x: this.constructorStore.mouse.positionPoint.x, 
          y: this.constructorStore.mouse.positionPoint.y 
        },
        this.constructorStore.mouse.rightClickPosition, // положение клика на по правой кнопке
      );

      // Смещаем в противоположную сторону (вычитаем изменения)
      const newX = this.constructorStore.mouse.prevOriginOfCoordinates.x - distanceX;
      const newY = this.constructorStore.mouse.prevOriginOfCoordinates.y - distanceY;

      // Обновляем координаты центра в store
      this.constructorStore.updateOriginOfCoordinates(newX, newY);
    }
  }

}
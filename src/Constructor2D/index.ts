import {
  watch,
  ref
} from 'vue';
import * as PIXI from 'pixi.js';

import Grid from "./CanvasComponents/Grid";
import Rulers from "./CanvasComponents/Rulers";
import Planner from "./CanvasComponents/Planner";
import ArrowRulerActiveObject from "./CanvasComponents/ArrowRulerActiveObject";
import StartPointActiveObject from "./CanvasComponents/StartPointActiveObject";
import SizeTextActiveObject from "./CanvasComponents/SizeTextActiveObject";

/*
import {
  DropData
} from "@/types/constructor2d/interfaсes";
*/

import { useConstructor2DStore } from '@/store/constructor2d/store/useConstructor2DStore';
import { useC2DInteractiveWallStore } from "@/store/constructor2d/store/useInteractiveWallStore";
import {
  calculateMouseDistanceByAxes
} from "./utils/Math";

interface Components {
  grid: Grid | null;
  arrowRulerActiveObject: ArrowRulerActiveObject | null;
  planner: Planner | null;
  sizeTextActiveObject: SizeTextActiveObject | null;
  startPointActiveObject: StartPointActiveObject | null;
  rulers: Rulers | null;
}

export default class Constructor2D {

  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private app2d: PIXI.Application | null = null;
  private components: Components = {
    grid: null,
    arrowRulerActiveObject: null,
    planner: null,
    sizeTextActiveObject: null,
    startPointActiveObject: null,
    rulers: null,
  };

  private constructorStore = useConstructor2DStore(); // constructor2D хранилище
  private interactiveWallStore = useC2DInteractiveWallStore();

  // Массив для хранения функций отписки
  private unwatchList: (() => void)[] = [];

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    this.container = container;
    this.canvas = canvas;

    this.unwatchList.push(
      watch (
        () => this.interactiveWallStore.activeObjectID,
        (newVal, oldVal) => {
          if (newVal === 0 && !this.interactiveWallStore.statusLeftDownMouse) {
            this.clearAllGraphics();
          }
        }
      )
    );
  }

  async init(): Promise<void> {
    if (this.app2d) return;

    this.app2d = new PIXI.Application();
    await this.app2d.init({
      canvas: this.canvas,
      resizeTo: this.container,
      backgroundColor: 0xffffff,
      antialias: true,
      resolution: window.devicePixelRatio || 1
    });
    this.app2d.stage.hitArea = this.app2d.screen;
    this.app2d.stage.eventMode = 'static';

    this.initComponents();
    this.setupInteractions();

    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private initComponents(): void {
    this.components.grid = new Grid(this.app2d!);
    this.components.arrowRulerActiveObject = new ArrowRulerActiveObject(this.app2d!);
    this.components.planner = new Planner(this.app2d!);
    this.components.startPointActiveObject = new StartPointActiveObject(this.app2d!);
    this.components.rulers = new Rulers(this.app2d!);
  }

  private handleResize(): void {
    if (this.app2d) {
      this.app2d.renderer.resize(this.container.clientWidth, this.container.clientHeight);
      if(this.components.rulers) this.components.rulers.drawRulers();
      if(this.components.grid) this.components.grid.drawGrid();
      if(this.components.grid) this.components.grid.drawGridAxisLines();
    }
  }

  public addDoor(): void {
    if (!this.components.planner) return;
    // Логика добавления двери в Store
  }

  public clearAllGraphics(): void {
    this.components.startPointActiveObject?.clearGraphic();
    this.components.arrowRulerActiveObject?.clearGraphic();
    this.components.sizeTextActiveObject?.clearGraphic();
  }

  destroy(): void {
    if (this.app2d) {
    
      // Отписываемся от всех наблюдателей
      this.unwatchList.forEach(unwatch => unwatch());
      this.unwatchList = []; // Очищаем массив наблюдателей для безопасности

      // Удаляем обработчики событий с канвы
      this.removeInteractions();

      // Удаляем resize listener
      window.removeEventListener('resize', this.handleResize.bind(this));

      // Удаляем все компоненты
      for (const key in this.components) {
        const component = this.components[key as keyof Components];
        if (component && typeof component.destroy === 'function') {
          component.destroy();
        }
        this.components[key as keyof Components] = null;
      }

      // Уничтожаем приложение PIXI
      this.app2d.destroy(true, { children: true });
      this.app2d = null;
    }
  }

  private setupInteractions(): void {
    const stage = this.app2d?.stage;

    if (!stage) return;

    stage
      .on('pointerdown', this.onClick.bind(this))
      .on('rightdown', this.onRightDown.bind(this))
      .on('rightup', this.onRightUp.bind(this))
      .on('pointerout', this.onRightUp.bind(this))
      .on('pointermove', this.onPointerMove.bind(this))
      .on('wheel', this.onWheel.bind(this));
  }

  private removeInteractions(): void {
    const stage = this.app2d?.stage;

    if (!stage) return;

    stage
      .off('pointerdown', this.onClick)
      .off('rightdown', this.onRightDown)
      .off('rightup', this.onRightUp)
      .off('pointerout', this.onRightUp)
      .off('pointermove', this.onPointerMove)
      .off('wheel', this.onWheel);
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();

    let currentScale: number = this.constructorStore.getScale;
    const scaleSpeed: number = this.constructorStore.getScaleSpeed;

    if (e.deltaY < 0) {
      currentScale += scaleSpeed;
    } else if (e.deltaY > 0) {
      currentScale -= scaleSpeed;
    }

    this.constructorStore.setScale(currentScale);
  }

  private onClick(e: PIXI.FederatedPointerEvent): void {
    e.preventDefault();

    if (!this.app2d) return;
    
    if (!this.interactiveWallStore.statusLeftDownMouse) {
      this.interactiveWallStore.setActiveObjectID(0);
    }
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
    if(this.constructorStore.mouse.rightBtn){
      this.constructorStore.toggleRightBtn();
    }
  }

  private onPointerMove(e: PIXI.FederatedPointerEvent): void {
    e.preventDefault();

    this.constructorStore.updatePositionPoint(e.global.x, e.global.y);

    if (this.constructorStore.mouse.rightBtn) {

      const { distanceX, distanceY } = calculateMouseDistanceByAxes(
        {
          x: this.constructorStore.mouse.positionPoint.x,
          y: this.constructorStore.mouse.positionPoint.y,
        },
        this.constructorStore.mouse.rightClickPosition
      );

      const newX = this.constructorStore.mouse.prevOriginOfCoordinates.x - distanceX;
      const newY = this.constructorStore.mouse.prevOriginOfCoordinates.y - distanceY;

      this.constructorStore.updateOriginOfCoordinates(
        newX < 0 ? newX : 0,
        newY < 0 ? newY : 0
      );
    }
  }
}
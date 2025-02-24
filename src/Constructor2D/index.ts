import * as PIXI from 'pixi.js';

import Grid from "./Layers/Grid";
import Rulers from "./Layers/Rulers";
import Planner from "./Layers/Planner";
import ArrowRulerActiveObject from "./Layers/ArrowRulerActiveObject";
import StartPointActiveObject from "./Layers/StartPointActiveObject";

import {
  calculateMouseDistanceByAxes
} from "./utils/Math";

interface Layers {
  grid: Grid | null;
  arrowRulerActiveObject: ArrowRulerActiveObject | null;
  planner: Planner | null;
  startPointActiveObject: StartPointActiveObject | null;
  rulers: Rulers | null;
}

export default class Constructor2D {

  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private app2d: PIXI.Application | null = null;
  public layers: Layers = {
    grid: null,
    arrowRulerActiveObject: null,
    planner: null,
    startPointActiveObject: null,
    rulers: null,
  };

  public config: any | null = {

    scale: 1,
    speedScale: 0.01,
    minScale: 0.3,
    maxScale: 2,
    inverseScale: 1,

    originOfCoordinates: {
      x: 0,
      y: 0
    },
    
  }

  // параметры состояния
  public state: any | null = {

    mouse: {
      left: false,
      right: false,
      downCoordinates: {
        x: 0,
        y: 0
      }
    },

    keys: {
      ctrl: false,
      shift: false
    },

    oldOriginOfCoordinates: {
      x: 0,
      y: 0
    },
    
  }

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    
    if (!container || !canvas) {
      throw new Error('Container and canvas elements are required.');
    }
    this.container = container;
    this.canvas = canvas;

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
    this.app2d.stage.eventMode = 'static'; // чтобы работали события на root-контейнере

    // this.app2d?.ticker.add(() => {
    //   console.log(this.app2d?.ticker.FPS);
    // });

    this.layers.grid = new Grid(this.app2d, this);
    this.layers.arrowRulerActiveObject = new ArrowRulerActiveObject(this.app2d!, this);
    this.layers.planner = new Planner(this.app2d!, this);
    this.layers.startPointActiveObject = new StartPointActiveObject(this.app2d!, this);
    this.layers.rulers = new Rulers(this.app2d!, this);

    this.app2d.stage
      .on('rightdown', this.onRightDown.bind(this))
      .on('rightup', this.onRightUp.bind(this))
      .on('pointermove', this.onPointerMove.bind(this))
      .on('pointerout', this.onRightUp.bind(this))
      .on('pointerdown', this.onClick.bind(this))
      .on('wheel', this.onWheel.bind(this));

    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('keydown', this.handleKeyDown.bind(this)); // нажатие на кнопку backspace или другие
    
  }
  
  private onClick(e: PIXI.FederatedPointerEvent): void {
    e.preventDefault();

    if (!this.app2d) return;
    
    if (e.button !== 0) return;

    if (
      !this.state.mouse.left && 
      this.layers.planner && 
      this.layers.planner.state.activeWall
    ) {
      this.layers.planner?.deactiveWalls();
      this.layers.arrowRulerActiveObject?.clearGraphic();
      this.layers.startPointActiveObject?.activate(false);
    }

  }

  // если нажали на правую кнопку мыши в области холста
  private onRightDown(e: PIXI.FederatedPointerEvent): void {
    e.preventDefault();

    this.state.oldOriginOfCoordinates.x = this.config.originOfCoordinates.x;
    this.state.oldOriginOfCoordinates.y = this.config.originOfCoordinates.y;
    
    this.state.mouse.downCoordinates.x = e.global.x;
    this.state.mouse.downCoordinates.y = e.global.y;
    
    this.state.mouse.right = true;
    
  }

  // если отпустили правую кнопку мыши в области холста
  private onRightUp(e: PIXI.FederatedPointerEvent): void {
    e.preventDefault();
    
    this.state.mouse.right = false;
    
  }

  // если происхожит смещение курсора над областью холста
  private onPointerMove(e: PIXI.FederatedPointerEvent): void {

    e.preventDefault();

    if (this.state.mouse.right) {

      // рассчитываем расстояние между точкой клика правой кнопкой мыши и курсором
      const { distanceX, distanceY } = calculateMouseDistanceByAxes(
        {
          x: e.global.x,
          y: e.global.y,
        },
        this.state.mouse.downCoordinates
      );

      const newX = this.state.oldOriginOfCoordinates.x - distanceX;
      const newY = this.state.oldOriginOfCoordinates.y - distanceY;
  
      this.config.originOfCoordinates.x = newX <= 0 ? newX : 0;
      this.config.originOfCoordinates.y = newY <= 0 ? newY : 0;

      this.layers.grid?.drawGrid(); // обновляем сетку
      this.layers.rulers?.drawRulers(); // обновляем линейки
      this.layers.planner!.updateScenePosition(); // обновляем слой с объектами
      this.layers.arrowRulerActiveObject!.updateScenePosition(); // обновляем слой со стрелками от активной точки
      this.layers.startPointActiveObject!.updateScenePosition(); // обновляем слой со стрелками от активной точки
      
    }
    
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();

    if (!this.state.mouse.right) {

      { // set scale

        let currentScale: number = this.config.scale;
        const scaleSpeed: number = this.config.speedScale;

        if (e.deltaY < 0) {
          currentScale += scaleSpeed;
        } else if (e.deltaY > 0) {
          currentScale -= scaleSpeed;
        }

        const ns = Math.min(
          Math.max(currentScale, this.config.minScale),
          this.config.maxScale
        );

        this.config.scale = ns;

        // Если scale меньше 1, inverseScale становится больше 1, и наоборот
        if (ns < 1) {
          this.config.inverseScale = 1 / ns;
        } else {
          this.config.inverseScale = ns === 1 ? 1 : 1 / ns;
        }

        this.layers.grid!.scale = this.config.scale; // обновляем сетку
        this.layers.rulers?.drawRulers(); // обновляем линейки
        this.layers.planner!.scale = this.config.scale; // обновляем сетку
        this.layers.arrowRulerActiveObject!.scale = this.config.scale; // обновляем стрелки
        this.layers.startPointActiveObject!.scale = this.config.scale; // обновляем стрелки

      }

    }
  }

  private handleResize(): void {
    if (this.app2d) {
      this.app2d.renderer.resize(this.container.clientWidth, this.container.clientHeight);
      if(this.layers.rulers) this.layers.rulers.drawRulers();
      if(this.layers.grid) this.layers.grid.drawGrid();
    } 
  }

  private handleKeyDown(e: KeyboardEvent): void {

    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (this.layers.planner) {
        this.layers.planner.deleteSelectedObject();
      }
    }
    
  }
  
  public destroy(): void {
    if (this.app2d) {

      // Удаляем resize listener
      window.removeEventListener('resize', this.handleResize.bind(this));
      window.removeEventListener('keydown', this.handleKeyDown.bind(this));

      this.app2d.stage
        .off('rightdown', this.onRightDown.bind(this))
        .off('rightup', this.onRightUp.bind(this))
        .off('pointermove', this.onPointerMove.bind(this))
        .off('pointerout', this.onRightUp.bind(this))
        .off('pointerdown', this.onClick.bind(this))
        .off('wheel', this.onWheel.bind(this));

      // Удаляем все компоненты
      for (const key in this.layers) {
        const component = this.layers[key as keyof Layers];
        if (component && typeof component.destroy === 'function') {
          component.destroy();
        }
        this.layers[key as keyof Layers] = null;
      }

      this.state = null;
      this.config = null;

      // Уничтожаем приложение PIXI
      this.app2d.destroy(true, { children: true });
      this.app2d = null;
      
    }
    
  }

}
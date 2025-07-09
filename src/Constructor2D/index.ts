import * as PIXI from 'pixi.js';

import Grid from "./Layers/Grid";
import HalfRoom from "./Layers/HalfRoom";
import Rulers from "./Layers/Rulers";
import Planner from "./Layers/Planner";
import ArrowRulerActiveObject from "./Layers/ArrowRulerActiveObject";
import StartPointActiveObject from "./Layers/StartPointActiveObject";
import DoorsAndWindows from './Layers/DoorsAndWindows';

import {
  IConfig,
  IState,
} from './interfaces';

import { handlerMouseRightDown } from "./methods/events/handlerMouseRightDown";
import { handlerMouseRightUp } from "./methods/events/handlerMouseRightUp";
import { handlerPointerMove } from "./methods/events/handlerPointerMove";
import { handlerMouseLeftDown } from "./methods/events/handlerMouseLeftDown";
import { handlerWheel } from "./methods/events/handlerWheel";
import { handleWindowResize } from "./methods/events/handleWindowResize";
import { handleKeyDown } from "./methods/events/handleKeyDown";
import { handleKeyUp } from "./methods/events/handleKeyUp";

import { useEventBus } from '@/store/constructor2d/useEventBus';

interface Layers {
  grid: Grid | null;
  halfRoom: HalfRoom | null;
  arrowRulerActiveObject: ArrowRulerActiveObject | null;
  planner: Planner | null;
  doorsAndWindows: DoorsAndWindows | null;
  startPointActiveObject: StartPointActiveObject | null;
  rulers: Rulers | null;
}

export default class Constructor2D {

  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private app2d: PIXI.Application | null = null;
  public layers: Layers = {
    grid: null,
    halfRoom: null, // пол комнаты
    arrowRulerActiveObject: null,
    planner: null,
    doorsAndWindows: null, // двери и окна
    startPointActiveObject: null,
    rulers: null,
  };

  public config: IConfig = {

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
  public state: IState = {

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

  private handlerMouseRightDown: (e:PIXI.FederatedPointerEvent) => void;
  private handlerMouseRightUp: (e:PIXI.FederatedPointerEvent) => void;
  private handlerPointerMove: (e:PIXI.FederatedPointerEvent) => void;
  private handlerMouseLeftDown: (e:PIXI.FederatedPointerEvent) => void;
  private handlerWheel: (e: WheelEvent) => void;
  private handleWindowResize: () => void;
  private handleKeyDown: (e: KeyboardEvent) => void;
  private handleKeyUp: (e:KeyboardEvent) => void;

  public eventBus: ReturnType<typeof useEventBus> = useEventBus();

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    
    if (!container || !canvas) {
      throw new Error('Container and canvas elements are required.');
    }
    this.container = container;
    this.canvas = canvas;

    this.handlerMouseRightDown = handlerMouseRightDown.bind(this);
    this.handlerMouseRightUp = handlerMouseRightUp.bind(this);
    this.handlerPointerMove = handlerPointerMove.bind(this);
    this.handlerMouseLeftDown = handlerMouseLeftDown.bind(this);
    this.handlerWheel = handlerWheel.bind(this);
    this.handleWindowResize = handleWindowResize.bind(this);
    this.handleKeyDown = handleKeyDown.bind(this);
    this.handleKeyUp = handleKeyUp.bind(this);

  }

  async init(): Promise<void> {
    if (this.app2d) return;
        
    this.app2d = new PIXI.Application();
    await this.app2d.init({
      canvas: this.canvas,
      resizeTo: this.container,
      backgroundColor: 0xffffff,
      antialias: true,  // Аппаратное сглаживание не поддерживается
      resolution: 2,      // Суперсэмплинг 2x
      autoDensity: true,  // Автомасштабирование для HiDPI
      powerPreference: 'high-performance'
    });
    this.app2d.stage.hitArea = this.app2d.screen;
    this.app2d.stage.eventMode = 'static'; // чтобы работали события на root-контейнере

    this.layers.grid = new Grid(this.app2d, this);
    this.layers.halfRoom = new HalfRoom(this.app2d, this);
    this.layers.arrowRulerActiveObject = new ArrowRulerActiveObject(this.app2d!, this);
    this.layers.planner = new Planner(this.app2d!, this);
    this.layers.doorsAndWindows = new DoorsAndWindows(this.app2d!, this);
    this.layers.startPointActiveObject = new StartPointActiveObject(this.app2d!, this);
    this.layers.rulers = new Rulers(this.app2d!, this);

    this.app2d.stage
      .on('rightdown', this.handlerMouseRightDown)
      .on('rightup', this.handlerMouseRightUp)
      .on('pointermove', this.handlerPointerMove)
      .on('pointerout', this.handlerMouseRightUp)
      .on('pointerdown', this.handlerMouseLeftDown)
      .on('wheel', this.handlerWheel);

    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener('keydown', this.handleKeyDown); // нажатие на кнопку backspace или другие
    window.addEventListener('keyup', this.handleKeyUp);
    
  }
  
  public destroy(): void {
    if (this.app2d) {

      window.removeEventListener('resize', this.handleWindowResize);
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);

      this.app2d.stage
        .off('rightdown', this.handlerMouseRightDown)
        .off('rightup', this.handlerMouseRightUp)
        .off('pointermove', this.handlerPointerMove)
        .off('pointerout', this.handlerMouseRightUp)
        .off('pointerdown', this.handlerMouseLeftDown)
        .off('wheel', this.handlerWheel);

      // Удаляем все компоненты
      for (const key in this.layers) {
        const component = this.layers[key as keyof Layers];
        if (component && typeof component.destroy === 'function') {
          component.destroy();
        }
        this.layers[key as keyof Layers] = null;
      }

      // Уничтожаем приложение PIXI
      this.app2d.destroy(true, { children: true });
      this.app2d = null;
      
    }
    
  }

}
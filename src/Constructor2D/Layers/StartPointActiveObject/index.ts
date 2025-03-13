//@ts-nocheck

import * as PIXI from 'pixi.js';
// import { MathUtils } from "three";

import {
  Vector2,
} from "@/types/constructor2d/interfaсes";

import {
  Config,
  State
} from "./interfaces";

import {
  drawCircle,
  rectV2,
} from "../../utils/Shape";

import { handlerMouseLeftDown } from "./methods/events/handlerMouseLeftDown/index";
import { handlerMouseOver } from "./methods/events/handlerMouseOver/index";
import { handlerMouseOut } from "./methods/events/handlerMouseOut/index";
import { handlerMouseMove } from "./methods/events/handlerMouseMove/index";
import { handlerMouseUp } from "./methods/events/handlerMouseUp/index";
import { handlerCanvasMouseLeave } from "./methods/events/handlerCanvasMouseLeave/index";

import { drawAngleBetweenWalls } from "./methods/drawAngleBetweenWalls/index";

export default class StartPointActiveObject {

  private app: PIXI.Application;
  private parent: any;
  private container: PIXI.Container;
  
  private circleStartPoint: PIXI.Graphics;
  private circleEndPoint: PIXI.Graphics;

  private startPointRect: PIXI.Graphics;
  private endPointRect: PIXI.Graphics;

  private angleBetweenWalls: PIXI.Graphics; // линия арки между стенами
  private angleText: PIXI.Text; // текст отображающий угол
  private angleTextConatainer: PIXI.Container; // контейнер, в который будет добавлен текст, цель контейнера в поцизионировании на холсте
  private circleAngleMask: PIXI.Graphics; // маска окружность, чтобы вычасть из линии арки для отображения текста

  private handlerMouseLeftDown: (e:PIXI.FederatedPointerEvent) => void;
  private handlerMouseOver: (e:PIXI.FederatedPointerEvent) => void;
  private handlerMouseOut: (e:PIXI.FederatedPointerEvent) => void;
  private handlerMouseMove: (e:PIXI.FederatedPointerEvent) => void;
  private handlerMouseUp: (e:PIXI.FederatedPointerEvent) => void;
  private handlerCanvasMouseLeave: (e: MouseEvent) => void;

  private drawAngleBetweenWalls: () => void;

  private config: Config = {

    fontSize: 15,
    colorText: 0x5D6069,
    colorRect: 0xDA444C,
    colorCircle: 0x4285F4,
    colorAngleArc: 0x131313,
    
  };

  public state: State = {

    downActivePointerPosition: {x: 0, y: 0},
    
  };

  constructor(pixiApp: PIXI.Application, parent: any) {
    
    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.parent = parent;
    this.container = new PIXI.Container();
    this.container.x = 30;
    this.container.y = 30;
    this.app.stage.addChild(this.container);
    
    this.startPointRect = new PIXI.Graphics();
    this.container.addChild(this.startPointRect);
    this.endPointRect = new PIXI.Graphics();
    this.container.addChild(this.endPointRect);

    this.circleStartPoint = new PIXI.Graphics();
    (this.circleStartPoint as PIXI.Graphics & { indexPoint: number }).indexPoint = 0;
    this.circleStartPoint.eventMode = 'static';
    this.container.addChild(this.circleStartPoint);
    
    this.circleEndPoint = new PIXI.Graphics();
    (this.circleEndPoint as PIXI.Graphics & { indexPoint: number }).indexPoint = 1;
    this.circleEndPoint.eventMode = 'static';
    this.container.addChild(this.circleEndPoint);
    
    this.angleBetweenWalls = new PIXI.Graphics();
    this.container.addChild(this.angleBetweenWalls);
    this.circleAngleMask = new PIXI.Graphics();
    this.container.addChild(this.circleAngleMask);
    this.angleText = new PIXI.Text({
      text: "",
      style: {
        fontSize: this.config.fontSize,
        fill: this.config.colorText
      }
    });
    this.angleTextConatainer = new PIXI.Container();
    this.angleTextConatainer.addChild(this.angleText);
    this.container.addChild(this.angleTextConatainer);

    this.handlerMouseLeftDown = handlerMouseLeftDown.bind(this);
    this.handlerMouseOver = handlerMouseOver.bind(this);
    this.handlerMouseOut = handlerMouseOut.bind(this);
    this.handlerMouseMove = handlerMouseMove.bind(this);
    this.handlerMouseUp = handlerMouseUp.bind(this);
    this.handlerCanvasMouseLeave = handlerCanvasMouseLeave.bind(this);

    this.drawAngleBetweenWalls = drawAngleBetweenWalls.bind(this);

    // рисуем графику
    this.initGraphic();
    
    this.setupInteractions();

  }

  private initGraphic(): void {

    { // start point

      rectV2(
        this.startPointRect,
        {
          center: {x: 0, y: 0}, 
          width: 10,
          height: 10,
          lineColor: this.config.colorRect, // Цвет обводки (по умолчанию чёрный)
          lineWidth: 1, // Толщина линии обводки
          angleDegrees: 0
        }
      );

      // синяя точка
      drawCircle(
        this.circleStartPoint,
        {x: 0, y: 0},
        10, 
        this.config.colorCircle
      );

    }

    { // end point

      rectV2(
        this.endPointRect,
        {
          center: {x: 0, y: 0}, 
          width: 10,
          height: 10,
          lineColor: this.config.colorRect, // Цвет обводки (по умолчанию чёрный)
          lineWidth: 1, // Толщина линии обводки
          angleDegrees: 0
        }
      );

      // прозрачная точка
      drawCircle(
        this.circleEndPoint,
        {x: 0, y: 0},
        10, 
        "rgba(0,0,0,0)"
      );
      
    }

    this.container.visible = false;

  }

  public setupInteractions(): void {

    this.circleStartPoint // события для стартовой точки
      .on('pointerdown', this.handlerMouseLeftDown) //.handleMouseDown.bind(this, 0)) // если нажали на точку стены
      .on("mouseover", this.handlerMouseOver)
      .on("mouseout", this.handlerMouseOut);

    this.circleEndPoint // события для конечной точки
      .on('pointerdown', this.handlerMouseLeftDown) //handleMouseDown.bind(this, 1)) // если нажали на точку стены
      .on("mouseover", this.handlerMouseOver)
      .on("mouseout", this.handlerMouseOut);

    this.app.stage
      .on('pointermove', this.handlerMouseMove)
      .on('pointerup', this.handlerMouseUp);

    this.app.renderer.canvas.addEventListener("mouseleave", this.handlerCanvasMouseLeave);

  }

  // включены точки
  public activate(value: [Vector2, Vector2] | false = false) {

    if(value){

      if(!value[0] || !value[1]) return;

      const indexPoint = this.parent.layers.planner.state.activePointWall;

      { // start point
        const p: Vector2 = {
          x: value[0].x < 0 ? 0 : value[0].x,
          y: value[0].y < 0 ? 0 : value[0].y,
        };

        this.circleStartPoint.x = p.x;
        this.circleStartPoint.y = p.y;
        this.startPointRect.x = p.x
        this.startPointRect.y = p.y;
        
        this.startPointRect.visible = indexPoint == 0 ? true : false;

      }

      { // end point
        const p: Vector2 = { // point position
          x: value[1].x < 0 ? 0 : value[1].x,
          y: value[1].y < 0 ? 0 : value[1].y,
        };

        this.circleEndPoint.x = p.x;
        this.circleEndPoint.y = p.y;
        this.endPointRect.x = p.x;
        this.endPointRect.y = p.y;

        this.endPointRect.visible = indexPoint == 1 ? true : false;
        
      }

      this.drawAngleBetweenWalls();
      
      this.container.visible = true;
      
    }else{

      this.container.visible = false;
      
    }
    
  }

  private getPointerPosition(x: number, y:number): Vector2 {

    const co = this.parent.config.originOfCoordinates;
    const inverseScale = this.parent.config.inverseScale;

    return {
      x: (x - co.x - 30) * inverseScale,
      y: (y - co.y - 30) * inverseScale,
    };
    
  }

  public updateScenePosition(): void {

    this.container!.x = this.parent.config.originOfCoordinates.x + 30;
    this.container!.y = this.parent.config.originOfCoordinates.y + 30;
    
  }

  public set scale(v: number) {
    this.container!.scale.set(v);
  }

  public destroy(): void {

    this.app.stage
      .off('pointermove', this.handlerMouseMove)
      .off('pointerup', this.handlerMouseUp);

    this.circleStartPoint
      .off('pointerdown', this.handlerMouseLeftDown)
      .off('mouseover', this.handlerMouseOver)
      .off('mouseout', this.handlerMouseOut);

    this.circleEndPoint
      .off('pointerdown', this.handlerMouseLeftDown)
      .off('mouseover', this.handlerMouseOver)
      .off('mouseout', this.handlerMouseOut);

    this.app.renderer.canvas.removeEventListener("mouseleave", this.handlerCanvasMouseLeave);

    // Очистка и уничтожение графики
    [
      this.circleStartPoint, 
      this.circleEndPoint, 
      this.startPointRect, 
      this.endPointRect,
      this.circleAngleMask,
      this.angleText,
      this.angleTextConatainer,
      this.angleBetweenWalls,
    ].forEach(graphic => {
      if (graphic) {
        graphic.destroy(true);
        this.container.removeChild(graphic);
      }
    });

    // Удаление контейнера
    if (this.container) {
      this.app.stage.removeChild(this.container);
      this.container.destroy({ children: true, texture: true });
    }

    // Обнуление свойств
    this.circleStartPoint = null!;
    this.circleEndPoint = null!;
    this.startPointRect = null!;
    this.endPointRect = null!;
    this.circleAngleMask = null!;
    this.angleText = null!;
    this.angleTextConatainer = null!;
    this.container = null!;
    this.app = null!;

  }

};
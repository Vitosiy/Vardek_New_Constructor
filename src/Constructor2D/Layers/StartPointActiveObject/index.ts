import * as PIXI from 'pixi.js';
import { MathUtils } from "three";

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

export default class StartPointActiveObject {

  private app: PIXI.Application;
  private parent: any;
  private container: PIXI.Container;
  
  private circleStartPoint: PIXI.Graphics;
  private circleEndPoint: PIXI.Graphics;

  private startPointRect: PIXI.Graphics;
  private endPointRect: PIXI.Graphics;

  private angleText: PIXI.Text; // текст отображающий угол
  private angleTextConatainer: PIXI.Container; // контейнер, в который будет добавлен текст, цель контейнера в поцизионировании на холсте
  private circleAngleMask: PIXI.Graphics; // маска окружность, чтобы вычасть из линии арки для отображения текста

  private config: Config = {

    fontSize: 15,
    colorText: 0x5D6069,
    colorRect: 0xDA444C,
    colorCircle: 0x4285F4,
    
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
    this.circleStartPoint.eventMode = 'static';
    this.container.addChild(this.circleStartPoint);
    
    this.circleEndPoint = new PIXI.Graphics();
    this.circleEndPoint.eventMode = 'static';
    this.container.addChild(this.circleEndPoint);
    
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
      .on('pointerdown', this.handleMouseDown.bind(this, 0)) // если нажали на точку стены
      .on("mouseover", this.handlerOverEventGraphic.bind(this, this.circleStartPoint, 0))
      .on("mouseout", this.handlerOutEventGraphic.bind(this, this.circleStartPoint));

    this.circleEndPoint // события для конечной точки
      .on('pointerdown', this.handleMouseDown.bind(this, 1)) // если нажали на точку стены
      .on("mouseover", this.handlerOverEventGraphic.bind(this, this.circleEndPoint, 1))
      .on("mouseout", this.handlerOutEventGraphic.bind(this, this.circleEndPoint));

    this.app.stage
      .on('pointermove', this.handleMouseMove.bind(this))
      .on('pointerup', this.handleMouseUp.bind(this));
    this.app.renderer.canvas.addEventListener("mouseleave", this.handleMouseAppOut.bind(this));

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

  // при меремещении мышки с зажатой левой кнопкой мышки
  private handleMouseMove(e: PIXI.FederatedPointerEvent): void {

    e.preventDefault();

    e.stopPropagation(); // Останавливаем всплытие события

    const indexPoint = this.parent.layers.planner.state.activePointWall;

    if (
      this.parent.state.mouse.left &&
      indexPoint != null
    ) {
  
      const __position = this.getPointerPosition(e.global.x, e.global.y);

      { // меняем позицию индикатора активной точки
    
        const position: Vector2 = {
          x: __position.x < 0 ? 0 : __position.x,
          y: __position.y < 0 ? 0 : __position.y,
        };
        
        if(indexPoint == 0){
          this.circleStartPoint.x = position.x;
          this.circleStartPoint.y = position.y;
          this.startPointRect.x = position.x
          this.startPointRect.y = position.y;
        }else if(indexPoint == 1){
          this.circleEndPoint.x = position.x;
          this.circleEndPoint.y = position.y;
          this.endPointRect.x = position.x;
          this.endPointRect.y = position.y;
        }

        this.parent.layers.planner.updateWallPoint(position);

      }
  
    }

  }

  private handleMouseDown(indexPoint: number, e: PIXI.FederatedPointerEvent): void {

    e.preventDefault();

    e.stopPropagation(); // Останавливаем всплытие события
    
    if(indexPoint == 0){
      this.circleStartPoint.cursor = "pointer";
    }else if(indexPoint == 1){
      this.circleEndPoint.cursor = "pointer";
    }
    this.app.stage.cursor = "pointer";

    // эта переменная для того, чтобы потом корректно перемещать активную точку по холсту
    this.state.downActivePointerPosition = this.getPointerPosition(e.global.x, e.global.y);

    this.parent.layers.planner.state.activePointWall = indexPoint;
    this.parent.state.mouse.left = true;

    const dataWall: { id: string, points: Vector2[] } | undefined = 
      this.parent.layers.planner.objectWalls.find((el: { id: string }) => el.id === this.parent.layers.planner.state.activeWall);
    if(dataWall) this.parent.layers.arrowRulerActiveObject.draw(dataWall.points[indexPoint]);
    
  }
 
  private handleMouseUp (e: PIXI.FederatedPointerEvent): void {

    e.preventDefault();
    
    e.stopPropagation(); // Останавливаем всплытие события
    this.parent.state.mouse.left = false;

    this.parent.layers.planner.updateRoomStore(null, true);
    
  }
    
  private handlerOverEventGraphic(graphic: PIXI.Graphics, indexPoint: number): void{

    graphic.cursor = "pointer";
    this.app.stage.cursor = "pointer";

    if(!this.parent.state.mouse.left){
      const dataWall: { id: string, angleDegrees: number } | undefined = 
        this.parent.layers.planner.objectWalls.find((el: { id: string }) => el.id === this.parent.layers.planner.state.activeWall);
      if(dataWall){
        if(indexPoint == 0){
          this.startPointRect.rotation = MathUtils.degToRad(dataWall.angleDegrees);
        }else if(indexPoint == 1){
          this.endPointRect.rotation = MathUtils.degToRad(dataWall.angleDegrees);
        }
      }
    }
    
    if(indexPoint == 0){
      this.startPointRect.visible = true;
      this.endPointRect.visible = false;
    }else if(indexPoint == 1){
      this.startPointRect.visible = false;
      this.endPointRect.visible = true;
    }

  }

  private handlerOutEventGraphic(graphic: PIXI.Graphics): void{

    graphic.cursor = "defalut";

    if(!this.parent.state.mouse.left){
      this.app.stage.cursor = "default";
      this.startPointRect.visible = false;
      this.endPointRect.visible = false;
    }

  }

  private handleMouseAppOut(e: MouseEvent): void {

    e.preventDefault();
    this.parent.state.mouse.left = false;
    this.circleStartPoint.cursor = "defalut";
    this.endPointRect.cursor = "defalut";
    this.app.stage.cursor = "default";
    this.startPointRect.visible = false;
    this.endPointRect.visible = false;

  }

  public updateScenePosition(): void {

    this.container!.x = this.parent.config.originOfCoordinates.x + 30;
    this.container!.y = this.parent.config.originOfCoordinates.y + 30;
    
  }

  public set scale(v: number) {
    this.container!.scale.set(v);
  }

  public destroy(): void {

    this.app.stage.off('pointermove');
    this.app.stage.off('pointerup');

    this.circleStartPoint.off('pointerdown');
    this.circleStartPoint.off('mouseover');
    this.circleStartPoint.off('mouseout');

    this.circleEndPoint.off('pointerdown');
    this.circleEndPoint.off('mouseover');
    this.circleEndPoint.off('mouseout');

    this.app.renderer.canvas.removeEventListener("mouseleave", this.handleMouseAppOut.bind(this));

    // Очистка и уничтожение графики
    [
      this.circleStartPoint, 
      this.circleEndPoint, 
      this.startPointRect, 
      this.endPointRect,
      this.circleAngleMask,
      this.angleText,
      this.angleTextConatainer,
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

}
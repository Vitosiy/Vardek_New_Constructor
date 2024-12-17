import {
  watch,
  ref
} from 'vue';
import * as PIXI from 'pixi.js';
// import { useGridStore } from '@/store/constructor2d/store/useGridStore';
// import { useRulers2DStore } from '@/store/constructor2d/store/useRulersStore';
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";
import { usePlanner2DStore } from "@/store/constructor2d/store/usePlannerStore";
import { useC2DInteractiveWallStore } from "@/store/constructor2d/store/useInteractiveWallStore";

import {
  PlannerObject,
  // PlannerObjectContainers,
  // Vector2,
} from "@/types/constructor2d/interfaсes";

import { 
  configWall
} from "@/store/constructor2d/data/usePlannerData";

import { 
  // rect,
  // drawVerticalLines,
  // drawDashedOutline,
  // drawArrow,
  // drawArrowHead,
  drawCircle,
  rectV2,
} from "../../utils/Shape";

export default class StartPointActiveObject {

  private app: PIXI.Application;
  private container: PIXI.Container;
  
  private circleStartPoint: PIXI.Graphics;
  private circleEndPoint: PIXI.Graphics;

  private startPointRect: PIXI.Graphics;
  private endPointRect: PIXI.Graphics;
  
  // private gridStore = useGridStore();
  // private rulerStore = useRulers2DStore();
  private constructorStore = useConstructor2DStore();
  private plannerStore = usePlanner2DStore();
  private interactiveWallStore = useC2DInteractiveWallStore();

  constructor(pixiApp: PIXI.Application) {

    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.container = new PIXI.Container();
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

    this.setupInteractions();
    
    // отслеживаем изменения в объекте
    watch(
      () => this.plannerStore.objects.map(obj => ({ ...obj })), // "Копируем" объекты для отслеживания
      (newVal, oldVal) => {
        newVal.forEach((newObject, index) => {
          const oldObject = oldVal?.[index];
    
          if (oldObject && JSON.stringify(newObject) !== JSON.stringify(oldObject)) {
            // Если объект изменился
            const updatedObject = JSON.parse(JSON.stringify(newObject));
            this.draw(updatedObject); // Выполняем действие с изменённым объектом
          }
        });
      },
      { deep: true } // Глубокое слежение за изменениями
    );

    watch(
      () => this.constructorStore.originOfCoordinates,
      (newValue) => {

        const cX = newValue.x;
        const cY = newValue.y;
        
        this.container.position.set(cX, cY);
        
      },
      { deep: true } // Необходим, чтобы отслеживать изменения вложенных объектов
    );

    watch (
      () => this.interactiveWallStore.activeObjectID,
      (newVal, oldVal) => {

        if(newVal){
          const obj = JSON.parse(JSON.stringify(this.plannerStore.getObjectById(newVal)));
          this.interactiveWallStore.setActivePoint(0);
          this.draw(obj);
        }

      }
    );

    watch(
      () => this.constructorStore.scale,
      (newValue) => {
        
        this.container.scale.set(newValue);
        
      }
    );

  }

  public draw(obj: PlannerObject): void {

    if(!obj.points) return;

    this.container.visible = true;
    this.container.x = 30;
    this.container.y = 30;
    
    this.interactiveWallStore.setActiveObjectID(obj.id);

    { // start point
      const position = obj.points[0];

      this.circleStartPoint.clear();

      if(this.interactiveWallStore.activePoint != null && this.interactiveWallStore.activePoint == 0){
        this.startPointRect.visible = true;
      }else{
        this.startPointRect.visible = false;
      }
      rectV2(
        this.startPointRect,
        {
          center: position, 
          width: 10,
          height: 10,
          // fillColor: "rgba(255,0,0,0.0)", // Цвет заливки (по умолчанию красный)
          lineColor: configWall.color.arrowHeadWall, // Цвет обводки (по умолчанию чёрный)
          lineWidth: 1         // Толщина линии обводки
        }
      );

      // синяя точка
      drawCircle(
        this.circleStartPoint,
        position,
        10, 
        configWall.color.mediumBlue
      );

    }

    { // end point

      const position = obj.points[1];

      this.circleEndPoint.clear();

      if(this.interactiveWallStore.activePoint != null && this.interactiveWallStore.activePoint == 1){
        this.endPointRect.visible = true;
      }else{
        this.endPointRect.visible = false;
      }
      rectV2(
        this.endPointRect,
        {
          center: position, 
          width: 10,
          height: 10,
          // fillColor: "rgba(255,0,0,0.0)", // Цвет заливки (по умолчанию красный)
          lineColor: configWall.color.arrowHeadWall, // Цвет обводки (по умолчанию чёрный)
          lineWidth: 1         // Толщина линии обводки
        }
      );

      // синяя точка
      drawCircle(
        this.circleEndPoint,
        position,
        10, 
        "rgba(255,0,0,0.0)"
      );
      
    }
    
  }

  private setupInteractions(): void {

    this.circleStartPoint
      // если нажали на точку стены
      .on('pointerdown', this.handleMouseDown.bind(this, 0))
      // если отпустили кнопку на точке стены
      .on('pointerup', this.handleMouseUp.bind(this));

    this.circleEndPoint
      // если нажали на точку стены
      .on('pointerdown', this.handleMouseDown.bind(this, 1))
      // если отпустили кнопку на точке стены
      .on('pointerup', this.handleMouseUp.bind(this));

    // если перемещаем курсор с нажатой кнопкой 
    this.app.stage.on('pointermove', this.handleMouseMove.bind(this));

  }

  private handleMouseDown(indexPoint: number, e: PIXI.FederatedPointerEvent): void {

    e.preventDefault();

    this.interactiveWallStore.setActivePoint(indexPoint);
    this.interactiveWallStore.setStatusLeftDownMouse(true);
    this.handleMouseMove(e);

    e.stopPropagation(); // Останавливаем всплытие события
    
  }

  private handleMouseUp (e: PIXI.FederatedPointerEvent): void {

    e.preventDefault();

    this.interactiveWallStore.setStatusLeftDownMouse(false);
    
    e.stopPropagation(); // Останавливаем всплытие события
    
  }

  private handleMouseMove (e: PIXI.FederatedPointerEvent): void {

    e.preventDefault();
    
    if(this.interactiveWallStore.statusLeftDownMouse && this.interactiveWallStore.activePoint != null){
      
      const co = this.constructorStore.getOriginOfCoordinates;

      this.plannerStore.setNewPointPosition(
        this.interactiveWallStore.activeObjectID,
        this.interactiveWallStore.activePoint,
        {
          x: e.data.global.x - co.x,
          y: e.data.global.y - co.y
        }
      );

    }
    
    e.stopPropagation(); // Останавливаем всплытие события
    
  }

  public clearGraphic(): void{

    this.container.visible = false;
    
  }

}
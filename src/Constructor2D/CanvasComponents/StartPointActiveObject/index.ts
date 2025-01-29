import {
  watch,
  // ref
} from 'vue';
import * as PIXI from 'pixi.js';
import { MathUtils } from "three";
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

import {
  getAngleBetweenVectors,
  offsetVectorBySegment,
  rotatePoint
} from "../../utils/Math";

export default class StartPointActiveObject {

  private app: PIXI.Application;
  private container: PIXI.Container;
  
  private circleStartPoint: PIXI.Graphics;
  private circleEndPoint: PIXI.Graphics;

  private startPointRect: PIXI.Graphics;
  private endPointRect: PIXI.Graphics;

  private angleText: PIXI.Text; // текст отображающий угол
  private angleTextConatainer: PIXI.Container; // контейнер, в который будет добавлен текст, цель контейнера в поцизионировании на холсте
  private circleAngleMask: PIXI.Graphics; // маска окружность, чтобы вычасть из линии арки для отображения текста
  
  // private gridStore = useGridStore();
  // private rulerStore = useRulers2DStore();
  private constructorStore = useConstructor2DStore();
  private plannerStore = usePlanner2DStore();
  private interactiveWallStore = useC2DInteractiveWallStore();

  // Массив для хранения функций отписки
  private unwatchList: (() => void)[] = [];

  constructor(pixiApp: PIXI.Application) {

    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
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
        fontSize: 15,
        fill: 0x5D6069
      }
    });
    this.angleTextConatainer = new PIXI.Container();
    this.angleTextConatainer.addChild(this.angleText);
    this.container.addChild(this.angleTextConatainer);

    this.setupInteractions();
    
    this.unwatchList.push(
      // отслеживаем изменения в объекте
      watch(
        () => this.plannerStore.objects.map(obj => ({ ...obj })), // "Копируем" объекты для отслеживания
        (newVal, oldVal) => {
          newVal.forEach((newObject, index) => {
            const oldObject = oldVal?.[index];
      
            if(!oldObject || newObject.updateTime === oldObject.updateTime){
              if (oldObject && JSON.stringify(newObject) !== JSON.stringify(oldObject)) {
                // Если объект изменился
                const updatedObject = JSON.parse(JSON.stringify(newObject));
                this.draw(updatedObject); // Выполняем действие с изменённым объектом
              }
            }

          });
        },
        { deep: true } // Глубокое слежение за изменениями
      )
    );

    this.unwatchList.push(
      watch(
        () => this.constructorStore.originOfCoordinates,
        (newValue) => {

          const cX = 30 + newValue.x;
          const cY = 30 + newValue.y;
          
          this.container.position.set(cX, cY);
          
        },
        { deep: true } // Необходим, чтобы отслеживать изменения вложенных объектов
      )
    );

    this.unwatchList.push(
      watch (
        () => this.interactiveWallStore.activeObjectID,
        (newVal) => {

          if(newVal){
            const obj = JSON.parse(JSON.stringify(this.plannerStore.getObjectById(newVal)));
            this.interactiveWallStore.setActivePoint(0);
            this.draw(obj);
          }

        }
      )
    );

    this.unwatchList.push(
      watch(
        () => this.constructorStore.scale,
        (newValue) => {
          
          this.container.scale.set(newValue);
          
        }
      )
    );

  }

  public draw(obj: PlannerObject): void {

    if(!obj.points) return;

    this.container.visible = true;

    { // start point
      const position = obj.points[0];

      this.circleStartPoint.clear();
      this.circleAngleMask.clear();
      this.angleText.text = "";

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
          lineColor: configWall.color.arrowLineWall, // Цвет обводки (по умолчанию чёрный)
          lineWidth: 1, // Толщина линии обводки
          angleDegrees: configWall.angleDegrees + obj.angleDegrees
        }
      );

      // синяя точка
      drawCircle(
        this.circleStartPoint,
        position,
        10, 
        configWall.color.mediumBlue
      );

      { // рисуем арку и показываем угол

        if(obj.mergeWalls.wallPoint1){

          const mergeWallPoint0 = JSON.parse(JSON.stringify(this.plannerStore.getObjectById(obj.mergeWalls.wallPoint1)));

          const p0 = mergeWallPoint0.points[0];
          const p1 = obj.points[0];
          const p2 = obj.points[1];

          const vAngle = -getAngleBetweenVectors(p1, p0, p2);

          const degTextAngle = vAngle < 0 ? 360 + vAngle : vAngle
          
          const radius = Math.max(24, 120 - (degTextAngle * 96 / 90));

          const startAngle = MathUtils.degToRad(obj.angleDegrees); // Начинаем арку перпендикулярно линии (p1, p2)
          const endAngle = MathUtils.degToRad(vAngle + obj.angleDegrees);   // Заканчиваем арку перпендикулярно линии (p0, p1)

          this.circleStartPoint.arc(p1.x, p1.y, radius, startAngle, endAngle);
          this.circleStartPoint.stroke({ width: 1, color: configWall.color.borderLine });

          /*
          angleText
          angleTextConatainer
          circleAngleMask
          */

          {          

            const circlePointOffsetSegment = offsetVectorBySegment(
              [p1, p2],
              p1,
              radius
            );

            const angle = (vAngle < 0 ? -((360-vAngle) / 2) : (vAngle / 2));

            const circlePosition = rotatePoint(
              circlePointOffsetSegment,
              p1,
              angle
            );
            
            // рисуем кружок
            // this.circleAngleMask.circle(circlePosition.x, circlePosition.y, 10);
            // this.circleAngleMask.fill({
            //   color: 0xffffff
            // });

            this.angleTextConatainer.position.x = circlePosition.x;
            this.angleTextConatainer.position.y = circlePosition.y;
            this.angleText.text = degTextAngle.toFixed(2).replace('.', ',') + "°";

          }

        }

      }

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
          lineColor: configWall.color.arrowLineWall, // Цвет обводки (по умолчанию чёрный)
          lineWidth: 1, // Толщина линии обводки
          angleDegrees: configWall.angleDegrees + obj.angleDegrees
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

    const startPoint = this.circleStartPoint;
    const endPoint = this.circleEndPoint;

    startPoint
      // если нажали на точку стены
      .on('pointerdown', this.handleMouseDown.bind(this, 0))
      // если отпустили кнопку на точке стены
      .on('pointerup', this.handleMouseUp.bind(this))
      .on("mouseover", () => { startPoint.cursor = "pointer"; })
      .on("mouseout", () => { startPoint.cursor = "default"; });

    endPoint
      // если нажали на точку стены
      .on('pointerdown', this.handleMouseDown.bind(this, 1))
      // если отпустили кнопку на точке стены
      .on('pointerup', this.handleMouseUp.bind(this))
      .on("mouseover", () => { endPoint.cursor = "pointer"; })
      .on("mouseout", () => { endPoint.cursor = "default"; });

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

  private handleMouseMove(e: PIXI.FederatedPointerEvent): void {
    e.preventDefault();
  
    if (
      this.interactiveWallStore.statusLeftDownMouse &&
      this.interactiveWallStore.activePoint != null
    ) {
      const co = this.constructorStore.getOriginOfCoordinates;
      const inverseScale = this.constructorStore.getInverseScale;
  
      const mousePosition = {
        x: (e.global.x - co.x - 30) * inverseScale,
        y: (e.global.y - co.y - 30) * inverseScale,
      };
  
      const __activeWall = this.plannerStore.getObjectById(
        this.interactiveWallStore.activeObjectID
      );
      const wall = JSON.parse(JSON.stringify(__activeWall));
  
      // Обновляем позицию активной точки
      this.plannerStore.setNewPointPosition(
        this.interactiveWallStore.activeObjectID,
        this.interactiveWallStore.activePoint,
        mousePosition
      );
  
      // Обрабатываем привязанные стены
      if (this.interactiveWallStore.activePoint === 0 && wall.mergeWalls.wallPoint1 !== null) {
        this.plannerStore.setNewPointPosition(
          wall.mergeWalls.wallPoint1,
          1,
          mousePosition
        );
      } else if (this.interactiveWallStore.activePoint === 1 && wall.mergeWalls.wallPoint0 !== null) {
        this.plannerStore.setNewPointPosition(
          wall.mergeWalls.wallPoint0,
          0,
          mousePosition
        );
      }
  
      // Обновляем соединённые стены, если есть слияние
      if (wall.mergeWalls.wallPoint1 !== null || wall.mergeWalls.wallPoint0 !== null) {
        this.plannerStore.updatedMergeWalls(this.interactiveWallStore.activeObjectID);
      }
    }
  
    e.stopPropagation(); // Останавливаем всплытие события
  }
  

  public clearGraphic(): void{

    this.container.visible = false;
    
  }

  public destroy(): void {

    // Отписываемся от всех наблюдателей
    this.unwatchList.forEach(unwatch => unwatch());
    this.unwatchList = []; // Очищаем массив для безопасности

    this.circleStartPoint.off('pointerdown');
    this.circleStartPoint.off('pointerup');

    this.circleEndPoint.off('pointerdown');
    this.circleEndPoint.off('pointerup');

    this.app.stage.off('pointermove', this.handleMouseMove);

    // Очистка и уничтожение графики
    [this.circleStartPoint, this.circleEndPoint, this.startPointRect, this.endPointRect].forEach(graphic => {
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
    this.container = null!;
    this.app = null!;
  }


}
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
import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition";

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
  private roomStore = useSchemeTransition();

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
            this.circleAngleMask.circle(circlePosition.x, circlePosition.y, 10);
            this.circleAngleMask.fill({
              color: 0xffffff
            });

            this.angleText.text = degTextAngle.toFixed(2).replace('.', ',') + "°";

            this.angleTextConatainer.pivot.x = 5; // this.angleText.width / 2;
            this.angleTextConatainer.pivot.y = this.angleText.height / 2;

            this.angleTextConatainer.rotation = MathUtils.degToRad(angle + obj.angleDegrees);

            this.angleTextConatainer.position.x = circlePosition.x;
            this.angleTextConatainer.position.y = circlePosition.y;

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
      if(!__activeWall) return;
      const wall = JSON.parse(JSON.stringify(__activeWall));
      
      const countObject = this.plannerStore.getCountObjects;
      
      if (countObject > 2){
        // если при перемещении точки стены попадает на другую точку другой стены, то делаем слияние
        if (this.interactiveWallStore.activePoint === 0 && wall.mergeWalls.wallPoint1 === null) {

          const hoverPointObject: { id: number; indexPoint: number } | null = 
            this.plannerStore.getPointByPosition({
              x: mousePosition.x,
              y: mousePosition.y
            });

          if(hoverPointObject){
        
            this.constructorStore.setHoverObject(
              hoverPointObject.id,
              hoverPointObject.indexPoint
            );
            
            // присоединяем объект к точке
            if(hoverPointObject.indexPoint === 1){ // если курсор над точкой 1
        
              const __hoverObj = this.plannerStore.getObjectById(hoverPointObject.id); // находим объект которому принадлежит точка 1

              if(__hoverObj){
                
                const hoverObj = JSON.parse(JSON.stringify(__hoverObj));

                if(hoverObj.mergeWalls.wallPoint0 === null){

                  // присвваиваем положение точки 1 найденного объекта новому
                  mousePosition.x = hoverObj.points[1].x;
                  mousePosition.y = hoverObj.points[1].y;

                  __activeWall.mergeWalls.wallPoint1 = hoverPointObject.id;
                  __hoverObj.mergeWalls.wallPoint0 = wall.id;
                  
                }

              }

            }

          }

        } else if (this.interactiveWallStore.activePoint === 1 && wall.mergeWalls.wallPoint0 === null) {

          const hoverPointObject: { id: number; indexPoint: number } | null = 
            this.plannerStore.getPointByPosition({
              x: mousePosition.x,
              y: mousePosition.y
            });

          if(hoverPointObject){
        
            this.constructorStore.setHoverObject(
              hoverPointObject.id,
              hoverPointObject.indexPoint
            );
            
            // присоединяем объект к точке
            if(hoverPointObject.indexPoint === 0){ // если курсор над точкой 1
        
              const __hoverObj = this.plannerStore.getObjectById(hoverPointObject.id); // находим объект которому принадлежит точка 1

              if(__hoverObj){
                
                const hoverObj = JSON.parse(JSON.stringify(__hoverObj));

                if(hoverObj.mergeWalls.wallPoint1 === null){

                  // присвваиваем положение точки 1 найденного объекта новому
                  mousePosition.x = hoverObj.points[0].x;
                  mousePosition.y = hoverObj.points[0].y;

                  __activeWall.mergeWalls.wallPoint0 = hoverPointObject.id;
                  __hoverObj.mergeWalls.wallPoint1 = wall.id;
                  
                }

              }

            }
            
          }

        }
      }
  
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
    
      { // Обновляем стену в схеме
        const __activeObject = this.plannerStore.getObjectById(this.interactiveWallStore.getActiveObjectID);
        const activeObject = JSON.parse(JSON.stringify(__activeObject));
  
        this.roomStore.setWall({
          idRoom: this.roomStore.getSchemeTransitionData[0].id,
          wall: activeObject
        });
      }
  
      // Обновляем соединённые стены, если есть слияние
      if (wall.mergeWalls.wallPoint1 !== null || wall.mergeWalls.wallPoint0 !== null) {
        this.plannerStore.updatedMergeWalls(this.interactiveWallStore.activeObjectID);

        if(wall.mergeWalls.wallPoint1) {
          const wallData = JSON.parse(JSON.stringify(this.plannerStore.getObjectById(wall.mergeWalls.wallPoint1)));
          this.roomStore.setWall({
            idRoom: this.roomStore.getSchemeTransitionData[0].id,
            wall: wallData
          });
        }
        if(wall.mergeWalls.wallPoint0) {
          const wallData = JSON.parse(JSON.stringify(this.plannerStore.getObjectById(wall.mergeWalls.wallPoint0)));
          this.roomStore.setWall({
            idRoom: this.roomStore.getSchemeTransitionData[0].id,
            wall: wallData
          });
        }

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
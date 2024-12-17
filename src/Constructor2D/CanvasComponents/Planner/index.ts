import {
  watch
} from 'vue';
import * as PIXI from 'pixi.js';
import { useGridStore } from '@/store/constructor2d/store/useGridStore';
import { useRulers2DStore } from '@/store/constructor2d/store/useRulersStore';
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";
import { usePlanner2DStore } from "@/store/constructor2d/store/usePlannerStore";
import { useC2DInteractiveWallStore } from "@/store/constructor2d/store/useInteractiveWallStore";

import {
  PlannerObject,
  PlannerObjectContainers,
  Vector2,
} from "@/types/constructor2d/interfaсes";

import { 
  configWall
} from "@/store/constructor2d/data/usePlannerData";

interface DrawObjects {
  id: string | number,
  containers: PlannerObjectContainers
}

import { 
  rect,
  drawVerticalLines,
  drawDashedOutline,
  drawArrow,
  drawArrowHead,
  drawCircle,
} from "./../../utils/Shape";

export default class Planner {

  private app: PIXI.Application;
  private container: PIXI.Container;

  private activeObjectGraphic:  PIXI.Graphics;
  
  private drawObjects: DrawObjects[] = [];
  private activeObject: string | number = '';
  
  private gridStore = useGridStore();
  private rulerStore = useRulers2DStore();
  private constructorStore = useConstructor2DStore();
  private plannerStore = usePlanner2DStore();
  private interactiveWallStore = useC2DInteractiveWallStore();

  constructor(pixiApp: PIXI.Application) {
    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.container = new PIXI.Container();
    this.container.position.set(30, 30);
    this.app.stage.addChild(this.container);

    this.activeObjectGraphic = new PIXI.Graphics();
    this.app.stage.addChild(this.activeObjectGraphic);

    watch(
      () => this.plannerStore.objects.length, // Следим за длиной массива
      (newLength, oldLength) => {
        if (newLength > oldLength) {
          // Определяем, что добавлен новый объект
          const lastAddedObject = this.plannerStore.objects[newLength - 1];
          
          if (lastAddedObject) {
            const newObject = JSON.parse(JSON.stringify(lastAddedObject));
    
            if (!this.drawObjects.some((el) => el.id === newObject.id)) {
              const newDrawObject = this.createDrawObject(newObject);
              this.drawObjects.push(newDrawObject);
              this.drawObject(newObject);
            }
          }
        }
      }
    );
    
    // отслеживаем изменения в объекте
    watch(
      () => this.plannerStore.objects.map(obj => ({ ...obj })), // "Копируем" объекты для отслеживания
      (newVal, oldVal) => {
        newVal.forEach((newObject, index) => {
          const oldObject = oldVal?.[index];
    
          if (oldObject && JSON.stringify(newObject) !== JSON.stringify(oldObject)) {
            // Если объект изменился
            const updatedObject = JSON.parse(JSON.stringify(newObject));
            this.drawObject(updatedObject); // Выполняем действие с изменённым объектом
          }
        });
      },
      { deep: true } // Глубокое слежение за изменениями
    );

    watch(
      () => this.constructorStore.originOfCoordinates,
      (newValue) => {

        const cX = 30 + newValue.x;
        const cY = 30 + newValue.y;
        
        this.container.position.set(cX, cY);
        
      },
      { deep: true } // Необходим, чтобы отслеживать изменения вложенных объектов
    );

    watch(
      () => this.constructorStore.scale,
      (newValue) => {
        
        this.container.scale.set(newValue);
        
      }
    );
    
  }

  private init(): void {
    // Отрисовка сохраненной сцены
  }

  private createDrawObject(data: PlannerObject): DrawObjects {
    
    const containers = {
      root: new PIXI.Container(),
      maskWall: new PIXI.Graphics(),
      bodyWall: new PIXI.Graphics(),
      lineWall: new PIXI.Graphics(),
      startPoint: new PIXI.Graphics(),
      endPoint: new PIXI.Graphics(),
      normalIndicator: new PIXI.Graphics(),
      textWallWidth: new PIXI.Text(),
      textWallLength: new PIXI.Text(),
      eventGraphic: new PIXI.Graphics(),
    };

    this.container.addChild(containers.root);

    // containers.bodyWall.eventMode = 'static';
    // containers.lineWall.eventMode = 'static';
    // containers.startPoint.eventMode = 'static';
    // containers.endPoint.eventMode = 'static';
    // containers.normalIndicator.eventMode = 'static';
    // containers.textWallWidth.eventMode = 'static';
    // containers.textWallLength.eventMode = 'static';
    containers.eventGraphic.eventMode = 'static';
    containers.eventGraphic.on("pointerup", this.handlerEventGraphic.bind(this, data.id));

    containers.root.addChild(
      containers.maskWall,
      containers.bodyWall,
      containers.lineWall,
      containers.startPoint,
      containers.endPoint,
      containers.normalIndicator,
      containers.textWallWidth,
      containers.textWallLength,
      containers.eventGraphic,
    );

    return { id: data.id, containers };
  }

  private drawObject(data: PlannerObject): void {

    switch (data.name) {
      case "wall":
        this.drawWall(data);
        break;
    }

  }

  private drawWall(data: PlannerObject): void {

    // Найти объект по ID
    const obj = this.drawObjects.find((el) => el.id === data.id);
    if (!obj) return;
  
    // Получить контейнеры из объекта
    const { containers } = obj;

    if(data.points){
      
      // рисуем маску для wallBody
      if(containers.maskWall){
        rect(
          containers.maskWall,
          this.constructorStore.getInverseScale,
          {
            points: data.points,
            heightDirection: data.heightDirection,
            color: "rgba(255,0,0,0.3)" //configWall.color.background // Цвет заливки
          }
        );
      }

      // рисуем тело стены
      if(containers.bodyWall){
        
        drawVerticalLines(
          containers.bodyWall, // graphics
          data.points[0], // startPoint
          data.width, // width
          data.height, // height
          20, // spacing
          data.heightDirection, // heightDirection
          configWall.color.line76deg, // Цвет линий
          1, // Толщина линий
          configWall.angleDegrees + data.angleDegrees,
          this.constructorStore.getScale,
          this.constructorStore.getInverseScale
        );

        if(containers.maskWall) containers.bodyWall.mask = containers.maskWall;

        // рисуем пунктирную рамку стены
        drawDashedOutline(containers.bodyWall, data.points, this.constructorStore.getInverseScale);
        
      }
      
      // рисуем стрелку-вектор стены
      if(containers.lineWall){

        drawArrow(
          containers.lineWall,
          data.points[0],
          data.width,
          configWall.angleDegrees + data.angleDegrees, // Угол направления стрелки в градусах
          configWall.color.arrowHeadWall, // Цвет стрелки
          1, // Толщина линии
          12, // Размер треугольника (основание и высота)
          true,
          this.constructorStore.getInverseScale
        );

        // рисуем указатель внутренне стороны стены (стрелка без линии)
        drawArrowHead(
          containers.lineWall,
          data.points[0], // позиция начала стены
          data.width * 0.3, // расстояние по x от начала data.points[0], где нужно нарисовать стрелку
          0, //data.height, // number | расстояние по y от начала data.points[0], где нужно нарисовать стрелку
          {axis: "y", value: (data.heightDirection === 1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
          configWall.angleDegrees + data.angleDegrees, // Угол направления стрелки в градусах относительно data.points[0]
          configWall.color.arrowHeadWall, // Цвет стрелки
          12, // Размер треугольника (основание и высота)
          false, // не очищаем графику
          this.constructorStore.getInverseScale
        );

        /*
        // рисуем указатель начала стены (стрелка без линии)
        drawArrowHead(
          containers.lineWall,
          data.points[0], // позиция начала стены
          0, // расстояние по x от начала data.points[0], где нужно нарисовать стрелку
          (data.heightDirection === 1 ? data.height : -data.height), // number | расстояние по y от начала data.points[0], где нужно нарисовать стрелку
          {axis: "y", value: (data.heightDirection === -1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
          configWall.angleDegrees + data.angleDegrees, // Угол направления стрелки в градусах относительно data.points[0]
          configWall.color.arrowHeadWall, // Цвет стрелки
          12, // Размер треугольника (основание и высота)
          false // не очищаем графику
        );

        // рисуем указатель конца стены (стрелка без линии)
        drawArrowHead(
          containers.lineWall,
          data.points[0], // позиция начала стены
          data.width, // расстояние по x от начала data.points[0], где нужно нарисовать стрелку
          (data.heightDirection === 1 ? data.height : -data.height), // number | расстояние по y от начала data.points[0], где нужно нарисовать стрелку
          {axis: "y", value: (data.heightDirection === -1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
          configWall.angleDegrees + data.angleDegrees, // Угол направления стрелки в градусах относительно data.points[0]
          configWall.color.arrowHeadWall, // Цвет стрелки
          12, // Размер треугольника (основание и высота)
          false // не очищаем графику
        );

        drawArrowHead(
          containers.lineWall,
          data.points[0], // позиция начала стены
          data.width * 0.4, // расстояние по x от начала data.points[0], где нужно нарисовать стрелку
          0, // number | расстояние по y от начала data.points[0], где нужно нарисовать стрелку
          {axis: "y", value: (data.heightDirection === -1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
          configWall.angleDegrees + data.angleDegrees, // Угол направления стрелки в градусах относительно data.points[0]
          configWall.color.green, // Цвет стрелки
          12, // Размер треугольника (основание и высота)
          false // не очищаем графику
        );

        drawArrowHead(
          containers.lineWall,
          data.points[0], // позиция начала стены
          data.width * 0.4, // расстояние по x от начала data.points[0], где нужно нарисовать стрелку
          (data.heightDirection === -1 ? -data.height : data.height), // number | расстояние по y от начала data.points[0], где нужно нарисовать стрелку
          {axis: "y", value: (data.heightDirection === 1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
          configWall.angleDegrees + data.angleDegrees, // Угол направления стрелки в градусах относительно data.points[0]
          configWall.color.green, // Цвет стрелки
          12, // Размер треугольника (основание и высота)
          false // не очищаем графику
        );
        */
        
      }
    
      /*
      if(containers.eventGraphic){
        rect(
          containers.eventGraphic,
          {
            points: data.points,
            heightDirection: data.heightDirection,
            color: "rgba(255,255,255,0)" //configWall.color.background // Цвет заливки
          }
        );
      }
      */

      this.interactiveWallStore.activeObjectID = data.id;
      // this.activeObject = data.id;

    }
    
  }

  private handlerEventGraphic(id: number | string, e:PIXI.FederatedPointerEvent):void {

    e.preventDefault();

    // Найти объект по ID
    this.interactiveWallStore.setActiveObjectID(id);

    e.stopPropagation(); // Останавливаем всплытие события

  }

  destroy(): void {
    this.app.stage.removeChild(this.container);
  }
}
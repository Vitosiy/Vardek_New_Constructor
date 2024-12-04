import {
  watch
} from 'vue';
import * as PIXI from 'pixi.js';
import { useGridStore } from '@/store/constructor2d/store/useGridStore';
import { useRulers2DStore } from '@/store/constructor2d/store/useRulersStore';
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";
import { usePlanner2DStore } from "@/store/constructor2d/store/usePlannerStore";

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

  constructor(pixiApp: PIXI.Application) {
    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.container = new PIXI.Container();
    this.container.position.set(30, 30);
    this.app.stage.addChild(this.container);

    this.activeObjectGraphic = new PIXI.Graphics();
    this.app.stage.addChild(this.activeObjectGraphic);

    watch(
      () => this.plannerStore.objects,
      (newVal) => {
        
        const lastAddedObject = newVal[newVal.length - 1];
        
        if (lastAddedObject) {

          const newObject = JSON.parse(JSON.stringify(lastAddedObject));

          if (!this.drawObjects.some((el) => el.id === newObject.id)) {
            const newDrawObject = this.createDrawObject(newObject);
            this.drawObjects.push(newDrawObject);
            this.drawObject(newObject);
          }
          
        }

      },
      { deep: true } // Следим за глубокими изменениями в массиве
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
    };

    this.container.addChild(containers.root);

    containers.root.addChild(
      containers.maskWall,
      containers.bodyWall,
      containers.lineWall,
      containers.startPoint,
      containers.endPoint,
      containers.normalIndicator,
      containers.textWallWidth,
      containers.textWallLength
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
          {
            points: data.points,
            heightDirection: data.heightDirection,
            color: configWall.color.background // Цвет заливки
          }
        );
      }

      // рисуем тело стены
      if(containers.bodyWall){
        
        drawVerticalLines(
          containers.bodyWall, // graphics
          data.position, // startPoint
          data.width, // width
          data.height, // height
          20, // spacing
          data.heightDirection, // heightDirection
          configWall.color.line76deg, // Цвет линий
          1, // Толщина линий
          configWall.angleDegrees 
        );

        if(containers.maskWall) containers.bodyWall.mask = containers.maskWall;

        // рисуем пунктирную рамку стены
        drawDashedOutline(containers.bodyWall, data.points);
        
      }

      // рисуем стрелку-вектор стены
      if(containers.lineWall){

        drawArrow(
          containers.lineWall,
          data.position,
          data.width,
          configWall.angleDegrees, // Угол направления стрелки в градусах
          configWall.color.arrowHeadWall, // Цвет стрелки
          1, // Толщина линии
          12 // Размер треугольника (основание и высота)
        );

        // рисуем указатель внутренне стороны стены (стрелка без линии)
        drawArrowHead(
          containers.lineWall,
          data.position, // позиция начала стены
          data.width * 0.3, // расстояние по x от начала data.position, где нужно нарисовать стрелку
          0, //data.height, // number | расстояние по y от начала data.position, где нужно нарисовать стрелку
          {axis: "y", value: (data.heightDirection === 1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
          configWall.angleDegrees, // Угол направления стрелки в градусах относительно data.position
          configWall.color.arrowHeadWall, // Цвет стрелки
          12, // Размер треугольника (основание и высота)
          false // не очищаем графику
        );

        // рисуем указатель начала стены (стрелка без линии)
        drawArrowHead(
          containers.lineWall,
          data.position, // позиция начала стены
          0, // расстояние по x от начала data.position, где нужно нарисовать стрелку
          (data.heightDirection === 1 ? data.height : -data.height), // number | расстояние по y от начала data.position, где нужно нарисовать стрелку
          {axis: "y", value: (data.heightDirection === -1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
          configWall.angleDegrees, // Угол направления стрелки в градусах относительно data.position
          configWall.color.arrowHeadWall, // Цвет стрелки
          12, // Размер треугольника (основание и высота)
          false // не очищаем графику
        );

        // рисуем указатель конца стены (стрелка без линии)
        drawArrowHead(
          containers.lineWall,
          data.position, // позиция начала стены
          data.width, // расстояние по x от начала data.position, где нужно нарисовать стрелку
          (data.heightDirection === 1 ? data.height : -data.height), // number | расстояние по y от начала data.position, где нужно нарисовать стрелку
          {axis: "y", value: (data.heightDirection === -1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
          configWall.angleDegrees, // Угол направления стрелки в градусах относительно data.position
          configWall.color.arrowHeadWall, // Цвет стрелки
          12, // Размер треугольника (основание и высота)
          false // не очищаем графику
        );

        drawArrowHead(
          containers.lineWall,
          data.position, // позиция начала стены
          data.width * 0.4, // расстояние по x от начала data.position, где нужно нарисовать стрелку
          0, // number | расстояние по y от начала data.position, где нужно нарисовать стрелку
          {axis: "y", value: (data.heightDirection === -1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
          configWall.angleDegrees, // Угол направления стрелки в градусах относительно data.position
          configWall.color.green, // Цвет стрелки
          12, // Размер треугольника (основание и высота)
          false // не очищаем графику
        );

        drawArrowHead(
          containers.lineWall,
          data.position, // позиция начала стены
          data.width * 0.4, // расстояние по x от начала data.position, где нужно нарисовать стрелку
          (data.heightDirection === -1 ? -data.height : data.height), // number | расстояние по y от начала data.position, где нужно нарисовать стрелку
          {axis: "y", value: (data.heightDirection === 1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
          configWall.angleDegrees, // Угол направления стрелки в градусах относительно data.position
          configWall.color.green, // Цвет стрелки
          12, // Размер треугольника (основание и высота)
          false // не очищаем графику
        );
        
      }

      this.activeObject = data.id;

    }
    
  }

  destroy(): void {
    this.app.stage.removeChild(this.container);
  }
}
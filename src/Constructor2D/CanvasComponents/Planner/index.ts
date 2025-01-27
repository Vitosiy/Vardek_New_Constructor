import {
  watch
} from 'vue';
import * as PIXI from 'pixi.js';
// import { useGridStore } from '@/store/constructor2d/store/useGridStore';
// import { useRulers2DStore } from '@/store/constructor2d/store/useRulersStore';
import { useConstructor2DStore } from "@/store/constructor2d/store/useConstructor2DStore";
import { usePlanner2DStore } from "@/store/constructor2d/store/usePlannerStore";
import { useC2DInteractiveWallStore } from "@/store/constructor2d/store/useInteractiveWallStore";

import {
  PlannerObject,
  PlannerObjectContainers,
  // Vector2,
} from "@/types/constructor2d/interfaсes";

import { 
  getIntersectionPoint
} from "./../../utils/Math";

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
  drawShape,
  // drawCircle,
  drawLine,
} from "./../../utils/Shape";

export default class Planner {

  private app: PIXI.Application;
  container: PIXI.Container;

  private activeObjectGraphic:  PIXI.Graphics;
  
  private drawObjects: DrawObjects[] = [];

  private constructorStore = useConstructor2DStore();
  private plannerStore = usePlanner2DStore();
  private interactiveWallStore = useC2DInteractiveWallStore();

  activeWallID: string | number | null = null;

  // Массив для хранения функций отписки
  private unwatchList: (() => void)[] = [];

  constructor(pixiApp: PIXI.Application) {
    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.container = new PIXI.Container();
    this.container.position.set(30, 30);
    this.app.stage.addChild(this.container);

    this.activeObjectGraphic = new PIXI.Graphics();
    this.app.stage.addChild(this.activeObjectGraphic);

    // следим за добавлением нового объекта
    this.unwatchList.push(
      watch(
        () => this.plannerStore.objects.length, // Следим за длиной массива
        (newLength, oldLength) => {
          if (newLength > oldLength) {
            // Определяем, что добавлен новый объект
            const lastAddedObject = this.plannerStore.objects[newLength - 1];
            
            if (lastAddedObject) {
              const newObject = JSON.parse(JSON.stringify(lastAddedObject));
      
              if (!this.drawObjects.some((el) => el.id === newObject.id)) {
                if(this.activeWallID){
                  this.plannerStore.updatedObject(this.activeWallID);
                }
                this.setActiveObject("wall", newObject.id);
                const newDrawObject = this.createDrawObject(newObject);
                this.drawObjects.push(newDrawObject);
                this.drawObject(newObject);
              }
            }
          }
        }
      )
    );

    // отслеживаем изменения в объекте
    this.unwatchList.push(
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
      )
    );

    // Следим только за id и mergeWalls
    this.unwatchList.push(
      watch(
        () => this.plannerStore.objects.map(obj => ({
          id: obj.id,
          mergeWalls: { ...obj.mergeWalls }, // Делаем копию mergeWalls для отслеживания изменений
        })),
        (newVal, oldVal) => {
          newVal.forEach((newObject, index) => {
            const oldObject = oldVal?.[index];
            if (!oldObject) return;
    
            // Проверяем изменения в mergeWalls.wallPoint0 и mergeWalls.wallPoint1
            const isWallPointChanged =
              newObject.mergeWalls.wallPoint0 !== oldObject.mergeWalls.wallPoint0 ||
              newObject.mergeWalls.wallPoint1 !== oldObject.mergeWalls.wallPoint1;
    
            if (isWallPointChanged) {
              // Получаем оригинальный объект из plannerStore.objects
              const plannerObject = this.plannerStore.objects.find(obj => obj.id === newObject.id);
    
              if (plannerObject) {
                this.drawObject(plannerObject); // Передаём оригинальный объект в drawObject
              } else {
                console.warn(`Объект с ID ${newObject.id} не найден в plannerStore.objects`);
              }
            }
          });
        },
        { deep: true } // Глубокое отслеживание для вложенных объектов
      )
    );
    
    // сдедим за смещением начальной координаты сцены
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

    // следим за изменением размеры сцены (scale)
    this.unwatchList.push(
      watch(
        () => this.constructorStore.scale,
        (newValue) => {
          
          this.container.scale.set(newValue);
          
        }
      )
    );
    
  }

  // private init(): void {
  //   // Отрисовка сохраненной сцены
  // }

  // уcтановка активного объекта на сцене
  public setActiveObject(
    type: string | null = null, 
    id: string | number | null = null
  ): void {

    if(!type) return;

    if(type === 'wall'){
      this.activeWallID = id;
    }
    
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
    // Изменяем курсор на pointer при наведении
    // containers.eventGraphic.on("mouseover", () => {
    //   containers.eventGraphic.cursor = "pointer";
    // });
    // // Убираем курсор при уходе мыши
    // containers.eventGraphic.on("mouseout", () => {
    //   containers.eventGraphic.cursor = "default"; // Возвращаем стандартный курсор
    // });
    containers.eventGraphic.on("pointerdown", this.handlerEventGraphic.bind(this, data.id));

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

    const activeWallID = this.activeWallID === data.id ? true : false;

    if(data.points){
      
      { // обновление точки, если есть слияние стен

        // точка пересечения
        const mergeWalls = data.mergeWalls;
        // если стартовая точка соединена с сдругой стеной, тогда вычисляем координаты общей точки 
        if(mergeWalls.wallPoint1 !== null){
          
          const mergeObj = this.plannerStore.getObjectById(mergeWalls.wallPoint1);
          if(mergeObj){
            const wall_point1 = JSON.parse(JSON.stringify(mergeObj));
            if(wall_point1 && wall_point1.points){
              
              const interactionPoint = getIntersectionPoint(
                [data.points[2], data.points[3]],
                [wall_point1.points[2], wall_point1.points[3]]
              );

              if(interactionPoint.x != 0 && interactionPoint.y != 0) data.points[3] = interactionPoint;
              
            }
          }

        }

        // если конечная точка соединена с сдругой стеной, тогда вычисляем координаты общей точки
        if(mergeWalls.wallPoint0 !== null){

          const mergeObj = this.plannerStore.getObjectById(mergeWalls.wallPoint0);
          if(mergeObj){
            const wall_point0 = JSON.parse(JSON.stringify(mergeObj));
            if(wall_point0 && wall_point0.points){
              
              const interactionPoint = getIntersectionPoint(
                [data.points[2], data.points[3]],
                [wall_point0.points[2], wall_point0.points[3]]
              );

              if(interactionPoint.x != 0 && interactionPoint.y != 0) data.points[2] = interactionPoint;
              
            }
          }

        }
        
      }

      // рисуем маску для wallBody
      if(containers.maskWall){
        rect(
          containers.maskWall,
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
          configWall.angleDegrees + data.angleDegrees
        );

        if(containers.maskWall) containers.bodyWall.mask = containers.maskWall;

        // если эта стена активная, то рисуем пунктирную рамку, иначе сплошной линией
        if(activeWallID){
          // рисуем пунктирную рамку стены
          drawDashedOutline(containers.bodyWall, data.points);
        }else{
          // рисуем сплошную линию
          drawShape(containers.bodyWall, data.points);
        }
    
      }
      
      // рисуем стрелку-вектор стены
      if(containers.lineWall){

        if(activeWallID){
          drawArrow(
            containers.lineWall,
            data.points[0],
            data.width,
            configWall.angleDegrees + data.angleDegrees, // Угол направления стрелки в градусах
            {
              line: configWall.color.arrowLineWall, // Цвет стрелки
              head: configWall.color.arrowHeadLineWall
            },
            2, // Толщина линии
            12, // Размер треугольника (основание и высота)
            true
          );

          // рисуем указатель внутренне стороны стены (стрелка без линии)
          drawArrowHead(
            containers.lineWall,
            data.points[0], // позиция начала стены
            data.width * 0.3, // расстояние по x от начала data.points[0], где нужно нарисовать стрелку
            0, //data.height, // number | расстояние по y от начала data.points[0], где нужно нарисовать стрелку
            {axis: "y", value: (data.heightDirection === 1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
            configWall.angleDegrees + data.angleDegrees, // Угол направления стрелки в градусах относительно data.points[0]
            configWall.color.arrowHead, // Цвет стрелки
            12, // Размер треугольника (основание и высота)
            false // не очищаем графику
          );

          // рисуем указатель начала стены (стрелка без линии)
          drawArrowHead(
            containers.lineWall,
            data.points[0], // позиция начала стены
            0, // расстояние по x от начала data.points[0], где нужно нарисовать стрелку
            (data.heightDirection === 1 ? data.height : -data.height), // number | расстояние по y от начала data.points[0], где нужно нарисовать стрелку
            {axis: "y", value: (data.heightDirection === -1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
            configWall.angleDegrees + data.angleDegrees, // Угол направления стрелки в градусах относительно data.points[0]
            configWall.color.arrowHead, // Цвет стрелки
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
            configWall.color.arrowHead, // Цвет стрелки
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

        }else{

          // containers.lineWall.clear(); // Очистка предыдущего содержимого
          drawLine(
            containers.lineWall,
            data.points[0],
            data.width,
            configWall.angleDegrees + data.angleDegrees, // Угол направления стрелки в градусах
            configWall.color.bodyLine,
            2, // Толщина линии
            true
          );
          
        }
        
      }
    
      if(containers.eventGraphic){
        rect(
          containers.eventGraphic,
          {
            points: data.points,
            heightDirection: data.heightDirection,
            color: "rgba(255,0,0,0)" //configWall.color.background // Цвет заливки
          }
        );
      }

      // if(activeWall) this.interactiveWallStore.setActiveObjectID(data.id);
      // this.activeObject = data.id;

    }
    
  }

  private handlerEventGraphic(id: number | string, e:PIXI.FederatedPointerEvent):void {

    e.preventDefault();

    if (e.button == 0){

      const oldActive = this.activeWallID;
      
      if(id !== oldActive){

        if(oldActive){
          this.plannerStore.updatedObject(oldActive);
        }

        // указать активный объект в сторе для перерисовки
        this.interactiveWallStore.setActiveObjectID(id);
        this.setActiveObject("wall", id);
        
        if(this.activeWallID){
          this.plannerStore.updatedObject(this.activeWallID);
        }

      }

    }

    e.stopPropagation(); // Останавливаем всплытие события

  }

  public destroy(): void {
    // Отписываемся от всех наблюдателей
    this.unwatchList.forEach(unwatch => unwatch());
    this.unwatchList = []; // Очищаем массив для безопасности
  
     // Удаляем графику из сцены
    this.drawObjects.forEach(drawObject => {
      const { containers } = drawObject;

      // Уничтожаем каждый элемент контейнеров
      for (const key in containers) {
        const graphic = containers[key as keyof PlannerObjectContainers];
        if (graphic && typeof graphic.destroy === "function") {
          try {
            // Уничтожаем графику, только если она существует
            if (!graphic.destroyed) {
              graphic.destroy(true); // Уничтожаем графику рекурсивно
            }

            // Убираем из контейнера, если графика существует
            if (this.container && this.container.children.includes(graphic)) {
              this.container.removeChild(graphic);
            }

            // Обнуляем ссылку
            containers[key as keyof PlannerObjectContainers] = null!;
          } catch (error) {
            console.warn(`Failed to destroy graphic: ${key}`, error);
          }
        } else {
          console.warn(`Skipping destroy for graphic: ${key}, as it is null or undefined`);
        }
      }
    });
  
    this.drawObjects = []; // Очищаем массив объектов
  
    // Уничтожаем основной контейнер
    if (this.container) {
      try {
        this.container.destroy({ children: true, texture: true }); // Удаляем все дочерние элементы и текстуры
        this.app.stage.removeChild(this.container); // Убираем контейнер со сцены
        this.container = null!; // Обнуляем ссылку
      } catch (error) {
        console.warn("Failed to destroy main container", error);
      }
    }
  
    // Уничтожаем графику активного объекта
    if (this.activeObjectGraphic) {
      try {
        this.activeObjectGraphic.destroy(true);
        this.app.stage.removeChild(this.activeObjectGraphic);
        this.activeObjectGraphic = null!;
      } catch (error) {
        console.warn("Failed to destroy active object graphic", error);
      }
    }
  
    // Обнуляем другие ссылки
    this.app = null!;
  }  
  
}
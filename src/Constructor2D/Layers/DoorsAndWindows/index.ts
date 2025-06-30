//@ts-nocheck
import * as PIXI from 'pixi.js';
import { MathUtils } from "three";

import {
  Vector2,
} from "@/types/constructor2d/interfaсes";

import {
  IConfig,
  IState,
  IDrawObjects,
  IArgumentDataAddObject
} from "./interfaces";

import {
  ObjectWall
} from "./../Planner/interfaces";

import {
  rect,
  rectV2,
  drawLine,
} from "./../../utils/Shape";

import {
  getDistanceBetweenVectors,
  rotatePointsAroundCenter,
} from "./../../utils/Math";

// import { handlerMouseLeftDown } from "./methods/events/handlerMouseLeftDown/index";

export default class DoorsAndWindows {

  private app: PIXI.Application;
  private parent: any;
  private container: PIXI.Container;

  private drawObjects: IDrawObjects[] = [];

  // конфиругация, значения по умолчанию
  private config: IConfig = {

    window: {
      width: 100,
      height: 30,
      lineWidth: 1,
      colors: {
        background: 0xFFFFFF,
        colorEdge: 0x131313,
      }
    },

    door: {
      width: 100,
      height: 30,
      lineWidth: 1,
      colors: {
        background: 0xFFFFFF,
        colorEdge: 0x131313,
      }
    }

  };

  // состояние слоя
  public state: IState = {
  };

  constructor(pixiApp: PIXI.Application, parent: any) {

    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.parent = parent;
    this.container = new PIXI.Container();
    this.container.x = 30;
    this.container.y = 30;
    this.app.stage.addChild(this.container);

    // this.handlerMouseLeftDown = handlerMouseLeftDown.bind(this);

    // рисуем графику
    this.init();

    // инициализируем события
    this.setupInteractions();

  }

  // инициализация слоя
  // вызывается в конструкторе при запуске приложения
  private init(): void {

    // инициализация котейнеров объекта для рисования
    // const result = this.createDrawContainers(id);

    // рисуем объект на холсте
    // this.draw(id);

  }

  // добавляем объект в слой
  public addObject(data: IArgumentDataAddObject): void {

    /*
    * data.position = {x: 0, y: 0} - position cursor pointer
    * data.type = door | window - тип объекта
    */

    console.log("Adding Door or Window", data);

    if (!data.type || !data.position) return;

    // генерация id объекта
    const uuid: string = data.type + '__' + MathUtils.generateUUID();

    // опрелеляем координаты центра сцены и масшта/размер сцены
    const oc: Vector2 = this.parent.config.originOfCoordinates;
    const inverseScale: number = this.parent.config.inverseScale;

    // позиция курсора мыши на canvas'е
    const positionObjectX: number = (data.position.x - 30 - oc.x) * inverseScale;
    const positionObjectY: number = (data.position.y - 30 - oc.y) * inverseScale;
    const canvasPositionMouse: Vector2 = {
      x: positionObjectX,
      y: positionObjectY
    };

    // !!! 1 получить стену под курсором мыши
    const getBelongsToWall: { id: number | string; point: Vector2 } | null =
      this.parent.layers.planner.getConnectionPointInPolygon(canvasPositionMouse);
    const dataWall: Pick<ObjectWall, 'id' | 'name' | 'width' | 'height' | 'points' | 'heightDirection' | 'angleDegrees' | 'updateTime'> | null =
      getBelongsToWall
        ? JSON.parse(JSON.stringify((() => {
          const wall = this.parent.layers.planner.objectWalls.find((el: ObjectWall) => el.id === getBelongsToWall.id);
          if (!wall) return null;
          const { id, name, width, height, points, heightDirection, angleDegrees, updateTime } = wall;
          return { id, name, width, height, points, heightDirection, angleDegrees, updateTime };
        })()))
        : null;

    // !!! 2 получить ширину и высоту объекта относительно стены, если она есть. иначе из конфигурации
    const wallWidth: number = getDistanceBetweenVectors(dataWall?.points[0], dataWall?.points[1]);
    const objWidth: number = wallWidth > this.config[data.type]?.width ? this.config[data.type]?.width : wallWidth - 20;
    const objHeight: number = dataWall?.height ?? this.config[data.type]?.height;
    const objHeightDirection: -1 | 1 = dataWall?.heightDirection ?? -1;

    // !!! 3 получить угол поворота стены, если она есть. иначе 0
    const objAngleDegrees: number = dataWall?.angleDegrees ?? 0; // угол поворота объекта в градусах

    // 1. определяем точки окна/двери | 4 точки
    let point_0: Vector2 | undefined = getBelongsToWall?.point ?? canvasPositionMouse;
    let point_1: Vector2 | undefined = {
      x: point_0.x + objWidth,
      y: point_0.y
    };
    let point_2: Vector2 | undefined = JSON.parse(JSON.stringify(point_1));
    point_2.y -= objHeight;
    let point_3: Vector2 | undefined = JSON.parse(JSON.stringify(point_0));
    point_3.y -= objHeight;

    let objectPoints: Vector2[] = rotatePointsAroundCenter([
      point_0,
      point_1,
      point_2,
      point_3
    ], point_0, objAngleDegrees);

    const objectData: IDrawObjects = {
      id: uuid,
      name: data.type,
      width: objWidth,
      height: objHeight,
      heightDirection: objHeightDirection,
      angleDegrees: objAngleDegrees,
      updateTime: Date.now(),
      belongsToWall: null, // объект не принадлежит стене
      containers: null, // инициализируем позже
      points: objectPoints
    };
    this.drawObjects.push(objectData);

    const addedObject = this.drawObjects.find(el => el.id === uuid);

    if (!addedObject) {
      console.error("Failed to add object", data);
      return;
    }

    // инициализация котейнеров объекта для рисования
    const result = this.createDrawContainers(addedObject.id);

    if (result) {
      // рисуем объект на холсте
      this.draw(addedObject.id);
    }

  }

  // создаем контейнеры для визуализации cтены
  private createDrawContainers(id: string | number): number {

    const indexObject = this.drawObjects.findIndex(el => el.id === id);

    if (indexObject == -1) {
      console.error("Object not found for id:", id);
      return 0; // Возвращаем 0, если объект не найден
    }

    const dataObject = this.drawObjects[indexObject];
    if (!dataObject) {
      console.error("Object data not found for id:", id);
      return 0; // Возвращаем 0, если данные объекта не найдены
    }

    if (dataObject.containers) {
      console.warn("Containers already exist for this object:", id);
      return 0; // Возвращаем 0, если контейнеры уже существуют
    }

    // создаем контейнеры для рисования объекта
    dataObject.containers = {
      root: new PIXI.Container(), // родительский контейнер для всех елементов
      mainShape: new PIXI.Graphics(), // основная форма объекта
      line: new PIXI.Graphics(), // линии на объекте mainShape
      eventGraphic: new PIXI.Graphics(), // место для событий
    };

    if (!dataObject.containers?.root) {
      console.error("Failed to create root container for object:", id);
      return 0; // Возвращаем 0, если не удалось создать корневой контейнер
    }

    this.container.addChild(dataObject.containers.root);
    dataObject.containers.root.addChild(dataObject.containers.mainShape);
    dataObject.containers.root.addChild(dataObject.containers.line);
    dataObject.containers.root.addChild(dataObject.containers.eventGraphic);

    return 1; // Возвращаем 1, если контейнеры успешно созданы

  }

  // рисуем объект на холсте
  public draw(id: number | string): void {

    const obj: IDrawObjects | undefined = this.drawObjects.find(el => el.id === id);
    if (!obj) {
      console.error("Object not found for id:", id);
      return; // Если объект не найден, выходим из функции
    }

    // Получить контейнеры из объекта
    const containers = obj.containers;
    const points = JSON.parse(JSON.stringify(obj.points));
    const belongsToWall = obj.belongsToWall;

    const widthObj = getDistanceBetweenVectors(points[0], points[1]);
    const heightObj = getDistanceBetweenVectors(points[0], points[3]);

    if (containers?.mainShape) {
      rect(
        containers.mainShape,
        {
          points: points,
          heightDirection: obj.heightDirection,
          color: this.config[obj.name].colors.background,
          colorEdge: this.config[obj.name].colors.colorEdge,
          widthEdge: this.config[obj.name].lineWidth
        }
      );
    }

    if (containers?.line) {
      drawLine(
        // graphics: PIXI.Graphics,
        containers?.line,
        // startPoint: Vector2,
        points[0],
        // width: number, // Длина стрелки
        widthObj,
        // angleDegrees: number, // Угол направления стрелки в градусах
        obj.angleDegrees,
        // color: number | string = 0x000000, // Цвет стрелки
        0x008800,
        // lineWidth: number = 1, // Толщина линии
        1,
        // clearGraphics: boolean = false, // Флаг: очищать графику или нет
        false, // не очищаем графику
        // stepNormal: number = 0 // смещение линии по нормали
        obj.heightDirection * (heightObj / 2) + 5 // смещение линии по нормали
      );
      drawLine(
        // graphics: PIXI.Graphics,
        containers?.line,
        // startPoint: Vector2,
        points[0],
        // width: number, // Длина стрелки
        widthObj,
        // angleDegrees: number, // Угол направления стрелки в градусах
        obj.angleDegrees,
        // color: number | string = 0x000000, // Цвет стрелки
        0x008800,
        // lineWidth: number = 1, // Толщина линии
        1,
        // clearGraphics: boolean = false, // Флаг: очищать графику или нет
        false, // не очищаем графику
        // stepNormal: number = 0 // смещение линии по нормали
        obj.heightDirection * (heightObj / 2) - 5 // смещение линии по нормали
      );
      drawLine(
        // graphics: PIXI.Graphics,
        containers?.line,
        // startPoint: Vector2,
        points[0],
        // width: number, // Длина стрелки
        widthObj,
        // angleDegrees: number, // Угол направления стрелки в градусах
        obj.angleDegrees + 45,
        // color: number | string = 0x000000, // Цвет стрелки
        0x008800,
        // lineWidth: number = 1, // Толщина линии
        3,
        // clearGraphics: boolean = false, // Флаг: очищать графику или нет
        false, // не очищаем графику
        // stepNormal: number = 0 // смещение линии по нормали
        0 // смещение линии по нормали
      );
    }

  }

  public setupInteractions(): void {
  }

  public updateScenePosition(): void {

    this.container!.x = this.parent.config.originOfCoordinates.x + 30;
    this.container!.y = this.parent.config.originOfCoordinates.y + 30;

  }

  public set scale(v: number) {
    this.container!.scale.set(v);
  }

  public destroy(): void {

    [ // Очистка и уничтожение графики

      // this.circleStartPoint,

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

    this.container = null!;
    this.app = null!;

  }

};
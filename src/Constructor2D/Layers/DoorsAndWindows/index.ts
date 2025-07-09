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
  IArgumentDataAddObject,
  IDetachParams,
} from "./interfaces";

import {
  ObjectWall
} from "./../Planner/interfaces";

import {
  rect,
  rectV2,
  drawLine,
  // drawCircle,
  drawArc
} from "./../../utils/Shape";

import {
  getDistanceBetweenVectors,
  rotatePointsAroundCenter,
  getMidpoint,
  offsetVectorBySegment,
  adjustSegmentLength,
  offsetVectorBySegmentNormal,
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
        colorLine: 0x34A853,
      }
    },

    door: {
      width: 100,
      height: 30,
      lineWidth: 1,
      colors: {
        background: 0xFFFFFF,
        colorEdge: 0x131313,
        colorLine: 0x34A853,
      }
    }

  };

  // состояние слоя
  public state: IState = {
    activeObject: null, // активный объект | id object
    activePointObject: null, // активная точка объекта | index точки объекта
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
    const wallWidth: number = dataWall ? getDistanceBetweenVectors(dataWall?.points[0], dataWall?.points[1]) : this.config[data.type]?.width;
    const distanceFromWallStart: number = getBelongsToWall ? getDistanceBetweenVectors(dataWall?.points[0], getBelongsToWall.point) : 0;
    const objWidth: number = wallWidth > this.config[data.type]?.width ? this.config[data.type]?.width : wallWidth;
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
      belongsToWall: {
        id: getBelongsToWall?.id ?? null, // объект не принадлежит стене
        distanceFromWallStart: distanceFromWallStart, // расстояние от начала стены до объекта
      },
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
      
      this.parent.layers.planner?.deactiveWalls(); // деактивируем стены, если они были активны
      this.parent.layers.arrowRulerActiveObject?.clearGraphic();
      
      this.setActiveObject(addedObject.id); // устанавливаем активный объект и рисуем на холсте
      
      this.parent.layers.startPointActiveObject.activate([addedObject.points[0], addedObject.points[1]]);
      
    }

  }

  public setActiveObject(id: string | number | null): void {

    const oldActiveObject = this.state.activeObject;

    if (oldActiveObject === id) return; // Если объект уже активен, ничего не делаем
    
    this.state.activeObject = id; // Устанавливаем новый активный объект

    if(oldActiveObject) this.draw(oldActiveObject); // убраем автиность объекта, если он был активен

    if(this.state.activeObject) this.draw(this.state.activeObject); // Рисуем новый активный объект
    
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
    const idWall = obj.belongsToWall.id;

    const widthObj = getDistanceBetweenVectors(points[0], points[1]);
    const heightObj = getDistanceBetweenVectors(points[0], points[3]);

    if (containers?.mainShape) {
      containers.mainShape.clear();
      rect(
        containers.mainShape,
        {
          points: points,
          heightDirection: obj.heightDirection,
          color: this.config[obj.name].colors.background,
          // colorEdge: this.config[obj.name].colors.colorEdge,
          // widthEdge: this.config[obj.name].lineWidth
        }
      );
    }

    // рисуем линии на объекте
    if (containers?.line) {
      containers.line.clear();

      { // рисуем зеленые линии
        const line_0: Vector2[] = drawLine(
          // graphics: PIXI.Graphics,
          containers.line,
          // startPoint: Vector2,
          points[0],
          // width: number, // Длина стрелки
          widthObj,
          // angleDegrees: number, // Угол направления стрелки в градусах
          obj.angleDegrees,
          // color: number | string = 0x000000, // Цвет стрелки
          this.config[obj.name].colors.colorLine,
          // lineWidth: number = 1, // Толщина линии
          1,
          // clearGraphics: boolean = false, // Флаг: очищать графику или нет
          true, // не очищаем графику
          // stepNormal: number = 0 // смещение линии по нормали
          obj.heightDirection * (heightObj / 2) + 5 // смещение линии по нормали
        );
        const line_1: Vector2[] = drawLine(
          // graphics: PIXI.Graphics,
          containers.line,
          // startPoint: Vector2,
          points[0],
          // width: number, // Длина стрелки
          widthObj,
          // angleDegrees: number, // Угол направления стрелки в градусах
          obj.angleDegrees,
          // color: number | string = 0x000000, // Цвет стрелки
          this.config[obj.name].colors.colorLine,
          // lineWidth: number = 1, // Толщина линии
          1,
          // clearGraphics: boolean = false, // Флаг: очищать графику или нет
          false, // не очищаем графику
          // stepNormal: number = 0 // смещение линии по нормали
          obj.heightDirection * (heightObj / 2) - 5 // смещение линии по нормали
        );
        drawLine(
          // graphics: PIXI.Graphics,
          containers.line,
          // startPoint: Vector2,
          getMidpoint(line_0[0], line_0[1]),
          // width: number, // Длина стрелки
          0,
          // angleDegrees: number, // Угол направления стрелки в градусах
          0,
          // color: number | string = 0x000000, // Цвет стрелки
          this.config[obj.name].colors.colorLine,
          // lineWidth: number = 1, // Толщина линии
          1,
          // clearGraphics: boolean = false, // Флаг: очищать графику или нет
          false, // не очищаем графику
          // stepNormal: number = 0 // смещение линии по нормали
          0, // смещение линии по нормали
          // endPoint: Vector2,
          getMidpoint(line_1[0], line_1[1]),
        );

        if (obj.name === 'door') {
          drawLine(
            // graphics: PIXI.Graphics,
            containers.line,
            // startPoint: Vector2,
            points[0],
            // width: number, // Длина стрелки
            widthObj,
            // angleDegrees: number, // Угол направления стрелки в градусах
            obj.angleDegrees + 45,
            // color: number | string = 0x000000, // Цвет стрелки
            this.config[obj.name].colors.colorLine,
            // lineWidth: number = 1, // Толщина линии
            3,
            // clearGraphics: boolean = false, // Флаг: очищать графику или нет
            false, // не очищаем графику
            // stepNormal: number = 0 // смещение линии по нормали
            0 // смещение линии по нормали
          );
        }
      }

      { // рисуем зеленую арку
        if (obj.name === 'door') {
          drawArc(
            // graphics: PIXI.Graphics,
            containers.line,
            // center: Vector2,
            points[0],
            // radius: number, // Радиус дуги
            widthObj - 10, // радиус дуги
            // startAngleDegrees: number = 0, // Начальный угол в градусах
            obj.angleDegrees, // Начальный угол в градусах          
            // endAngleDegrees: number = 360, // Конечный угол в градусах
            obj.angleDegrees + 45, // Конечный угол в градусах
            // color: number | string = 0x000000, // Цвет дуги
            this.config[obj.name].colors.colorLine, // Цвет дуги
            // lineWidth: number = 1, // Толщина линии
            1, // Толщина линии
            // clearGraphics: boolean = false // Флаг: очищать графику или нет
            false, // не очищаем графику
          );
        }
      }

      if(this.state.activeObject && idWall){ // рисуем зеленые линейки справа и слева от объекта до краёв стены, если объект принадлежит стене
        
        const pointsWall: Vector2[] = this.parent.layers.planner.getWallProperty(idWall, 'points');
        
        // левая линия
        drawLine(
          // graphics: PIXI.Graphics,
          containers.line,
          // startPoint: Vector2,
          pointsWall[0],
          // width: number, // Длина стрелки
          0,
          // angleDegrees: number, // Угол направления стрелки в градусах
          0,
          // color: number | string = 0x000000, // Цвет стрелки
          this.config[obj.name].colors.colorLine,
          // lineWidth: number = 1, // Толщина линии
          2,
          // clearGraphics: boolean = false, // Флаг: очищать графику или нет
          false, // не очищаем графику
          // stepNormal: number = 0 // смещение линии по нормали
          0, // смещение линии по нормали
          // endPoint: Vector2,
          points[0],
        );

        // правая линия
        drawLine(
          // graphics: PIXI.Graphics,
          containers.line,
          // startPoint: Vector2,
          points[1],
          // width: number, // Длина стрелки
          0,
          // angleDegrees: number, // Угол направления стрелки в градусах
          0,
          // color: number | string = 0x000000, // Цвет стрелки
          this.config[obj.name].colors.colorLine,
          // lineWidth: number = 1, // Толщина линии
          2,
          // clearGraphics: boolean = false, // Флаг: очищать графику или нет
          false, // не очищаем графику
          // stepNormal: number = 0 // смещение линии по нормали
          0, // смещение линии по нормали
          // endPoint: Vector2,
          pointsWall[1],
        );

      }

      { // рисуем черную рамку отдельными линиями вокруг объекта
        drawLine(
          // graphics: PIXI.Graphics,
          containers.line,
          // startPoint: Vector2,
          points[0],
          // width: number, // Длина стрелки
          0,
          // angleDegrees: number, // Угол направления стрелки в градусах
          0,
          // color: number | string = 0x000000, // Цвет стрелки
          this.config[obj.name].colors.colorEdge,
          // lineWidth: number = 1, // Толщина линии
          2,
          // clearGraphics: boolean = false, // Флаг: очищать графику или нет
          false, // не очищаем графику
          // stepNormal: number = 0 // смещение линии по нормали
          0, // смещение линии по нормали
          // endPoint: Vector2,
          points[1],
        );
        drawLine(
          // graphics: PIXI.Graphics,
          containers.line,
          // startPoint: Vector2,
          points[1],
          // width: number, // Длина стрелки
          0,
          // angleDegrees: number, // Угол направления стрелки в градусах
          0,
          // color: number | string = 0x000000, // Цвет стрелки
          this.config[obj.name].colors.colorEdge,
          // lineWidth: number = 1, // Толщина линии
          1,
          // clearGraphics: boolean = false, // Флаг: очищать графику или нет
          false, // не очищаем графику
          // stepNormal: number = 0 // смещение линии по нормали
          0, // смещение линии по нормали
          // endPoint: Vector2,
          points[2],
        );
        drawLine(
          // graphics: PIXI.Graphics,
          containers.line,
          // startPoint: Vector2,
          points[2],
          // width: number, // Длина стрелки
          0,
          // angleDegrees: number, // Угол направления стрелки в градусах
          0,
          // color: number | string = 0x000000, // Цвет стрелки
          this.config[obj.name].colors.colorEdge,
          // lineWidth: number = 1, // Толщина линии
          1,
          // clearGraphics: boolean = false, // Флаг: очищать графику или нет
          false, // не очищаем графику
          // stepNormal: number = 0 // смещение линии по нормали
          0, // смещение линии по нормали
          // endPoint: Vector2,
          points[3],
        );
        drawLine(
          // graphics: PIXI.Graphics,
          containers.line,
          // startPoint: Vector2,
          points[3],
          // width: number, // Длина стрелки
          0,
          // angleDegrees: number, // Угол направления стрелки в градусах
          0,
          // color: number | string = 0x000000, // Цвет стрелки
          this.config[obj.name].colors.colorEdge,
          // lineWidth: number = 1, // Толщина линии
          1,
          // clearGraphics: boolean = false, // Флаг: очищать графику или нет
          false, // не очищаем графику
          // stepNormal: number = 0 // смещение линии по нормали
          0, // смещение линии по нормали
          // endPoint: Vector2,
          points[0],
        );
      }

    }

  }

  public updateObject(idWall: number | string): void {

    this.drawObjects.forEach((obj: IDrawObjects) => {
      if (obj.belongsToWall.id === idWall) {

        // Получаем данные стены
        const dataWall: Pick<ObjectWall, 'id' | 'name' | 'width' | 'height' | 'points' | 'heightDirection' | 'angleDegrees' | 'updateTime'> | null =
          JSON.parse(JSON.stringify((() => {
            const wall = this.parent.layers.planner.objectWalls.find((el: ObjectWall) => el.id === idWall);
            if (!wall) return null;
            const { id, name, width, height, points, heightDirection, angleDegrees, updateTime } = wall;
            return { id, name, width, height, points, heightDirection, angleDegrees, updateTime };
          })()));

        if (!dataWall) {
          console.error("Wall not found for id:", idWall);
          return;
        }

        const points: Vector2[] = dataWall.points;
        const objPoints: Vector2[] = JSON.parse(JSON.stringify(obj.points));
        // obj.width;
        obj.height = dataWall.height;
        obj.angleDegrees = dataWall.angleDegrees;
        obj.updateTime = Date.now();

        const point_0: Vector2 = offsetVectorBySegment(
          [points[0], points[1]],
          points[0],
          obj.belongsToWall.distanceFromWallStart
        );
        let point_1: Vector2 | undefined = {
          x: point_0.x + obj.width,
          y: point_0.y
        };
        let point_2: Vector2 | undefined = JSON.parse(JSON.stringify(point_1));
        point_2.y -= obj.height;
        let point_3: Vector2 | undefined = JSON.parse(JSON.stringify(point_0));
        point_3.y -= obj.height;

        const objectPoints: Vector2[] = rotatePointsAroundCenter([
          point_0,
          point_1,
          point_2,
          point_3
        ], point_0, obj.angleDegrees);

        obj.points[0] = objectPoints[0];
        obj.points[1] = objectPoints[1];
        obj.points[2] = objectPoints[2];
        obj.points[3] = objectPoints[3];

        this.draw(obj.id);

      }
    });

  }

  public updateObjectPoint(position: Vector2, __indexPoint: 0 | 1 | null = null): void {

    const indexPoint: number = __indexPoint !== null ? __indexPoint : this.state.activePointObject;
    const dataObject: IDrawObjects | undefined = this.drawObjects.find(el => el.id === this.state.activeObject);

    if (!dataObject) {
      console.error("Object not found for id:", this.state.activeObject);
      return; // Если объект не найден, выходим из функции
    }
    
    if (!dataObject.points[indexPoint]) {
      console.error("Invalid point index:", indexPoint);
      return; // Если индекс точки некорректен, выходим из функции
    }

    // получаем height объекта
    const heightObj: number = dataObject.height;

    const points: Vector2[] = JSON.parse(JSON.stringify(dataObject.points));
    
    // Изменяет длину отрезка, перемещая точку A или B вдоль линии
    // и возвращает новую позицию точки, которую нужно переместить
    const p = adjustSegmentLength(
      [dataObject.points[0], dataObject.points[1]], // линия отрезка
      indexPoint, // индекс точки, которую нужно переместить
      position, // позиция мыши
    );

    const point_0: Vector2 = indexPoint === 0 ? p : points[0];
    const point_1: Vector2 = indexPoint === 1 ? p : points[1];
    const point_2: Vector2 = offsetVectorBySegmentNormal([point_0, point_1], point_1, heightObj * dataObject.heightDirection);
    const point_3: Vector2 = offsetVectorBySegmentNormal([point_0, point_1], point_0, heightObj * dataObject.heightDirection);

    dataObject.width = getDistanceBetweenVectors(point_0, point_1);
    
    dataObject.points = [
      point_0,
      point_1,
      point_2,
      point_3
    ];

    this.draw(dataObject.id);
    
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

    this.drawObjects.forEach((obj: IDrawObjects) => this.removeObject(obj.id) );

    // Удаление контейнера
    if (this.container) {
      this.container.destroy({
        children: true,     // Удалить дочерние элементы (если это Container)
        texture: false,     // Удалить текстуру (если она есть)
        baseTexture: false, // Удалить базовую текстуру (если есть)
      });
      this.app.stage.removeChild(this.container);
    }

    this.container = null!;
    this.app = null!;

  }

  // Открепить объект от стены
  public detachFromWall(dataSearch: IDetachParams): void {

    const objs = (dataSearch.type === "wall" && dataSearch.id)
      ? this.drawObjects.filter(el => el.belongsToWall?.id === dataSearch.id) || []
      : ( (dataSearch.type === "object" && dataSearch.id) 
          ? this.drawObjects.find(el => el.id === dataSearch.id) || []
          : []
        );

    if (!objs || objs.length === 0) {
      console.error("Object not found for id:", dataSearch);
      return;
    }

    for (const obj of objs) {
      obj.belongsToWall = {
        id: null,
        distanceFromWallStart: 0,
      };
      
      // obj.angleDegrees = 0;
      this.draw(obj.id);
    }

  }

  public removeObject(id: string | number): void {

    const indexObject = this.drawObjects.findIndex(el => el.id === id);

    if (indexObject === -1) {
      console.error("Object not found for id:", id);
      return; // Если объект не найден, выходим из функции
    }

    const dataObject = this.drawObjects[indexObject];
    if (!dataObject) {
      console.error("Object data not found for id:", id);
      return; // Если данные объекта не найдены, выходим из функции
    }

    if (dataObject.containers) {

      // Удаляем все графики из контейнеров
      for (const key in dataObject.containers) {

        if (key === 'root') continue; // Пропускаем корневой контейнер

        const graphic = dataObject.containers[key];

        // отвязываем события от графики
        if (key === "eventGraphic" && graphic instanceof PIXI.Graphics) {
          // graphic
          //   .off("mouseover", this.handlerOverEventGraphic)
          //   .off("mouseout", this.handlerOutEventGraphic)
          //   .off("pointerdown", this.handlerDownEventGraphic);
        }

        if (graphic && typeof graphic.destroy === "function") {
          graphic.destroy({
            texture: false,     // Удалить текстуру (если она есть)
            baseTexture: false, // Удалить базовую текстуру (если есть)
          });
        }

        // Убираем из контейнера, если графика существует
        if (dataObject.containers.root && dataObject.containers.root.children.includes(graphic)) dataObject.containers.root.removeChild(graphic);

        dataObject.containers[key] = null!; // Обнуляем ссылку на графику

      }

      // удаляем контейнер root
      try {
        if (dataObject.containers.root && typeof dataObject.containers.root.destroy === "function") {
          dataObject.containers.root.destroy({
            children: true,     // Удалить дочерние элементы (если это Container)
            texture: false,     // Удалить текстуру (если она есть)
            baseTexture: false, // Удалить базовую текстуру (если есть)
          });
        }
        if (
          this.container &&
          this.container.children.includes(dataObject.containers.root)
        ) {
          this.container.removeChild(dataObject.containers.root);
        }
        dataObject.containers.root = null!;
      } catch (error) {
        console.warn(`Failed to destroy graphic: root`, error);
      }

      // Обнуляем ссылки на контейнеры
      dataObject.containers = null;

    }

    // Удаляем объект из массива
    this.drawObjects.splice(indexObject, 1);

  }

};
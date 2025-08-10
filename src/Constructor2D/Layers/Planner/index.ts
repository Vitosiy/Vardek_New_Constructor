//@ts-nocheck
import * as PIXI from 'pixi.js';
import { MathUtils } from "three";

import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition";

import { Vector2 } from '@/types/constructor2d/interfaсes';

import { Events } from '@/store/constructor2d/events';

import {
  ObjectWall,
  ObjectWallContainers,
  Config,
  State,
  ArgumentDataAddWall,
  MergeWalls,
  HoverPointObject,
  IC2DRoom,
} from "./interfaces";

import { IDrawObjects } from "./../DoorsAndWindows/interfaces";

import {
  offsetVectorBySegmentNormal,
  // rotatePointsAroundCenter,
  rotatePoint,
  getDistanceBetweenVectors,
  offsetVectorBySegment,
  getMidpoint,
  getAngleBetweenVectors,
  getIntersectionPoint,
  adjustP1ForPerpendicularity,
  doesVectorIntersectSegment,
  isPointInPolygon,
  getIntersectVectorLine,
  adjustSegmentLength,
  findRayLineIntersection,
  isPointNearLine,
  isPointInPolygon,
  getCenterOfPoints,
} from "@/Constructor2D/utils/Math";

import {
  rect,
  drawVerticalLines,
  drawDashedOutline,
  drawArrow,
  drawArrowHead,
  drawShape,
  drawCircle,
  drawLine,
} from "../../utils/Shape";

import { handlerOverEventGraphic } from "./methods/events/handlerOver/index";
import { handlerOutEventGraphic } from "./methods/events/handlerOut/index";
import { handlerDownEventGraphic } from "./methods/events/handlerDown/index";
import { handlerStageMouseUp } from "./methods/events/handlerStageMouseUp/index";
import { handlerStageMouseMove } from "./methods/events/handlerStageMouseMove/index";
import { eventModifyWall } from "./methods/events/eventModifyWall/index";
import { eventRemoveWall } from "./methods/events/eventRemoveWall/index";

import { initRoom } from "./methods/initRoom/index";

export default class Planner {

  private app: PIXI.Application;
  private parent: any;
  public container: PIXI.Container;

  private activeObjectGraphic: PIXI.Graphics;

  private objectWalls: ObjectWall[] = [];

  public roomsMap = new Map<string | number, IC2DRoom>();

  // private roomStore = useSchemeTransition();

  public config: Config = {

    wall: {
      width: 150,
      height: 30,
      heightDirection: -1, // направление толщины стены
      angleDegrees: 180, // + вращение по часовой стрелке, - против часовой стрелки
      color: {
        background: 0xffffff,
        bodyLine: 0x131313,
        borderLine: 0x131313,
        line76deg: 0xA3A9B5,
        arrowLineWall: 0xDA444C,
        arrowHeadLineWall: 0xB19F53,
        arrowHead: 0xB6887E,
        green: 0x8BDE84,
        mediumBlue: 0x4285F4,
        tapeLineColor: 0x5D6069
      }
    }

  }

  public state: State = {

    activeWall: null, // null | string | number
    activePointWall: null, // null | 0 | 1

    mouseLeft: false, // left mouse button
    positionDown: { // позиция курсора, когда нажали кнопку мыши
      x: 0,
      y: 0
    },
    oldPosition: []

  }

  // events
  private handlerOverEventGraphic: (e: PIXI.FederatedPointerEvent) => void;
  private handlerOutEventGraphic: (e: PIXI.FederatedPointerEvent) => void;
  private handlerDownEventGraphic: (e: PIXI.FederatedPointerEvent) => void;
  private handlerStageMouseUp: (e: PIXI.FederatedPointerEvent) => void;
  private handlerStageMouseMove: (e: PIXI.FederatedPointerEvent) => void;
  private eventModifyWall: (data: { width: number, height: number }) => void;
  private eventRemoveWall: () => void;

  private initRoom: () => (0 | 1);

  constructor(pixiApp: PIXI.Application, parent: any) {
    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.parent = parent;
    this.container = new PIXI.Container();
    this.container.position.set(30, 30);
    this.app.stage.addChild(this.container);

    this.activeObjectGraphic = new PIXI.Graphics();
    this.app.stage.addChild(this.activeObjectGraphic);

    // event methods
    this.handlerOverEventGraphic = handlerOverEventGraphic;
    this.handlerOutEventGraphic = handlerOutEventGraphic;
    this.handlerDownEventGraphic = handlerDownEventGraphic.bind(this);
    this.handlerStageMouseUp = handlerStageMouseUp.bind(this);
    this.handlerStageMouseMove = handlerStageMouseMove.bind(this);
    this.eventModifyWall = eventModifyWall.bind(this);
    this.eventRemoveWall = eventRemoveWall.bind(this);

    this.parent.eventBus.on(Events.C2D_MODIFY_WALL, this.eventModifyWall);
    this.parent.eventBus.on(Events.C2D_REMOVE_WALL, this.eventRemoveWall);

    this.initRoom = initRoom.bind(this);

    this.init();
  }

  // инициализация объектов для визуализации при запуске приложения
  private init(): void {

    const result = this.initRoom();

    if (result) {

      const objs = this.objectWalls;
      if (objs.length > 0) {
        for (let i = 0, len = objs.length; i < len; i++) {
          const id = objs[i].id;
          // создаем контейнеры для визуализации стены
          const result = this.createDrawContainers(id);
          // визуализируем объект
          if (result) {
            this.drawWall(id);
          }
        }
      }

    }

    this.redrawHalfRoom();

    this.app.stage
      .on("pointerup", this.handlerStageMouseUp)
      .on("mousemove", this.handlerStageMouseMove);

    console.log('Planner initialized with', this.objectWalls.length, 'walls');

  }

  // добавление новой комнаты
  public addRoom(
    id: string | number | null = null, 
    label: string | null = null, 
    description: string = ''
  ): string {

    const rId: string | number = id ? id : MathUtils.generateUUID();

    if (this.roomsMap.has(rId)) {
      throw new Error(`Room with ID ${rId} already exists`);
    }

    const countRooms: number = this.roomsMap.size;

    this.roomsMap.set(rId, {
      id: rId,
      label: label ?? `Комната ${countRooms + 1}`,
      description: description,
    });

    return rId;

  }

  // Получение комнаты по ID
  public getRoom(id: string | number) {

    if (!id) return undefined;

    return this.roomsMap.get(id);

  }

  // удаление комнаты по ID
  public removeRoom(id: string | number): boolean {

    if (!this.roomsMap.has(id)) {
      console.error(`Room with ID ${id} does not exist`);
      return false;
    }

    this.roomsMap.delete(id);

    return true;

  }

  // получение всех комнат
  get allRooms(): IC2DRoom[] {

    return Array.from(this.roomsMap.values());

  }

  private calculatePositionPointsWall(point0: Vector2, point1: Vector2, height: number, heightDirection: -1 | 1): [Vector2, Vector2, Vector2, Vector2] {

    let point2: Vector2 = offsetVectorBySegmentNormal(
      [point0, point1],
      point1,
      height * heightDirection
    );
    let point3: Vector2 = offsetVectorBySegmentNormal(
      [point0, point1],
      point0,
      height * heightDirection
    );

    return [
      point0,
      point1,
      point2,
      point3
    ];

  }

  // добавление стены в класс Planner при пересаскивании из меню с помощью drag and drop
  public addWall(data: ArgumentDataAddWall): void {

    /*
    * data.position = {x: 0, y: 0} - position cursor pointer
    * data.type = wall | wall_vertical
    */

    if (!data.type || !data.position) return;

    // генерация id объекта
    const uuid: string = data.type + '__' + MathUtils.generateUUID();

    // 1. создаем данные стены
    const oc: Vector2 = this.parent.config.originOfCoordinates;
    const inverseScale: number = this.parent.config.inverseScale;

    // позиция курсора мыши на canvas'е
    const positionObjectX: number = (data.position.x - 30 - oc.x) * inverseScale;
    const positionObjectY: number = (data.position.y - 30 - oc.y) * inverseScale;
    const canvasPositionMouse: Vector2 = {
      x: positionObjectX,
      y: positionObjectY
    };

    let linePoint_0: Vector2 | undefined = canvasPositionMouse;
    let linePoint_1: Vector2 | undefined = {
      x: canvasPositionMouse.x + this.config.wall.width,
      y: canvasPositionMouse.y
    };

    if (data.type === 'wall_vertical') {
      linePoint_0 = canvasPositionMouse;
      linePoint_1 = {
        x: canvasPositionMouse.x,
        y: canvasPositionMouse.y + this.config.wall.width
      }
    }

    // ищем точку стены под курсором
    let hoverPointObject: HoverPointObject | null;
    if (data.type === 'dividing_wall') { // внутренняя стена
      /*
      * определяем точку к которой конектится внутренняя стена
      */
      hoverPointObject = this.getConnectionPointInPolygon({
        x: positionObjectX,
        y: positionObjectY
      }); // id, point

    } else {
      hoverPointObject = this.getPointByPosition({
        x: positionObjectX,
        y: positionObjectY
      });
    }

    // стена под курсором
    let wallUnderCursor: ObjectWall | undefined = hoverPointObject ? this.objectWalls.find(el => el.id === hoverPointObject.id) : undefined;

    if (data.type === 'dividing_wall' && hoverPointObject) {
      wallUnderCursor = this.objectWalls.find(el => el.id === hoverPointObject.id);
      if (wallUnderCursor) {
        linePoint_0 = hoverPointObject.point;
        linePoint_1 = offsetVectorBySegmentNormal(
          [
            wallUnderCursor.points[0],
            wallUnderCursor.points[1]
          ],
          hoverPointObject.point,
          -this.config.wall.width * wallUnderCursor.heightDirection
        );
      }
    }

    let angleDegreesConnectWall: number = 0;
    let directionX: number = 1;
    let directionY: number = 1;

    if (hoverPointObject) {

      const hoverDataWall: ObjectWall | undefined = this.objectWalls.find((el: ObjectWall) => el.id === hoverPointObject.id);

      if (hoverDataWall) {

        const hoverPoints: Vector2[] = hoverDataWall.points;
        angleDegreesConnectWall = hoverDataWall.angleDegrees;

        if (hoverPointObject.indexPoint == 0 && hoverDataWall.mergeWalls.wallPoint1 === null) {

          if (data.type === 'wall_vertical') { // направление стены относительно к присоединяемой под углом 90 градусов

            linePoint_0 = offsetVectorBySegmentNormal(
              [hoverPoints[0], hoverPoints[1]],
              hoverPoints[0],
              (this.parent.state.keys.shift ? this.config.wall.width : -this.config.wall.width) * this.config.wall.heightDirection
            );
            linePoint_1 = hoverPoints[0];

          } else if (data.type === 'wall') { // направдение стены относительно к присоединяемой под углом 0 градусов, то есть ее продолжает

            linePoint_0 = offsetVectorBySegment(
              [hoverPoints[0], hoverPoints[1]],
              hoverPoints[0],
              -this.config.wall.width
            );
            linePoint_1 = hoverPoints[0];

          }

        } else if (hoverPointObject.indexPoint == 1 && hoverDataWall.mergeWalls.wallPoint0 === null) {

          if (data.type === 'wall_vertical') { // направление стены относительно к присоединяемой под углом 90 градусов

            linePoint_0 = hoverPoints[1];
            linePoint_1 = offsetVectorBySegmentNormal(
              [hoverPoints[0], hoverPoints[1]],
              hoverPoints[1],
              (this.parent.state.keys.shift ? this.config.wall.width : -this.config.wall.width) * this.config.wall.heightDirection
            );

          } else if (data.type === 'wall') { // направление стены относительно к присоединяемой под углом 0 градусов, то есть ее продолжает

            linePoint_0 = hoverPoints[1];
            linePoint_1 = offsetVectorBySegment(
              [hoverPoints[0], hoverPoints[1]],
              hoverPoints[1],
              this.config.wall.width
            );

          }

        }

      }

    }

    if (linePoint_0.x < 0) linePoint_0.x = 0;
    if (linePoint_0.y < 0) linePoint_0.y = 0;
    if (linePoint_1.x < 0) linePoint_1.x = 0;
    if (linePoint_1.y < 0) linePoint_1.y = 0;

    let point2: Vector2 = offsetVectorBySegmentNormal(
      [linePoint_0, linePoint_1],
      linePoint_1,
      this.config.wall.height * this.config.wall.heightDirection
    );
    let point3: Vector2 = offsetVectorBySegmentNormal(
      [linePoint_0, linePoint_1],
      linePoint_0,
      this.config.wall.height * this.config.wall.heightDirection
    );

    let pointsWall: Vector2[] = [
      linePoint_0,
      linePoint_1,
      point2,
      point3
    ];

    // обновить угол наклона стены
    const angleDegrees = getAngleBetweenVectors(
      pointsWall[0],
      {
        x: pointsWall[0].x + 300,
        y: pointsWall[0].y
      },
      pointsWall[1]
    );

    let mergeWalls: MergeWalls = {
      wallPoint0: null, // 0 точка другой стены
      wallPoint1: null  // 1 точка другой стены
    };

    if (hoverPointObject) {

      if (hoverPointObject.indexPoint == 0) {
        const otherMergeWallID: number = this.objectWalls.findIndex(el => el.id === hoverPointObject.id);
        if (otherMergeWallID != -1 && this.objectWalls[otherMergeWallID].mergeWalls.wallPoint1 === null) {
          mergeWalls.wallPoint0 = hoverPointObject.id; // 0 точка другой стены hoverPointObject.id
          this.objectWalls[otherMergeWallID].mergeWalls.wallPoint1 = uuid;
        }
      }

      if (hoverPointObject.indexPoint == 1) {
        const otherMergeWallID: number = this.objectWalls.findIndex(el => el.id === hoverPointObject.id);
        if (otherMergeWallID != -1 && this.objectWalls[otherMergeWallID].mergeWalls.wallPoint0 === null) {
          mergeWalls.wallPoint1 = hoverPointObject.id; // 1 точка другой стены hoverPointObject.id
          this.objectWalls[otherMergeWallID].mergeWalls.wallPoint0 = uuid;
        }
      }

    }

    const wallData: ObjectWall = {
      id: uuid,
      name: data.type,
      width: this.config.wall.width,
      height: this.config.wall.height,
      heightDirection: this.config.wall.heightDirection,
      angleDegrees: angleDegrees,
      updateTime: Date.now(),
      mergeWalls: mergeWalls,
      points: pointsWall,
      roomId: null,
    };

    if (wallUnderCursor) { // определение комнаты для стены

      wallData.roomId = wallUnderCursor.roomId;

    } else { // создаем комнату

      if (data.type !== 'dividing_wall') {

        // вызываем метод создания комнаты
        const rId: number | string = this.addRoom();

        if (!rId) {
          throw new Error("Failed to create a new room"); // throw error
        }

        wallData.roomId = rId;

      } else { // определяем, находится ли перегородка внутри какой-то комнаты или нет

        const rooms = this.allRooms; // спиосок всех комнат

        if(!rooms || rooms.length === 0){
          console.log('No rooms available for processing');
        }
        
        const originObject: Vector2 = getCenterOfPoints(wallData.points); // находим центр нового объекта

        if (!originObject) {
          console.error("Origin object is not defined.");
        } else {

          for (let i = 0, len = rooms.length; i < len; i++) {

            const pointInRoom: boolean = this.isPointInRoom(rooms[i].id, originObject);

            if (pointInRoom) {
              console.log('>>> Объект находится внутри комнаты');
              wallData.roomId = rooms[i].id;
              break;
            }

          }
          
        }

      }

    }

    console.log('all rooms:', this.allRooms);

    // 2. добавляем данные стены в this.objectWalls
    if (wallData.mergeWalls.wallPoint0) {

      const indexMergeWall = this.objectWalls.findIndex((el: ObjectWall) => el.id === wallData.mergeWalls.wallPoint0);
      if (indexMergeWall != -1) {
        this.objectWalls.splice(indexMergeWall, 0, wallData);
      }

    } else if (wallData.mergeWalls.wallPoint1) {

      const indexMergeWall = this.objectWalls.findIndex((el: ObjectWall) => el.id === wallData.mergeWalls.wallPoint1);
      if (indexMergeWall != -1) {
        this.objectWalls.splice(indexMergeWall + 1, 0, wallData);
      }

    } else {
      this.objectWalls.push(wallData);
    }
    // this.updateRoomStore(wallData.id, (wallData.mergeWalls.wallPoint0 || wallData.mergeWalls.wallPoint1 ? true : false));

    // 3. получаем из this.objectWalls добавленный объект и берем id
    const addedwall = this.objectWalls.find(el => el.id === uuid);
    const id = addedwall?.id;

    if (id) {

      // создаем контейнеры для визуализации стены
      const result = this.createDrawContainers(id);

      if (result) {
        const prevActiveObject = this.state.activeWall;
        this.state.activePointWall = 0;
        this.state.activeWall = id;
        if (prevActiveObject) {

          // если прошлая активная стена не соединяется с добавленной, то ее перерисовываем
          if (
            wallData.mergeWalls.wallPoint0 !== prevActiveObject &&
            wallData.mergeWalls.wallPoint1 !== prevActiveObject
          ) {
            this.drawWall(prevActiveObject);
          }

          const listRelatedWalls: (string | number)[] = this.getMergeWallsIDForUpdate(id);

          // визуализация списка стен и доабвляемая в списке
          this.drawListWalls(listRelatedWalls);


        } else {
          if (data.type === 'dividing_wall') {
            this.drawWall(id);
          } else {
            this.redrawAllObjects();
          }
        }
        this.parent.layers.startPointActiveObject.activate([pointsWall[0], pointsWall[1]]);
        this.parent.layers.arrowRulerActiveObject.draw(pointsWall[0]);

        this.parent.layers.startPointActiveObject.circleStartPoint.cursor = "pointer";
        this.app.stage.cursor = "pointer";

        this.parent.layers.startPointActiveObject.startPointRect.rotation = MathUtils.degToRad(wallData.angleDegrees);
        this.parent.layers.startPointActiveObject.endPointRect.rotation = MathUtils.degToRad(wallData.angleDegrees);

        if (data.type !== 'dividing_wall') this.redrawHalfRoom();

        // отображаем форму модификации стены
        this.parent.eventBus.emit(Events.C2D_SHOW_FORM_MODIFY_WALL, {
          width: addedwall.width * 10,
          height: addedwall.height * 10,
          position: {
            x: addedwall.points[0].x + this.parent.config.originOfCoordinates.x,
            y: addedwall.points[0].y + this.parent.config.originOfCoordinates.y
          }
        });

      }

    }

  }

  public isPointInRoom(roomId: number | string, targetPoint: Vector2): boolean {

    // Проверка входных параметров
    if (!roomId || !targetPoint) {
      throw new Error(`Invalid parameters: roomId(${roomId}) and targetPoint(${JSON.stringify(targetPoint)}) are required`);
    }

    const polygonPoints: Vector2[] = this.getRoomContour(roomId);

    // 5. Проверка принадлежности точки
    return isPointInPolygon(polygonPoints, targetPoint);

  }

  public getRoomContour(roomId: number | string): Vector2[] {

    // 2. Настройки точности
    const precision = 2; // Кол-во знаков после запятой
    const uniquePoints = new Map<string, Vector2>();

    // 3. Сбор уникальных точек (индексы 0 и 1)
    for (const wall of this.objectWalls) {
      if (wall.roomId === roomId && wall.name !== 'dividing_wall' && wall.points?.length >= 2) {
        // Точка 0
        const key0 = `${wall.points[0].x.toFixed(precision)},${wall.points[0].y.toFixed(precision)}`;
        uniquePoints.set(key0, wall.points[0]);

        // Точка 1
        const key1 = `${wall.points[1].x.toFixed(precision)},${wall.points[1].y.toFixed(precision)}`;
        uniquePoints.set(key1, wall.points[1]);
      }
    }

    // 4. Проверка минимального количества точек
    return Array.from(uniquePoints.values());

  }

  /*
  public updateRoomStore(id: number | string | null = null, mergeWall: boolean = false): void {

    if (!id) id = this.state.activeWall;

    if (!id) return;

    let wallData = this.objectWalls.find((el: ObjectWall) => el.id === id);
    if (wallData) {
      const { containers, ...wallDataWithoutContainers } = wallData;
      wallData = wallDataWithoutContainers;
    }

    if (wallData) {

      wallData = JSON.parse(JSON.stringify(wallData));

      if (mergeWall) {
        if (wallData?.mergeWalls.wallPoint0) {
          this.updateRoomStore(wallData?.mergeWalls.wallPoint0);
        }

        if (wallData?.mergeWalls.wallPoint1) {
          this.updateRoomStore(wallData?.mergeWalls.wallPoint1);
        }
      }

      this.roomStore.setWall({
        idRoom: this.roomStore.getSchemeTransitionData[0].id,
        wall: wallData
      });

    }

  }
  */

  // функция получения списка присоединенных стен для их обновления
  private getMergeWallsIDForUpdate(id: string | number): (string | number)[] {

    const wallData = this.objectWalls.find((el: ObjectWall) => el.id === id);
    if (!wallData) return [];

    const listRelatedWalls: (string | number)[] = [];
    listRelatedWalls.push(id);

    // найти связанные с добавляемой другие стены
    if (wallData.mergeWalls.wallPoint0) {
      listRelatedWalls.push(wallData.mergeWalls.wallPoint0);
      const otherMergeWall: ObjectWall | undefined = this.objectWalls.find(el => el.id === wallData.mergeWalls.wallPoint0);
      if (otherMergeWall && otherMergeWall.mergeWalls.wallPoint0) {
        const exist: number = listRelatedWalls.findIndex((id: string | number) => id === otherMergeWall.mergeWalls.wallPoint0);
        if (exist == -1) listRelatedWalls.push(otherMergeWall.mergeWalls.wallPoint0);
      }
    }
    if (wallData.mergeWalls.wallPoint1) {
      listRelatedWalls.push(wallData.mergeWalls.wallPoint1);
      const otherMergeWall: ObjectWall | undefined = this.objectWalls.find(el => el.id === wallData.mergeWalls.wallPoint1);
      if (otherMergeWall && otherMergeWall.mergeWalls.wallPoint1) {
        const exist: number = listRelatedWalls.findIndex((id: string | number) => id === otherMergeWall.mergeWalls.wallPoint1);
        if (exist == -1) listRelatedWalls.push(otherMergeWall.mergeWalls.wallPoint1);
      }
    }

    return listRelatedWalls;

  }

  // создаем контейнеры для визуализации cтены
  private createDrawContainers(id: string | number): number {

    const indexWall = this.objectWalls.findIndex(el => el.id === id);

    if (indexWall != -1) {

      const dataWall = this.objectWalls[indexWall];
      if (!dataWall) return 0;

      if (!dataWall.containers) {

        // создаем контейнеры
        dataWall.containers = {
          root: new PIXI.Container(),
          maskWall: new PIXI.Graphics(),
          bodyWall: new PIXI.Graphics(),
          lineWall: new PIXI.Graphics(),
          startPoint: new PIXI.Graphics(),
          endPoint: new PIXI.Graphics(),
          normalIndicator: new PIXI.Graphics(),
          textWallWidth: new PIXI.Text(),
          rulerWall: new PIXI.Graphics(),
          containerTextRulerWall: new PIXI.Container(),
          textRulerWall: new PIXI.Text({
            text: "",
            style: {
              fontSize: 16,
              fill: 0x5D6069,
            },
          }),
          eventGraphic: new PIXI.Graphics(),
        };

        if (dataWall.containers.root) this.container.addChild(dataWall.containers.root);

        if (dataWall.containers.containerTextRulerWall && dataWall.containers.textRulerWall) {
          dataWall.containers.containerTextRulerWall.addChild(dataWall.containers.textRulerWall);
        }

        if (dataWall.containers.eventGraphic) {
          dataWall.containers.eventGraphic.eventMode = 'static';
          (dataWall.containers.eventGraphic as PIXI.Graphics & { wallId?: string | number }).wallId = dataWall.id;

          // Изменяем курсор на pointer при наведении
          dataWall.containers.eventGraphic.on("mouseover", this.handlerOverEventGraphic);
          // Убираем курсор при уходе мыши
          dataWall.containers.eventGraphic.on("mouseout", this.handlerOutEventGraphic);
          // При клике делаем объект активным и перерисовываем
          dataWall.containers.eventGraphic.on("pointerdown", this.handlerDownEventGraphic);
        }

        if (dataWall.containers.root) {
          if (dataWall.containers.maskWall) dataWall.containers.root.addChild(dataWall.containers.maskWall);
          if (dataWall.containers.bodyWall) dataWall.containers.root.addChild(dataWall.containers.bodyWall);
          if (dataWall.containers.lineWall) dataWall.containers.root.addChild(dataWall.containers.lineWall);
          if (dataWall.containers.startPoint) dataWall.containers.root.addChild(dataWall.containers.startPoint);
          if (dataWall.containers.endPoint) dataWall.containers.root.addChild(dataWall.containers.endPoint);
          if (dataWall.containers.normalIndicator) dataWall.containers.root.addChild(dataWall.containers.normalIndicator);
          if (dataWall.containers.textWallWidth) dataWall.containers.root.addChild(dataWall.containers.textWallWidth);
          if (dataWall.containers.rulerWall) dataWall.containers.root.addChild(dataWall.containers.rulerWall);
          if (dataWall.containers.containerTextRulerWall) dataWall.containers.root.addChild(dataWall.containers.containerTextRulerWall);
          if (dataWall.containers.eventGraphic) dataWall.containers.root.addChild(dataWall.containers.eventGraphic);
        }

      }

      return 1;

    } else {

      return 0;

    }

  }

  // рисуем стену
  public drawWall(idWall: string | number): void {

    const obj: ObjectWall | undefined = this.objectWalls.find(el => el.id === idWall);
    if (!obj) return;

    // Получить контейнеры из объекта
    const containers = obj.containers;
    const points = JSON.parse(JSON.stringify(obj.points));
    const mergeWalls = obj.mergeWalls;

    // обновляем окно и двери в стене, если они есть
    if (this.parent.layers.doorsAndWindows) this.parent.layers.doorsAndWindows.updateObject(obj.id);

    { // рассчитываем новые координаты точек 2 и 3, если есть присоединенная стена

      if (obj.name === 'dividing_wall') {

        { // определяем находится ли точка _p0 на линии другой стены

          let pnl: Vector2 | null = null;
          let line: [Vector2, Vector2] | null = null;

          for (let i = 0, len = this.objectWalls.length; i < len; i++) {

            const wall: ObjectWall = this.objectWalls[i];

            if (wall.id === obj.id) continue; // пропускаем текущую стену

            pnl = isPointNearLine([wall.points[0], wall.points[1]], points[0], 1);

            if (wall.name === 'dividing_wall' && !pnl) {
              pnl = isPointNearLine([wall.points[2], wall.points[3]], points[0], 1);
              if (pnl) line = [wall.points[2], wall.points[3]];
            } else if (pnl) {
              line = [wall.points[0], wall.points[1]];
            }

            if (pnl) break;

          }

          if (line) {
            // если _p0 находится на линии другой стены, то находим точку _p3
            const pointIntLine: Vector2 | null = findRayLineIntersection(line[0], line[1], points[2], points[3]);
            if (pointIntLine) points[3] = pointIntLine;
          }

        }

        { // определяем находится ли точка _p1 на линии другой стены

          let pnl: Vector2 | null = null;
          let line: [Vector2, Vector2] | null = null;

          for (let i = 0, len = this.objectWalls.length; i < len; i++) {

            const wall: ObjectWall = this.objectWalls[i];

            if (wall.id === obj.id) continue; // пропускаем текущую стену

            pnl = isPointNearLine([wall.points[0], wall.points[1]], points[1], 1);

            if (wall.name === 'dividing_wall' && !pnl) {
              pnl = isPointNearLine([wall.points[2], wall.points[3]], points[1], 1);
              if (pnl) line = [wall.points[2], wall.points[3]];
            } else if (pnl) {
              line = [wall.points[0], wall.points[1]];
            }

            if (pnl) break;

          }

          if (line) {
            // если _p1 находится на линии другой стены, то находим точку _p2
            const pointIntLine: Vector2 | null = findRayLineIntersection(line[0], line[1], points[3], points[2]);
            if (pointIntLine) points[2] = pointIntLine;
          }

        }

      } else {

        if (mergeWalls.wallPoint0) {

          const otherWall: ObjectWall | undefined = this.objectWalls.find(el => el.id === mergeWalls.wallPoint0);

          if (otherWall) {

            const __p0 = obj.points[0];
            const __p1 = otherWall.points[0];
            const __p2 = otherWall.points[1];

            const vAngle = -getAngleBetweenVectors(__p1, __p0, __p2);
            const degTextAngle = vAngle < 0 ? 360 + vAngle : vAngle;

            if (degTextAngle > 35) {
              const activeWallHeight = obj.height;
              const mergeWallHeight = otherWall.height;

              if (activeWallHeight === mergeWallHeight) { // если толщина стен одинаковая

                const pointsOtherWall: Vector2[] = JSON.parse(JSON.stringify(otherWall.points));

                const line_0: [Vector2, Vector2] = [points[2], points[3]];
                const line_1: [Vector2, Vector2] = [pointsOtherWall[2], pointsOtherWall[3]];

                const intersectionPoint: Vector2 | null = getIntersectionPoint(line_0, line_1);

                if (intersectionPoint) {
                  points[2] = intersectionPoint;
                }

              } else if (activeWallHeight > mergeWallHeight) { // если толщина активной стены больше

                const isIntersect = doesVectorIntersectSegment(
                  [
                    obj.points[1],
                    obj.points[2]
                  ],
                  [
                    otherWall.points[2],
                    otherWall.points[3]
                  ]
                );
                if (isIntersect) {
                  isIntersect.x = Math.round(isIntersect.x * 100) / 100;
                  isIntersect.y = Math.round(isIntersect.y * 100) / 100;
                }

                if (!isIntersect) {
                  const pointsOtherWall: Vector2[] = JSON.parse(JSON.stringify(otherWall.points));

                  const line_0: [Vector2, Vector2] = [points[2], points[3]];
                  const line_1: [Vector2, Vector2] = [pointsOtherWall[2], pointsOtherWall[3]];

                  const intersectionPoint: Vector2 | null = getIntersectionPoint(line_0, line_1);

                  if (intersectionPoint) {
                    points[2] = intersectionPoint;
                  }
                }

              } else if (activeWallHeight < mergeWallHeight) { // если толщина активной стены меньше

                const isIntersect = doesVectorIntersectSegment(
                  [
                    otherWall.points[0],
                    otherWall.points[3]
                  ],
                  [
                    obj.points[3],
                    obj.points[2]
                  ]
                );

                if (isIntersect) {
                  points[2] = isIntersect;
                } else {
                  const pointsOtherWall: Vector2[] = JSON.parse(JSON.stringify(otherWall.points));

                  const line_0: [Vector2, Vector2] = [points[2], points[3]];
                  const line_1: [Vector2, Vector2] = [pointsOtherWall[2], pointsOtherWall[3]];

                  const intersectionPoint: Vector2 | null = getIntersectionPoint(line_0, line_1);

                  if (intersectionPoint) {
                    points[2] = intersectionPoint;
                  }
                }

              }
            }

          } else {

            mergeWalls.wallPoint0 = null;

          }

        }

        if (mergeWalls.wallPoint1) {

          const otherWall: ObjectWall | undefined = this.objectWalls.find(el => el.id === mergeWalls.wallPoint1);

          if (otherWall) {

            const __p0 = otherWall.points[0];
            const __p1 = obj.points[0];
            const __p2 = obj.points[1];

            const vAngle = -getAngleBetweenVectors(__p1, __p0, __p2);
            const degTextAngle = vAngle < 0 ? 360 + vAngle : vAngle;

            if (degTextAngle > 35) {
              const activeWallHeight = obj.height;
              const mergeWallHeight = otherWall.height;

              if (activeWallHeight === mergeWallHeight) { // если толщина стен одинаковая

                const pointsOtherWall: Vector2[] = JSON.parse(JSON.stringify(otherWall.points));

                const line_0: [Vector2, Vector2] = [points[2], points[3]];
                const line_1: [Vector2, Vector2] = [pointsOtherWall[2], pointsOtherWall[3]];

                const intersectionPoint: Vector2 | null = getIntersectionPoint(line_0, line_1);

                if (intersectionPoint) {
                  points[3] = intersectionPoint;
                }

              } else if (activeWallHeight > mergeWallHeight) { // если толщина активной стены больше

                const isIntersect = doesVectorIntersectSegment(
                  [
                    obj.points[0],
                    obj.points[3]
                  ],
                  [
                    otherWall.points[3],
                    otherWall.points[2]
                  ]
                );

                if (!isIntersect) {
                  const pointsOtherWall: Vector2[] = JSON.parse(JSON.stringify(otherWall.points));

                  const line_0: [Vector2, Vector2] = [points[2], points[3]];
                  const line_1: [Vector2, Vector2] = [pointsOtherWall[2], pointsOtherWall[3]];

                  const intersectionPoint: Vector2 | null = getIntersectionPoint(line_0, line_1);

                  if (intersectionPoint) {
                    points[3] = intersectionPoint;
                  }
                }

              } else if (activeWallHeight < mergeWallHeight) { // если толщина активной стены меньше

                const isIntersect = doesVectorIntersectSegment(
                  [
                    otherWall.points[1],
                    otherWall.points[2]
                  ],
                  [
                    obj.points[2],
                    obj.points[3]
                  ]
                );

                if (isIntersect) {
                  points[3] = isIntersect;
                } else {
                  const pointsOtherWall: Vector2[] = JSON.parse(JSON.stringify(otherWall.points));

                  const line_0: [Vector2, Vector2] = [points[2], points[3]];
                  const line_1: [Vector2, Vector2] = [pointsOtherWall[2], pointsOtherWall[3]];

                  const intersectionPoint: Vector2 | null = getIntersectionPoint(line_0, line_1);

                  if (intersectionPoint) {
                    points[3] = intersectionPoint;
                  }
                }

              }
            }

          } else {

            mergeWalls.wallPoint1 = null;

          }

        }

      }

    }

    const activeWallID = this.state.activeWall === obj.id ? true : false;

    if (points && containers) {

      // рисуем маску для wallBody
      if (containers.maskWall) {
        rect(
          containers.maskWall,
          {
            points: points,
            heightDirection: obj.heightDirection,
            color: "rgba(255,0,0,0.3)" //configWall.color.background // Цвет заливки
          }
        );
      }

      // рисуем тело стены
      if (containers.bodyWall) {

        drawVerticalLines(
          containers.bodyWall, // graphics
          points[0], // startPoint
          obj.width, // width
          obj.height, // height
          20, // spacing
          obj.heightDirection, // heightDirection
          this.config.wall.color.line76deg, // Цвет линий
          1, // Толщина линий
          obj.angleDegrees
        );

        if (containers.maskWall) containers.bodyWall.mask = containers.maskWall;

        // если эта стена активная, то рисуем пунктирную рамку, иначе сплошной линией
        if (activeWallID && obj.name !== 'dividing_wall') {
          // рисуем пунктирную рамку стены
          drawDashedOutline(containers.bodyWall, points);
        } else {
          // рисуем сплошную линию
          drawShape(containers.bodyWall, points, {}, (obj.name === 'dividing_wall' ? 4 : 1));
        }

      }

      // рисуем стрелку-вектор стены
      if (containers.lineWall) {

        if (activeWallID) {

          drawArrow(
            containers.lineWall,
            points[0],
            obj.width,
            obj.angleDegrees, // Угол направления стрелки в градусах
            {
              line: this.config.wall.color.arrowLineWall, // Цвет стрелки
              head: this.config.wall.color.arrowHeadLineWall
            },
            2, // Толщина линии
            12, // Размер треугольника (основание и высота)
            true
          );

          // рисуем указатель внутренне стороны стены (стрелка без линии)
          drawArrowHead(
            containers.lineWall,
            points[0], // позиция начала стены
            obj.width * 0.3, // расстояние по x от начала obj.points[0], где нужно нарисовать стрелку
            0, //obj.height, // number | расстояние по y от начала obj.points[0], где нужно нарисовать стрелку
            { axis: "y", value: (obj.heightDirection === 1 ? 1 : -1) }, // направление стрелки {axis: x | y, value: 1 | -1}
            obj.angleDegrees, // Угол направления стрелки в градусах относительно obj.points[0]
            this.config.wall.color.arrowHead, // Цвет стрелки
            12, // Размер треугольника (основание и высота)
            false // не очищаем графику
          );

          // рисуем указатель начала стены (стрелка без линии)
          drawArrowHead(
            containers.lineWall,
            points[0], // позиция начала стены
            0, // расстояние по x от начала obj.points[0], где нужно нарисовать стрелку
            (obj.heightDirection === 1 ? obj.height : -obj.height), // number | расстояние по y от начала obj.points[0], где нужно нарисовать стрелку
            { axis: "y", value: (obj.heightDirection === -1 ? 1 : -1) }, // направление стрелки {axis: x | y, value: 1 | -1}
            obj.angleDegrees, // Угол направления стрелки в градусах относительно obj.points[0]
            this.config.wall.color.arrowHead, // Цвет стрелки
            12, // Размер треугольника (основание и высота)
            false // не очищаем графику
          );

          // рисуем указатель конца стены (стрелка без линии)
          drawArrowHead(
            containers.lineWall,
            points[0], // позиция начала стены
            obj.width, // расстояние по x от начала data.points[0], где нужно нарисовать стрелку
            (obj.heightDirection === 1 ? obj.height : -obj.height), // number | расстояние по y от начала obj.points[0], где нужно нарисовать стрелку
            { axis: "y", value: (obj.heightDirection === -1 ? 1 : -1) }, // направление стрелки {axis: x | y, value: 1 | -1}
            obj.angleDegrees, // Угол направления стрелки в градусах относительно data.points[0]
            this.config.wall.color.arrowHead, // Цвет стрелки
            12, // Размер треугольника (основание и высота)
            false // не очищаем графику
          );

          drawArrowHead(
            containers.lineWall,
            points[0], // позиция начала стены
            obj.width * 0.4, // расстояние по x от начала obj.points[0], где нужно нарисовать стрелку
            0, // number | расстояние по y от начала obj.points[0], где нужно нарисовать стрелку
            { axis: "y", value: (obj.heightDirection === -1 ? 1 : -1) }, // направление стрелки {axis: x | y, value: 1 | -1}
            obj.angleDegrees, // Угол направления стрелки в градусах относительно obj.points[0]
            this.config.wall.color.green, // Цвет стрелки
            12, // Размер треугольника (основание и высота)
            false // не очищаем графику
          );

          drawArrowHead(
            containers.lineWall,
            points[0], // позиция начала стены
            obj.width * 0.4, // расстояние по x от начала obj.points[0], где нужно нарисовать стрелку
            (obj.heightDirection === -1 ? -obj.height : obj.height), // number | расстояние по y от начала obj.points[0], где нужно нарисовать стрелку
            { axis: "y", value: (obj.heightDirection === 1 ? 1 : -1) }, // направление стрелки {axis: x | y, value: 1 | -1}
            obj.angleDegrees, // Угол направления стрелки в градусах относительно obj.points[0]
            this.config.wall.color.green, // Цвет стрелки
            12, // Размер треугольника (основание и высота)
            false // не очищаем графику
          );

        } else {

          // containers.lineWall.clear(); // Очистка предыдущего содержимого
          if (obj.name !== 'dividing_wall') {
            drawLine(
              containers.lineWall,
              points[0],
              obj.width,
              obj.angleDegrees, // Угол направления стрелки в градусах
              this.config.wall.color.bodyLine,
              2, // Толщина линии
              true
            );
          } else {
            containers.lineWall.clear();
          }

        }

      }

      if (containers.rulerWall && containers.containerTextRulerWall) {

        if (this.state.activeWall) {

          containers.rulerWall.visible = true;

          const linePoints = drawLine(
            containers.rulerWall,
            points[0],
            obj.width,
            obj.angleDegrees, // Угол направления стрелки в градусах
            this.config.wall.color.arrowHead,
            0.6, // Толщина линии
            true,
            (obj.height + 20) * obj.heightDirection
          );

          for (let i = 0, len = linePoints.length; i < len; i++) { // граница линии начальной точки

            // Вычисляем точки p0 и p1 со смещением 8
            const p0: Vector2 = { x: linePoints[i].x - 5, y: linePoints[i].y };
            const p1: Vector2 = { x: linePoints[i].x + 5, y: linePoints[i].y };

            const rotatedP0 = rotatePoint(p0, linePoints[i], obj.angleDegrees + 100);
            const rotatedP1 = rotatePoint(p1, linePoints[i], obj.angleDegrees + 100);

            drawShape(
              containers.rulerWall,
              [
                rotatedP0,
                rotatedP1
              ], // Массив точек для контура
              {
                stroke: this.config.wall.color.arrowHead
              },
              0.6 // Толщина линии
            )

          }

          if (containers.textRulerWall) {

            containers.containerTextRulerWall.visible = true;
            containers.textRulerWall.text = "";

            const distance = getDistanceBetweenVectors(linePoints[0], linePoints[1]);

            containers.textRulerWall.text = (Number(distance.toFixed(1)) * 10).toString() + " мм";

            const pointText = offsetVectorBySegmentNormal(
              [linePoints[0], linePoints[1]],
              offsetVectorBySegment(
                [linePoints[0], linePoints[1]],
                getMidpoint(linePoints[0], linePoints[1]),
                -containers.textRulerWall.width / 2
              ),
              18 * obj.heightDirection
            );
            containers.containerTextRulerWall.x = pointText.x;
            containers.containerTextRulerWall.y = pointText.y;

            containers.containerTextRulerWall.pivot.x = 0.5;
            containers.containerTextRulerWall.pivot.y = 0.5;

            containers.containerTextRulerWall.rotation = MathUtils.degToRad(obj.angleDegrees);

          }

        } else {

          containers.rulerWall.clear();
          containers.rulerWall.visible = false;
          containers.containerTextRulerWall.visible = false;

        }

      }

      if (containers.eventGraphic) {
        rect(
          containers.eventGraphic,
          {
            points: obj.points,
            heightDirection: obj.heightDirection,
            color: "rgba(255,0,0,0)" //configWall.color.background // Цвет заливки
          }
        );

        // // объекь для показа центра стены
        // const centerObject = getCenterOfPoints(data.points);
        // drawCircle(
        //   containers.eventGraphic,
        //   centerObject,
        //   10, 
        //   "rgba(0,100,0,1)"
        // );

      }

    } else {
      return;
    }

  }

  public redrawHalfRoom(): void {

    const roomsHalf = [];

    const rooms = this.allRooms;

    rooms.forEach((room, index) => {

      const polygonPoints: Vector2[] = this.getRoomContour(room.id);

      const roomData = JSON.parse(JSON.stringify(room));
      roomData.points = polygonPoints;

      if(polygonPoints.length > 2){
        roomsHalf.push(roomData);
      }
      
    });

    if (roomsHalf.length != 0) {

      this.parent.layers.halfRoom.drawHalfRoom(roomsHalf);

    } else {
      this.parent.layers.halfRoom.removeHalfRoom();
    }

  }

  public drawListWalls(list: (number | string)[]): void {

    list.forEach((id: string | number) => {

      this.drawWall(id);

    });

    this.redrawHalfRoom();

  }

  /**
   * Находит точку соединения внутри полигона по заданной позиции.
   *
   * Проходит по списку объектов стен (`this.objectWalls`) и проверяет, находится ли переданная позиция `position`
   * внутри какого-либо полигона, определённого точками стены, игнорируя объект с id `ignoreObject`, если он указан.
   * Если позиция находится внутри полигона, вычисляет точку пересечения между позицией и первым ребром полигона
   * с помощью `getIntersectVectorLine` и возвращает id соответствующего объекта и точку пересечения.
   *
   * @param position - Позиция, для которой ищется пересечение с полигонами.
   * @param ignoreObject - (Необязательно) id объекта, который нужно игнорировать при поиске.
   * @returns Объект с id найденного полигона и точкой пересечения, либо `null`, если пересечение не найдено.
   *
   * @remarks
   * - Функция предполагает, что `this.objectWalls` — массив объектов с полями `id` и `points`.
   * - Для геометрических вычислений используются вспомогательные функции `isPointInPolygon` и `getIntersectVectorLine`.
   * - Для пересечения берётся только первое ребро полигона (`obj.points[0]` — `obj.points[1]`).
   *
   * @example
   * ```typescript
   * const result = getConnectionPointInPolygon(new Vector2(10, 20), 'wall-1');
   * if (result) {
   *   console.log(`Соединено со стеной ${result.id} в точке`, result.point);
   * }
   * ```
   */
  private getConnectionPointInPolygon(
    position: Vector2,
    ignoreObject: number | string | null = null
  ): { id: number | string; point: Vector2 } | null {

    let pointConnect: { id: number | string; indexPoint: number; point: Vector2 } | null = null;

    for (const obj of this.objectWalls) {
      const ignore = (ignoreObject !== null && obj.id === ignoreObject) ? true : false;

      if (obj.points && !ignore) {

        const result = isPointInPolygon(obj.points, position);

        if (result) {

          pointConnect = {};
          pointConnect.id = obj.id;
          pointConnect.point = getIntersectVectorLine([
            obj.points[0], obj.points[1]
          ], position);

          break;

        }

      }

    }

    return pointConnect;

  }

  // поискт совпадающей точки с координатами аргумента
  private getPointByPosition(
    position: Vector2,
    ignoreObject: number | string | null = null
  ): { id: number | string; indexPoint: number } | null {

    for (const obj of this.objectWalls) {

      if (obj.name === 'dividing_wall') continue; // пропускаем перегородки

      const ignore = (ignoreObject !== null && obj.id === ignoreObject) ? true : false;

      if (obj.points && !ignore) {
        for (let index = 0; index < 2; index++) {
          const point = obj.points[index];
          if (getDistanceBetweenVectors(point, position) < 10) {
            return { id: obj.id, indexPoint: index };
          }
        }
      }
    }
    return null;

  }

  public updateWallPoint(position: Vector2, __indexPoint: 0 | 1 | null = null): void {

    const indexPoint = __indexPoint !== null ? __indexPoint : this.state.activePointWall;
    const indexDataWall = this.objectWalls.findIndex(el => el.id === this.state.activeWall);

    if (indexDataWall == -1) return;

    const dataWall = this.objectWalls[indexDataWall];

    if (dataWall.name === 'dividing_wall') { // если это перегородка

      const newPoint = position;

      const newPoints = this.calculatePositionPointsWall(
        (indexPoint == 0 ? newPoint : dataWall.points[0]),
        (indexPoint == 1 ? newPoint : dataWall.points[1]),
        dataWall.height,
        dataWall.heightDirection
      );

      // обновить угол наклона стены
      dataWall.angleDegrees = getAngleBetweenVectors(
        newPoints[0],
        {
          x: newPoints[0].x + 300,
          y: newPoints[0].y
        },
        newPoints[1]
      );

      dataWall.width = getDistanceBetweenVectors(
        newPoints[0],
        newPoints[1]
      );

      dataWall.points = newPoints;

      if (indexPoint !== null) {
        this.parent.layers.arrowRulerActiveObject.draw(dataWall.points[indexPoint]);
        if (indexPoint == 0) this.parent.layers.startPointActiveObject.startPointRect.rotation = MathUtils.degToRad(dataWall.angleDegrees);
        if (indexPoint == 1) this.parent.layers.startPointActiveObject.endPointRect.rotation = MathUtils.degToRad(dataWall.angleDegrees);
      }

      this.drawWall(dataWall.id);

    } else {

      // ищем точку стены под курсором
      const hoverPointObject:
        HoverPointObject | null =
        this.getPointByPosition(position, dataWall.id);

      if (hoverPointObject) { // если есть точка другой стены под курсором

        // получаем данные стены на которую навели (точка стены 0 или 1)
        const connectWall = this.objectWalls.find((el: ObjectWall) => el.id === hoverPointObject.id);

        if (connectWall) { // если стена найдена и данные получены

          if (indexPoint == 0) { // если точка 0 под курсором

            /*
            Если стена под курсором не имеет присоединённой стены к точке 0,
            и индекс точки под курсором этой стены равен 1
            */
            if (connectWall.mergeWalls.wallPoint0 === null && hoverPointObject.indexPoint == 1) {

              connectWall.mergeWalls.wallPoint0 = dataWall.id;
              dataWall.mergeWalls.wallPoint1 = connectWall.id;

            }

          } else if (indexPoint == 1) { // если точка 1 под курсором

            /*
            Если стена под курсором не имеет присоединённой стены к точке 1,
            и индекс точки под курсором этой стены равен 0
            */
            if (connectWall.mergeWalls.wallPoint1 === null && hoverPointObject.indexPoint == 0) {

              connectWall.mergeWalls.wallPoint1 = dataWall.id;
              dataWall.mergeWalls.wallPoint0 = connectWall.id;

            }

          }

          /*
          * 1. При перемещении точки стены (возможно соединенной с другими стенами) на свободную точку другой стены:
          *    - Удаляем исходную комнату (к которой принадлежала перемещаемая стена)
          *    - Переносим все связанные стены в комнату, содержащую целевую точку под курсором
          *
          * 2. Проверка принадлежности стен к одной цепочке:
          *    2.1 Если перемещаемая стена и целевая точка принадлежат одной цепочке стен:
          *        - Оставляем без изменений (не допускаем соединения стены с самой собой)
          *    2.2 Если принадлежат разным цепочкам:
          *        - Выполняем удаление исходной комнаты и обновление roomId для всех стен цепочки
          */
          if (dataWall.roomId !== connectWall.roomId) {

            this.objectWalls.forEach(wall => {
              if (wall.roomId === dataWall.roomId) {
                wall.roomId = connectWall.roomId;
              }
            });

            this.removeRoom(dataWall.roomId);
            dataWall.roomId = connectWall.roomId;

            // !!! обновляем пол комнаты

          }

        } else {

          console.error('Connected wall not found for hoverPointObject:', hoverPointObject);

        }

      }

      const newPoints = this.calculatePositionPointsWall(
        (indexPoint == 0 ? position : dataWall.points[0]),
        (indexPoint == 1 ? position : dataWall.points[1]),
        dataWall.height,
        dataWall.heightDirection
      );

      // обновить угол наклона стены
      dataWall.angleDegrees = getAngleBetweenVectors(
        newPoints[0],
        {
          x: newPoints[0].x + 300,
          y: newPoints[0].y
        },
        newPoints[1]
      );

      dataWall.width = getDistanceBetweenVectors(
        newPoints[0],
        newPoints[1]
      );

      dataWall.points = newPoints;

      if (indexPoint !== null) {
        this.parent.layers.arrowRulerActiveObject.draw(dataWall.points[indexPoint]);
        if (indexPoint == 0) this.parent.layers.startPointActiveObject.startPointRect.rotation = MathUtils.degToRad(dataWall.angleDegrees);
        if (indexPoint == 1) this.parent.layers.startPointActiveObject.endPointRect.rotation = MathUtils.degToRad(dataWall.angleDegrees);
      }

      if (dataWall.mergeWalls.wallPoint0) this.updateMergeWallProperties(0, newPoints[1], dataWall.mergeWalls.wallPoint0);
      if (dataWall.mergeWalls.wallPoint1) this.updateMergeWallProperties(1, newPoints[0], dataWall.mergeWalls.wallPoint1);

      const listRelatedWalls: (string | number)[] = this.getMergeWallsIDForUpdate(dataWall.id);
      this.drawListWalls(listRelatedWalls);

    }

  }

  private updateMergeWallProperties(indexPoint: number, position: Vector2, idWall: string | number): void {

    const indexDataOtherWall: number = this.objectWalls.findIndex((el: ObjectWall) => el.id === idWall);
    if (indexDataOtherWall != -1) {
      const dataOtherWall = this.objectWalls[indexDataOtherWall];

      // меняем позицию точки
      dataOtherWall.points[indexPoint] = position;
      dataOtherWall.points = this.calculatePositionPointsWall(
        dataOtherWall.points[0],
        dataOtherWall.points[1],
        dataOtherWall.height,
        dataOtherWall.heightDirection
      );

      // меняем длину стены
      dataOtherWall.width = getDistanceBetweenVectors(
        dataOtherWall.points[0],
        dataOtherWall.points[1]
      );

      // меняем угол поворота
      dataOtherWall.angleDegrees = getAngleBetweenVectors(
        dataOtherWall.points[0],
        {
          x: dataOtherWall.points[0].x + 300,
          y: dataOtherWall.points[0].y
        },
        dataOtherWall.points[1]
      );

    }

  }

  public redrawAllObjects(): void {

    this.objectWalls.forEach((obj: ObjectWall) => {

      switch (obj.name) {
        case 'wall':
        case 'wall_vertical':
        case 'dividing_wall':
          this.drawWall(obj.id);
          break;

        default:
          break;
      }

    });

  }

  // расположение 2-х стен под углом 90 градусов
  public arrangeWallsAt_90_DegreeAngle(): void {

    if (this.state.activeWall !== null && this.state.activePointWall !== null) {

      const indexWall = this.objectWalls.findIndex(el => el.id === this.state.activeWall);

      if (indexWall != -1) {

        const dataWall = this.objectWalls[indexWall];
        if (!dataWall) return;

        if (this.state.activePointWall == 0) {

          if (!dataWall.mergeWalls.wallPoint1) return;

          const indexMergeWall = this.objectWalls.findIndex(el => el.id === dataWall.mergeWalls.wallPoint1);
          if (indexMergeWall == -1) return;

          const dataMergeWall = this.objectWalls[indexMergeWall];

          const p0 = dataMergeWall.points[0];
          const p1 = dataWall.points[0];
          const p2 = dataWall.points[1];

          const newP1 = adjustP1ForPerpendicularity(p0, p1, p2);

          this.updateWallPoint(newP1);

          this.parent.layers.startPointActiveObject.updatePositionIndicatorPoint(newP1);
          this.parent.layers.startPointActiveObject.drawAngleBetweenWalls();

          /* helper
          const graphic = new PIXI.Graphics();
          this.container.addChild(graphic);

          drawCircle(
            graphic,
            newP1,
            10, 
            "rgba(0,100,0,1)"
          );
          */

        } else if (this.state.activePointWall == 1) {

          if (!dataWall.mergeWalls.wallPoint0) return;

          const indexMergeWall = this.objectWalls.findIndex(el => el.id === dataWall.mergeWalls.wallPoint0);
          if (indexMergeWall == -1) return;

          const dataMergeWall = this.objectWalls[indexMergeWall];

          const p0 = dataWall.points[0];
          const p1 = dataWall.points[1];
          const p2 = dataMergeWall.points[1];

          const newP0 = adjustP1ForPerpendicularity(p0, p1, p2);

          this.updateWallPoint(newP0);

          this.parent.layers.startPointActiveObject.updatePositionIndicatorPoint(newP0);
          this.parent.layers.startPointActiveObject.drawAngleBetweenWalls();

        }

      }

    }

  }

  public deactiveWalls(): void {

    this.state.activeWall = null;
    this.state.activePointWall = null;

    this.parent.eventBus.emit(Events.C2D_HIDE_FORM_MODIFY_WALL);

    this.redrawAllObjects();

  }

  public updateScenePosition(): void {

    this.container.x = this.parent.config.originOfCoordinates.x + 30;
    this.container.y = this.parent.config.originOfCoordinates.y + 30;

    const indexPoint = this.state.activePointWall;
    const indexDataWall = this.objectWalls.findIndex(el => el.id === this.state.activeWall);

    if (indexDataWall == -1) return;

    const dataWall = this.objectWalls[indexDataWall];

    this.parent.eventBus.emit(Events.C2D_UPDATE_FORM_MODIFY_WALL, {
      width: Number(dataWall.width.toFixed(1)) * 10,
      height: Number(dataWall.height.toFixed(1)) * 10,
      position: {
        x: dataWall.points[0].x + this.parent.config.originOfCoordinates.x,
        y: dataWall.points[0].y + this.parent.config.originOfCoordinates.y
      }
    });

  }

  public deleteSelectedObject(): void {

    if (this.state.activeWall) {

      const indexWall = this.objectWalls.findIndex((el: ObjectWall) => el.id === this.state.activeWall);

      if (indexWall != -1) {

        for (const key in this.objectWalls[indexWall].containers) {

          const graphic = this.objectWalls[indexWall].containers[key as keyof ObjectWallContainers];

          if (graphic && typeof graphic.destroy === "function") {

            try {

              if (key === "eventGraphic" && graphic instanceof PIXI.Graphics) {
                graphic.off("mouseover", this.handlerOverEventGraphic);
                graphic.off("mouseout", this.handlerOutEventGraphic);
                graphic.off("pointerdown", this.handlerDownEventGraphic);
              }

              // Уничтожаем графику, только если она существует
              if (!graphic.destroyed) {
                graphic.destroy(true); // Уничтожаем графику рекурсивно
              }

              // Убираем из контейнера, если графика существует
              if (this.container && this.container.children.includes(graphic)) {
                this.container.removeChild(graphic);
              }

              // Обнуляем ссылку
              this.objectWalls[indexWall].containers[key as keyof ObjectWallContainers] = null!;

            } catch (error) {
              console.warn(`Failed to destroy graphic: ${key}`, error);
            }

          }

        }

        if (this.objectWalls[indexWall].mergeWalls.wallPoint0 !== null) {

          const wall = this.objectWalls.find((el: ObjectWall) => el.id === this.objectWalls[indexWall].mergeWalls.wallPoint0);
          if (wall) {
            wall.mergeWalls.wallPoint1 = null
          }

        }

        if (this.objectWalls[indexWall].mergeWalls.wallPoint1 !== null) {

          const wall = this.objectWalls.find((el: ObjectWall) => el.id === this.objectWalls[indexWall].mergeWalls.wallPoint1);
          if (wall) {
            wall.mergeWalls.wallPoint0 = null
          }

        }

        const count = this.objectWalls.reduce((acc, wall) => {
          return acc + (
            (
              wall.id !== this.objectWalls[indexWall].id && 
              wall.roomId === this.objectWalls[indexWall].roomId &&
              wall.name !== "dividing_wall"
            ) ? 1 : 0
          );
        }, 0);
        if (count == 0 && this.objectWalls[indexWall].roomId){

          // отвязываем все внутренние стены от удаленной комнаты
          this.objectWalls.forEach((wall: ObjectWall) => {
            if(wall.name === "dividing_wall" && wall.roomId === this.objectWalls[indexWall].roomId){
              wall.roomId = null;
            }
          });

          // отвязываем все внутренние объекты от удаленной комнаты
          this.parent.layers.doorsAndWindows.drawObjects.forEach((obj: IDrawObjects) => {
            if(obj.roomId === this.objectWalls[indexWall].roomId){
              obj.roomId = null;
            }
          });
          
          this.removeRoom(this.objectWalls[indexWall].roomId);
          
        }
        console.log('remove | all rooms:', this.allRooms);

        this.objectWalls.splice(indexWall, 1);
        // this.roomStore.removeWall({
        //   idRoom: this.roomStore.getSchemeTransitionData[0].id,
        //   idWall: this.state.activeWall
        // });

        this.state.activePointWall = null;
        this.parent.layers.doorsAndWindows.detachFromWall({
          type: "wall",
          id: this.state.activeWall
        });
        this.state.activeWall = null

        this.redrawAllObjects();
        this.parent.layers.arrowRulerActiveObject?.clearGraphic();
        this.parent.layers.startPointActiveObject?.activate(false);

        this.redrawHalfRoom();

      }

    }

  }

  public getWallProperty<T extends keyof ObjectWall>(
    id: string | number,
    propName: T
  ): ObjectWall[T] | null {
    const wall = this.objectWalls?.find(wall => wall.id === id);
    return wall ? JSON.parse(JSON.stringify(wall[propName])) : null;
  }

  public set scale(v: number) {
    this.container!.scale.set(v);
  }

  public destroy(): void {
    // Отписываемся от всех наблюдателей
    // this.unwatchList.forEach(unwatch => unwatch());
    // this.unwatchList = []; // Очищаем массив для безопасности

    // Удаляем графику из сцены
    this.objectWalls.forEach(drawObject => {
      const containers = drawObject.containers;

      // Уничтожаем каждый элемент контейнеров
      if (containers) {

        for (const key in containers) {

          if (
            key === "root" ||
            key === "containerTextRulerWall" ||
            key === "textRulerWall"
          ) continue; // пропускаем корневой контейнер

          const graphic = containers[key];

          if (graphic && typeof graphic.destroy === "function") {

            try {

              if (key === "eventGraphic" && graphic instanceof PIXI.Graphics) {
                graphic
                  .off("mouseover", this.handlerOverEventGraphic)
                  .off("mouseout", this.handlerOutEventGraphic)
                  .off("pointerdown", this.handlerDownEventGraphic);
              }

              // Уничтожаем графику, только если она существует
              if (graphic && typeof graphic.destroy === "function") {
                graphic.destroy({
                  texture: false,     // Удалить текстуру (если она есть)
                  baseTexture: false, // Удалить базовую текстуру (если есть)
                }); // Уничтожаем графику рекурсивно
              }

              // Убираем из контейнера, если графика существует
              if (containers.root && containers.root.children.includes(graphic)) containers.root.removeChild(graphic);

              // Обнуляем ссылку
              containers[key as keyof ObjectWallContainers] = null!;

            } catch (error) {
              console.warn(`Failed to destroy graphic: ${key}`, error);
            }

          } else {
            console.warn(`Skipping destroy for graphic: ${key}, as it is null or undefined`);
          }
        }

        // удаляем контейнер textRulerWall
        try {
          if (containers.textRulerWall && typeof containers.textRulerWall.destroy === "function") {
            containers.textRulerWall.destroy(true);
          }
          if (
            containers.containerTextRulerWall &&
            containers.containerTextRulerWall.children.includes(containers.textRulerWall)
          ) {
            containers.containerTextRulerWall.removeChild(containers.textRulerWall);
          }
          containers.textRulerWall = null!;
        } catch (error) {
          console.warn(`Failed to destroy graphic: textRulerWall`, error);
        }

        // удаляем контейнер containerTextRulerWall
        try {
          if (containers.containerTextRulerWall && typeof containers.containerTextRulerWall.destroy === "function") {
            containers.containerTextRulerWall.destroy(true);
          }
          if (
            containers.root &&
            containers.root.children.includes(containers.containerTextRulerWall)
          ) {
            containers.root.removeChild(containers.containerTextRulerWall);
          }
          containers.containerTextRulerWall = null!;
        } catch (error) {
          console.warn(`Failed to destroy graphic: containerTextRulerWall`, error);
        }

        // удаляем контейнер root
        try {
          if (containers.root && typeof containers.root.destroy === "function") {
            containers.root.destroy({
              children: true,     // Удалить дочерние элементы (если это Container)
              texture: false,     // Удалить текстуру (если она есть)
              baseTexture: false, // Удалить базовую текстуру (если есть)
            });
          }
          if (
            this.container &&
            this.container.children.includes(containers.root)
          ) {
            this.container.removeChild(containers.root);
          }
          containers.root = null!;
        } catch (error) {
          console.warn(`Failed to destroy graphic: root`, error);
        }

      }

    });


    this.app.stage
      .off("pointerup", this.handlerStageMouseUp)
      .off("mousemove", this.handlerStageMouseMove);

    this.parent.eventBus.off(Events.C2D_MODIFY_WALL, this.eventModifyWall);
    this.parent.eventBus.off(Events.C2D_REMOVE_WALL, this.eventRemoveWall);

    if (this.activeObjectGraphic) {
      this.activeObjectGraphic.destroy(true);
      this.app.stage.removeChild(this.activeObjectGraphic);
      this.activeObjectGraphic = null!;
    }

    this.objectWalls = []; // Очищаем массив объектов

    // Обнуляем другие ссылки
    this.app = null!;

  }

};
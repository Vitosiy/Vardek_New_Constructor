import * as PIXI from 'pixi.js';
import { MathUtils } from "three";

import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition";

import { Vector2 } from '@/types/constructor2d/interfaсes';

import {
  ObjectWall,
  ObjectWallContainers,
  Config,
  State,
  ArgumentDataAddWall,
  MergeWalls,
  HoverPointObject,
} from "./interfaces";

import {
  offsetVectorBySegmentNormal,
  // rotatePointsAroundCenter,
  rotatePoint,
  getDistanceBetweenVectors,
  offsetVectorBySegment,
  getMidpoint,
  getAngleBetweenVectors,
  getIntersectionPoint,
} from "@/Constructor2D/utils/Math";

import { 
  rect,
  drawVerticalLines,
  drawDashedOutline,
  drawArrow,
  drawArrowHead,
  drawShape,
  // drawCircle,
  drawLine,
} from "../../utils/Shape";

export default class Planner {

  private app: PIXI.Application;
  private parent: any;
  public container: PIXI.Container;

  private activeObjectGraphic:  PIXI.Graphics;
  
  private objectWalls: ObjectWall[] = [];

  private roomStore = useSchemeTransition();

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

  constructor(pixiApp: PIXI.Application, parent: any) {
    if (!pixiApp) throw new Error("PIXI.Application instance is required");

    this.app = pixiApp;
    this.parent = parent;
    this.container = new PIXI.Container();
    this.container.position.set(30, 30);
    this.app.stage.addChild(this.container);

    this.activeObjectGraphic = new PIXI.Graphics();
    this.app.stage.addChild(this.activeObjectGraphic);

    this.init();
  }

  // инициализация объектов для визуализации при запуске приложения
  private init(): void {

    const objs = this.objectWalls;
    if(objs.length > 0){
      for (let i=0, len=objs.length; i<len; i++) {
        const id = objs[i].id;
        // создаем контейнеры для визуализации стены
        const result = this.createDrawContainers(id);
        // визуализируем объект
        if(result){
          this.drawWall(id);
        }
      }
    }

  }

  private calculatePositionPointsWall(point0:Vector2, point1:Vector2, height: number, heightDirection: -1 | 1): [Vector2, Vector2, Vector2, Vector2] {

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

  // обавление стены в класс Planner при пересаскивании из меню с помощью drag and drop
  public addWall(data: ArgumentDataAddWall): void {

    /*
    * data.position = {x: 0, y: 0} - position cursor pointer
    * data.type = wall | wall_vertical
    */

    if(!data.type || !data.position) return;

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

    if(data.type === 'wall_vertical'){
      linePoint_0 = canvasPositionMouse;
      linePoint_1 = {
        x: canvasPositionMouse.x,
        y: canvasPositionMouse.y + this.config.wall.width
      }
    }

    // ищем точку стены под курсором
    const hoverPointObject: 
    HoverPointObject | null = 
    this.getPointByPosition({
      x: positionObjectX,
      y: positionObjectY
    });

    let angleDegreesConnectWall = 0;
    let directionX = 1;
    let directionY = 1;

    if(hoverPointObject){

      const hoverDataWall: ObjectWall | undefined = this.objectWalls.find((el: ObjectWall) => el.id === hoverPointObject.id);
      
      if(hoverDataWall){

        const hoverPoints: Vector2[] = hoverDataWall.points;
        angleDegreesConnectWall = hoverDataWall.angleDegrees;

        directionX = ((hoverPoints[0].x - hoverPoints[1].x) < 0 ? 1 : -1);
        directionY = ((hoverPoints[0].y - hoverPoints[1].y) < 0 ? 1 : -1);

        // console.log("directionX:", directionX, ' | ', "directionY:", directionY);
      
        if(hoverPointObject.indexPoint == 0 && hoverDataWall.mergeWalls.wallPoint1 === null){

          if(data.type === 'wall_vertical'){

            linePoint_0 = {
              x: hoverPoints[0].x,
              y: hoverPoints[0].y + this.config.wall.width
            };
            linePoint_1 = hoverPoints[0];
            
          }else if(data.type === 'wall'){
            
            linePoint_0 = {
              x: hoverPoints[0].x - this.config.wall.width,
              y: hoverPoints[0].y
            };
            linePoint_1 = hoverPoints[0];
            
          }

        }else if(hoverPointObject.indexPoint == 1 && hoverDataWall.mergeWalls.wallPoint0 === null){

          if(data.type === 'wall_vertical'){

            linePoint_0 = hoverPoints[1];
            if(directionY == -1){
              linePoint_1 = rotatePoint({
                x: hoverPoints[1].x,
                y: hoverPoints[1].y + this.config.wall.width
              }, linePoint_0, 180);
            }else if(directionY == 1){
              linePoint_1 = {
                x: hoverPoints[1].x,
                y: hoverPoints[1].y + this.config.wall.width
              };
            }
            
          }else if(data.type === 'wall'){
            
            linePoint_0 = hoverPoints[1];
            if(directionX == -1){
              linePoint_1 = rotatePoint({
                x: hoverPoints[1].x + this.config.wall.width,
                y: hoverPoints[1].y
              }, linePoint_0, 180);
            }else if(directionX == 1){
              linePoint_1 = {
                x: hoverPoints[1].x + this.config.wall.width,
                y: hoverPoints[1].y
              };
            }
            
          }

        }

      }
      
    }

    if(linePoint_0.x < 0) linePoint_0.x = 0;
    if(linePoint_0.y < 0) linePoint_0.y = 0;
    if(linePoint_1.x < 0) linePoint_1.x = 0;
    if(linePoint_1.y < 0) linePoint_1.y = 0;

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

    if(hoverPointObject){

      if(hoverPointObject.indexPoint == 0){
        const otherMergeWallID: number = this.objectWalls.findIndex(el => el.id === hoverPointObject.id);
        if(otherMergeWallID != -1 && this.objectWalls[otherMergeWallID].mergeWalls.wallPoint1 === null){
          mergeWalls.wallPoint0 = hoverPointObject.id; // 0 точка другой стены hoverPointObject.id
          this.objectWalls[otherMergeWallID].mergeWalls.wallPoint1 = uuid;
        }
      }

      if(hoverPointObject.indexPoint == 1){
        const otherMergeWallID: number = this.objectWalls.findIndex(el => el.id === hoverPointObject.id);
        if(otherMergeWallID != -1 && this.objectWalls[otherMergeWallID].mergeWalls.wallPoint0 === null){
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
      points: pointsWall
    };

    // 2. добавляем данные стены в this.objectWalls
    if(wallData.mergeWalls.wallPoint0){
        
      const indexMergeWall = this.objectWalls.findIndex((el: ObjectWall) => el.id === wallData.mergeWalls.wallPoint0);
      if(indexMergeWall != -1){
        this.objectWalls.splice(indexMergeWall, 0, wallData);
      }

    }else if(wallData.mergeWalls.wallPoint1){
        
      const indexMergeWall = this.objectWalls.findIndex((el: ObjectWall) => el.id === wallData.mergeWalls.wallPoint1);
      if(indexMergeWall != -1){
        this.objectWalls.splice(indexMergeWall + 1, 0, wallData);
      }
      
    }else{
      this.objectWalls.push(wallData);
    }
    this.updateRoomStore(wallData.id, (wallData.mergeWalls.wallPoint0 || wallData.mergeWalls.wallPoint1 ? true: false));

    // 3. получаем из this.objectWalls добавленный объект и берем id
    const addedwall = this.objectWalls.find(el => el.id === uuid);
    const id = addedwall?.id;

    if(id){
    
      const result = this.createDrawContainers(id);

      if(result){
        const prevActiveObject = this.state.activeWall;
        this.state.activePointWall = 0;
        this.state.activeWall = id;
        if(prevActiveObject){

          // если прошлая активная стена не соединяется с добавленной, то ее перерисовываем
          if(
            wallData.mergeWalls.wallPoint0 !== prevActiveObject && 
            wallData.mergeWalls.wallPoint1 !== prevActiveObject
          ){
            this.drawWall(prevActiveObject);
          }

          const listRelatedWalls: (string | number)[] = this.getMergeWallsIDForUpdate(id);
          
          // визуализация списка стен и доабвляемая в списке
          this.drawListWalls(listRelatedWalls);
        

        }else{
          this.redrawAllObjects();
        }
        this.parent.layers.startPointActiveObject.activate([pointsWall[0], pointsWall[1]]);
        this.parent.layers.arrowRulerActiveObject.draw(pointsWall[0]);

        this.parent.layers.startPointActiveObject.circleStartPoint.cursor = "pointer";
        this.app.stage.cursor = "pointer";

        this.parent.layers.startPointActiveObject.startPointRect.rotation = MathUtils.degToRad(wallData.angleDegrees);
        this.parent.layers.startPointActiveObject.endPointRect.rotation = MathUtils.degToRad(wallData.angleDegrees);
        
      }

    }

  }

  public updateRoomStore(id: number | string | null = null, mergeWall: boolean = false): void {

    if(!id) id = this.state.activeWall;

    if(!id) return;

    let wallData = this.objectWalls.find((el: ObjectWall) => el.id === id);
    if (wallData) {
      const { containers, ...wallDataWithoutContainers } = wallData;
      wallData = wallDataWithoutContainers;
    }

    if(wallData){

      wallData = JSON.parse(JSON.stringify(wallData));

      if(mergeWall){
        if(wallData?.mergeWalls.wallPoint0){
          this.updateRoomStore(wallData?.mergeWalls.wallPoint0);
        }

        if(wallData?.mergeWalls.wallPoint1){
          this.updateRoomStore(wallData?.mergeWalls.wallPoint1);
        }
      }

      this.roomStore.setWall({
        idRoom: this.roomStore.getSchemeTransitionData[0].id,
        wall: wallData
      });

    }
    
  }

  // функция получения списка присоединенных стен для их обновления
  private getMergeWallsIDForUpdate(id: string | number): (string | number)[] {

    const wallData = this.objectWalls.find((el: ObjectWall) => el.id === id);
    if(!wallData) return [];

    const listRelatedWalls: (string | number)[] = [];
    listRelatedWalls.push(id);

    // найти связанные с добавляемой другие стены
    if(wallData.mergeWalls.wallPoint0){
      listRelatedWalls.push(wallData.mergeWalls.wallPoint0);
      const otherMergeWall: ObjectWall | undefined = this.objectWalls.find(el => el.id === wallData.mergeWalls.wallPoint0);
      if(otherMergeWall && otherMergeWall.mergeWalls.wallPoint0){
        const exist: number = listRelatedWalls.findIndex((id: string | number) => id === otherMergeWall.mergeWalls.wallPoint0);
        if(exist == -1) listRelatedWalls.push(otherMergeWall.mergeWalls.wallPoint0);
      }
    }
    if(wallData.mergeWalls.wallPoint1){
      listRelatedWalls.push(wallData.mergeWalls.wallPoint1);
      const otherMergeWall: ObjectWall | undefined = this.objectWalls.find(el => el.id === wallData.mergeWalls.wallPoint1);
      if(otherMergeWall && otherMergeWall.mergeWalls.wallPoint1){
        const exist: number = listRelatedWalls.findIndex((id: string | number) => id === otherMergeWall.mergeWalls.wallPoint1);
        if(exist == -1) listRelatedWalls.push(otherMergeWall.mergeWalls.wallPoint1);
      }
    }

    return listRelatedWalls;
    
  }

  // создаем контейнеры для визуализации
  private createDrawContainers(id: string | number): number{

    const indexWall = this.objectWalls.findIndex(el => el.id === id);

    if(indexWall != -1){

      const dataWall = this.objectWalls[indexWall];
      if(!dataWall) return 0;

      if(!dataWall.containers){

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

        if(dataWall.containers.root) this.container.addChild(dataWall.containers.root);
    
        if(dataWall.containers.containerTextRulerWall && dataWall.containers.textRulerWall){
          dataWall.containers.containerTextRulerWall.addChild(dataWall.containers.textRulerWall);
        }
    
        if(dataWall.containers.eventGraphic){
          dataWall.containers.eventGraphic.eventMode = 'static';
          // Изменяем курсор на pointer при наведении
          dataWall.containers.eventGraphic.on("mouseover", this.handlerOverEventGraphic.bind(this, dataWall.containers.eventGraphic));
          // Убираем курсор при уходе мыши
          dataWall.containers.eventGraphic.on("mouseout", this.handlerOutEventGraphic.bind(this, dataWall.containers.eventGraphic));
          // При клике делаем объект активным и перерисовываем
          dataWall.containers.eventGraphic.on("pointerdown", this.handlerEventGraphic.bind(this, dataWall.id));

          dataWall.containers.eventGraphic.on("pointerup", this.handlerUpEventGraphic.bind(this/*, dataWall.id*/));
          this.app.stage.on("mousemove", this.handlerMoveEventGraphic.bind(this));
        }

        if(dataWall.containers.root){
          if(dataWall.containers.maskWall) dataWall.containers.root.addChild(dataWall.containers.maskWall);
          if(dataWall.containers.bodyWall) dataWall.containers.root.addChild(dataWall.containers.bodyWall);
          if(dataWall.containers.lineWall) dataWall.containers.root.addChild(dataWall.containers.lineWall);
          if(dataWall.containers.startPoint) dataWall.containers.root.addChild(dataWall.containers.startPoint);
          if(dataWall.containers.endPoint) dataWall.containers.root.addChild(dataWall.containers.endPoint);
          if(dataWall.containers.normalIndicator) dataWall.containers.root.addChild(dataWall.containers.normalIndicator);
          if(dataWall.containers.textWallWidth) dataWall.containers.root.addChild(dataWall.containers.textWallWidth);
          if(dataWall.containers.rulerWall) dataWall.containers.root.addChild(dataWall.containers.rulerWall);
          if(dataWall.containers.containerTextRulerWall) dataWall.containers.root.addChild(dataWall.containers.containerTextRulerWall);
          if(dataWall.containers.eventGraphic) dataWall.containers.root.addChild(dataWall.containers.eventGraphic);
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
    if(!obj) return;
  
    // Получить контейнеры из объекта
    const containers = obj.containers;
    const points = JSON.parse(JSON.stringify(obj.points));
    const mergeWalls = obj.mergeWalls;

    { // рассчитываем новые координаты точек 2 и 3, если есть присоединенная стена

      if(mergeWalls.wallPoint0){

        const otherWall: ObjectWall | undefined = this.objectWalls.find(el => el.id === mergeWalls.wallPoint0);
        
        if(otherWall){

          const pointsOtherWall: Vector2[] = JSON.parse(JSON.stringify(otherWall.points));

          const line_0: [Vector2, Vector2] = [points[2], points[3]];
          const line_1: [Vector2, Vector2] = [pointsOtherWall[2], pointsOtherWall[3]];

          const intersectionPoint: Vector2 | null = getIntersectionPoint(line_0, line_1);

          if(intersectionPoint){
            points[2] = intersectionPoint;
          }
          
        } else {

          mergeWalls.wallPoint0 = null;
          
        }
        
      }
      
      if(mergeWalls.wallPoint1){

        const otherWall: ObjectWall | undefined = this.objectWalls.find(el => el.id === mergeWalls.wallPoint1);
        
        if(otherWall){

          const pointsOtherWall: Vector2[] = JSON.parse(JSON.stringify(otherWall.points));

          const line_0: [Vector2, Vector2] = [points[2], points[3]];
          const line_1: [Vector2, Vector2] = [pointsOtherWall[2], pointsOtherWall[3]];

          const intersectionPoint: Vector2 | null = getIntersectionPoint(line_0, line_1);

          if(intersectionPoint){
            points[3] = intersectionPoint;
          }
          
        } else {

          mergeWalls.wallPoint1 = null;
          
        }

      }

    }

    const activeWallID = this.state.activeWall === obj.id ? true : false;

    if(points && containers){

      // рисуем маску для wallBody
      if(containers.maskWall){
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
      if(containers.bodyWall){
        
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

        if(containers.maskWall) containers.bodyWall.mask = containers.maskWall;

        // если эта стена активная, то рисуем пунктирную рамку, иначе сплошной линией
        if(activeWallID){
          // рисуем пунктирную рамку стены
          drawDashedOutline(containers.bodyWall, points);
        }else{
          // рисуем сплошную линию
          drawShape(containers.bodyWall, points);
        }
    
      }
      
      // рисуем стрелку-вектор стены
      if(containers.lineWall){

        if(activeWallID){
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
            {axis: "y", value: (obj.heightDirection === 1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
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
            {axis: "y", value: (obj.heightDirection === -1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
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
            {axis: "y", value: (obj.heightDirection === -1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
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
            {axis: "y", value: (obj.heightDirection === -1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
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
            {axis: "y", value: (obj.heightDirection === 1 ? 1 : -1)}, // направление стрелки {axis: x | y, value: 1 | -1}
            obj.angleDegrees, // Угол направления стрелки в градусах относительно obj.points[0]
            this.config.wall.color.green, // Цвет стрелки
            12, // Размер треугольника (основание и высота)
            false // не очищаем графику
          );

        }else{

          // containers.lineWall.clear(); // Очистка предыдущего содержимого
          drawLine(
            containers.lineWall,
            points[0],
            obj.width,
            obj.angleDegrees, // Угол направления стрелки в градусах
            this.config.wall.color.bodyLine,
            2, // Толщина линии
            true
          );
          
        }
        
      }

      if(containers.rulerWall && containers.containerTextRulerWall){

        if(this.state.activeWall){

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

          for(let i=0, len=linePoints.length; i<len; i++){ // граница линии начальной точки

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

          if(containers.textRulerWall){

            containers.containerTextRulerWall.visible = true;
            containers.textRulerWall.text = "";

            const distance = getDistanceBetweenVectors(linePoints[0], linePoints[1]);

            containers.textRulerWall.text = (Number(distance.toFixed(1))*10).toString() + " cм";

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

        }else{

          containers.rulerWall.clear();
          containers.rulerWall.visible = false;
          containers.containerTextRulerWall.visible = false;

        }
        
      }
    
      if(containers.eventGraphic){
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

    }else{
      return;
    }

  }

  public drawListWalls(list: (number | string)[]): void {

    list.forEach((id: string | number) => {

      this.drawWall(id);
      
    });
    
  }

  // поискт совпадающей точки с координатами аргумента
  private getPointByPosition(
    position: Vector2, 
    ignoreObject: number | string | null = null
  ): { id: number | string; indexPoint: number } | null {

    for (const obj of this.objectWalls) {
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

  public updateWallPoint(position: Vector2): void {

    const indexPoint = this.state.activePointWall;
    const indexDataWall = this.objectWalls.findIndex(el => el.id === this.state.activeWall);

    if(indexDataWall == -1) return;

    const dataWall = this.objectWalls[indexDataWall];

    // ищем точку стены под курсором
    const hoverPointObject: 
    HoverPointObject | null = 
    this.getPointByPosition(position, dataWall.id);

    if(hoverPointObject){

      const connectWall = this.objectWalls.find((el: ObjectWall) => el.id === hoverPointObject.id);

      if(connectWall){

        if(indexPoint == 0){

          if(connectWall.mergeWalls.wallPoint0 === null && hoverPointObject.indexPoint == 1){

            connectWall.mergeWalls.wallPoint0 = dataWall.id;
            dataWall.mergeWalls.wallPoint1 = connectWall.id;
            
          }
          
        }else if(indexPoint == 1){

          if(connectWall.mergeWalls.wallPoint1 === null && hoverPointObject.indexPoint == 0){

            connectWall.mergeWalls.wallPoint1 = dataWall.id;
            dataWall.mergeWalls.wallPoint0 = connectWall.id;
            
          }
          
        }

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

    if(indexPoint !== null){
      this.parent.layers.arrowRulerActiveObject.draw(dataWall.points[indexPoint]);
      if(indexPoint == 0) this.parent.layers.startPointActiveObject.startPointRect.rotation = MathUtils.degToRad(dataWall.angleDegrees);
      if(indexPoint == 1) this.parent.layers.startPointActiveObject.endPointRect.rotation = MathUtils.degToRad(dataWall.angleDegrees);
    }

    if(dataWall.mergeWalls.wallPoint0) this.updateMergeWallProperties(0, newPoints[1], dataWall.mergeWalls.wallPoint0);
    if(dataWall.mergeWalls.wallPoint1) this.updateMergeWallProperties(1, newPoints[0], dataWall.mergeWalls.wallPoint1);

    const listRelatedWalls: (string | number)[] = this.getMergeWallsIDForUpdate(dataWall.id);
    this.drawListWalls(listRelatedWalls);
    
  }

  private updateMergeWallProperties(indexPoint: number, position: Vector2, idWall: string | number): void {

    const indexDataOtherWall: number = this.objectWalls.findIndex((el: ObjectWall) => el.id === idWall);
    if(indexDataOtherWall != -1){
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

  public redrawAllObjects():void {
    
    this.objectWalls.forEach((obj: ObjectWall) => {

      switch (obj.name) {
        case 'wall':
        case 'wall_vertical':
          this.drawWall(obj.id);
          break;
      
        default:
          break;
      }

    });
    
  }

  public deactiveWalls(): void {
    
    this.state.activeWall = null;
    this.state.activePointWall = null;

    this.redrawAllObjects();
    
  }

  public updateScenePosition(): void {

    this.container.x = this.parent.config.originOfCoordinates.x + 30;
    this.container.y = this.parent.config.originOfCoordinates.y + 30;
    
  }
  
  private handlerOverEventGraphic(graphic: PIXI.Graphics): void{
    graphic.cursor = "pointer";
  }

  private handlerOutEventGraphic(graphic: PIXI.Graphics): void{
    graphic.cursor = "defalut";
  }
 
  private handlerEventGraphic(id: number | string, e:PIXI.FederatedPointerEvent):void {
    
    if (e.button == 0){

      this.state.mouseLeft = true;

      const prevActiveObject = this.state.activeWall;

      this.state.activeWall = id;
      this.state.activePointWall = 0;

      const addedwall = this.objectWalls.find(el => el.id === id);

      if (addedwall && addedwall.points) {
        this.state.oldPosition = JSON.parse(JSON.stringify(addedwall.points));
      }
      
      this.state.positionDown.x = e.global.x;
      this.state.positionDown.y = e.global.y;
      
      if(id !== prevActiveObject){

        if(!prevActiveObject){
          this.redrawAllObjects();
        }else{
          this.drawWall(prevActiveObject);
          this.drawWall(id);
        }
        
        // рендеринг стрелок
        this.parent.layers.arrowRulerActiveObject.draw(addedwall?.points[this.state.activePointWall]);

        // рендеринг активных точек
        this.parent.layers.startPointActiveObject.activate(
          [
            addedwall?.points[0],
            addedwall?.points[1]
          ], 
          this.state.activePointWall
        );

        if(addedwall){
          this.parent.layers.startPointActiveObject.startPointRect.rotation = MathUtils.degToRad(addedwall.angleDegrees);
          this.parent.layers.startPointActiveObject.endPointRect.rotation = MathUtils.degToRad(addedwall.angleDegrees);
        }

      }

    }

    e.stopPropagation(); // Останавливаем всплытие события

  }

  private handlerUpEventGraphic(/*id: number | string,*/ e:PIXI.FederatedPointerEvent):void {
    
    this.state.mouseLeft = false;
    this.state.oldPosition = [];
    this.state.positionDown = {x: 0, y: 0};

    e.stopPropagation(); // Останавливаем всплытие события
  }

  private handlerMoveEventGraphic(e:PIXI.FederatedPointerEvent): void {

    if(this.state.mouseLeft && this.state.activeWall){

      const id = this.state.activeWall;

      const mousePostion: Vector2 = {
        x: e.global.x,
        y: e.global.y
      };

      const distance: Vector2 = {
        x: mousePostion.x - this.state.positionDown.x,
        y: mousePostion.y - this.state.positionDown.y
      };

      const dataWall = this.objectWalls.find(el => el.id === id);

      if(dataWall){

        let status = true;
        dataWall.points.forEach((p: Vector2, index: number) => {
          if(
            this.state.oldPosition[index].x + distance.x < 0 || 
            this.state.oldPosition[index].y + distance.y < 0
          ){
            status = false;
          }
        });

        if(status){
        
          dataWall.points.forEach((p: Vector2, index: number) => {
            p.x = this.state.oldPosition[index].x + distance.x;
            p.y = this.state.oldPosition[index].y + distance.y;
          });

          if(dataWall.mergeWalls.wallPoint0){
            this.updateMergeWallProperties(
              0, 
              dataWall.points[1], 
              dataWall.mergeWalls.wallPoint0
            );
          }

          if(dataWall.mergeWalls.wallPoint1){
            this.updateMergeWallProperties(
              1,
              dataWall.points[0],
              dataWall.mergeWalls.wallPoint1
            );
          }

          const listRelatedWalls: (string | number)[] = this.getMergeWallsIDForUpdate(id);
          // визуализация списка стен и доабвляемая в списке
          this.drawListWalls(listRelatedWalls);

          this.parent.layers.startPointActiveObject.activate([dataWall.points[0], dataWall.points[1]]);
          this.parent.layers.arrowRulerActiveObject.draw(dataWall.points[this.state.activePointWall ?? 0]);
        }

      }

      e.stopPropagation(); // Останавливаем всплытие события
      
    }
    
  }

  public deleteSelectedObject(): void {

    if(this.state.activeWall){

      const indexWall = this.objectWalls.findIndex((el:ObjectWall) => el.id === this.state.activeWall);

      if(indexWall != -1){

        for(const key in this.objectWalls[indexWall].containers){

          const graphic = this.objectWalls[indexWall].containers[key as keyof ObjectWallContainers];

          if (graphic && typeof graphic.destroy === "function") {

            try {

              if(key === "eventGraphic" && graphic instanceof PIXI.Graphics){
                graphic.off("mouseover", this.handlerOverEventGraphic.bind(this, graphic));
                graphic.off("mouseout", this.handlerOutEventGraphic.bind(this, graphic));
                graphic.off("pointerdown", this.handlerEventGraphic.bind(this, this.objectWalls[indexWall].id));
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

        if(this.objectWalls[indexWall].mergeWalls.wallPoint0 !== null){

          const wall = this.objectWalls.find((el: ObjectWall) => el.id === this.objectWalls[indexWall].mergeWalls.wallPoint0);
          if(wall){
            wall.mergeWalls.wallPoint1 = null
          }
          
        }

        if(this.objectWalls[indexWall].mergeWalls.wallPoint1 !== null){

          const wall = this.objectWalls.find((el: ObjectWall) => el.id === this.objectWalls[indexWall].mergeWalls.wallPoint1);
          if(wall){
            wall.mergeWalls.wallPoint0 = null
          }
          
        }

        this.objectWalls.splice(indexWall, 1);
        this.roomStore.removeWall({
          idRoom: this.roomStore.getSchemeTransitionData[0].id,
          idWall: this.state.activeWall
        });

        this.state.activePointWall = null;
        this.state.activeWall = null

        this.redrawAllObjects();
        this.parent.layers.arrowRulerActiveObject?.clearGraphic();
        this.parent.layers.startPointActiveObject?.activate(false);
        
      }
      
    }
    
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
      if(containers){
        for (const key in containers) {
          const graphic = containers[key as keyof ObjectWallContainers];
          
          if (graphic && typeof graphic.destroy === "function") {

            try {

              if(key === "eventGraphic" && graphic instanceof PIXI.Graphics){
                graphic.off("mouseover", this.handlerOverEventGraphic.bind(this, graphic));
                graphic.off("mouseout", this.handlerOutEventGraphic.bind(this, graphic));
                graphic.off("pointerdown", this.handlerEventGraphic.bind(this, drawObject.id));
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
              containers[key as keyof ObjectWallContainers] = null!;

            } catch (error) {
              console.warn(`Failed to destroy graphic: ${key}`, error);
            }
          } else {
            console.warn(`Skipping destroy for graphic: ${key}, as it is null or undefined`);
          }
        }
      }

    });

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
//@ts-nocheck
import * as PIXI from 'pixi.js';
import { MathUtils } from "three";

import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition";

import {
  rotatePointsAroundCenter,
  offsetVectorBySegmentNormal,
  getAngleBetweenVectors,
  getDistanceBetweenVectors,
} from "./../../../../utils/Math/index";

import {
  ObjectWall,
} from "./../../interfaces";

import {
  drawCircle
} from "./../../../../utils/Shape/index";

import { Vector2 } from "@/types/constructor2d/interfaсes";

const roomsStore = useSchemeTransition();

export function initRoom(this: any): (0 | 1) {

  const activeRoomID = "room_001";

  const room = JSON.parse(JSON.stringify(roomsStore.getRoomById(activeRoomID)));

  const dataRoomWalls = room.size.walls;

  /* HELPER for Walls
  const container = this.container;
  const graphic = new PIXI.Graphics();
  container.addChild(graphic);

  for(let i=0, len=dataRoomWalls.length; i<len; i++) {

    const wall = dataRoomWalls[i];

    drawCircle(
      graphic,
      {
        x: wall.position.x / 10,
        y: wall.position.z / 10
      },
      10, 
      "rgba(0,100,0,1)"
    );



    // высчитываем начальную точку стены относительно длины
    const center: Vector2 = {
      x: wall.position.x / 10,
      y: wall.position.z / 10
    }
    const p0: Vector2 = {
      x: wall.position.x / 10 - ((wall.width / 10) / 2),
      y: wall.position.z / 10
    };
    const p1: Vector2 = {
      x: wall.position.x / 10 + ((wall.width / 10) / 2),
      y: wall.position.z / 10
    };
    const points = rotatePointsAroundCenter([p0, p1], center, -MathUtils.radToDeg(wall.rotation._y));

    // Рисуем основную линию с учетом смещения
    graphic.moveTo(points[0].x, points[0].y);
    graphic.lineTo(points[1].x, points[1].y);
    graphic.stroke({
      color: 0xff0000,
      width: 3,
    });
    
  }
  */

  for(let i=0, len=dataRoomWalls.length; i<len; i++) {

    const roomWallData = dataRoomWalls[i];

    const wallData: ObjectWall = {
      id: roomWallData.id,
      name: "wall",
      width: roomWallData.width / 10,
      height: roomWallData.depth / 10,
      heightDirection: this.config.wall.heightDirection,
      angleDegrees: MathUtils.radToDeg(roomWallData.rotation._y),
      updateTime: Date.now(),
      mergeWalls: {
        wallPoint0: null,
        wallPoint1: null
      },
      points: []
    };

    // высчитываем начальную точку стены относительно длины
    const center: Vector2 = {
      x: roomWallData.position.x / 10,
      y: roomWallData.position.z / 10
    }
    const p0: Vector2 = {
      x: (roomWallData.position.x / 10) - (wallData.width / 2),
      y: roomWallData.position.z / 10
    };
    const p1: Vector2 = {
      x: (roomWallData.position.x / 10) + (wallData.width / 2),
      y: roomWallData.position.z / 10
    };

    // p0 и p1 повернуть вокруг center на угол roomWallData.rotation._y
    const points = rotatePointsAroundCenter([p0, p1], center, -wallData.angleDegrees);

    // обновить угол наклона стены
    wallData.angleDegrees = getAngleBetweenVectors(
      points[0],
      {
        x: points[0].x + 300,
        y: points[0].y
      },
      points[1]
    );

    const point2: Vector2 = offsetVectorBySegmentNormal(
      [
        points[0],
        points[1]
      ],
      points[1],
      wallData.heightDirection * wallData.height
    );

    const point3: Vector2 = offsetVectorBySegmentNormal(
      [
        points[0],
        points[1]
      ],
      points[0],
      wallData.heightDirection * wallData.height
    );

    points.push(point2, point3);

    wallData.points = points;
    
    this.objectWalls.push(wallData);
    
  }

  for(let i=0, len=this.objectWalls.length; i<len; i++) {

    const wall = this.objectWalls[i];

    const wallPoint0 = getPointByPosition.bind(this)(wall.points[0], wall.id);

    wall.mergeWalls.wallPoint1 = wallPoint0?.id ?? null;

    const wallPoint1  = getPointByPosition.bind(this)(wall.points[1], wall.id);

    wall.mergeWalls.wallPoint0 = wallPoint1?.id ?? null;
    
  }
  
  return 1;

};

 // поискт совпадающей точки с координатами аргумента
function getPointByPosition(
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
import * as PIXI from "pixi.js";

import {
  Vector2
} from "@/types/constructor2d/interfaсes";

import { IDrawObjects } from "./../../../interfaces";

export function handlerStageMouseUp(this: any, e: PIXI.FederatedPointerEvent): void {

  if(this.state.activeObject) {

    const drawObjectsIndex = this.drawObjects.findIndex((obj: IDrawObjects) => obj.id === this.state.activeObject);
    const drawObjects: IDrawObjects = this.drawObjects[drawObjectsIndex];

    const objectPoints: Vector2[] = JSON.parse(JSON.stringify(drawObjects.points));

    // const originObject: Vector2 = getCenterOfPoints(objectPoints); // находим центр нового объекта
    
    const rooms = this.parent.layers.planner.allRooms; // спиосок всех комнат

    for (let i = 0, len = rooms.length; i < len; i++) {

      const pointInRoom: boolean = this.parent.layers.planner.isPointInRoom(rooms[i].id, objectPoints[0]);

      this.drawObjects[drawObjectsIndex].roomId = pointInRoom ? rooms[i].id : null;

      if (pointInRoom) {
        console.log('>>> Объект находится внутри комнаты:', rooms[i].id);
        break;
      }

    }

  }
    
  this.state.mouseLeft = false;
  this.state.oldPosition = [];
  this.state.positionDown = {x: 0, y: 0};

  e.stopPropagation(); // Останавливаем всплытие события

};
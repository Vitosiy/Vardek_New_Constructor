import { MathUtils } from "three";
import * as PIXI from "pixi.js";
import { ObjectWall } from "./../../../interfaces";
import { Events } from "@/store/constructor2d/events";

export function handlerDownEventGraphic(this: any, e: PIXI.FederatedPointerEvent): void {

  const target = e.currentTarget as PIXI.Graphics & { wallId?: string | number };
  const id = target.wallId;

  if (e.button == 0){

    this.state.mouseLeft = true;

    const prevActiveObject = this.state.activeWall;

    this.state.activeWall = id;
    this.state.activePointWall = 0;

    const addedwall = this.objectWalls.find((el: ObjectWall) => el.id === id);

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

      this.parent.eventBus.emit(Events.C2D_SHOW_FORM_MODIFY_WALL, {
        width: Number(addedwall.width.toFixed(1))*10,
        height: Number(addedwall.height.toFixed(1))*10,
        position: {
          x: addedwall.points[0].x + this.parent.config.originOfCoordinates.x,
          y: addedwall.points[0].y + this.parent.config.originOfCoordinates.y
        }
      });

    }

  }
  
  e.stopPropagation(); // Останавливаем всплытие события
  
};
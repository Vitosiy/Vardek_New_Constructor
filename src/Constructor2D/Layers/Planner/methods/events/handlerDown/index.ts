import { MathUtils } from "three";
import * as PIXI from "pixi.js";
import { ObjectWall } from "./../../../interfaces";
import { Events } from "@/store/constructor2d/events";

export function handlerDownEventGraphic(this: any, e: PIXI.FederatedPointerEvent): void {

  const target = e.currentTarget as PIXI.Graphics & { wallId?: string | number };
  const id = target.wallId;

  // Правый клик по стене — разделение стены на две
  if (e.button === 2) {
    if (id != null) {
      // вызываем метод Planner для разделения стены
      if (typeof this.splitWallIntoTwo === 'function') {
        this.splitWallIntoTwo(id);
      } else {
        console.warn('Wallsplitter is not defined on Planner');
      }
    }
    e.stopPropagation();
    return;
  }

  if (e.button == 0){

    // снимает активность с окна или двери
    this.parent.layers.doorsAndWindows.setActiveObject(null);

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

    }

    this.parent.eventBus.emit(Events.C2D_HIDE_FORM_MODIFY_WALL);

  }
  
  e.stopPropagation(); // Останавливаем всплытие события
  
};
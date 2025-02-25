import * as PIXI from "pixi.js";
// import Planner from "./../../../index";

export function handlerStageMouseUp(this: any, e: PIXI.FederatedPointerEvent): void {
    
  this.state.mouseLeft = false;
  this.state.oldPosition = [];
  this.state.positionDown = {x: 0, y: 0};

  e.stopPropagation(); // Останавливаем всплытие события

};
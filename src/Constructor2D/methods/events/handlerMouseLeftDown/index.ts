import * as PIXI from "pixi.js";
// import { Vector2 } from "@/types/constructor2d/interfaсes";
import { Events } from "@/store/constructor2d/events";

export function handlerMouseLeftDown(this: any, e: PIXI.FederatedPointerEvent): void {
  e.preventDefault();

  if (!this.app2d) return;
  
  if (e.button !== 0) return;

  if (
    !this.state.mouse.left && 
    this.layers.planner && 
    this.layers.planner.state.activeWall
  ) {
    this.layers.planner?.deactiveWalls();
    this.layers.arrowRulerActiveObject?.clearGraphic();
    this.layers.startPointActiveObject?.activate(false);
    this.eventBus.emit(Events.C2D_HIDE_FORM_MODIFY_WALL);
  }

};
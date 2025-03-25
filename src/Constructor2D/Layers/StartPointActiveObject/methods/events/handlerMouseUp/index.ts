import * as PIXI from "pixi.js";
// import { Vector2 } from "@/types/constructor2d/interfaсes";

export function handlerMouseUp(this: any, e: PIXI.FederatedPointerEvent): void {

  e.preventDefault();
  
  e.stopPropagation(); // Останавливаем всплытие события
  
  this.parent.state.mouse.left = false;

  this.parent.layers.planner.updateRoomStore(null, true);

}
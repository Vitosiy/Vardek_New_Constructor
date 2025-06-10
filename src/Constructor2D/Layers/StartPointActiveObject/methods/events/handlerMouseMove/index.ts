import * as PIXI from "pixi.js";
// import { Vector2 } from "@/types/constructor2d/interfaсes";

export function handlerMouseMove(this: any, e: PIXI.FederatedPointerEvent): void {

  e.preventDefault();

  e.stopPropagation(); // Останавливаем всплытие события

  const indexPoint = this.parent.layers.planner.state.activePointWall;

  if (
    this.parent.state.mouse.left &&
    indexPoint != null
  ) {

    const __position = this.getPointerPosition(e.global.x, e.global.y);

    // меняем позицию индикатора активной точки
    const position = this.updatePositionIndicatorPoint(__position);

    // перерисовываем угол между стенами
    this.drawAngleBetweenWalls();

    // перерисовываем стену
    this.parent.layers.planner.updateWallPoint(position);


  }
  
}
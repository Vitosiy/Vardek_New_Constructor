import * as PIXI from "pixi.js";
import { Vector2 } from "@/types/constructor2d/interfaсes";

export function handlerMouseMove(this: any, e: PIXI.FederatedPointerEvent): void {

  e.preventDefault();

  e.stopPropagation(); // Останавливаем всплытие события

  const indexPoint = this.parent.layers.planner.state.activePointWall;

  if (
    this.parent.state.mouse.left &&
    indexPoint != null
  ) {

    const __position = this.getPointerPosition(e.global.x, e.global.y);

    { // меняем позицию индикатора активной точки
  
      const position: Vector2 = {
        x: __position.x < 0 ? 0 : __position.x,
        y: __position.y < 0 ? 0 : __position.y,
      };
      
      if(indexPoint == 0){
        this.circleStartPoint.x = position.x;
        this.circleStartPoint.y = position.y;
        this.startPointRect.x = position.x
        this.startPointRect.y = position.y;
      }else if(indexPoint == 1){
        this.circleEndPoint.x = position.x;
        this.circleEndPoint.y = position.y;
        this.endPointRect.x = position.x;
        this.endPointRect.y = position.y;
      }

      this.parent.layers.planner.updateWallPoint(position);

    }

  }
  
}
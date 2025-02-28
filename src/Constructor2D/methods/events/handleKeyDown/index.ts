// import * as PIXI from "pixi.js";
// import { Vector2 } from "@/types/constructor2d/interfaсes";

export function handleKeyDown(this: any, e: KeyboardEvent): void {
  
  if (e.key === 'Backspace' || e.key === 'Delete') {
    if (this.layers.planner) {
      this.layers.planner.deleteSelectedObject();
    }
  }
  
};
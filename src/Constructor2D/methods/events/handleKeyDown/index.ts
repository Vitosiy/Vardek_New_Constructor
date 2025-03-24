// import * as PIXI from "pixi.js";
// import { Vector2 } from "@/types/constructor2d/interfaсes";
import { Events } from "@/store/constructor2d/events";

export function handleKeyDown(this: any, e: KeyboardEvent): void {

  // Проверяем, находится ли фокус на элементе ввода
  const isInputFocused = 
    document.activeElement?.tagName === 'INPUT' || 
    document.activeElement?.tagName === 'TEXTAREA';

  // Если фокус на элементе ввода, игнорируем обработку
  if (isInputFocused) {
    return;
  }
  
  if (e.key === 'Backspace' || e.key === 'Delete') {
    if (this.layers.planner) {
      this.layers.planner.deleteSelectedObject();
      this.eventBus.emit(Events.C2D_HIDE_FORM_MODIFY_WALL);
    }
  }
  
};
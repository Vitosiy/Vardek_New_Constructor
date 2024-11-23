import {
  Vector2
} from "@/types/constructor2d/interfaсes";

function calculateMouseDistanceByAxes(previous: Vector2, current: Vector2): { distanceX: number; distanceY: number } {
  const distanceX = current.x - previous.x; // Расстояние по оси X
  const distanceY = current.y - previous.y; // Расстояние по оси Y

  return { distanceX, distanceY };
}

export {
  
  calculateMouseDistanceByAxes

};
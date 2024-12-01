import {
  Vector2
} from "@/types/constructor2d/interfaсes";

function calculateMouseDistanceByAxes(previous: Vector2, current: Vector2): { distanceX: number; distanceY: number } {
  const distanceX = current.x - previous.x; // Расстояние по оси X
  const distanceY = current.y - previous.y; // Расстояние по оси Y

  return { distanceX, distanceY };
}
function getRectPoints(
  width: number,
  height: number,
  startPoint: Vector2,
  heightDirection: 1 | -1 = 1,
  angleDegrees: number = 0
): [Vector2, Vector2, Vector2, Vector2] {
  // Преобразуем угол из градусов в радианы
  const angleRadians = (angleDegrees * Math.PI) / 180;

  // Функция для поворота точки
  const rotatePoint = (point: Vector2, angle: number, origin: Vector2): Vector2 => {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    // Переводим точку в систему координат, где origin — начало
    const translatedX = point.x - origin.x;
    const translatedY = point.y - origin.y;

    // Поворот относительно origin
    const rotatedX = translatedX * cosAngle - translatedY * sinAngle;
    const rotatedY = translatedX * sinAngle + translatedY * cosAngle;

    // Возвращаем точку обратно
    return { x: rotatedX + origin.x, y: rotatedY + origin.y };
  };

  // Основные точки прямоугольника
  const topLeft: Vector2 = startPoint;
  const topRight: Vector2 = { x: startPoint.x + width, y: startPoint.y };
  const bottomLeft: Vector2 = {
    x: startPoint.x,
    y: startPoint.y + height * heightDirection,
  };
  const bottomRight: Vector2 = {
    x: startPoint.x + width,
    y: startPoint.y + height * heightDirection,
  };

  // Поворачиваем каждую точку
  const rotatedTopLeft = rotatePoint(topLeft, angleRadians, startPoint);
  const rotatedTopRight = rotatePoint(topRight, angleRadians, startPoint);
  const rotatedBottomLeft = rotatePoint(bottomLeft, angleRadians, startPoint);
  const rotatedBottomRight = rotatePoint(bottomRight, angleRadians, startPoint);

  return [rotatedTopLeft, rotatedTopRight, rotatedBottomRight, rotatedBottomLeft];
}

export {
  
  calculateMouseDistanceByAxes,
  getRectPoints

};
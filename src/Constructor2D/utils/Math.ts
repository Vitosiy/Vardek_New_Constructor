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

function getRectPointsV2(
  width: number,
  height: number,
  startPoint: Vector2,
  heightDirection: 1 | -1 = 1,
  angleDegrees: number = 0
): [Vector2, Vector2, Vector2, Vector2] {

  // Угол поворота в радианах
  const angleRadians = (angleDegrees * Math.PI) / 180;

  // Локальные точки прямоугольника относительно startPoint
  const topLeft: Vector2 = { x: startPoint.x, y: startPoint.y };
  const topRight: Vector2 = { x: startPoint.x + width, y: startPoint.y };
  const bottomRight: Vector2 = { x: startPoint.x + width, y: startPoint.y + height * heightDirection };
  const bottomLeft: Vector2 = { x: startPoint.x, y: startPoint.y + height * heightDirection };

  // Вспомогательная функция для вращения точки вокруг startPoint
  function rotatePoint(center: Vector2, point: Vector2, angle: number): Vector2 {
    const dx = point.x - center.x;
    const dy = point.y - center.y;

    const rotatedX = center.x + dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = center.y + dx * Math.sin(angle) + dy * Math.cos(angle);

    return { x: rotatedX, y: rotatedY };
  }

  // Вращаем каждую точку (кроме topLeft, которая остаётся на месте)
  const rotatedTopLeft = topLeft;
  const rotatedTopRight = rotatePoint(startPoint, topRight, angleRadians);
  const rotatedBottomRight = rotatePoint(startPoint, bottomRight, angleRadians);
  const rotatedBottomLeft = rotatePoint(startPoint, bottomLeft, angleRadians);

  return [rotatedTopLeft, rotatedTopRight, rotatedBottomRight, rotatedBottomLeft];

}

/**
 * Вычисляет расстояние между двумя векторами
 * @param vecA Первый вектор
 * @param vecB Второй вектор
 * @returns Расстояние между двумя точками
 */
function getDistanceBetweenVectors(vecA: Vector2, vecB: Vector2): number {
  const dx = vecB.x - vecA.x; // Разница по оси x
  const dy = vecB.y - vecA.y; // Разница по оси y
  return Math.sqrt(dx * dx + dy * dy); // Евклидово расстояние
}

function getAngleBetweenVectors(center: Vector2, start: Vector2, end: Vector2): number {
    // Создаём векторы
    const v1 = { x: start.x - center.x, y: start.y - center.y };
    const v2 = { x: end.x - center.x, y: end.y - center.y };
  
    // Скалярное произведение
    const dot = v1.x * v2.x + v1.y * v2.y;
  
    // Длины векторов
    const magnitudeV1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const magnitudeV2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
    // Проверка на нулевые длины векторов
    if (magnitudeV1 === 0 || magnitudeV2 === 0) {
      throw new Error("Один из векторов имеет нулевую длину.");
    }
  
    // Определитель
    const det = v1.x * v2.y - v1.y * v2.x;
  
    // Угол в радианах
    const angleRadians = Math.atan2(det, dot);
  
    // Преобразование в градусы
    return (angleRadians * 180) / Math.PI;
  }

export {
  
  calculateMouseDistanceByAxes,
  getRectPoints,
  getDistanceBetweenVectors,
  getAngleBetweenVectors,
  getRectPointsV2

};
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
  endPoint: Vector2,
  heightDirection: 1 | -1 = 1,
  angleDegrees: number = 0
): [Vector2, Vector2, Vector2, Vector2] {

  endPoint = { x: endPoint.x, y: endPoint.y };

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

// функция получения угла между векторами
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

/**
 * Округляет число до ближайшего значения с учётом точности.
 * @param value - Число для округления.
 * @param precision - Количество знаков после запятой.
 * @returns Округлённое число.
 */
function roundToPrecision(value: number, precision: number = 15): number {
  return parseFloat(value.toFixed(precision));
}

/**
 * Возвращает точку пересечения двух линий.
 * @param line0 - Первая линия.
 * @param line1 - Вторая линия.
 * @returns Точка пересечения.
 * @see https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
 **/
function getIntersectionPoint(
  line0: Vector2[],
  line1: Vector2[]
): Vector2 {
  const x1 = line0[0].x;
  const y1 = line0[0].y;
  const x2 = line0[1].x;
  const y2 = line0[1].y;
  const x3 = line1[0].x;
  const y3 = line1[0].y;
  const x4 = line1[1].x;
  const y4 = line1[1].y;

  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (d === 0) {
    return { x: 0, y: 0 };
  }

  const a = x1 * y2 - y1 * x2;
  const b = x3 * y4 - y3 * x4;

  const x = (a * (x3 - x4) - (x1 - x2) * b) / d;
  const y = (a * (y3 - y4) - (y1 - y2) * b) / d;

  return { x: x, y: y };
}

// Функция для поворота точки вокруг другой точки на заданный угол (в радианах)
function rotatePoint(point: Vector2, center: Vector2, angleDegrees: number): Vector2 {

  const angle = (angleDegrees * Math.PI) / 180;

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // Смещаем точку относительно центра
  const translatedX = point.x - center.x;
  const translatedY = point.y - center.y;

  // Поворачиваем точку
  const rotatedX = translatedX * cosA - translatedY * sinA;
  const rotatedY = translatedX * sinA + translatedY * cosA;

  // Возвращаем точку в исходную систему координат
  return {
    x: rotatedX + center.x,
    y: rotatedY + center.y,
  };
}

/**
 * Функция, которая принимает 2 вектора и высчитывает середину между ними.
 * @param vecA Первый вектор
 * @param vecB Второй вектор
 * @returns Вектор, представляющий середину между двумя точками
 */
function getMidpoint(vecA: Vector2, vecB: Vector2): Vector2 {
  const midX = (vecA.x + vecB.x) / 2;
  const midY = (vecA.y + vecB.y) / 2;
  return { x: midX, y: midY };
}

/**
 * Функция принимает отрезок (2 точки) и вектор, который нужно смещать по нормали отрезка.
 * @param segment - Отрезок, представленный двумя точками.
 * @param vector - Вектор, который нужно смещать.
 * @param distance - Расстояние, на которое нужно сместить вектор по нормали.
 * @returns Новый вектор, смещённый по нормали отрезка.
 */
function offsetVectorBySegmentNormal(segment: [Vector2, Vector2], vector: Vector2, distance: number): Vector2 {
  const [pointA, pointB] = segment;

  // Вычисляем вектор от pointA до pointB
  const segmentVector = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };

  // Вычисляем нормаль к вектору отрезка
  const normal = { x: -segmentVector.y, y: segmentVector.x };

  // Нормализуем нормаль
  const magnitude = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
  const normalizedNormal = { x: normal.x / magnitude, y: normal.y / magnitude };

  // Смещаем вектор по нормали
  const offsetVector = {
    x: vector.x + normalizedNormal.x * distance,
    y: vector.y + normalizedNormal.y * distance,
  };

  return offsetVector;
}

/**
 * Функция, которая смещает вектор относительно отрезка на заданное расстояние.
 * @param segment - Отрезок, представленный двумя точками.
 * @param vector - Вектор, который нужно сместить.
 * @param distance - Расстояние, на которое нужно сместить вектор.
 * @returns Новый вектор, смещённый относительно отрезка.
 */
function offsetVectorBySegment(segment: [Vector2, Vector2], vector: Vector2, distance: number): Vector2 {
  const [pointA, pointB] = segment;

  // Вычисляем вектор от pointA до pointB
  const segmentVector = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };

  // Вычисляем длину отрезка
  const segmentLength = Math.sqrt(segmentVector.x * segmentVector.x + segmentVector.y * segmentVector.y);

  // Нормализуем вектор отрезка
  const normalizedSegmentVector = { x: segmentVector.x / segmentLength, y: segmentVector.y / segmentLength };

  // Смещаем вектор вдоль отрезка
  const offsetVector = {
    x: vector.x + normalizedSegmentVector.x * distance,
    y: vector.y + normalizedSegmentVector.y * distance,
  };

  return offsetVector;
}

// вычислить по массиву точек их центр
/**
 * Вычисляет центр массива точек.
 * @param points - Массив точек.
 * @returns Центр точек.
 */
function getCenterOfPoints(points: Vector2[]): Vector2 {
  const center = points.reduce(
    (acc, point) => {
      acc.x += point.x;
      acc.y += point.y;
      return acc;
    },
    { x: 0, y: 0 }
  );

  center.x /= points.length;
  center.y /= points.length;

  let xyConverted = {
    x: center.x,
    y: center.y
  }

  return xyConverted
}

export {

  calculateMouseDistanceByAxes,
  getRectPoints,
  getDistanceBetweenVectors,
  getAngleBetweenVectors,
  getRectPointsV2,
  roundToPrecision,
  getIntersectionPoint,
  rotatePoint,
  getMidpoint,
  offsetVectorBySegmentNormal,
  offsetVectorBySegment,
  getCenterOfPoints,

};
import { Vector2 } from '@/types/constructor2d/interfaсes';

const calculateMouseDistanceByAxes =
  (previous: Vector2, current: Vector2): { distanceX: number; distanceY: number } => {
    const distanceX = current.x - previous.x; // Расстояние по оси X
    const distanceY = current.y - previous.y; // Расстояние по оси Y

    return { distanceX, distanceY };
  }

const getRectPoints = (
  width: number,
  height: number,
  startPoint: Vector2,
  heightDirection: 1 | -1 = 1,
  angleDegrees: number = 0
): [Vector2, Vector2, Vector2, Vector2] => {
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

const getRectPointsV2 = (
  width: number,
  height: number,
  startPoint: Vector2,
  endPoint: Vector2,
  heightDirection: 1 | -1 = 1,
  angleDegrees: number = 0
): [Vector2, Vector2, Vector2, Vector2] => {

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
const getDistanceBetweenVectors = (vecA: Vector2, vecB: Vector2): number => {
  const dx = vecB.x - vecA.x; // Разница по оси x
  const dy = vecB.y - vecA.y; // Разница по оси y
  return Math.sqrt(dx * dx + dy * dy); // Евклидово расстояние
}

// функция получения угла между векторами
const getAngleBetweenVectors = (
  center: Vector2,
  start: Vector2,
  end: Vector2
): number => {
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
const roundToPrecision = (value: number, precision: number = 15): number => {
  return parseFloat(value.toFixed(precision));
}

/**
 * Возвращает точку пересечения двух бесконечных линий.
 * @param line0 - Первая линия (массив из двух точек, через которые она проходит).
 * @param line1 - Вторая линия (массив из двух точек, через которые она проходит).
 * @returns Точка пересечения или null, если линии параллельны или совпадают.
 */
const getIntersectionPoint = (
  line0: Vector2[],
  line1: Vector2[]
): Vector2 | null => {
  // Извлекаем координаты точек
  const p1 = line0[0];
  const p2 = line0[1];
  const p3 = line1[0];
  const p4 = line1[1];

  // Вычисляем направляющие векторы
  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;
  const dx2 = p4.x - p3.x;
  const dy2 = p4.y - p3.y;

  // Вычисляем определитель
  const D = dx1 * dy2 - dy1 * dx2;

  // Если определитель близок к нулю, линии параллельны или совпадают
  if (Math.abs(D) < 1e-9) {
    return null;
  }

  // Вычисляем параметр t для первой линии
  const t = ((p3.x - p1.x) * dy2 - (p3.y - p1.y) * dx2) / D;

  // Находим точку пересечения
  const x = p1.x + t * dx1;
  const y = p1.y + t * dy1;

  return { x, y };
};

// Функция для поворота точки вокруг другой точки на заданный угол (в радианах)
const rotatePoint = (point: Vector2, center: Vector2, angleDegrees: number): Vector2 => {

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

const rotatePointsAroundCenter = (
  points: Vector2[],
  center: Vector2,
  angleDegrees: number
): Vector2[] => {

  const angle = (angleDegrees * Math.PI) / 180;

  return points.map(point => {
    const x = point.x - center.x;
    const y = point.y - center.y;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    return {
      x: cosA * x - sinA * y + center.x,
      y: sinA * x + cosA * y + center.y
    };
  });

}

/**
 * Функция, которая принимает 2 вектора и высчитывает середину между ними.
 * @param vecA Первый вектор
 * @param vecB Второй вектор
 * @returns Вектор, представляющий середину между двумя точками
 */
const getMidpoint = (vecA: Vector2, vecB: Vector2): Vector2 => {
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
const offsetVectorBySegmentNormal =
  (segment: [Vector2, Vector2], vector: Vector2, distance: number):
    Vector2 => {
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
const offsetVectorBySegment =
  (segment: [Vector2, Vector2], vector: Vector2, distance: number):
    Vector2 => {
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

/**
 * Изменяет длину отрезка, перемещая точку A или B вдоль линии.
 * @param segment - Отрезок [A, B].
 * @param pointIndex - Индекс точки (0 для A, 1 для B), которую нужно переместить.
 * @param cursorPos - Позиция курсора.
 * @returns Новый отрезок с изменённой длиной.
 */
const adjustSegmentLength = (
  segment: [Vector2, Vector2],
  pointIndex: 0 | 1,
  cursorPos: Vector2
): Vector2 => {
  const [A, B] = segment;
  const pointToMove = pointIndex === 0 ? A : B;
  const anchorPoint = pointIndex === 0 ? B : A; // Неподвижная точка

  // Вектор направления отрезка (от anchorPoint к pointToMove)
  const direction = {
    x: pointToMove.x - anchorPoint.x,
    y: pointToMove.y - anchorPoint.y,
  };

  // Длина отрезка
  const segmentLength = Math.sqrt(direction.x ** 2 + direction.y ** 2);

  // Если отрезок вырожден (длина = 0), создаём небольшой отрезок по горизонтали
  if (segmentLength < 0.001) {
    const newPoint = { ...pointToMove };
    newPoint.x += 1; // Произвольное небольшое смещение
    return newPoint;
  }

  // Нормализованный вектор направления
  const normalizedDir = {
    x: direction.x / segmentLength,
    y: direction.y / segmentLength,
  };

  // Вектор от anchorPoint до курсора
  const cursorVector = {
    x: cursorPos.x - anchorPoint.x,
    y: cursorPos.y - anchorPoint.y,
  };

  // Проекция курсора на направление отрезка (скалярное произведение)
  const projection = cursorVector.x * normalizedDir.x + cursorVector.y * normalizedDir.y;

  // Новая позиция точки (двигаем вдоль отрезка)
  const newPoint = {
    x: anchorPoint.x + projection * normalizedDir.x,
    y: anchorPoint.y + projection * normalizedDir.y,
  };

  // Возвращаем обновлённый отрезок
  return newPoint;
};

/**
 * Вычисляет центр массива точек.
 * @param points - Массив точек.
 * @returns Центр точек.
 */
const getCenterOfPoints = (points: Vector2[]): Vector2 => {
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

function adjustP1ForPerpendicularity(p0: Vector2, p1: Vector2, p2: Vector2): Vector2 {
  // Векторы исходных линий
  const v1 = { x: p1.x - p0.x, y: p1.y - p0.y };
  const v2 = { x: p2.x - p1.x, y: p2.y - p1.y };

  // Условие перпендикулярности: v1 · v2 = 0
  // (p1.x-p0.x)(p2.x-p1.x) + (p1.y-p0.y)(p2.y-p1.y) = 0

  // Если уже перпендикулярны (с учетом погрешности вычислений)
  if (Math.abs(v1.x * v2.x + v1.y * v2.y) < 1e-10) {
    return p1;
  }

  // Находим параметрическое решение для новой точки p1'
  // Через систему уравнений:
  // 1. (p1'.x-p0.x)(p2.x-p1'.x) + (p1'.y-p0.y)(p2.y-p1'.y) = 0
  // 2. Минимизируем расстояние между p1 и p1'

  // Решение через проекцию на окружность перпендикулярности
  const center = {
    x: (p0.x + p2.x) / 2,
    y: (p0.y + p2.y) / 2
  };
  const radius = Math.sqrt(Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)) / 2;

  // Вектор от центра к исходной точке p1
  const dx = p1.x - center.x;
  const dy = p1.y - center.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Если точка уже на окружности (но не перпендикулярна - значит коллинеарны)
  if (Math.abs(distance - radius) < 1e-10) {
    // Особый случай - возвращаем точку под 90 градусов от текущего положения
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    };
  }

  // Проецируем на окружность
  const scale = radius / distance;
  const p1Prime1 = {
    x: center.x + dx * scale,
    y: center.y + dy * scale
  };
  const p1Prime2 = {
    x: center.x - dx * scale,
    y: center.y - dy * scale
  };

  // Выбираем ближайшую точку к исходной p1
  const dist1 = Math.sqrt(Math.pow(p1Prime1.x - p1.x, 2) + Math.pow(p1Prime1.y - p1.y, 2));
  const dist2 = Math.sqrt(Math.pow(p1Prime2.x - p1.x, 2) + Math.pow(p1Prime2.y - p1.y, 2));

  return dist1 < dist2 ? p1Prime1 : p1Prime2;
}

/**
 * Функция проверяет, пересекает ли вектор отрезок, и возвращает координаты точки пересечения или null.
 * @param segment - Отрезок, представленный двумя точками.
 * @param vector - Вектор, представленный двумя точками (начало и направление).
 * @returns Координаты точки пересечения или null, если пересечения нет.
 */
const doesVectorIntersectSegment = (
  segment: [Vector2, Vector2],
  vector: [Vector2, Vector2]
): Vector2 | null => {
  const [segStart, segEnd] = segment;
  const [vecStart, vecEnd] = vector;

  // Вычисляем направляющие векторы
  const segDir = { x: segEnd.x - segStart.x, y: segEnd.y - segStart.y };
  const vecDir = { x: vecEnd.x - vecStart.x, y: vecEnd.y - vecStart.y };

  // Определитель для проверки параллельности
  const det = segDir.x * vecDir.y - segDir.y * vecDir.x;

  // Если определитель близок к нулю, линии параллельны
  if (Math.abs(det) < 1e-9) {
    return null;
  }

  // Вычисляем параметры t и u для точки пересечения
  const t = ((vecStart.x - segStart.x) * vecDir.y - (vecStart.y - segStart.y) * vecDir.x) / det;
  const u = ((vecStart.x - segStart.x) * segDir.y - (vecStart.y - segStart.y) * segDir.x) / det;

  // Проверяем, находится ли точка пересечения внутри отрезка и в направлении вектора
  if (t >= 0 && t <= 1 && u >= 0) {
    // Вычисляем координаты точки пересечения
    const intersection = {
      x: segStart.x + t * segDir.x,
      y: segStart.y + t * segDir.y,
    };
    return intersection;
  }

  return null;
};

/**
 * Проверяет, лежит ли точка на отрезке между p1 и p2.
 */
function isPointOnSegment(p1: Vector2, p2: Vector2, point: Vector2): boolean {
  // Проверка коллинеарности (точка лежит на прямой p1-p2)
  const crossProduct = (point.x - p1.x) * (p2.y - p1.y) - (point.y - p1.y) * (p2.x - p1.x);
  if (Math.abs(crossProduct) > 1e-10) {
    return false;
  }

  // Проверка, что точка внутри bounding box отрезка
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  return (
    point.x >= minX - 1e-10 &&
    point.x <= maxX + 1e-10 &&
    point.y >= minY - 1e-10 &&
    point.y <= maxY + 1e-10
  );
}

function isPointInPolygon(polygon: Vector2[], point: Vector2): boolean {
  const n = polygon.length;
  let inside = false;

  // Проверка, если полигон имеет менее 3 вершин
  if (n < 3) {
    return false;
  }

  // Проходим по всем рёбрам полигона
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const vertex1 = polygon[i];
    const vertex2 = polygon[j];

    // Проверяем, лежит ли точка точно на вершине
    if (vertex1.x === point.x && vertex1.y === point.y) {
      return true; // Точка на вершине считается внутри
    }

    // Проверяем пересечение луча (горизонтального от точки вправо) с ребром
    if (
      // Точка находится между y-координатами вершин ребра
      ((vertex1.y > point.y) !== (vertex2.y > point.y)) &&
      // Проверка пересечения по x-координате
      point.x <
      vertex1.x +
      ((point.y - vertex1.y) * (vertex2.x - vertex1.x)) /
      (vertex2.y - vertex1.y)
    ) {
      inside = !inside; // Переключаем флаг при каждом пересечении
    }

    // Проверка, лежит ли точка на ребре
    if (
      // Проверка, что точка находится между y-координатами вершин
      Math.min(vertex1.y, vertex2.y) <= point.y &&
      point.y <= Math.max(vertex1.y, vertex2.y) &&
      // Проверка, что точка находится между x-координатами вершин
      Math.min(vertex1.x, vertex2.x) <= point.x &&
      point.x <= Math.max(vertex1.x, vertex2.x)
    ) {
      // Проверка коллинеарности точки с ребром
      const crossProduct =
        (point.y - vertex1.y) * (vertex2.x - vertex1.x) -
        (point.x - vertex1.x) * (vertex2.y - vertex1.y);

      if (Math.abs(crossProduct) < Number.EPSILON) {
        return true; // Точка лежит на ребре
      }
    }
  }

  return inside;
}

function getIntersectVectorLine([pointStart, pointEnd]: [Vector2, Vector2], vector2d: Vector2): Vector2 | null {
  // Направление линии
  const lineDir: Vector2 = {
    x: pointEnd.x - pointStart.x,
    y: pointEnd.y - pointStart.y,
  };

  // Проверяем, что линия не вырождена
  const lineLength = Math.sqrt(lineDir.x ** 2 + lineDir.y ** 2);
  if (lineLength === 0) {
    return null; // Линия вырождена
  }

  // Вектор, перпендикулярный линии (поворот lineDir на 90 градусов)
  const perpDir: Vector2 = {
    x: -lineDir.y, // Поворот: (x, y) -> (-y, x) или (y, -x)
    y: lineDir.x,
  };

  // Параметрическое уравнение первой линии: P(t) = pointStart + t * lineDir
  // Параметрическое уравнение второй линии: Q(s) = vector2d + s * perpDir

  // Решаем систему уравнений для нахождения точки пересечения:
  // pointStart + t * lineDir = vector2d + s * perpDir
  // Или:
  // pointStart.x + t * lineDir.x = vector2d.x + s * perpDir.x
  // pointStart.y + t * lineDir.y = vector2d.y + s * perpDir.y

  const denom = lineDir.x * perpDir.y - lineDir.y * perpDir.x;
  if (Math.abs(denom) < 1e-10) {
    return null; // Линии параллельны, пересечения нет
  }

  // Находим параметр t
  const t =
    ((vector2d.x - pointStart.x) * perpDir.y - (vector2d.y - pointStart.y) * perpDir.x) / denom;

  // Находим точку пересечения
  const intersection: Vector2 = {
    x: pointStart.x + t * lineDir.x,
    y: pointStart.y + t * lineDir.y,
  };

  return intersection;
}

/**
 * Определяет, находится ли точка v0 близко к отрезку [p0, p1] в пределах заданного порога.
 * Если точка находится близко, возвращает ближайшую точку на отрезке. В противном случае возвращает null.
 *
 * @param segment - Массив из двух точек, определяющих отрезок [p0, p1].
 * @param v0 - Точка, для которой проверяется близость к отрезку.
 * @param threshold - Максимальное расстояние, при котором точка считается "находящейся на линии".
 * @returns Vector2 | null - Ближайшая точка на отрезке, если v0 находится в пределах порога, иначе null.
 */
function isPointNearLine([p0, p1]: [Vector2, Vector2], v0: Vector2, threshold = 5): Vector2 | null {
  // Вектор отрезка (p0 -> p1)
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const segmentLengthSquared = dx * dx + dy * dy; // Квадрат длины отрезка

  // Если отрезок вырожден (p0 == p1), проверяем расстояние до точки
  if (segmentLengthSquared === 0) {
    const distSquared = (v0.x - p0.x) * (v0.x - p0.x) + (v0.y - p0.y) * (v0.y - p0.y);
    // Возвращаем новый объект для консистентности, если точка близка
    return distSquared <= threshold * threshold ? { x: p0.x, y: p0.y } : null;
  }

  // Параметр проекции точки v0 на прямую (p0, p1)
  // t = ( (v0 - p0) . (p1 - p0) ) / |p1 - p0|^2
  const t = ((v0.x - p0.x) * dx + (v0.y - p0.y) * dy) / segmentLengthSquared;

  // Ограничиваем t в пределах [0, 1], чтобы найти ближайшую точку на *отрезке*
  const tClamped = Math.max(0, Math.min(1, t));

  // Находим ближайшую точку на отрезке
  const closestX = p0.x + tClamped * dx;
  const closestY = p0.y + tClamped * dy;

  // Квадрат расстояния от v0 до ближайшей точки на отрезке
  const distX = v0.x - closestX;
  const distY = v0.y - closestY;
  const distanceSquared = distX * distX + distY * distY;

  // Если точка в пределах threshold, возвращаем проекцию
  return distanceSquared <= threshold * threshold
    ? { x: closestX, y: closestY }
    : null;
}

/**
 * Находит точку пересечения двух отрезков [A,B] и [C,D]
 * @param segment1 Первый отрезок [A, B]
 * @param segment2 Второй отрезок [C, D]
 * @returns Точка пересечения или null, если отрезки не пересекаются
 */
function findSegmentIntersection(
  segment1: [Vector2, Vector2],
  segment2: [Vector2, Vector2]
): Vector2 | null {
  const [A, B] = segment1;
  const [C, D] = segment2;

  // Вектора отрезков
  const AB = { x: B.x - A.x, y: B.y - A.y };
  const CD = { x: D.x - C.x, y: D.y - C.y };

  // Вычисляем знаменатель
  const denominator = AB.x * CD.y - AB.y * CD.x;

  // Отрезки параллельны или коллинеарны
  if (Math.abs(denominator) < 1e-10) {
    return null;
  }

  // Вектора от начала отрезков
  const AC = { x: C.x - A.x, y: C.y - A.y };

  // Параметры пересечения
  const t = (AC.x * CD.y - AC.y * CD.x) / denominator;
  const u = (AC.x * AB.y - AC.y * AB.x) / denominator;

  // Проверяем, что точка пересечения лежит на обоих отрезках
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: A.x + AB.x * t,
      y: A.y + AB.y * t
    };
  }

  return null;
}

/**
 * Находит точку пересечения луча и отрезка
 * @param AP0 - Первая точка отрезка A
 * @param AP1 - Вторая точка отрезка A
 * @param BP0 - Начальная точка луча B
 * @param BP1 - Направляющая точка луча B (луч идет от BP0 через BP1)
 * @returns Точка пересечения или null, если пересечения нет
 */
function findRayLineIntersection(
  AP0: Vector2,
  AP1: Vector2,
  BP0: Vector2,
  BP1: Vector2
): Vector2 | null {
  // Векторы для параметрических уравнений
  const a = AP1.x - AP0.x;
  const b = BP0.x - BP1.x;
  const c = AP1.y - AP0.y;
  const d = BP0.y - BP1.y;

  // Свободные члены
  const e = BP0.x - AP0.x;
  const f = BP0.y - AP0.y;

  // Определитель системы
  const det = a * d - b * c;

  // Если определитель близок к нулю, линии параллельны или совпадают
  if (Math.abs(det) < 1e-10) {
    return null;
  }

  // Находим параметры t (для отрезка) и u (для луча)
  const t = (e * d - b * f) / det;
  const u = (a * f - e * c) / det;

  // Проверяем, что точка пересечения находится на отрезке (t ∈ [0, 1])
  // и на луче (u ≥ 0)
  if (t >= 0 && t <= 1 && u >= 0) {
    return {
      x: AP0.x + a * t,
      y: AP0.y + c * t
    };
  }

  return null;
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
  adjustSegmentLength,
  getCenterOfPoints,
  rotatePointsAroundCenter,
  adjustP1ForPerpendicularity,
  doesVectorIntersectSegment,
  isPointOnSegment,
  isPointInPolygon,
  getIntersectVectorLine,
  isPointNearLine,
  findSegmentIntersection,
  findRayLineIntersection,

};
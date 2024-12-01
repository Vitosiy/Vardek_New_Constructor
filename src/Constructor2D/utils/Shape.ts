import * as PIXI from 'pixi.js';

import {
  Vector2,
  RectData
} from "@/types/constructor2d/interfaсes";

function rect(graphic: PIXI.Graphics, data: RectData): PIXI.Graphics {

  /*
  data = {
    points: [Vector2, Vector2, Vector2, Vector2]; // 4 точки для прямоугольника
    color: number | string; // Цвет заливки
  }
  */

  graphic.clear();

  const { points, color } = data;

  if (points.length !== 4) {
    throw new Error("Data must contain exactly 4 points.");
  }

  // Логика рисования прямоугольника через точки
  graphic.moveTo(points[0].x, points[0].y); // Перемещаемся к первой точке
  graphic.lineTo(points[1].x, points[1].y); // Линия ко второй точке
  graphic.lineTo(points[2].x, points[2].y); // Линия к третьей точке
  graphic.lineTo(points[3].x, points[3].y); // Линия к четвертой точке
  graphic.lineTo(points[0].x, points[0].y); // Замыкаем контур
  graphic.fill(color); // Устанавливаем цвет заливки

  // Возвращаем объект graphics
  return graphic;
  
}

function drawVerticalLines(
  graphics: PIXI.Graphics,
  startPoint: Vector2,
  width: number,
  height: number,
  spacing: number = 30,
  heightDirection: 1 | -1 = -1, // Направление линий по оси Y
  color: number = 0x000000, // Цвет линий
  lineWidth: number = 1, // Толщина линий
  rotationDegrees: number = 0 // Угол поворота линий вокруг startPoint
): void {
  graphics.clear(); // Очистка предыдущего содержимого

  const baseAngleDegrees = 76; // Базовый угол линий
  const baseAngleRadians = (baseAngleDegrees * Math.PI) / 180; // Преобразуем базовый угол в радианы
  const rotationRadians = (rotationDegrees * Math.PI) / 180; // Преобразуем угол поворота в радианы

  height += 100;

  const numLines = Math.floor(width / spacing); // Количество линий, помещающихся в ширину

  // Функция для поворота точки вокруг startPoint
  const rotatePoint = (x: number, y: number, origin: Vector2, angle: number): Vector2 => {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    const dx = x - origin.x;
    const dy = y - origin.y;

    const rotatedX = dx * cosAngle - dy * sinAngle + origin.x;
    const rotatedY = dx * sinAngle + dy * cosAngle + origin.y;

    return { x: rotatedX, y: rotatedY };
  };

  for (let i = 0; i <= numLines; i++) {
    const xStart = startPoint.x + i * spacing; // X-координата начальной точки линии
    const yStart = startPoint.y; // Y-координата начальной точки линии

    // Вычисляем смещение конечной точки с учетом heightDirection
    const xOffset = height * Math.cos(baseAngleRadians); // Горизонтальное смещение
    const yOffset = height * Math.sin(baseAngleRadians) * heightDirection; // Вертикальное смещение

    const xEnd = xStart + xOffset; // X-координата конечной точки
    const yEnd = yStart + yOffset; // Y-координата конечной точки

    // Поворачиваем начальную и конечную точки вокруг startPoint
    const rotatedStart = rotatePoint(xStart, yStart, startPoint, rotationRadians);
    const rotatedEnd = rotatePoint(xEnd, yEnd, startPoint, rotationRadians);

    // Рисуем линию
    graphics.moveTo(rotatedStart.x, rotatedStart.y); // Устанавливаем начальную точку линии
    graphics.lineTo(rotatedEnd.x, rotatedEnd.y); // Рисуем линию до конечной точки
    graphics.stroke({
      color: color,
      width: lineWidth,
    });
  }
}

function drawDashedOutline(
  graphics: PIXI.Graphics,
  points: Vector2[], // Массив точек для контура
  dashLength: number = 4, // Длина каждого штриха
  gapLength: number = 2, // Длина промежутка между штрихами
  color: number = 0x000000, // Цвет линии
  lineWidth: number = 1 // Толщина линии
): void {
  if (points.length < 2) {
    console.warn("Недостаточно точек для построения контура.");
    return;
  }

  // Перебираем точки попарно
  for (let i = 0; i < points.length - 1; i++) {
    const startPoint = points[i]; // Текущая точка
    const endPoint = points[i + 1]; // Следующая точка

    // Вычисляем разницу координат
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;

    // Длина линии между текущей и следующей точкой
    const lineLength = Math.sqrt(dx * dx + dy * dy);

    // Угол линии
    const angle = Math.atan2(dy, dx);

    // Текущая длина, пройденная вдоль линии
    let currentLength = 0;

    // Рисуем штрихи до тех пор, пока текущая длина меньше длины линии
    while (currentLength < lineLength) {
      // Вычисляем начальные координаты штриха
      const dashStartX = startPoint.x + Math.cos(angle) * currentLength;
      const dashStartY = startPoint.y + Math.sin(angle) * currentLength;

      // Длина текущего штриха (учитываем, что штрих может быть обрезан в конце линии)
      const dashEndLength = Math.min(dashLength, lineLength - currentLength);

      // Вычисляем конечные координаты штриха
      const dashEndX =
        dashStartX + Math.cos(angle) * dashEndLength;
      const dashEndY =
        dashStartY + Math.sin(angle) * dashEndLength;

      // Рисуем штрих
      graphics.moveTo(dashStartX, dashStartY);
      graphics.lineTo(dashEndX, dashEndY);

      // Обновляем текущую длину, добавляя длину штриха и промежутка
      currentLength += dashEndLength + gapLength;
    }
  }

  // Соединяем последнюю точку с первой для замкнутого контура
  const startPoint = points[points.length - 1];
  const endPoint = points[0];
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const lineLength = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  let currentLength = 0;

  while (currentLength < lineLength) {
    const dashStartX = startPoint.x + Math.cos(angle) * currentLength;
    const dashStartY = startPoint.y + Math.sin(angle) * currentLength;

    const dashEndLength = Math.min(dashLength, lineLength - currentLength);

    const dashEndX = dashStartX + Math.cos(angle) * dashEndLength;
    const dashEndY = dashStartY + Math.sin(angle) * dashEndLength;

    graphics.moveTo(dashStartX, dashStartY);
    graphics.lineTo(dashEndX, dashEndY);

    currentLength += dashEndLength + gapLength;
  }

  graphics.stroke({
    color: color,
    width: lineWidth
  });
  
}

function drawArrow(
  graphics: PIXI.Graphics,
  startPoint: Vector2,
  width: number, // Длина стрелки
  angleDegrees: number, // Угол направления стрелки в градусах
  color: number = 0x000000, // Цвет стрелки
  lineWidth: number = 1, // Толщина линии
  triangleSize: number = 12, // Размер треугольника (основание и высота)
  clearGraphics?: boolean // Флаг: очищать графику или нет
): void {
  if(clearGraphics || clearGraphics !== undefined){
    graphics.clear(); // Очистка графики
  }

  // Преобразуем угол из градусов в радианы
  const angleRadians = (angleDegrees * Math.PI) / 180;

  // Вычисляем конечную точку линии на основе длины и угла
  const endPoint = {
    x: startPoint.x + Math.cos(angleRadians) * width,
    y: startPoint.y + Math.sin(angleRadians) * width,
  };

  // Рисуем основную линию
  graphics.moveTo(startPoint.x, startPoint.y);
  graphics.lineTo(endPoint.x, endPoint.y);
  graphics.stroke({
    color: color,
    width: lineWidth,
  });

  // Вычисляем вершины треугольника
  const halfBase = triangleSize / 2;
  const backPoint = {
    x: endPoint.x - Math.cos(angleRadians) * triangleSize,
    y: endPoint.y - Math.sin(angleRadians) * triangleSize,
  };
  const leftPoint = {
    x: backPoint.x + Math.cos(angleRadians + Math.PI / 2) * halfBase,
    y: backPoint.y + Math.sin(angleRadians + Math.PI / 2) * halfBase,
  };
  const rightPoint = {
    x: backPoint.x + Math.cos(angleRadians - Math.PI / 2) * halfBase,
    y: backPoint.y + Math.sin(angleRadians - Math.PI / 2) * halfBase,
  };

  // Рисуем треугольник
  graphics.moveTo(endPoint.x, endPoint.y); // Вершина треугольника
  graphics.lineTo(leftPoint.x, leftPoint.y); // Левая вершина треугольника
  graphics.lineTo(rightPoint.x, rightPoint.y); // Правая вершина треугольника
  graphics.closePath(); // Замыкаем треугольник
  graphics.fill(color);
}

function drawArrowHead(
  graphics: PIXI.Graphics,
  startPoint: Vector2, // Позиция начала стрелки
  distanceX: number, // Расстояние от начала стрелки до треугольника
  distanceY: number, // Расстояние от начала стрелки до треугольника
  arrowDirection: { axis: 'x' | 'y'; value: 1 | -1 }, // Направление стрелки
  angleDegrees: number, // Угол поворота стрелки относительно начала
  color: number = 0x000000, // Цвет стрелки
  size: number = 12, // Размер треугольника (основание и высота)
  clearGraphics: boolean = true // Флаг: очищать графику или нет
): void {
  if (clearGraphics) {
    graphics.clear(); // Очистка графики, если требуется
  }
// Преобразуем угол из градусов в радианы
  const angleRadians = (angleDegrees * Math.PI) / 180;

  // Размер треугольника (половина основания)
  const halfBase = size / 2;

  // 1. Сначала вычисляем точку рисования стрелки (без поворота)
  const baseX = startPoint.x + distanceX;
  const baseY = startPoint.y + distanceY;

  // 2. Поворачиваем точку (baseX, baseY) относительно startPoint на угол angleRadians
  const deltaX = baseX - startPoint.x;
  const deltaY = baseY - startPoint.y;

  const rotatedX = startPoint.x + deltaX * Math.cos(angleRadians) - deltaY * Math.sin(angleRadians);
  const rotatedY = startPoint.y + deltaX * Math.sin(angleRadians) + deltaY * Math.cos(angleRadians);

  // Теперь rotatedX и rotatedY — это точка рисования стрелки с учетом смещения и поворота

  let leftPoint: Vector2;
  let rightPoint: Vector2;

  if (arrowDirection.axis === 'y') {
    // Направление стрелки по оси Y
    if (arrowDirection.value === 1) {
      // Направление вверх
      leftPoint = { x: rotatedX - halfBase, y: rotatedY - size };
      rightPoint = { x: rotatedX + halfBase, y: rotatedY - size };
    } else {
      // Направление вниз
      leftPoint = { x: rotatedX - halfBase, y: rotatedY + size };
      rightPoint = { x: rotatedX + halfBase, y: rotatedY + size };
    }
  } else {
    // Направление стрелки по оси X
    if (arrowDirection.value === -1) {
      // Направление вправо
      leftPoint = { x: rotatedX + size, y: rotatedY - halfBase };
      rightPoint = { x: rotatedX + size, y: rotatedY + halfBase };
    } else {
      // Направление влево
      leftPoint = { x: rotatedX - size, y: rotatedY - halfBase };
      rightPoint = { x: rotatedX - size, y: rotatedY + halfBase };
    }
  }

  function rotatePoint(x:number, y:number, centerX:number, centerY:number, angle:number) {
    // Перевод угла в радианы
    let rad = angle * Math.PI / 180;
    // Применяем матрицу поворота
    let rotatedX = centerX + (x - centerX) * Math.cos(rad) - (y - centerY) * Math.sin(rad);
    let rotatedY = centerY + (x - centerX) * Math.sin(rad) + (y - centerY) * Math.cos(rad);
    return { x: rotatedX, y: rotatedY };
  }

  // Поворот левой и правой точки
  let rotatedLeft = rotatePoint(leftPoint.x, leftPoint.y, rotatedX, rotatedY, angleDegrees);
  let rotatedRight = rotatePoint(rightPoint.x, rightPoint.y, rotatedX, rotatedY, angleDegrees);

  // Рисуем треугольник с повернутыми точками
  graphics.moveTo(rotatedX, rotatedY); // Вершина треугольника
  graphics.lineTo(rotatedLeft.x, rotatedLeft.y); // Повернутая левая точка
  graphics.lineTo(rotatedRight.x, rotatedRight.y); // Повернутая правая точка
  graphics.lineTo(rotatedX, rotatedY); // Замыкаем треугольник
  graphics.closePath(); // Замыкаем треугольник
  graphics.fill(color); // Заканчиваем рисование
}

function drawCircle(
  graphics: PIXI.Graphics,
  startPoint: Vector2,
  size: number, 
  color: string | number
): void {
  // Определяем центр геометрии
  const centerX: number = startPoint.x;
  const centerY: number = startPoint.y;

  // Радиус окружности (половина размера)
  const radius: number = size / 2;

  // Рисуем окружность
  graphics.beginPath();
  graphics.arc(centerX, centerY, radius, 0, Math.PI * 2); // Полный круг
  graphics.closePath();
  graphics.fill(color);
}

export {
  rect,
  drawVerticalLines,
  drawDashedOutline,
  drawArrow,
  drawArrowHead,
  drawCircle
}
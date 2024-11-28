import * as PIXI from 'pixi.js';

type GraphicsOrNull = PIXI.Graphics | null;

// Тип для иконки
export interface IconInt {
  width: number;
  height: number;
  viewBox: string;
  d: string;
}

// Тип для товара
export interface GoodInt {
  id: string;
  name: string;
  nameMode: string;
  icon: string; // Путь к изображению иконки
}

// Тип для секции каталога
export interface CatalogSectionInt {
  id: string;
  name: string;
  nameMode: string;
  icon: IconInt;
  goods: GoodInt[];
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface DropData {
  position: Vector2,
  good: string
}

// Интерфейсы для объектов в сцене конструктора
// Интерфейс для объектов визуализации на 2д сцене
export interface PlannerObjectContainers {
  root?: PIXI.Container | null; // родительский контейнер для всех елементов стены
  maskWall?: GraphicsOrNull;
  bodyWall?: GraphicsOrNull;
  lineWall?: GraphicsOrNull;
  startPoint?: GraphicsOrNull;
  endPoint?: GraphicsOrNull;
  normalIndicator?: GraphicsOrNull;
  textWallWidth?: PIXI.Text | null; // гирина стены
  textWallLength?: PIXI.Text | null; // длина стены
}

export interface PlannerObject {
  id: string | number;
  name: string;
  width: number;
  height: number;
  position: Vector2;
  points?: Vector2[];
  heightDirection: -1 | 1;
  angleDegrees: number;
}

// Utils Shapes
//
export interface RectData {
  points: Vector2[]; // 4 точки для прямоугольника
  heightDirection: -1 | 1;
  color: number | string; // Цвет заливки
}
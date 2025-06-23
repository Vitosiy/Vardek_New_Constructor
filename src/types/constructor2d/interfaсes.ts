import * as PIXI from 'pixi.js';
import * as THREE from "three";

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
  eventGraphic?: GraphicsOrNull;
  maskWall?: GraphicsOrNull;
  bodyWall?: GraphicsOrNull;
  lineWall?: GraphicsOrNull;
  startPoint?: GraphicsOrNull;
  endPoint?: GraphicsOrNull;
  normalIndicator?: GraphicsOrNull;
  textWallWidth?: PIXI.Text | null; // гирина стены
  containerTextRulerWall?: PIXI.Container | null;
  textRulerWall?: PIXI.Text | null; // длина стены
  rulerWall?: GraphicsOrNull;
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
  updateTime: number;
  mergeWalls: {
    wallPoint0: string | number | null, 
    wallPoint1: string | number | null
  };
}

// Utils Shapes
export interface RectData {
  points: Vector2[]; // 4 точки для прямоугольника
  heightDirection: -1 | 1;
  color: number | string; // Цвет заливки
}

export interface DrawObjects {
  id: string | number,
  containers: PlannerObjectContainers
}

export interface MergeWalls { 
  wallPoint0: null | string | number, // id стены которая присоединяется 0 точкой
  wallPoint1: null | string | number  // id стены которая присоединяется 1 точкой
}

export interface HoverPointObject { 
  id: number | string; 
  indexPoint: number 
}

export interface FillingObject {
  product: number;
  id: number;
  name: string;
  image: string;
  type: "shelf" | "drawer" | "any";
  position: number;
  size: THREE.Vector3;
  color: number;
  fasade?: FasadeObject;
}

export interface FasadeObject {
  id: number;
  position: THREE.Vector2;
  width: number;
  height: number;
  material: FasadeMaterial;
  type: "fasade";
  error?: boolean;
}
export interface FasadeMaterial {
  COLOR: number;
  POSITION: number;
  GLASS?: number;
  MILLING?: number;
  PALETTE?: number;
  PATINA?: number;
  TYPE?: number;
  WINDOW?: number;
  ALUM?: number;
}

export interface GridCellsRow {
  number: number;
  width: number;
  height: number;
  type: "rowCell";
  fillings?: FillingObject[];
}

export interface GridCell {
  number: number;
  width: number;
  height: number;
  type: "cell";
  cellsRows?: GridCellsRow[];
  fillings?: FillingObject[];
}

export interface GridSection {
  number: number;
  width: number;
  height: number;
  type: "section";
  cells: GridCell[];
  fasades?: FasadeObject[];
}

export interface GridModule {
  width: number;
  height: number;
  moduleThickness: number;
  sections: GridSection[];
  type: "module";
  horizont?: number;
  fasades?: FasadeObject[];
}
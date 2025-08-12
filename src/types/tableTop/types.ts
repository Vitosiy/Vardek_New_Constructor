import * as THREE from 'three'

export type TPathCommand = {
  action: 'moveTo' | 'lineTo' | 'closePath';
  data: number[];
};

export type TServiseData = {
  ID: number;
  NAME: string;
  value: boolean;
  pos: string;
  error: boolean;
  corner?: number;
  radius?: number;
  width?: number;
};

export type TRoundCut = {
  radius: number;
  x: number;
  y: number;
};

export type THole = {
  x: number;
  y: number;
  type: 'circle' | 'rect';
  radius?: number;
  width?: number;
  height?: number;
  lable: string;
  holeId: number;
  Mradius?: number;
  Mwidth?: number;
  Mheight?: number;
  distances: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
};

export type TObjectData = {
  width: number;
  height: number;
  roundCut: Partial<TRoundCut>; // может быть пустым объектом {}
  holes: THole[];
  serviseData: TServiseData[];
  xOffset: number;
  yOffset: number;
  path: TPathCommand[];
  sectorId: string;
  position: THREE.Vector3 | null;
  rotation: THREE.Euler | null;
};

export interface IDataResponse {
  data: TObjectData[][];
  canvasHeight: number;
  modelHeight: number;
}


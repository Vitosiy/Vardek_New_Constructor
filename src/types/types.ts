import * as THREE from "three";
import { Application } from "@/Application/Core/Application";
import { TrafficManager } from "@/Application/Movement/TrafficManager";
import { MoveManager } from "@/Application/Movement/MoveManager";
import { RoomManager } from "@/Application/Room/RoomManager";
import { Resources } from "@/Application/Utils/Resources";
import { Ruler } from "@/Application/Utils/Ruler";
import { CustomBoxHelper } from "@/Application/Utils/BoxHelperCustom";
import { BuildProduct } from "@/Application/Meshes/BuildProduct";
import { MillingBuilder } from "@/Application/Meshes/MillingBuilder";
import { PaletteBulider } from "@/Application/Meshes/PaletteBuilder";
import { WindowBuilder } from "@/Application/Meshes/WindowBuilder";
import { MeshEvents } from "@/Application/Meshes/Utils/Events";
import { SetObject } from "@/Application/Utils/SetObject";
import { AlumBulider } from "@/Application/Meshes/AlumBuilder";
import { UniformTextureBuilder } from "@/Application/Meshes/UniformTextureBuilder";
import { KeybordListeners } from "@/Application/Utils/KeybordListeners";
import { UniformTextureEvents } from "@/Application/Meshes/UniformTextureUtils/UniformTextureEvents";
import { DeepDispose } from "@/Application/Utils/DeepDispose";
import { AppLights } from "@/Application/World/Lights";

import { useEventBus } from "@/store/appliction/useEventBus";
import { useRoomState } from "@/store/appliction/useRoomState";
import { useAppData } from "@/store/appliction/useAppData";
import { useSceneState } from "@/store/appliction/useSceneState";
import { useCustomiserStore } from "@/store/appStore/useCustomiserStore";
import { useObjectData } from "@/store/appliction/useObjectData";
import { useRoomContantData } from "@/store/appliction/useRoomContantData";
import { useUniformState } from "@/store/appliction/useUniformState";
import { useModelState } from "@/store/appliction/useModelState";



export type TApplication = Application
export type TMeshEvents = MeshEvents
export type TTrafficManager = TrafficManager
export type TMoveManager = MoveManager
export type TRoomManager = RoomManager
export type TResources = Resources
export type TRuler = Ruler
export type TScene = THREE.Scene
export type TCustomBoxHelper = CustomBoxHelper
export type TBuildProduct = BuildProduct
export type TMillingBuilder = MillingBuilder
export type TWindowBuilder = WindowBuilder
export type TPaletteBulider = PaletteBulider
export type TSetObject = SetObject
export type TAlumBulider = AlumBulider
export type TUniformTextureBuilder = UniformTextureBuilder
export type TKeybordListeners = KeybordListeners
export type TUniformTextureEvents = UniformTextureEvents
export type TDeepDispose = DeepDispose
export type TAppLights = AppLights

export type TContentType = 'gltf' | 'geometry' | 'geometry:buffer' | 'room';

export type TMaterialType =
  'MeshBasicMaterial'
  | 'MeshStandardMaterial'
  | 'MeshPhongMaterial'
  | 'MeshPhysicalMaterial'
  | 'MeshLambertMaterial'
  | THREE.MeshBasicMaterial
  | THREE.MeshStandardMaterial
  | THREE.MeshPhongMaterial
  | THREE.MeshPhysicalMaterial
  | THREE.MeshLambertMaterial

export type TGeometryType = 'BoxGeometry' | 'ExtrudeGeometry' | 'PlaneGeometry'

export type TAdjustPosition = {
  position: THREE.Vector3,
  rotation: THREE.Euler,
  quaternion: THREE.Quaternion
}

export type TUseUniformState = ReturnType<typeof useUniformState>;
export type TUseEventBus = ReturnType<typeof useEventBus>;
export type TUseAppData = ReturnType<typeof useAppData>;
export type TUseRoomState = ReturnType<typeof useRoomState>;
export type TUseSceneState = ReturnType<typeof useSceneState>;
export type TUseCustomiserStore = ReturnType<typeof useCustomiserStore>;
export type TUseObjectData = ReturnType<typeof useObjectData>;
export type TUseRoomContantData = ReturnType<typeof useRoomContantData>;
export type TUseModelState = ReturnType<typeof useModelState>;


type TQualityValue = 'low' | 'medium' | 'hight'
export type MenuType = 'tech' | 'roomPar' | 'customiser';
export type TQuality = {
  lable: string,
  value: TQualityValue,
}

type TOptionItem = {
  id: number | string;
  global: boolean;
  title: string;
  label: string;
};

export type TLightRange = {
  pointLight: number | string,
  ambientLight: number | string
}

export type TOptionsMap = {
  wall: TOptionItem;
  floor: TOptionItem;
  moduleTop: TOptionItem;
  moduleBottom: TOptionItem;
  fasadsTop: TOptionItem;
  fasadsBottom: TOptionItem;
};

export type TTextureActionMap = {
  wall: 'A:ChangeWallTexture';
  floor: 'A:ChangeFloorTexture';
  moduleTop: 'A:ChangeModuleTotalTexture';
  moduleBottom: 'A:ChangeModuleTotalTexture';
  fasadsTop: 'A:ChangeFasadsTopTexture';
  fasadsBottom: 'A:ChangeFasadsBottomTexture';
};

export type TTextureItem = {
  ID: number;
  NAME: string;
  PREVIEW_PICTURE: string;
  DETAIL_PICTURE: string;
  texture: string;
  scale: number;
  sort: number;
};

export type TFasadeItem = {
  ID: number;
  NAME: string;
  IBLOCK_SECTION_ID: string;
  DETAIL_PICTURE: string;
  SORT: number;
  TEST: number;
  EN_NAME: string | null;
  ADMIN_COMMENT: string | null;
  ARTICLE: string | null;
  date_shipment: string | null;
  delay_date: number;
  date_build: number;
  DEPTH: number;
  CNAME: string | null;
  TEXTURE_DIRECTION: string | null;
  NOT_IN_KONSTRUKTOR: string;
  TEXTURE: string;
  SHININESS: number;
  SCALE: number;
  COLOR: boolean;
  TYPE: string;
  EDGE_COLOR: boolean;
  MODEL: string | null;
  EDGE_TEXTURE: string | null;
  SIBLINGS_COLOR: string | null;
  ATTACH_MILLINGS: (number | null)[];
  ALT_MILLINGS: (number | null)[];
  ATTACH_GLASS: number[];
  no_fasade: string;
  FACADEALIGNSELECT: number;
  HANDLECOLOR: (number | null)[];
  PATINA: (number | null)[];
  PALETTE: (number | null)[];
  type_showcase: (number | null)[];
  ELEMENT_TYPE: string | null;
  fasade_type: (number | null)[];
  REACH: string | null;
  GLASS_ONLY: number;
  options: number[];
  back_color: string | null;
  MATERIAL: string;
  BUMP: number;
  INCITY: (number | null)[];
  CITY: (number | null)[];
  MIN_WIDTH: (number | null)[];
  MIN_HEIGHT: (number | null)[];
  DENSITY: string;
  DISCOUNT_25: string | null;
  MAX_WIDTH: number;
  MAX_HEIGHT: number;
  PREVIEW_PICTURE: string;
  TEXTURE_HEIGHT: number;
  TEXTURE_WIDTH: number;
  UNSETINPRODUCT: Record<string, number[]>;
};

export type TUniformGroups = {
  id: number;
  parts: THREE.Object3D[][];
  fasadeId: number;
  groupSize: {
    maxWidth: number;
    maxHeight: number;
    currentWidth: number;
    currentHeight: number;
  };
  color: string; // можно уточнить как CSSColor если хочешь
};



/** Заглушка */
export type TObject = { [key: string]: any }
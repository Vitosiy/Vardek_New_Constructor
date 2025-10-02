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
import { PaletteBuilder } from "@/Application/Meshes/PaletteBuilder";
import { WindowBuilder } from "@/Application/Meshes/WindowBuilder";
import { MeshEvents } from "@/Application/Meshes/Utils/Events";
import { SetObject } from "@/Application/Utils/SetObject";
import { AlumBuilder } from "@/Application/Meshes/AlumBuilder";
import { UniformTextureBuilder } from "@/Application/Meshes/UniformTextureBuilder";
import { KeybordListeners } from "@/Application/Utils/KeybordListeners";
import { UniformTextureEvents } from "@/Application/Meshes/UniformTextureUtils/UniformTextureEvents";
import { UniversalGeometryBuilder } from "@/Application/Meshes/UniversalModuleUtils/UniversalGeometryBuilder.ts";
import { DeepDispose } from "@/Application/Utils/DeepDispose";
import { AppLights } from "@/Application/World/Lights";
import { GeometryBuilder } from "@/Application/Meshes/GeometryBuilder";
import { JsonBuilder } from "@/Application/Meshes/JsonProductBuilder";
import { EdgeBuilder } from "@/Application/Meshes/EdgeBuilder/EdgeBuilder";
import { UseEdgeBuilder } from "@/Application/Meshes/EdgeBuilder/useEdgeBuilder";
import { HandlesBuilder } from "@/Application/Meshes/Hendles/Handles";
import { ModelsBuilder } from "@/Application/Meshes/ModelsBuilder";

import { useEventBus } from "@/store/appliction/useEventBus";
import { useRoomState } from "@/store/appliction/useRoomState";
import { useAppData } from "@/store/appliction/useAppData";
import { useSceneState } from "@/store/appliction/useSceneState";
import { useCustomiserStore } from "@/store/appStore/useCustomiserStore";
import { useObjectData } from "@/store/appliction/useObjectData";
import { useRoomContantData } from "@/store/appliction/useRoomContantData";
import { useUniformState } from "@/store/appliction/useUniformState";
import { useModelState } from "@/store/appliction/useModelState";
import { useMenuStore } from "@/store/appStore/useMenuStore";

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
export type TPaletteBulider = PaletteBuilder
export type TSetObject = SetObject
export type TAlumBuilder = AlumBuilder
export type TUniformTextureBuilder = UniformTextureBuilder
export type TKeybordListeners = KeybordListeners
export type TUniformTextureEvents = UniformTextureEvents
export type TDeepDispose = DeepDispose
export type TAppLights = AppLights
export type TUniversalGeometryBuilder = UniversalGeometryBuilder
export type TGeometryBuilder = GeometryBuilder
export type TJSONBuilder = JsonBuilder
export type TEdgeBuilder = EdgeBuilder
export type TUseEdgeBuilder = UseEdgeBuilder
export type THandlesBuilder = HandlesBuilder
export type TModelsBuilder = ModelsBuilder

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
export type TMenuStore = ReturnType<typeof useMenuStore>;


export type TQualityValue = 'low' | 'medium' | 'hight'
export type MenuType = 'tech' | 'roomPar' | 'customiser';
export type TQuality = {
  lable: string,
  value: TQualityValue,
  active: boolean
}

export type TOptionItem = {
  id: number | string;
  palitte?: number | string | null,
  milling?: number | string | null,
  global?: boolean;
  title: string;
  label?: string;
  prefix?: string,
  palitteTitle?: string,
  palitteData?: TPalitte[] | null
  millingTitle?: string,
  millingData?: TMilling[] | null
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
  // palitteTop?: TOptionItem;
  // palitteBottom?: TOptionItem;
  fasadsTop: TOptionItem;
  fasadsBottom: TOptionItem;
  tableTop: TOptionItem
};

export type TTextureActionMap = {
  wall: 'A:ChangeWallTexture';
  floor: 'A:ChangeFloorTexture';
  moduleTop: 'A:ChangeModuleTotalTexture';
  moduleBottom: 'A:ChangeModuleTotalTexture';
  fasadsTop: 'A:ChangeFasadsTopTexture';
  fasadsBottom: 'A:ChangeFasadsBottomTexture';
  tableTop: 'A:ChangeTableTop',
  palitteTotal: 'A:ChangePaletteTotal',
  millingTotal: "A:ChangeMillingTotal",

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
  color: string;
};

export type TSize = {
  width: number;
  height: number;
  depth: number;
}

type TModuleGrid = {
  canvasHeight: number;
  canvasWidth: number;
};

export type TMyObject = {
  MODULEGRID: TModuleGrid | false;
  PROPS: any;
  canvasHeight: number;
  canvasWidth: number;
};

export type TDefaultOptionsConfig = {
  defModuleUp: number | string,
  defModuleDown: number | string,
  defFasadeUp: number | string,
  defFasadeDown: number | string,
  moduleTop: TOptionItem;
  moduleBottom: TOptionItem;
  fasadsTop: TOptionItem;
  fasadsBottom: TOptionItem;
  tableTop: TOptionItem
}

//------------------
/** @MODEL_JSON */
//------------------

// Утилиты
type NumStr = number | string;

// Материал
interface TMaterial {
  type: "MeshLambertMaterial" | "MeshPhongMaterial" | "MeshStandardMaterial" | "MeshPhysicalMaterial" | string;
  opt: {
    color: number;
    [key: string]: NumStr | boolean | undefined;
  };
}

// Геометрия
interface TGeometry {
  type: string; // "BoxGeometry" | "ExtrudeBoxGeometry" и т.п.
  opt: Record<string, NumStr | boolean>;
}

// Вектор
interface TVector3 {
  x: NumStr;
  y: NumStr;
  z: NumStr;
}

// Элемент сцены
interface TItem {
  id: string;
  type: "object" | string;
  geometry: TGeometry;
  rotation: TVector3;
  position: TVector3;
}

// Итоговый тип
export type TModelJSON = {
  material: TMaterial;
  items: TItem[] | Record<string, TItem>;
  position?: TVector3;
};

export type TFasadeProp = {
  SHOW: boolean | null,
  POSITION: number | null,
  COLOR: number | null,
  BODY: number | null,
  TYPE: number | null,
  MILLING: number | null,
  PALETTE: number | null,
  WINDOW: number | null,
  ALUM: number | null,
  GLASS: number | null,
  PATINA: number | null,
  HANDLES: {
    id: number | null,
    position: number | null
    drawer: null | string
  }
}

export type TModelData = {
  id: number;
  name: string;
  json: any | null;
  type_label: string;
  type: any | null;
  shininess: number | null;
  material: string;
  color: string;
  DAE: string;
  file: string;
  model_type: string;
  scale: number;
  width: number | null;
  height: number | null;
  depth: number | null;
  corr_x: number | string | null;
  corr_y: number | string | null;
  corr_z: number | string | null;
  loop_position: any | null;
  loop_model: any | null;
  wall_thickness: number | null;
};


/** @Product */

export type TNullable = string | number | null;
export type TNullableArray = Array<TNullable>;

export type TIpropertyValues = {
  SECTION_META_TITLE: string | null;
  ELEMENT_META_TITLE: string | null;
  ELEMENT_META_DESCRIPTION: string | null;
  SECTION_META_DESCRIPTION: string | null;
  SECTION_PAGE_TITLE: string | null;
};

export type TTexture = {
  src: string;
  width: number;
  height: number;
  size: string;
};

export type IProductFull = {
  ID: number;
  SORT: number;
  NAME: string;
  IPROPERTY_VALUES: TIpropertyValues;
  FACADE: number[]; // массив id фасадов
  OPTION: number[];
  GLASS: TNullableArray;
  MILLING: number[];
  CITY: TNullableArray;
  COLOR: TNullableArray;
  SIZE_EDIT: TNullable;
  SIZE_EDIT_HEIGHT: TNullableArray;
  SIZE_EDIT_WIDTH_MIN: number;
  SIZE_EDIT_WIDTH_MAX: number;
  SIZE_EDIT_HEIGHT_MIN: TNullable;
  SIZE_EDIT_HEIGHT_MAX: TNullable;
  SIZE_EDIT_WIDTH: TNullableArray;
  models: number[];
  width: number;
  depth: number;
  element_type: TNullable;
  tabletop: TNullable;
  height: number;
  HEM: TNullableArray;
  SIZE_EDIT_STEP_WIDTH: number;
  SIZE_EDIT_TERMS_MULTIPLICITY: TNullable;
  SIZE_EDIT_STEP_HEIGHT: TNullable;
  texture: TTexture;
  INCITY: TNullableArray;
  plinth_length: TNullable;
  disable_raycast: number;
  count_in_basket: TNullable;
  SIZE_EDIT_STEP_DEPTH: TNullable;
  SIZE_EDIT_DEPTH: TNullableArray;
  SIZE_EDIT_DEPTH_MIN: TNullable;
  SIZE_EDIT_DEPTH_MAX: TNullable;
  MILLING_ALT: TNullable;
  USLUGI: TNullableArray;
  SIZE_EDIT_CALC_TYPE: TNullable;
  FILLING: TNullableArray;
  leg_length: number;
  profile: TNullableArray;
  FACADEALIGNSELECT: TNullable;
  substitution_width: TNullable;
  substitution_height: TNullable;
  substitution_depth: TNullable;
  texture_type: TNullable;
  texture_rotation: TNullable;
  texture_scale: TNullable;
  EN_NAME: string;
  MODULECOLOR: number[];
  SHELFQUANT: TNullable;
  type_showcase: TNullableArray;
  fasade_type: number[];
  other_models: TNullableArray;
  DE_NAME: string;
  FASADE_SIZES: TNullableArray;
  texture_map: TNullable;
  ACTUAL_DEPT: TNullable;
  IS_BOX_SECTION: number;
  CAN_HIDE_EL: number;
  SIZE_EDIT_JOINDEPTH_MIN: TNullable;
  SIZE_EDIT_JOINDEPTH_MAX: TNullable;
  PRODUCT_MECHANISM: TNullableArray;
  DATA_PETROVICH: TNullable;
  CNSTR_MIN_WIDTH: TNullable;
  NULL_PRICE: number;
  TEST: number;
  MIN_FASADE_SIZE: TNullable;
  MAX_FASADE_SIZE: TNullable;
  LOOPSIDE: TNullableArray;
  REC_HEM: TNullableArray;
  productType: TNullable;
  DOP_PRODUCT: TNullableArray;
  HANDLES: TNullableArray;
  canSetSideProfile: number;
  ALTERNATIVE_PRODUCT: number[];
  LANG: string;
  OPTIONSECTION_ID: number;
  PREVIEW_PICTURE: string;
  FILLING_SECTION: boolean;
  FASADE_POSITION: number[];
}


export type TPalitte = {
  ID: number;
  NAME: string;
  TYPE: string;
  UNAME: string;
  HTML: string;
  PREVIEW_PICTURE: string | null;
  DETAIL_PICTURE: string | null;
}

export type TMilling = {
  ID: number;
  NAME: string;
  IBLOCK_SECTION_ID: string;
  '~IBLOCK_SECTION_ID': string;
  DETAIL_PICTURE: string;
  PREVIEW_PICTURE: string;
  SORT: number;
  '~SORT': string;
  FACADEALIGNSELECT: 0 | 1;
  PATINAOFF: 0 | 1;
  MODEL: string | null;
  INCITY: (string | null)[];
  CITY: (string | null)[];
  delay_date: string | null;
  date_shipment: string | null;
  date_build: string | null;
  type_showcase: number[];
  fasade_type: number[];
  DENSITY: number | string | null;
}



/** Заглушка */

export type TObject = { [key: string]: any }
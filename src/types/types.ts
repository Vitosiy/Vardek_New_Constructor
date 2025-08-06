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
  id: number;
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
  bodyTop: TOptionItem;
  bodyBottom: TOptionItem;
  fasadsTop: TOptionItem;
  fasadsBottom: TOptionItem;
};


/** Заглушка */
export type TObject = { [key: string]: any }
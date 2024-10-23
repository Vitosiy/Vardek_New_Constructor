import * as THREE from "three";
import { Application } from "@/Application/Core/Application";
import { TrafficManager } from "@/Application/Movement/TrafficManager";
import { RoomManager } from "@/Application/Room/RoomManager";
import { Resources } from "@/Application/Utils/Resources";
import { Ruler } from "@/Application/Utils/Ruler";
import { CustomBoxHelper } from "@/Application/Utils/BoxHelperCustom";

export type TApplication = Application
export type TTrafficManager = TrafficManager
export type TResources = Resources
export type TRuler = Ruler
export type TScene = THREE.Scene
export type TRoomManager = RoomManager
export type TCustomBoxHelper = CustomBoxHelper

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

/** Заглушка */
export type TObject = { [key: string]: any }
import * as THREE from "three";
import { Application } from "@/Application/Core/Application";
import { TrafficManager } from "@/Application/Movement/TrafficManager";
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
import {UniversalGeometryBuilder} from "@/Application/Meshes/UniversalModuleUtils/UniversalGeometryBuilder.ts";


export type TApplication = Application
export type TMeshEvents = MeshEvents
export type TTrafficManager = TrafficManager
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
export type TUniversalGeometryBuilder = UniversalGeometryBuilder

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
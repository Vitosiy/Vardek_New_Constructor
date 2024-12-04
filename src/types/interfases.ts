import * as THREE from "three";
import * as THREETypes from "../types/types"
import { FBXLoader, GLTFLoader, ColladaLoader } from "three/examples/jsm/Addons.js";

declare global {

    interface Window {
        requestFileSystem?: (
            type: number,
            size: number,
            successCallback: FileSystemEntryCallback,
        ) => void;

        webkitRequestFileSystem?: (
            type: number,
            size: number,
            successCallback: FileSystemEntryCallback,
        ) => void;
    }
}

/** THREE JS */

export interface IProjectParams {
    rooms?: IRoom[],
    camera?: ICameraData,
    orto_camera?: IOrtoCameraData,
    lights?: ILightsObjects,
    height_clamp?: number,
    table?: { [key: string]: any },
    table_params?: { [key: string]: any },
    table_color?: number | null,
    table_top_type_auto?: boolean
    default_fasade_up?: number,
    default_fasade_down?: number,
}


export interface IContentItem {
    type?: THREETypes.TContentType;
    position?: [number, number, number];
    rotation?: number[];
    sizes?: { [key: string]: number }
}

export interface IRoom {
    id: number;
    label?: string;
    description?: string;
    size: IWallSizes;
    content?: IContentItem[];
}


interface IGeometryOpt {
    x: number | string,
    y: number | string,
    z: number | string
}

interface IGeometry {
    type: string,
    opt: IGeometryOpt
}

export interface IProductGeometry {
    id: string,
    type: string,
    geometry: IGeometry,
    rotation: IRotation,
    position: IPosition
}

export interface IRotationEuler {
    isEuler: boolean,
    _x: number,
    _y: number,
    _z: number,
    _order: 'XYZ'
}

export interface IRotation {
    x: number | string,
    y: number | string,
    z: number | string,
}

export interface IPosition {
    x: number | string,
    y: number | string,
    z: number | string,
}

export interface IWallData {
    width: number,
    height: number,
    position: IPosition,
    rotation: IRotationEuler,
    side: number
}

export interface IWallSizes {
    // width?: number,
    // height?: number,
    // depth?: number,
    // thickness?: number,
    // numberOfWalls?: number,
    walls: IWallData[]
    floor?: THREE.Texture | number | string
    wall?: THREE.Texture | number | string
}

export interface ICameraData {
    position: [number, number, number],
    target: { x: number, y: number, z: number },
    fov: number,
    near: number,
    far: number

}

export interface IOrtoCameraData {
    position: [number, number, number],
    target: { x: number, y: number, z: number },
    near: number,
    far: number
}

export interface IMaterialData {
    type?: THREE.Material,
    side?: number,
    clearcoat?: number,
    clearcoatRoughness?: number,
    metalness?: number,
    roughness?: number,
    color?: THREE.Color | number | string,
    transparent?: boolean,
}

export interface IPbrMaterialData extends IMaterialData {
    map?: THREE.Texture,
    aoMap?: THREE.Texture,
    aoMapIntensity?: number
    metalnessMap?: THREE.Texture,
    roughnessMap?: THREE.Texture,
    normalMap?: THREE.Texture,
}

export interface IlightData {
    type?: string,
    normalBias?: number,
    bias?: number,
    castShadow?: boolean,
    receiveShadow?: boolean,
    mapSize?: number,
    color?: THREE.Color | number | string,
    intensity?: number,
    distance?: number,
    position?: [number, number, number]
    decay?: number
}

export interface ILightsObjects {
    ambientLight: IlightData;
    pointLight: IlightData;
}

export interface Source {
    type: 'gltfModel' | 'texture' | 'cubeTexture';
    path: string;
    name: string;
}

export interface ILoader {
    load: (path: string, callback: (file: unknown) => void, loaded?: (url: any, itemsLoaded: any, itemsTotal: any) => void, error?: (file: unknown) => void) => void;
}

export interface ILoaders {
    gltfLoader: GLTFLoader;
    textureLoader: THREE.TextureLoader;
    cubeTextureLoader: THREE.CubeTextureLoader;
    fbxLoader: FBXLoader;
    daeLoader: ColladaLoader;
}

export interface IModelsData {
    id: string;
    name: string;
    json: any | null;
    type_label: string;
    type: string;
    shininess: number;
    material: string | null;
    color: string | null;
    DAE: string;
    file: string | null;
    model_type: string;
    scale: number;
    width: number | null;
    height: number | null;
    depth: number | null;
    corr_x: number | null;
    corr_y: number | null;
    corr_z: number | null;
    loop_position: number | null;
    loop_model: string | null;
    wall_thickness: number | null;
}

export interface IShelfData {
    X: number[],
    Y: number[],
    WIDTH_CORRECTION: number
}

export interface IMouseData {
    "x": number,
    "y": number
}

export interface ISetProduct {
    scene: THREE.Scene,
    config: THREETypes.TObject,
    object: THREE.Object3D,
    point: THREE.Vector3,

    roomManager: THREETypes.TRoomManager,
    trafficManager?: THREETypes.TTrafficManager,
    boxHelper?: THREETypes.TCustomBoxHelper,
    wall?:THREE.Object3D | THREE.Mesh,
}

export interface IClampPosition {
    position: THREE.Vector3,
    rotation: THREE.Vector3 | THREE.Euler | null,
    quaternion: THREE.Quaternion
}


/** ----------------------------------------------------------------------------------------- */
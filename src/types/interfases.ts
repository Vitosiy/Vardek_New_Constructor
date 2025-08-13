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
    camera: ICameraData,
    lights: ILightsObjects,
    height_clamp: number,
    table: { [key: string]: any },
    table_params: { [key: string]: any },
    table_color: number | null,
    table_top_type_auto: boolean,
    module_color: number | string,
    default_fasade_up: number | string,
    default_fasade_down: number | string,
    default_floor: number | string,
    default_wall: number | string,
    default_module_color_down: number | string | null,
    default_module_color_up: number | string | null,
}

export interface IContentItem {
    id?: number;
    uuid?: string;
    position?: IVector3;
    rotation?: IRotationEuler;
    size?: {
        width: number;
        height: number;
        depth: number;
    };
}

export interface IRoom {
    id: number | string;
    label?: string;
    description?: string;
    params?: IWallSizes;
    content?: IContentItem[] | any[];
}

export interface IWallSizes {

    walls: IWallData[]
    floor: string | number
    wall: string | number
}

interface IVector3 {
    x: number;
    y: number;
    z: number;
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
    _order: 'XYZ' | string
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
    id: number | string
    width: number;
    height: number;
    depth?: number;
    position: IVector3,
    rotation: IRotationEuler,
    side: number
}

/**---------------------------------------------- */

export interface ICameraData {
    position: number[],
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
    ID?:string | number;
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
    moduleType: any
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


    object?: THREE.Object3D,
    point?: THREE.Vector3,
    rotate?: THREE.Vector3 | THREE.Euler | null,


    trafficManager?: THREETypes.TTrafficManager,
    boxHelper?: THREETypes.TCustomBoxHelper,
    wall?: THREE.Object3D | THREE.Mesh,
}

export interface IClampPosition {
    position: THREE.Vector3,
    rotation: THREE.Vector3 | THREE.Euler | null,
    quaternion: THREE.Quaternion
}



/** ----------------------------------------------------------------------------------------- */
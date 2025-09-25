//@ts-nocheck

// import * as THREE from "three"
// import * as THREEInterfases from "@/types/interfases"

// import { _URL } from "@/types/constants";
// import { EventEmitter } from "./EventEmitter";
// import { FBXLoader, GLTFLoader, ColladaLoader } from "three/examples/jsm/Addons.js";

// export class Resources extends EventEmitter {

//     sources: { [key: string]: unknown } = {}
//     items: { [key: string]: unknown } = {}
//     loaders: THREEInterfases.ILoaders | null = null
//     loadingManager: THREE.LoadingManager = new THREE.LoadingManager();
//     data: any

//     constructor() {

//         super()
//         this.items = {}
//         this.setLoaders()
//     }

//     get _data() {

//         return this.data
//     }

//     setLoaders() {
//         this.loaders = {} as THREEInterfases.ILoaders
//         this.loaders.gltfLoader = new GLTFLoader(this.loadingManager)
//         this.loaders.fbxLoader = new FBXLoader(this.loadingManager)
//         this.loaders.daeLoader = new ColladaLoader(this.loadingManager)
//         this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager).setCrossOrigin('anonymous');
//         this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);

//         this.loadingManager.onStart = (file, itemsLoaded, itemsTotal) => {
//         };

//         this.loadingManager.onLoad = (file) => {
//         }

//         this.loadingManager.onError = (file) => {
//         }
//     }


//     replaceUrls(obj: any) {
//         return _URL + obj
//     }

//     async startLoading(path: string | readonly string[], type: string, callback?: (...args: any[]) => void): void {

//         let truePath

//         switch (type) {

//             case 'GLTF':
//                 truePath = this.replaceUrls(path)

//                 this.loaders?.gltfLoader.load(truePath as string, (file: any) => {
//                     if (callback) {
//                         this.data = file.scene

//                         file.scene.traverse((children: any): void => {
//                             if (children instanceof THREE.Mesh) {
//                                 children.castShadow = true;
//                                 children.receiveShadow = true;
//                             }
//                         })

//                         callback(file.scene)
//                     }
//                 });
//                 break

//             case 'FBX':
//                 truePath = this.replaceUrls(path)

//                 let example = 'https://dev.vardek.online/upload/iblock/fa8/fa8d309c7d9927fd467936994c5ff446.FBX'

//                 this.loaders?.fbxLoader.load(truePath as string, (file: any) => {

//                     if (callback) {


//                         callback(file)
//                     }
//                 });
//                 break

//             case 'DAE':
//                 truePath = this.replaceUrls(path)
//                 this.loaders?.daeLoader.load(truePath as string, (file: any) => {
//                     if (callback) {

//                         callback(file)
//                     }
//                 });
//                 break

//             case 'texture':
//                 truePath = this.replaceUrls(path)
//                 this.loaders?.textureLoader.load(truePath as string, (file: any) => {

//                     if (callback) {

//                         callback(file)
//                     }
//                 }, () => {

//                 },
//                     () => {
//                         if (callback) {

//                             callback(false)
//                         }
//                     }
//                 )

//                 break

//             case 'localTexture':

//                 this.loaders?.textureLoader.load(path as string, (file: any) => {

//                     if (callback) {
//                         callback(file)
//                     }

//                 }, () => {

//                 },
//                     (e) => {
//                         if (callback) {
//                             console.log(e)
//                             callback(false)
//                         }
//                     }
//                 )

//                 break

//             case 'cubeTexture':
//                 this.loaders?.cubeTextureLoader.load(path as readonly string[],
//                     (file: unknown) => {
//                         this.items['environmentMapTexture'] = file
//                         this.trigger('cubeTextureLoaded')
//                         if (callback) {
//                             callback(file)
//                         }
//                     },
//                 );
//                 break;

//             default:
//                 throw new Error(`Unknown source type: ${type}`);
//         }


//     }
// }


import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"

import { _URL } from "@/types/constants"
import { EventEmitter } from "./EventEmitter"
import { FBXLoader, GLTFLoader, ColladaLoader } from "three/examples/jsm/Addons.js"

export class Resources extends EventEmitter {
    items: { [key: string]: unknown } = {}
    loaders: THREEInterfases.ILoaders | null = null
    loadingManager: THREE.LoadingManager = new THREE.LoadingManager()
    data: any

    constructor() {
        super()
        this.setLoaders()
    }

    get _data() {
        return this.data
    }

    setLoaders() {
        this.loaders = {} as THREEInterfases.ILoaders
        this.loaders.gltfLoader = new GLTFLoader(this.loadingManager)
        this.loaders.fbxLoader = new FBXLoader(this.loadingManager)
        this.loaders.daeLoader = new ColladaLoader(this.loadingManager)
        this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager).setCrossOrigin("anonymous")
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager)
    }

    private replaceUrls(obj: string | readonly string[]) {
        return Array.isArray(obj) ? obj.map(o => _URL + o) : _URL + obj
    }

    private loadWith<T>(loader: { load: Function }, path: string | string[]): Promise<T> {
        return new Promise((resolve, reject) => {
            loader.load(
                path,
                (result: T) => resolve(result),
                undefined,
                (err: any) => reject(err)
            )
        })
    }

    async startLoading(
        path: string | readonly string[],
        type: string,
        callback?: (result: unknown) => void
    ): Promise<unknown> {
        if (!this.loaders) throw new Error("Loaders not initialized")

        const call = (res: unknown) => {
            if (callback) callback(res)
            return res
        }

        const handlers: Record<string, () => Promise<unknown>> = {
            GLTF: async () => {
                const file: any = await this.loadWith(this.loaders!.gltfLoader, this.replaceUrls(path) as string)
                this.data = file.scene
                file.scene.traverse((child: any) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })
                return call(file.scene)
            },
            FBX: async () => {
                const file = await this.loadWith(this.loaders!.fbxLoader, this.replaceUrls(path) as string)
                return call(file)
            },
            DAE: async () => {
                const file = await this.loadWith(this.loaders!.daeLoader, this.replaceUrls(path) as string)
                return call(file.scene)
            },
            texture: async () => {
                const file = await this.loadWith(this.loaders!.textureLoader, this.replaceUrls(path) as string)
                return call(file)
            },
            localTexture: async () => {
                const file = await this.loadWith(this.loaders!.textureLoader, path as string)
                return call(file)
            },
            cubeTexture: async () => {
                const file = await this.loadWith(this.loaders!.cubeTextureLoader, path as string[])
                this.items["environmentMapTexture"] = file
                this.trigger("cubeTextureLoaded")
                return call(file)
            }
        }

        const handler = handlers[type]
        if (!handler) throw new Error(`Unknown source type: ${type}`)
        return handler()
    }

    async loadAll(
        resources: { path: string | string[]; type: string; key?: string; callback?: (res: unknown) => void }[]
    ): Promise<Record<string, unknown>> {
        const results: Record<string, unknown> = {}

        // параллельная загрузка
        await Promise.all(
            resources.map(async res => {
                const file = await this.startLoading(res.path, res.type, res.callback)
                if (res.key) results[res.key] = file
            })
        )

        return results
    }
}
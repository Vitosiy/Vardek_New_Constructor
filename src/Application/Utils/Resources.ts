//@ts-nocheck

import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"

import { _URL } from "@/types/constants";
import { EventEmitter } from "./EventEmitter";
import { FBXLoader, GLTFLoader, ColladaLoader } from "three/examples/jsm/Addons.js";

export class Resources extends EventEmitter {

    sources: { [key: string]: unknown } = {}
    items: { [key: string]: unknown } = {}
    loaders: THREEInterfases.ILoaders | null = null
    loadingManager: THREE.LoadingManager = new THREE.LoadingManager();
    data: any

    constructor() {

        super()
        this.items = {}
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
        this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager).setCrossOrigin('anonymous');
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);

        this.loadingManager.onStart = (file, itemsLoaded, itemsTotal) => {
            // console.log('Started loading file: ' + file + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        };

        this.loadingManager.onLoad = (file) => {

            // console.log(file,'Loading complete!');
        }

        this.loadingManager.onError = (file) => {
            // console.log('There was an error loading ' + file)
        }
    }


    replaceUrls(obj: any) {
        return _URL + obj
        // return  obj
    }

    startLoading(path: string | readonly string[], type: string, callback?: (...args: any[]) => void): void {

        let truePath

        switch (type) {

            case 'GLTF':
                truePath = this.replaceUrls(path)

                this.loaders?.gltfLoader.load(truePath as string, (file: any) => {
                    if (callback) {
                        this.data = file.scene

                        file.scene.traverse((children: any): void => {
                            if (children instanceof THREE.Mesh) {
                                children.castShadow = true;
                                children.receiveShadow = true;
                            }
                        })

                        callback(file.scene)
                    }
                });
                break

            case 'FBX':
                truePath = this.replaceUrls(path)

                let example = 'https://dev.vardek.online/upload/iblock/fa8/fa8d309c7d9927fd467936994c5ff446.FBX'

                this.loaders?.fbxLoader.load(truePath as string, (file: any) => {

                    if (callback) {


                        callback(file)
                    }
                });
                break

            case 'DAE':
                truePath = this.replaceUrls(path)
                this.loaders?.daeLoader.load(truePath as string, (file: any) => {
                    if (callback) {

                        callback(file)
                    }
                });
                break

            case 'texture':
                truePath = this.replaceUrls(path)
                this.loaders?.textureLoader.load(truePath as string, (file: any) => {

                    if (callback) {

                        callback(file)
                    }
                }, () => {

                },
                    () => {
                        if (callback) {

                            callback(false)
                        }
                    }
                )

                break

            case 'localTexture':

                this.loaders?.textureLoader.load(path as string, (file: any) => {

                    if (callback) {
                        callback(file)
                    }

                }, () => {

                },
                    (e) => {
                        if (callback) {
                            console.log(e)
                            callback(false)
                        }
                    }
                )

                break

            case 'cubeTexture':
                this.loaders?.cubeTextureLoader.load(path as readonly string[],
                    (file: unknown) => {
                        this.items['environmentMapTexture'] = file
                        this.trigger('cubeTextureLoaded')
                        if (callback) {
                            callback(file)
                        }
                    },
                );
                break;

            default:
                throw new Error(`Unknown source type: ${type}`);
        }


    }
}
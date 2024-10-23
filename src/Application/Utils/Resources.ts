import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import { EventEmitter } from "./EventEmitter";
import { FBXLoader, GLTFLoader, ColladaLoader } from "three/examples/jsm/Addons.js";

export class Resources extends EventEmitter {

    sources: { [key: string]: unknown } = {}
    items: { [key: string]: unknown } = {}
    loaders: THREEInterfases.ILoaders|null = null
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
        this.loaders.gltfLoader = new GLTFLoader(this.loadingManager);
        this.loaders.fbxLoader = new FBXLoader(this.loadingManager);
        this.loaders.daeLoader = new ColladaLoader(this.loadingManager);
        this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager).setCrossOrigin('anonymous');
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);

        this.loadingManager.onStart = (file, itemsLoaded, itemsTotal) => {
            console.log('Started loading file: ' + file + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        };

        this.loadingManager.onLoad = () => {
            console.log('Loading complete!');
        }

        this.loadingManager.onError = (file) => {
            console.log('There was an error loading ' + file)
        }
    }

    startLoading(path: string | readonly string[] , type: string, callback?: (file: unknown | null | boolean) => void): void {

        switch (type) {

            case 'GLTF':
                this.loaders?.gltfLoader.load(path as string, (file: any) => {
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
                this.loaders?.fbxLoader.load(path as string , (file: any) => {
                    if (callback) {
                        this.data = file.scene

                        callback(file.scene)
                    }
                });
                break

            case 'DAE':
                this.loaders?.daeLoader.load(path as string, (file: any) => {
                    if (callback) {
                        this.data = file.scene
                        callback(file.scene)
                    }
                });
                break

            case 'texture':
                this.loaders?.textureLoader.load(path as string, (file: any) => {

                    if (callback) {
                        this.data = file
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

            case 'cubeTexture':
                this.loaders?.cubeTextureLoader.load(path as readonly string[] ,
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

        return this.data
    }
}
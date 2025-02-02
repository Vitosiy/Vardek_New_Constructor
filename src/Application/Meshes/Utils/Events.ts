
//@ts-nocheck
import * as THREE from 'three'
import * as THREETypes from "@/types/types"
import GUI from 'lil-gui';

import { useEventBus } from '@/store/appliction/useEventBus';
import { DeepDispose } from '@/Application/Utils/DeepDispose';
import { BuildProduct } from '../BuildProduct';
import { useAppData } from '@/store/appliction/useAppData';
import { useModelState } from "@/store/appliction/useModelState";

import { MILLINGS } from '@/Application/F-millings';
import { directionToColor } from 'three/webgpu';

let alumTextures = new URL('@/assets/metall', import.meta.url).href + "/"

export class MeshEvents {

    root: THREETypes.TApplication;
    scene: THREETypes.TScene
    events: ReturnType<typeof useEventBus> = useEventBus()
    currentProduct: THREE.Object3D | null = null
    resources: THREETypes.TResources
    dispose: DeepDispose
    buildProduct: BuildProduct
    buildMilling: THREETypes.TMillingBuilder
    buildWindow: THREETypes.TWindowBuilder
    buildPalette: THREETypes.TPaletteBulider
    millings: any | null = MILLINGS

    _APP: THREETypes.TObject = useAppData().getAppData
    modelState = useModelState()
    // millHelper = new GUI()

    private onChangeModuleTexture: (data: { [key: string]: any }) => void;
    private onChangeFasadeTexture: ({ data, fasadeNdx }: { data: { [key: string]: any }, fasadeNdx: number }) => void;
    private onChangePaletteColor: ({ data, fasadeNdx }: { data: number, fasadeNdx: number }) => void;
    private onChangeGlassColor: (data: number | string) => void;
    private onChangeMilling: ({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) => void;
    private onChangeWindow: ({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) => void;
    private onChangeModelSize: (data: { width: number, height: number, depth: number }) => void;
    private onToggleFasade: (fasad_ndx: number) => void;

    constructor(root: THREETypes.TApplication) {

        this.root = root
        this.scene = root._scene
        this.resources = root._resources
        this.dispose = new DeepDispose()

        console.log(root.geometryBuilder, 'ROOM')

        // this.buildProduct = root.world.room.geometryBuilder.buildProduct
        this.buildProduct = root.geometryBuilder.buildProduct


        this.onChangeModuleTexture = this.changeModuleTexture.bind(root)
        this.onChangeFasadeTexture = this.changeFasadeTexture.bind(root)
        this.onChangePaletteColor = this.changePaletteColor.bind(root)
        this.onChangeGlassColor = this.changeGlassColor.bind(root)
        this.onChangeMilling = this.changeMilling.bind(root)

        this.onChangeModelSize = this.changeModelSize.bind(root)
        this.onToggleFasade = this.toggleFasade.bind(root)

        this.addVueEvents()

        this.buildMilling = this.buildProduct.milling_builder
        this.buildPalette = this.buildProduct.palette_bulider
        this.buildWindow = this.buildProduct.window_builder

    }

    get _currentMesh() {
        return this.root._trafficManager?.currentObject
    }
    // set _currentMesh(value) {
    //     this.currentProduct = this.root._trafficManager?._currentObject
    // }
    /** Цвкет корпуса */
    changeModuleTexture(data: { [key: string]: any }) {

        if (!this._currentMesh) return;

        let body = this._currentMesh?.userData.PROPS.BODY
        let shelf = this._currentMesh?.userData.PROPS.SHELF

        body?.traverse((children: THREE.Object3D) => {
            if (children instanceof THREE.Mesh) {
                this.changeColor(
                    {
                        object: children,
                        url: data.TEXTURE
                    })
            }
        })
        shelf?.forEach((item: THREE.Object3D) => {
            item.traverse((children: THREE.Object3D) => {
                if (children instanceof THREE.Mesh) {
                    this.changeColor(
                        {
                            object: children,
                            url: data.TEXTURE
                        })
                }
            })
        })

        this._currentMesh.userData.PROPS.CONFIG.MODULE_COLOR = data.ID

        // if (this.root._trafficManager) {
        //     this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.MODULE_COLOR = data.ID
        // }
    }

    /** Цвет Фасада */
    changeFasadeTexture({ data, fasadeNdx }: { data: { [key: string]: any }, fasadeNdx: number }) {
        if (!this._currentMesh) return;

        const props = this._currentMesh.userData.PROPS
        const fasade = props.FASADE[fasadeNdx]
        const window = props.CONFIG.SHOWCASE

        if (data.PALETTE.length > 0 && data.PALETTE[0] != null) {
            this.modelState.createCurrentPaletteData(data.ID)
            let palette = Object.keys(this.modelState.getCurrentPaletteData)[0]

            // console.log(props.FASADE[fasadeNdx], 'changeFasadeTexture')

            this.changePaletteColor({ data: palette, fasadeNdx })
            return
        }

        if (data.ATTACH_MILLINGS && data.ATTACH_MILLINGS[0] == null) {
            fasade.geometry = props.FASADE_DEFAULT[fasadeNdx].geometry.clone()
        }

        if (window != null) {
            this.changeWindow({ data: window[0], fasadeNdx });
        }

        const textureSize = {
            x: data.TEXTURE_WIDTH,
            y: data.TEXTURE_HEIGHT,
        }

        if (!data.COLOR) {
            fasade.visible = true;

            fasade.traverse((children: THREE.Object3D) => {
                if (children instanceof THREE.Mesh) {

                    this.changeColor(
                        {
                            object: children,
                            url: data.TEXTURE,
                            textureSize
                        })
                }
            })

            this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
            this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].COLOR = data.ID
            this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].PALETTE = null

            // console.log(this._currentMesh, 'this._currentMesh---1')

            return;
        }

        fasade.traverse((children: THREE.Object3D) => {

            fasade.visible = true

            if (children instanceof THREE.Mesh && children.userData.type != 'glass') {

                !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                children.material = new THREE.MeshStandardMaterial();

                this.resources.startLoading(`${alumTextures}metal_roughness.jpg`, 'localTexture', (file) => {
                    children.material.roughnessMap = file
                    children.material.roughnessMap.wrapS = children.material.roughnessMap.wrapT = THREE.RepeatWrapping;
                    children.material.roughnessMap.repeat.set(
                        1 / 512,
                        1 / 512
                    );
                    children.material.roughnessMap.offset.set(0.5, 0.5);
                })

                this.resources.startLoading(`${alumTextures}metal_metallic.jpg`, 'localTexture', (file) => {
                    children.material.metallicMap = file
                    children.material.metallicMap.wrapS = THREE.RepeatWrapping;
                    children.material.metallicMap.wrapT = THREE.RepeatWrapping;
                    children.material.metallicMap.repeat.set(
                        1 / 512,
                        1 / 512
                    );
                    children.material.metallicMap.offset.set(0.5, 0.5);
                })

                children.material.color.set(`${data.COLOR}`)
                children.material.metalness = 0.5
                children.material.roughness = 0.5

                // children.material.clearcoat = 1
                // children.material.clearcoatRoughness = 0

                children.material.receiveShadow = true;
                children.material.castShadow = true;
                children.material.encoding = THREE.SRGBColorSpace;

                children.material.needsUpdate = true;

            }

        })

        this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
        this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].COLOR = data.ID
        this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].PALETTE = null

    }

    changePaletteColor({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) {

        if (!this._currentMesh) return;

        // console.log('changePaletteColor')

        const props = this._currentMesh.userData.PROPS
        const fasade = props.FASADE[fasadeNdx]

        this.buildPalette.createPaletteColor({ fasade, data, fasadeNdx, props })

    }

    changeGlassColor(data: number | string) {

        if (!this._currentMesh) return;

        const props = this._currentMesh.userData.PROPS
        const fasade = props.FASADE
        const GLASS = this._APP.GLASS[data]

        if (GLASS.DETAIL_PICTURE != null && GLASS.COLOR === null) {

            Object.values(fasade).forEach((item: any) => {

                item.visible = true;

                const box = new THREE.Box3().setFromObject(item);
                const vec = new THREE.Vector3()
                const fasadeSize = box.getSize(vec)

                item.traverse((children: THREE.Object3D) => {

                    if (children instanceof THREE.Mesh) {

                        !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                        this.changeColor(
                            {
                                object: children,
                                url: GLASS.DETAIL_PICTURE,
                                type: "Glass",
                                textureSize: fasadeSize
                            })
                    }
                })

                if (this.root._trafficManager) {
                    this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW = item.visible
                }
            })

            return
        }

        Object.values(fasade).forEach((item: any) => {

            item.traverse((children: THREE.Object3D) => {

                item.visible = true;

                if (children instanceof THREE.Mesh) {

                    !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                    children.material = new THREE.MeshStandardMaterial();
                    children.material.color.set(`#${GLASS.COLOR}`)
                    children.material.metalness = 0.7
                    children.material.roughness = 0.05

                    children.material.clearcoat = 1
                    children.material.clearcoatRoughness = 0

                    children.material.receiveShadow = true;
                    children.material.castShadow = true;
                    children.material.encoding = THREE.SRGBColorSpace;

                    children.material.needsUpdate = true;

                }

                if (this.root._trafficManager) {
                    this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW = item.visible
                }
            })
        })

    }

    changeMilling({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) {
        if (!this._currentMesh) return;

        const props = this._currentMesh.userData.PROPS
        const fasade: THREE.Mesh = props.FASADE[fasadeNdx]
        const fasadeProps = props.CONFIG.FASADE_POSITIONS
        const defaultGeometry = props.FASADE_DEFAULT[fasadeNdx]

        // let millingData = [
        //     {
        //         name: "milling_1",
        //         type: 'svg',
        //         lib: 'bvh',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 2,
        //             bevelEnabled: true,
        //             bevelThickness: 2,
        //             bevelSize: 5,
        //             bevelOffset: 0,
        //             bevelSegments: 1,
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "default",
        //                 inpost: 'top',
        //                 condition: {
        //                     width: {
        //                         min: 296,
        //                         max: Infinity,
        //                     },
        //                     height: {
        //                         min: 20,
        //                         max: Infinity,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="
        //                         M 0 -hgh 
        //                         L (wth - radius) -hgh 
        //                         A radius radius 0 0 1 wth -(hgh - radius) 
        //                         L wth (hgh - radius) 
        //                         A radius radius 0 0 1 (wth - radius) hgh 
        //                         L -(wth - radius) hgh 
        //                         A radius radius 0 0 1 -wth (hgh - radius) 
        //                         L -wth -(hgh - radius) 
        //                         A radius radius 0 0 1 -(wth - radius) -hgh 
        //                         Z" 
        //                     />`,
        //                     // svg: `<path d="M -wth -hgh L wth -hgh Ar L wth hgh Ad L -wth hgh Al L -wth -hgh Au Z"/>`,
        //                     widthOffset: -55,
        //                     heightOffset: -55,
        //                     radius: 5.34,
        //                     position: {
        //                         inpostOffset: 70,
        //                         y: 'inpostTop',
        //                         z: -4,
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M 0 -hgh 
        //                         L (wth - radius) -hgh 
        //                         A radius radius 0 0 1 wth -(hgh - radius) 
        //                         L wth (hgh - radius) 
        //                         A radius radius 0 0 1 (wth - radius) hgh 
        //                         L -(wth - radius) hgh 
        //                         A radius radius 0 0 1 -wth (hgh - radius) 
        //                         L -wth -(hgh - radius) 
        //                         A radius radius 0 0 1 -(wth - radius) -hgh 
        //                         Z" 
        //                     />`,
        //                     widthOffset: -55,
        //                     heightOffset: -55,
        //                 },
        //             },
        //         ],
        //     },
        //     {
        //         name: "milling_3",
        //         isCorner: true,
        //         type: 'svg',
        //         lib: 'bvh',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 3,
        //             bevelEnabled: true,
        //             bevelThickness: 2,
        //             bevelSize: 2,
        //             bevelOffset: 0,
        //             bevelSegments: 1,
    
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "default",
        //                 inpost: 'top',
        //                 condition: {
        //                     width: {
        //                         min: 296,
        //                         max: Infinity,
        //                     },
        //                     height: {
        //                         min: 20,
        //                         max: Infinity,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -65,
        //                     heightOffset: -62,
        //                     position: {
        //                         inpostOffset: 83,
        //                         y: 'inpostTop',
        //                         z: -4,
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -68,
        //                     heightOffset: -65,
   
        //                 },
        //             },
        //         ],
        //     },
        //     {
        //         name: "milling_4",
        //         isCorner: true,
        //         type: 'svg',
        //         lib: 'bvh',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 3,
        //             bevelEnabled: true,
        //             bevelThickness: 2,
        //             bevelSize: 2,
        //             bevelOffset: 0,
        //             bevelSegments: 1,
    
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "default",
        //                 inpost: 'top',
        //                 condition: {
        //                     width: {
        //                         min: 296,
        //                         max: Infinity,
        //                     },
        //                     height: {
        //                         min: 20,
        //                         max: Infinity,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -78,
        //                     heightOffset: -70,
        //                     position: {
        //                         inpostOffset: 93,
        //                         y: 'inpostTop',
        //                         z: -4,
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -78,
        //                     heightOffset: -70,

        //                 },
        //             },
        //         ],
        //     },
        //     {
        //         name: "milling_5",
        //         isCorner: true,
        //         type: 'svg',
        //         lib: 'bvh',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 3,
        //             bevelEnabled: true,
        //             bevelThickness: 2,
        //             bevelSize: 2,
        //             bevelOffset: 0,
        //             bevelSegments: 2,
    
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "default",
        //                 inpost: 'top',
        //                 condition: {
        //                     width: {
        //                         min: 296,
        //                         max: Infinity,
        //                     },
        //                     height: {
        //                         min: 20,
        //                         max: Infinity,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -79,
        //                     heightOffset: -70,
        //                     position: {
        //                         inpostOffset: 95,
        //                         y: 'inpostTop',
        //                         z: -2,
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -100,
        //                     heightOffset: -100,
 
        //                 },
        //             },
        //         ],
        //     },
        //     {
        //         name: "milling_1",
        //         type: 'svg',
        //         lib: 'bvh',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 2,
        //             bevelEnabled: true,
        //             bevelThickness: 2,
        //             bevelSize: 5,
        //             bevelOffset: 0,
        //             bevelSegments: 1,
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "default",
        //                inpost: 'bottom',
        //                 condition: {
        //                     width: {
        //                         min: 296,
        //                         max: Infinity,
        //                     },
        //                     height: {
        //                         min: 20,
        //                         max: Infinity,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="
        //                         M 0 -hgh 
        //                         L (wth - radius) -hgh 
        //                         A radius radius 0 0 1 wth -(hgh - radius) 
        //                         L wth (hgh - radius) 
        //                         A radius radius 0 0 1 (wth - radius) hgh 
        //                         L -(wth - radius) hgh 
        //                         A radius radius 0 0 1 -wth (hgh - radius) 
        //                         L -wth -(hgh - radius) 
        //                         A radius radius 0 0 1 -(wth - radius) -hgh 
        //                         Z" 
        //                     />`,
        //                     // svg: `<path d="M -wth -hgh L wth -hgh Ar L wth hgh Ad L -wth hgh Al L -wth -hgh Au Z"/>`,
        //                     widthOffset: -55,
        //                     heightOffset: -55,
        //                     radius: 5.34,
        //                     position: {
        //                         inpostOffset: 70,
        //                         y: 'inpostBottom',
        //                         z: -4,
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M 0 -hgh 
        //                         L (wth - radius) -hgh 
        //                         A radius radius 0 0 1 wth -(hgh - radius) 
        //                         L wth (hgh - radius) 
        //                         A radius radius 0 0 1 (wth - radius) hgh 
        //                         L -(wth - radius) hgh 
        //                         A radius radius 0 0 1 -wth (hgh - radius) 
        //                         L -wth -(hgh - radius) 
        //                         A radius radius 0 0 1 -(wth - radius) -hgh 
        //                         Z" 
        //                     />`,
        //                     widthOffset: -55,
        //                     heightOffset: -55,
        //                 },
        //             },
        //         ],
        //     },
        //     {
        //         name: "milling_3",
        //         isCorner: true,
        //         type: 'svg',
        //         lib: 'bvh',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 3,
        //             bevelEnabled: true,
        //             bevelThickness: 2,
        //             bevelSize: 2,
        //             bevelOffset: 0,
        //             bevelSegments: 1,
    
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "default",
        //                inpost: 'bottom',
        //                 condition: {
        //                     width: {
        //                         min: 296,
        //                         max: Infinity,
        //                     },
        //                     height: {
        //                         min: 20,
        //                         max: Infinity,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -65,
        //                     heightOffset: -62,
        //                     position: {
        //                         inpostOffset: 83,
        //                         y: 'inpostBottom',
        //                         z: -4,
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -68,
        //                     heightOffset: -65,
   
        //                 },
        //             },
        //         ],
        //     },
        //     {
        //         name: "milling_4",
        //         isCorner: true,
        //         type: 'svg',
        //         lib: 'bvh',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 3,
        //             bevelEnabled: true,
        //             bevelThickness: 2,
        //             bevelSize: 2,
        //             bevelOffset: 0,
        //             bevelSegments: 1,
    
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "default",
        //                inpost: 'bottom',
        //                 condition: {
        //                     width: {
        //                         min: 296,
        //                         max: Infinity,
        //                     },
        //                     height: {
        //                         min: 20,
        //                         max: Infinity,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -78,
        //                     heightOffset: -70,
        //                     position: {
        //                         inpostOffset: 93,
        //                         y: 'inpostBottom',
        //                         z: -4,
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -78,
        //                     heightOffset: -70,

        //                 },
        //             },
        //         ],
        //     },
        //     {
        //         name: "milling_5",
        //         isCorner: true,
        //         type: 'svg',
        //         lib: 'bvh',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 3,
        //             bevelEnabled: true,
        //             bevelThickness: 2,
        //             bevelSize: 2,
        //             bevelOffset: 0,
        //             bevelSegments: 2,
    
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "default",
        //                inpost: 'bottom',
        //                 condition: {
        //                     width: {
        //                         min: 296,
        //                         max: Infinity,
        //                     },
        //                     height: {
        //                         min: 20,
        //                         max: Infinity,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -79,
        //                     heightOffset: -70,
        //                     position: {
        //                         inpostOffset: 95,
        //                         y: 'inpostBottom',
        //                         z: -2,
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -100,
        //                     heightOffset: -100,
 
        //                 },
        //             },
        //         ],
        //     },
        //     {
        //         name: "corner_milling_1",
        //         isCorner: true,
        //         type: 'svg',
        //         lib: 'bvh',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 1.5,
        //             bevelEnabled: true,
        //             bevelThickness: 4,
        //             bevelSize: 7.5,
        //             bevelOffset: -7.5,
        //             bevelSegments: 2,
    
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "default",
        //                 condition: {
        //                     width: {
        //                         min: 20,
        //                         max: Infinity,
        //                     },
        //                     height: {
        //                         min: 20,
        //                         max: Infinity,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: 7.5,
        //                     heightOffset: 7.5,
        //                     position: {
        //                         z: -4,
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -7.5,
        //                     heightOffset: -7.5,
        //                 },
        //             },
        //         ],
        //     },
        // ]

        let hendlesPoss = {
            y: 0,
            x: 0,
            z: 0,
            rotationX: THREE.MathUtils.radToDeg(fasade.rotation.x), // переводим из радиан в градусы
            rotationY: THREE.MathUtils.radToDeg(fasade.rotation.y),
            rotationZ: THREE.MathUtils.radToDeg(fasade.rotation.z),

        }

        let millingData = this.millings[data] ? data : 2462671

        const fasadePosition = {
            FASADE_WIDTH: eval(fasadeProps[fasadeNdx].FASADE_WIDTH),
            FASADE_HEIGHT: eval(fasadeProps[fasadeNdx].FASADE_HEIGHT),
            FASADE_DEPTH: eval(fasadeProps[fasadeNdx].FASADE_DEPTH)
        };
        // console.log(fasadePosition, '---fasadePosition')

        this.buildMilling.createMillingFasade(fasade, fasadePosition, millingData, defaultGeometry);


        // this.createMillingHelper(millingData, () => this.buildMilling.createMillingFasade(fasade, fasadePosition, millingData, defaultGeometry));

        props.CONFIG.FASADE_PROPS[fasadeNdx].MILLING = data
        props.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible

        // console.log(props)
        // console.log(fasade)
    }

    changeWindow({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) {
        if (!this._currentMesh) return;

        const props = this._currentMesh.userData.PROPS
        const fasade: THREE.Mesh = props.FASADE[fasadeNdx]
        const fasadeProps = props.CONFIG.FASADE_POSITIONS;
        const defaultGeometry = props.FASADE_DEFAULT[fasadeNdx]

        const fasadePosition = {
            FASADE_WIDTH: eval(fasadeProps[fasadeNdx].FASADE_WIDTH),
            FASADE_HEIGHT: eval(fasadeProps[fasadeNdx].FASADE_HEIGHT),
            FASADE_DEPTH: eval(fasadeProps[fasadeNdx].FASADE_DEPTH)
        };

        // this.buildMilling.createMillingFasade(fasade,
        //     fasadePosition,
        //     data,
        //     defaultGeometry)

        this.buildWindow.createWindow({
            fasade,
            fasadePosition,
            data,
            defaultGeometry
        });

        props.CONFIG.FASADE_PROPS[fasadeNdx].WINDOW = data
        props.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
    }

    // Доделать под разный выбранный фасад
    toggleFasade(fasadeNdx: number) {

        if (!this._currentMesh) return;

        const props = this._currentMesh?.userData.PROPS

        const fasade = props.FASADE[fasadeNdx]

        fasade.visible = false

        this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible

    }

    hideTable() {

    }

    changeModelSize(data: { width: number, height: number, depth: number }) {

        if (!this._currentMesh) return

        const position = this._currentMesh!.userData.PROPS.CONFIG.POSITION as THREE.Vector3

        /** Очищаем родительский объект */
        this.dispose.clearParent(this._currentMesh as THREE.Object3D)

        /** Пересоздаём по новым параметрам */
        let body = this.buildProduct.createProductBody(this._currentMesh as THREE.Object3D, data);
        /** Добавляем к родителю */
        this._currentMesh?.add(body as THREE.Object3D);
        this._currentMesh?.position.set(position.x, position.y, position.z)
        this._currentMesh?.updateMatrixWorld(true);

        const aabb = new THREE.Box3().setFromObject(this._currentMesh);
        const size = new THREE.Vector3()
        aabb.getSize(size);

        /** Для корректного примагничивания к стенам */
        this._currentMesh.userData.trueDepth = data.depth * 0.5
        this._currentMesh.userData.trueHeight = data.height * 0.5
        this._currentMesh.userData.trueLength = data.width * 0.5
        this._currentMesh.userData.trueSizes = {
            z: data.depth * 0.5, y: size.y * 0.5, x: data.width * 0.5
        }

    }

    changeColor({ object, url, textureSize, type }: { object: THREE.Object3D, url: string, textureSize?: THREETypes.TObject, type?: string }) {

        object.traverse(children => {
            if (children instanceof THREE.Mesh) {

                children.userData.ORIGINAL_COLOR != null ? children.material = children.userData.ORIGINAL_COLOR : ''

                this.resources.startLoading(url, 'texture', (file) => {

                    if (type === "Palette" || type === "Glass") {
                        children.material = new THREE.MeshStandardMaterial()
                    }

                    if (file instanceof THREE.Texture) {

                        file.colorSpace = THREE.SRGBColorSpace
                        children.material.map = file

                        if (textureSize) {
                            children.material.map.wrapS = THREE.RepeatWrapping;
                            children.material.map.wrapT = THREE.RepeatWrapping;
                            children.material.map.repeat.set(
                                1 / textureSize.x,
                                1 / textureSize.y
                            );
                            children.material.map.offset.set(0.5, 0.5);
                        }
                        if (type === "Palette") {
                            children.material.metalness = 0.7
                            children.material.roughness = 0.05
                            children.material.clearcoat = 1
                            children.material.clearcoatRoughness = 0
                            children.material.needsUpdate = true;
                        }
                    }
                });
            }
        })
    }

    addVueEvents() {
        this.onChangeModuleTexture = (data) => {
            this.changeModuleTexture(data)
        }

        this.onChangeFasadeTexture = ({ data, fasadeNdx }) => {
            this.changeFasadeTexture({ data, fasadeNdx })
        }

        this.onChangePaletteColor = ({ data, fasadeNdx }) => {
            this.changePaletteColor({ data, fasadeNdx })
        }

        this.onChangeGlassColor = (data) => {
            this.changeGlassColor(data)
        }

        this.onChangeMilling = ({ data, fasadeNdx }) => {
            this.changeMilling({ data, fasadeNdx })
        }

        this.onChangeWindow = ({ data, fasadeNdx }) => {
            this.changeWindow({ data, fasadeNdx })
        }

        this.onChangeModelSize = (data) => {
            this.changeModelSize(data as { width: number, height: number, depth: number })
        }

        this.onToggleFasade = (fasad_ndx) => {
            this.toggleFasade(fasad_ndx)
        }



        this.events.on('A:ChangeModuleTexture', this.onChangeModuleTexture);
        this.events.on('A:ChangeFasadeTexture', this.onChangeFasadeTexture);
        this.events.on('A:ChangePaletteColor', this.onChangePaletteColor);
        this.events.on('A:ChangeGlassColor', this.onChangeGlassColor);
        this.events.on('A:ChangeMilling', this.onChangeMilling)
        this.events.on('A:ChangeWindow', this.onChangeWindow)

        this.events.on('A:Model-resize', this.onChangeModelSize)
        this.events.on('A:Toggle-Fasad', this.onToggleFasade)

    }

    removeVueEvents() {
        this.events.off('A:ChangeModuleTexture', this.onChangeModuleTexture)
        this.events.off('A:Model-resize', this.onChangeModelSize)
        this.events.off('A:ChangeModuleTexture', this.onChangeModuleTexture);
        this.events.off('A:ChangeFasadeTexture', this.onChangeFasadeTexture);
        this.events.off('A:ChangePaletteColor', this.onChangePaletteColor);
        this.events.off('A:ChangeGlassColor', this.onChangeGlassColor);
        this.events.off('A:ChangeMilling', this.onChangeMilling)
        this.events.off('A:Toggle-Fasad', this.onToggleFasade)
        alumTextures = null
        this.millings = null
        this.currentProduct = null
    }

    createMillingHelper(data, fu) {

        this.millHelper.reset()

        data.forEach((item, key) => {
            if (item.type == 'capsule') return;

            let start = {}
            start[item.name] = this.millHelper.addFolder(item.name)

            start[item.name].add(item.extrudeSettings, 'steps').min(-16).max(16).step(1).name('steps').onChange(() => {
                fu()
            })
            start[item.name].add(item.extrudeSettings, 'depth').min(-20).max(20).step(0.01).name('depth').onChange(() => {
                fu()
            })
            start[item.name].add(item.extrudeSettings, 'bevelThickness').min(-20).max(20).step(1).name('bevelThickness').onChange(() => {
                fu()
            })
            start[item.name].add(item.extrudeSettings, 'bevelSize').min(-40).max(40).step(1).name('bevelSize').onChange(() => {
                fu()
            })
            start[item.name].add(item.extrudeSettings, 'bevelOffset').min(-40).max(40).step(1).name('bevelOffset').onChange(() => {
                fu()
            })
            start[item.name].add(item.extrudeSettings, 'bevelSegments').min(0).max(16).step(1).name('bevelSegments').onChange(() => {
                fu()
            })

            item.figureParams.forEach(params => {
                let condition = start[item.name].addFolder(params.nameCondition);

                let figure = condition.addFolder('figure')
                let hole = condition.addFolder('hole')

                figure.add(params.figure, 'widthOffset').min(-200).max(200).step(0.1).name('widthOffset').onChange(() => {
                    fu()
                })

                figure.add(params.figure, 'heightOffset').min(-200).max(200).step(0.1).name('heightOffset').onChange(() => {
                    fu()
                })

                hole.add(params.hole, 'widthOffset').min(-200).max(200).step(0.1).name('widthOffset').onChange(() => {
                    fu()
                })

                hole.add(params.hole, 'heightOffset').min(-200).max(200).step(0.1).name('heightOffset').onChange(() => {
                    fu()
                })
            })

        })
    }
}


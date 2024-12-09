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

const alumTextures = new URL('@/assets/metall', import.meta.url).href + "/"

export class MeshEvents {

    root: THREETypes.TApplication;
    scene: THREETypes.TScene
    events: ReturnType<typeof useEventBus> = useEventBus()
    currentProduct: THREE.Object3D | null = null
    resources: THREETypes.TResources
    dispose: DeepDispose
    buildProduct: BuildProduct
    buildMilling: THREETypes.TMillingBuilder
    buildPalette: THREETypes.TPaletteBulider
    millings = MILLINGS

    _APP: THREETypes.TObject = useAppData().getAppData
    modelState = useModelState()
    millHelper = new GUI()

    private onChangeModuleTexture: (data: { [key: string]: any }) => void;
    private onChangeFasadeTexture: ({ data, fasadeNdx }: { data: { [key: string]: any }, fasadeNdx: number }) => void;
    private onChangePaletteColor: ({ data, fasadeNdx }: { data: number, fasadeNdx: number }) => void;
    private onChangeGlassColor: (data: number | string) => void;
    private onChangeMilling: ({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) => void;
    private onChangeModelSize: (data: { width: number, height: number, depth: number }) => void;
    private onToggleFasade: (fasad_ndx: number) => void;

    constructor(root: THREETypes.TApplication) {

        this.root = root
        this.scene = root._scene
        this.resources = root._resources
        this.dispose = new DeepDispose()
        this.buildProduct = root.world.room.geometryBuilder.buildProduct


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

        console.log('changeFasadeTexture')

        if (data.PALETTE.length > 0 && data.PALETTE[0] != null) {
            this.modelState.createCurrentPaletteData(data.ID)
            let palette = Object.keys(this.modelState.getCurrentPaletteData)[0]

            console.log(palette, 'palette')

            this.changePaletteColor({ data: palette, fasadeNdx })
            return
        }

        const props = this._currentMesh.userData.PROPS
        const fasade = props.FASADE[fasadeNdx]

        if (data.ATTACH_MILLINGS && data.ATTACH_MILLINGS[0] == null) {
            fasade.geometry = props.FASADE_DEFAULT[fasadeNdx].geometry.clone()
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


            console.log(this._currentMesh, 'this._currentMesh---1')

            return;
        }

        fasade.traverse((children: THREE.Object3D) => {

            fasade.visible = true

            if (children instanceof THREE.Mesh) {

                !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                children.material = new THREE.MeshStandardMaterial();

                this.resources.startLoading(`${alumTextures}metal_roughness.jpg`, 'texture', (file) => {
                    children.material.roughnessMap = file
                    children.material.roughnessMap.wrapS = children.material.roughnessMap.wrapT = THREE.RepeatWrapping;
                    children.material.roughnessMap.repeat.set(
                        1 / 512,
                        1 / 512
                    );
                    children.material.roughnessMap.offset.set(0.5, 0.5);
                })

                this.resources.startLoading(`${alumTextures}metal_metallic.jpg`, 'texture', (file) => {
                    children.material.metallicMap = file
                    children.material.metallicMap.wrapS = children.material.metallicMap.wrapT = THREE.RepeatWrapping;
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

            // this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
            // if (this.root._trafficManager) {
            //     this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.FASADE_SHOW[fasadeNdx] = fasade.visible
            // }
        })

        this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
        this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].COLOR = data.ID
        this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].PALETTE = null

    }

    changePaletteColor({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) {

        if (!this._currentMesh) return;

        console.log('changePaletteColor')

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

        console.log('changePaletteColor')

        const props = this._currentMesh.userData.PROPS

        let fasade: THREE.Mesh = props.FASADE[fasadeNdx]
        const fasadeProps = props.CONFIG.FASADE_POSITIONS

        // let millingData = [
        //     {
        //         name: "Line",
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 1,
        //             bevelEnabled: true,
        //             bevelThickness: 0,
        //             bevelSize: 0,
        //             bevelOffset: 0,
        //             bevelSegments: 1,
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "default",
        //                 condition: {
        //                     width: {
        //                         min: 146,
        //                         max: Infinity,
        //                     },
        //                     height: {
        //                         min: 146,
        //                         max: Infinity,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="M 0 3 L -5.2 0 L 5.2 0 Z"/>
        //                         `,
        //                     widthOffset: 0,
        //                     heightOffset: 0,
        //                     pattern:{
        //                         offset:30
        //                     },
        //                     boolParams: {
        //                         depth: {
        //                             offset: 3,
        //                             size: "FASADE_HEIGHT"
        //                         },
        //                         position: {
        //                             top: false,
        //                             bottom: true,
        //                             front: -8,
        //                             left: true,
        //                             right: false,
        //                             centerVertical: true
        //                         },
        //                         rotate: {
        //                             x: -Math.PI * 0.5,
        //                             z: -Math.PI
        //                         }
        //                     }
        //                 },
        //                 hole: {
        //                     svg: ``,
        //                     widthOffset: -0,
        //                     heightOffset: -0,
        //                 },
        //             },
        //         ],
        //     },
        //     {
        //         name: "corner_milling_1",
        //         isCorner: true,
        //         extrudeSettings: {
        //             steps: 0,
        //             depth: 0,
        //             bevelEnabled: true,
        //             bevelThickness: 4,
        //             bevelSize: 7.5,
        //             bevelOffset: -7.5,
        //             bevelSegments: 1,

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

        const fasadePosition = { FASADE_WIDTH: eval(fasadeProps[fasadeNdx].FASADE_WIDTH), FASADE_HEIGHT: eval(fasadeProps[fasadeNdx].FASADE_HEIGHT), FASADE_DEPTH: eval(fasadeProps[fasadeNdx].FASADE_DEPTH) };
        console.log(fasadePosition, '---fasadePosition')


        this.buildMilling.createMillingFasade(fasade, fasadePosition, millingData, props.FASADE_DEFAULT[fasadeNdx]);

        // let hendles = this.millHelper.addFolder('РУЧКА')
        // hendles.add(hendlesPoss, 'y').min(-fasadeProps[fasadeNdx].FASADE_HEIGHT).max(fasadeProps[fasadeNdx].FASADE_HEIGHT).step(1).name('Y').onChange(() => this.buildMilling.createMillingFasade(fasade, fasadePosition, hendlesPoss, props.FASADE_DEFAULT[fasadeNdx]))
        // hendles.add(hendlesPoss, 'x').min(-fasadeProps[fasadeNdx].FASADE_WIDTH).max(fasadeProps[fasadeNdx].FASADE_WIDTH).step(1).name('X').onChange(() => this.buildMilling.createMillingFasade(fasade, fasadePosition, hendlesPoss, props.FASADE_DEFAULT[fasadeNdx]))
        // hendles.add(hendlesPoss, 'z').min(-fasadeProps[fasadeNdx].FASADE_DEPTH).max(fasadeProps[fasadeNdx].FASADE_DEPTH).step(1).name('Z').onChange(() => this.buildMilling.createMillingFasade(fasade, fasadePosition, hendlesPoss, props.FASADE_DEFAULT[fasadeNdx]))

        // hendles.add(hendlesPoss, 'rotationX', 0, 360).name('Rotation X').onChange(()=>this.buildMilling.createMillingFasade(fasade, fasadePosition, hendlesPoss, props.FASADE_DEFAULT[fasadeNdx]))
        // hendles.add(hendlesPoss, 'rotationY', 0, 360).name('Rotation Y').onChange(()=>this.buildMilling.createMillingFasade(fasade, fasadePosition, hendlesPoss, props.FASADE_DEFAULT[fasadeNdx]))
        // hendles.add(hendlesPoss, 'rotationZ', 0, 360).name('Rotation Z').onChange(()=>this.buildMilling.createMillingFasade(fasade, fasadePosition, hendlesPoss, props.FASADE_DEFAULT[fasadeNdx]))

        // this.createMillingHelper(millingData, () => this.buildMilling.createMillingFasade(fasade, fasadePosition, millingData, props.FASADE_DEFAULT[fasadeNdx]));

        this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].MILLING = data
        this._currentMesh.userData.PROPS.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible

        console.log(props)
        console.log(fasade)
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
        this._currentMesh.userData.trueSizes = [data.depth * 0.5, data.height * 0.5, data.width * 0.5]
    }

    changeColor({ object, url, textureSize, type }: { object: THREE.Object3D, url: string, textureSize?: THREETypes.TObject, type?: string }) {

        console.log(url)

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
                            children.material.map.wrapS = children.material.map.wrapT = THREE.RepeatWrapping;
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
        this.currentProduct = null
    }

    createMillingHelper(data, fu) {

        this.millHelper.reset()

        data.forEach((item, key) => {
            let start = {}
            start[item.name] = this.millHelper.addFolder(item.name)

            start[item.name].add(item.extrudeSettings, 'steps').min(-16).max(16).step(1).name('steps').onChange(() => {
                fu()
            })
            start[item.name].add(item.extrudeSettings, 'depth').min(-16).max(16).step(0.1).name('depth').onChange(() => {
                fu()
            })
            start[item.name].add(item.extrudeSettings, 'bevelThickness').min(-16).max(16).step(0.01).name('bevelThickness').onChange(() => {
                fu()
            })
            start[item.name].add(item.extrudeSettings, 'bevelSize').min(-16).max(16).step(0.1).name('bevelSize').onChange(() => {
                fu()
            })
            start[item.name].add(item.extrudeSettings, 'bevelOffset').min(-16).max(16).step(0.01).name('bevelOffset').onChange(() => {
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


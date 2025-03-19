
//@ts-nocheck
import * as THREE from 'three'
import * as THREETypes from "@/types/types"
import GUI from 'lil-gui';

import { useEventBus } from '@/store/appliction/useEventBus';
import { DeepDispose } from '@/Application/Utils/DeepDispose';
import { BuildProduct } from '../BuildProduct';
import { useAppData } from '@/store/appliction/useAppData';
import { useModelState } from "@/store/appliction/useModelState";

import { BuildersHelper } from '../BuildersHelper';

import { MILLINGS, additionaMillinglKeys } from '@/Application/F-millings';
import { directionToColor } from 'three/webgpu';

let alumTextures = new URL('@/assets/metall', import.meta.url).href + "/"

export class MeshEvents extends BuildersHelper {

    root: THREETypes.TApplication;
    scene: THREETypes.TScene
    events: ReturnType<typeof useEventBus> = useEventBus()
    // currentProduct: THREE.Object3D | null = null
    resources: THREETypes.TResources
    dispose: DeepDispose
    buildProduct: BuildProduct
    buildMilling: THREETypes.TMillingBuilder
    buildWindow: THREETypes.TWindowBuilder
    buildPalette: THREETypes.TPaletteBulider
    buildAlum: THREETypes.TAlumBulider
    private millings: any | null = MILLINGS
    private additionaMillinglKeys: any | null = additionaMillinglKeys
    private alumTextures = alumTextures

    _APP: THREETypes.TObject = useAppData().getAppData
    modelState = useModelState()
    // millHelper = new GUI()

    private onChangeModuleTexture: (data: { [key: string]: any }) => void;
    private onChangeFasade: ({ data, fasadeNdx }: { data: { [key: string]: any }, fasadeNdx: number }) => void;
    private onChangePaletteColor: ({ data, fasadeNdx }: { data: number, fasadeNdx: number }) => void;
    private onChangeGlassColor: ({ data, fasadeNdx }: { data: number, fasadeNdx: number }) => void;
    private onChangeMilling: ({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) => void;
    private onChangeWindow: ({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) => void;
    private onChangeModelSize: (data: { width: number, height: number, depth: number }) => void;
    private onToggleFasade: (fasad_ndx: number) => void;

    constructor(root: THREETypes.TApplication) {

        super(root)

        // console.trace('MeshEvents')

        this.root = root
        this.scene = root._scene
        this.resources = root._resources
        this.dispose = new DeepDispose()

        // console.log(root.geometryBuilder, 'ROOM')

        // this.buildProduct = root.world.room.geometryBuilder.buildProduct
        this.buildProduct = root.geometryBuilder.buildProduct


        this.onChangeModuleTexture = this.changeModuleTexture.bind(root)
        this.onChangeFasade = this.changeFasade.bind(root)
        this.onChangePaletteColor = this.changePaletteColor.bind(root)
        this.onChangeGlassColor = this.changeGlassColor.bind(root)
        this.onChangeMilling = this.changeMilling.bind(root)

        this.onChangeModelSize = this.changeModelSize.bind(root)
        this.onToggleFasade = this.toggleFasade.bind(root)

        this.addVueEvents()

        this.buildMilling = this.buildProduct.milling_builder
        this.buildPalette = this.buildProduct.palette_bulider
        this.buildWindow = this.buildProduct.window_builder
        this.buildAlum = this.buildProduct.alum_builder

    }

    get _currentMesh() {
        return this.root._trafficManager?._currentObject
    }

    resetFasade(fasadeNdx, incomingModel) {
        if (!this._currentMesh) return;

        const ptoductProps = this._currentMesh.userData.PROPS
        const { CONFIG, FASADE, FASADE_DEFAULT } = ptoductProps
        const { FASADE_PROPS } = CONFIG
        const rootFasadeParent = FASADE_DEFAULT[fasadeNdx].userData.rootFasadeParent
        const fasadeExist = FASADE[fasadeNdx] !== null

        const rebuild = (fasadeNdx) => {
            this.buildProduct.fasade_builder.getFasade(
                {
                    group: rootFasadeParent,
                    props: ptoductProps,
                    model_data: CONFIG.MODEL,
                    fasadeNdx,
                    incomingModel
                })
        }

        if (!fasadeExist) {
            console.log('here')
            rebuild(fasadeNdx)
        }

        if (incomingModel) {
            FASADE_PROPS[fasadeNdx].ALUM = incomingModel
            console.log('here_2')
            this.deliteFasade(fasadeNdx)
            rebuild(fasadeNdx, incomingModel)
        }
    }

    /** Цвкет корпуса */
    changeModuleTexture(data: { [key: string]: any }) {

        if (!this._currentMesh) return;

        const product = this._currentMesh
        

        let body = product.userData.PROPS.BODY
        let shelf = product.userData.PROPS.SHELF

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

        product.PROPS.CONFIG.MODULE_COLOR = data.ID

        // if (this.root._trafficManager) {
        //     this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.MODULE_COLOR = data.ID
        // }
    }

    /** Цвет Фасада */
    changeFasade({ data, fasadeNdx }: { data: { [key: string]: any }, fasadeNdx: number }) {

        if (!this._currentMesh) return;

        const product = this._currentMesh
        const incomingModel = data.MODEL

        this.resetFasade(fasadeNdx, incomingModel)

        const ptoductProps = product.userData.PROPS
        const { CONFIG, FASADE, FASADE_DEFAULT } = ptoductProps
        const { FASADE_PROPS } = CONFIG
        const window = CONFIG.SHOWCASE
        const applyWindow = FASADE_PROPS[fasadeNdx].WINDOW
        const fasade = FASADE[fasadeNdx] ?? FASADE_DEFAULT[fasadeNdx]
        FASADE_PROPS[fasadeNdx].ALUM = incomingModel

        const textureSize = {
            x: data.TEXTURE_WIDTH,
            y: data.TEXTURE_HEIGHT,
        }

        if (data.PALETTE.length > 0 && data.PALETTE[0] != null) {
            console.log('PALETTE')
            this.modelState.createCurrentPaletteData(data.ID)
            let palette = Object.keys(this.modelState.getCurrentPaletteData)[0]
            this.changePaletteColor({ data: palette, fasadeNdx })
            return
        }

        /**Проверка на наличие у входящего фасад фрезеровки и окна  */
        if (data.ATTACH_MILLINGS && data.ATTACH_MILLINGS[0] == null && window == null) {
            fasade.geometry = FASADE_DEFAULT[fasadeNdx].geometry.clone()
            console.log('ATTACH')
        }

        /**Проверка устанавливалось ли окно раньше */
        if (window != null && applyWindow === null || window != null && incomingModel == null) {
            console.log('WINDOW')
            this.changeWindow({ data: window[0], fasadeNdx });
        }

        if (!data.COLOR) {

            console.log('COLOR')
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

            FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
            FASADE_PROPS[fasadeNdx].COLOR = data.ID
            FASADE_PROPS[fasadeNdx].PALETTE = null

            return;
        }

        this.createAlumColor({ data, fasadeNdx })


        FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
        FASADE_PROPS[fasadeNdx].COLOR = data.ID
        FASADE_PROPS[fasadeNdx].PALETTE = null

    }

    changePaletteColor({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) {

        if (!this._currentMesh) return;

        const props = this._currentMesh.userData.PROPS
        const { FASADE, CONFIG } = props
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE[fasadeNdx]

        this.buildPalette.createPaletteColor({ fasade, data, fasadeNdx, props })

    }

    createAlumColor({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) {
        if (!this._currentMesh) return;

        const props = this._currentMesh.userData.PROPS
        const { FASADE, CONFIG } = props
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE[fasadeNdx]

        this.buildAlum.createAlum({ fasade, data })
    }


    changeGlassColor({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) {

        if (!this._currentMesh) return;

        const props = this._currentMesh.userData.PROPS
        const { FASADE, CONFIG } = props
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE[fasadeNdx]

        this.buildWindow.changeGlassColor({ fasade, glassId: data })

        FASADE_PROPS[fasadeNdx].GLASS = data

    }

    changeMilling({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) {
        if (!this._currentMesh) return;

        const props = this._currentMesh.userData.PROPS
        const { FASADE, FASADE_DEFAULT, CONFIG } = props
        const { FASADE_POSITIONS, FASADE_PROPS } = CONFIG

        const fasade: THREE.Mesh = FASADE[fasadeNdx]
        const defaultGeometry = FASADE_DEFAULT[fasadeNdx]

        // let millingData = [
        //     {
        //         name: "milling_1",
        //         type: 'svg',
        //         // lib: 'bvh',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 0,
        //             bevelEnabled: true,
        //             bevelThickness: 20,
        //             bevelSize: 0,
        //             bevelOffset: 0,
        //             bevelSegments: 1,
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "default",
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

        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh  L -wth -hgh  Z"/>`,
        //                     widthOffset: -3,
        //                     heightOffset: -3,
        //                     position:{
        //                         z:-20
        //                     }

        //                 },
        //                 hole: {
        //                     svg: ``,
        //                     widthOffset: -55,
        //                     heightOffset: -55,
        //                 },
        //             },

        //             {
        //                 nameCondition: "default",
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

        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh  L -wth -hgh  Z"/>`,
        //                     widthOffset: -15,
        //                     heightOffset: -15,
        //                     position:{
        //                         z:-35
        //                     }

        //                 },
        //                 hole: {
        //                     svg: ``,
        //                     widthOffset: -55,
        //                     heightOffset: -55,
        //                 },
        //             },
        //         ],
        //     },
        // ]

        let millingData = this.millings[data] || this.additionaMillinglKeys[data] ? data : 2462671

        // console.log(this.millings[data], this.additionaMillinglKeys[data])

        const fasadePosition = {
            FASADE_WIDTH: eval(FASADE_POSITIONS[fasadeNdx].FASADE_WIDTH),
            FASADE_HEIGHT: eval(FASADE_POSITIONS[fasadeNdx].FASADE_HEIGHT),
            FASADE_DEPTH: eval(FASADE_POSITIONS[fasadeNdx].FASADE_DEPTH)
        };
        // console.log(fasadePosition, '---fasadePosition')

        this.buildMilling.createMillingFasade(fasade, fasadePosition, millingData, defaultGeometry);


        // this.createMillingHelper(millingData, () => this.buildMilling.createMillingFasade(fasade, fasadePosition, millingData, defaultGeometry));

        FASADE_PROPS[fasadeNdx].MILLING = data
        FASADE_PROPS[fasadeNdx].SHOW = fasade.visible

    }

    changeWindow({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) {
        if (!this._currentMesh) return;

        const props = this._currentMesh.userData.PROPS
        const { FASADE, FASADE_DEFAULT, CONFIG } = props
        const { FASADE_POSITIONS, FASADE_PROPS } = CONFIG

        const fasade: THREE.Mesh = FASADE[fasadeNdx]
        const defaultGeometry = FASADE_DEFAULT[fasadeNdx]
        const alum = FASADE_PROPS[fasadeNdx].ALUM

        const fasadePosition = {
            FASADE_WIDTH: eval(FASADE_POSITIONS[fasadeNdx].FASADE_WIDTH),
            FASADE_HEIGHT: eval(FASADE_POSITIONS[fasadeNdx].FASADE_HEIGHT),
            FASADE_DEPTH: eval(FASADE_POSITIONS[fasadeNdx].FASADE_DEPTH)
        };

        // this.buildMilling.createMillingFasade(fasade,
        //     fasadePosition,
        //     data,
        //     defaultGeometry)

        this.buildWindow.createWindow({
            fasade,
            fasadePosition,
            data,
            defaultGeometry,
            alum
        });

        FASADE_PROPS[fasadeNdx].WINDOW = data
        FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
    }

    // Скрыть фасад
    toggleFasade(fasadeNdx: number) {

        if (!this._currentMesh) return;

        const product = this._currentMesh
        const props = product.userData.PROPS
        const fasade = props.FASADE[fasadeNdx]

        if (fasade === null) return
        fasade.visible = !fasade.visible
        props.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible

    }

    // Удалить фасад
    deliteFasade(fasadeNdx: number) {
        if (!this._currentMesh) return;

        const product = this._currentMesh
        const props = product.userData.PROPS
        const fasadeMeshId = props.FASADE[fasadeNdx]?.uuid

        // product.children.forEach(i => {
        //     i.children.forEach(ii=>{
        //         if (ii.uuid === fasadeMeshId) {
        //             this.dispose.clearObjectFromParrent(ii)
        //         }
        //     })
        // })

        try {
            if (product instanceof THREE.Object3D && typeof product.traverse === 'function') {
                product.traverse(children => {
                    if (children.uuid === fasadeMeshId) {
                        this.dispose.clearObjectFromParrent(children)
                    }
                })
                // props.FASADE = props.FASADE.filter((item, key) => item.uuid != fasadeMeshId)

                props.CONFIG.FASADE_PROPS[fasadeNdx].COLOR = null
                props.CONFIG.FASADE_PROPS[fasadeNdx].MILLING = null
                props.CONFIG.FASADE_PROPS[fasadeNdx].PALETTE = null
                props.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = false
            }
        }
        catch (e) {
        }
        props.FASADE[fasadeNdx] = null


        console.log(props.FASADE)


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

    addVueEvents() {
        this.onChangeModuleTexture = (data) => {
            this.changeModuleTexture(data)
        }

        this.onChangeFasade = ({ data, fasadeNdx }) => {
            this.changeFasade({ data, fasadeNdx })
        }

        this.onChangePaletteColor = ({ data, fasadeNdx }) => {
            this.changePaletteColor({ data, fasadeNdx })
        }

        this.onChangeGlassColor = ({ data, fasadeNdx }) => {
            this.changeGlassColor({ data, fasadeNdx })
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
        this.events.on('A:ChangeFasade', this.onChangeFasade);
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
        this.alumTextures = null
        this.millings = null
        // this.currentProduct = null
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


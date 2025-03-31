
//@ts-nocheck
import { toRaw } from 'vue';
import * as THREE from 'three'
import * as THREETypes from "@/types/types"
import GUI from 'lil-gui';

import { useEventBus } from '@/store/appliction/useEventBus';
import { DeepDispose } from '@/Application/Utils/DeepDispose';
import { BuildProduct } from '../BuildProduct';
import { useAppData } from '@/store/appliction/useAppData';
import { useModelState } from "@/store/appliction/useModelState";
import { useUniformState } from "@/store/appliction/useUniformState";

import { BuildersHelper } from '../BuildersHelper';

import { MILLINGS, additionaMillinglKeys } from '@/Application/F-millings';
import { directionToColor } from 'three/webgpu';

import { VertexNormalsHelper } from "three/examples/jsm/Addons.js";


let alumTextures = new URL('@/assets/metall', import.meta.url).href + "/"

export class MeshEvents extends BuildersHelper {

    root: THREETypes.TApplication;
    scene: THREETypes.TScene
    events: ReturnType<typeof useEventBus> = useEventBus()
    uniformState: ReturnType<typeof useUniformState> = useUniformState()
    // currentProduct: THREE.Object3D | null = null
    resources: THREETypes.TResources
    dispose: DeepDispose
    buildProduct: BuildProduct
    buildMilling: THREETypes.TMillingBuilder
    buildWindow: THREETypes.TWindowBuilder
    buildPalette: THREETypes.TPaletteBulider
    buildAlum: THREETypes.TAlumBulider
    buildUniformTexture: THREETypes.TUniformTextureBuilder
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
    private onDeliteMilling: (fasadeNdx: number) => void;

    private onChangeWindow: ({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) => void;

    private onDrawPatina: ({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) => void;
    private onDelitePatina: (fasadeNdx: number) => void;



    private onChangeModelSize: (data: { width: number, height: number, depth: number }) => void;
    private onToggleFasade: (fasad_ndx: number) => void;
    private onDeliteFasade: (fasad_ndx: number) => void;
    private onCreateUniformGroup: () => void
    private onDeliteUniformGroup: (id: number) => void

    constructor(root: THREETypes.TApplication) {

        super(root)

        // console.trace('MeshEvents')

        this.root = root
        this.scene = root._scene
        this.resources = root._resources
        this.dispose = new DeepDispose()

        this.buildProduct = root.geometryBuilder.buildProduct


        this.onChangeModuleTexture = this.changeModuleTexture.bind(root)
        this.onChangeFasade = this.changeFasade.bind(root)
        this.onChangePaletteColor = this.changePaletteColor.bind(root)
        this.onChangeGlassColor = this.changeGlassColor.bind(root)

        this.onChangeMilling = this.changeMilling.bind(root)
        this.onDeliteMilling = this.deliteMilling.bind(root)

        this.onDrawPatina = this.drawPatina.bind(root)
        this.onDelitePatina = this.delitePatina.bind(root)

        this.onCreateUniformGroup = this.сreateUniformGroup.bind(root)
        this.onDeliteUniformGroup = this.deliteUniformGroup.bind(root)

        this.onChangeModelSize = this.changeModelSize.bind(root)
        this.onToggleFasade = this.toggleFasade.bind(root)
        this.onDeliteFasade = this.deliteFasade.bind(root)

        this.addVueEvents()

        this.buildMilling = this.buildProduct.milling_builder
        this.buildPalette = this.buildProduct.palette_bulider
        this.buildWindow = this.buildProduct.window_builder
        this.buildAlum = this.buildProduct.alum_builder
        this.buildUniformTexture = this.buildProduct.uniform_texture_builder

    }

    get _currentMesh() {
        return this.root._trafficManager?._currentObject
    }

    resetFasade(fasadeNdx, incomingModel) {
        if (!this._currentMesh) return;

        const { PROPS } = this._currentMesh.userData
        const { CONFIG, FASADE, FASADE_DEFAULT } = PROPS
        const { FASADE_PROPS } = CONFIG
        const rootFasadeParent = FASADE_DEFAULT[fasadeNdx].userData.rootFasadeParent
        const fasadeExist = FASADE[fasadeNdx] !== null

        const rebuild = (fasadeNdx) => {
            this.buildProduct.fasade_builder.getFasade(
                {
                    group: rootFasadeParent,
                    props: PROPS,
                    model_data: CONFIG.MODEL,
                    fasadeNdx,
                    incomingModel
                })
        }

        if (!fasadeExist) {
            rebuild(fasadeNdx)
        }

        if (incomingModel) {
            FASADE_PROPS[fasadeNdx].ALUM = incomingModel
            this.deliteFasade(fasadeNdx)
            rebuild(fasadeNdx, incomingModel)
            return
        }

        if (FASADE_PROPS[fasadeNdx].MILLING != null) {
            // console.log('resetFasade here_3')
            FASADE[fasadeNdx].geometry = FASADE_DEFAULT[fasadeNdx].geometry.clone()
            FASADE[fasadeNdx].userData.millingMaterial = null
            FASADE_PROPS[fasadeNdx].MILLING = null
            FASADE_PROPS[fasadeNdx].PATINA = null
            return
        }
    }

    /** Цвкет корпуса */
    changeModuleTexture(data: { [key: string]: any }) {

        if (!this._currentMesh) return;

        const product = this._currentMesh


        const { CONFIG, SHELF, BODY } = product.userData.PROPS

        let body = BODY
        let shelf = SHELF

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

        CONFIG.MODULE_COLOR = data.ID

        // if (this.root._trafficManager) {
        //     this.root._trafficManager.currentObject!.userData.PROPS.CONFIG.MODULE_COLOR = data.ID
        // }
    }

    /** Цвет Фасада */
    changeFasade({ data, fasadeNdx }: { data: { [key: string]: any }, fasadeNdx: number }) {

        if (!this._currentMesh) return;
        /** Выбран без фасада */
        if (data.ID === 7397) {
            this.deliteFasade(fasadeNdx)
            return
        }

        const product = this._currentMesh
        const incomingModel = data.MODEL
        const ptoductProps = product.userData.PROPS

        if (product.userData.PROPS.CONFIG.UNIFORM_TEXTURE.group !== null) {
            this.buildUniformTexture.removeFromUniformGroup(this._currentMesh)
        }


        this.resetFasade(fasadeNdx, incomingModel)


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

        /**Проверка устанавливалось ли окно раньше */
        if (window != null && applyWindow === null || window != null && incomingModel == null) {
            // console.log('WINDOW')
            this.changeWindow({ data: window[0], fasadeNdx });
        }
        else {
            FASADE_PROPS[fasadeNdx].MILLING = null
            FASADE_PROPS[fasadeNdx].PATINA = null
        }

        if (data.PALETTE.length > 0 && data.PALETTE[0] != null) {
            // console.log('PALETTE')

            FASADE_PROPS[fasadeNdx].COLOR = data.ID
            this.modelState.createCurrentPaletteData(data.ID)
            let palette = Object.keys(this.modelState.getCurrentPaletteData)[0]
            this.changePaletteColor({ data: palette, fasadeNdx })

            return
        }

        if (!data.COLOR) {

            // console.log('COLOR')
            fasade.visible = true;
            fasade.traverse((children: THREE.Object3D) => {
                if (children instanceof THREE.Mesh) {
                    this.changeColor(
                        {
                            object: children,
                            url: data.TEXTURE,
                            textureSize
                        })
                    fasade.userData.backupMaterial = children.material
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

        // console.log(fasade.userData.millingMaterial, 'FJF')

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
        const patina = FASADE_PROPS[fasadeNdx].PATINA

        console.log('MILLL')

        // let millingData = [
        //     {
        //         name: "milling_1",
        //         type: 'svg',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 1.5,
        //             bevelEnabled: true,
        //             bevelThickness: 4.5,
        //             bevelSize: 13,
        //             bevelOffset: -13,
        //             bevelSegments: 2,
        //         },
        //         figureParams: [
        //             {
        //                 nameCondition: "small_width",
        //                 condition: {
        //                     width: {
        //                         min: 175,
        //                         max: 295,
        //                     },
        //                     height: {
        //                         min: 396,
        //                         max: 2500,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -40,
        //                     heightOffset: -60,
        //                     position: {
        //                         z: -4
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M -wth,+26 -hgh,+26 L -wth,+26 hgh,-26 L wth,-26 hgh,-26 L wth,-26 -hgh,+26 L -wth,+26 -hgh,+26 Z"/>`,
        //                     widthOffset: -40,
        //                     heightOffset: -60,
        //                 },
        //             },
        //             {
        //                 nameCondition: "small_height",
        //                 condition: {
        //                     width: {
        //                         min: 396,
        //                         max: 1250,
        //                     },
        //                     height: {
        //                         min: 175,
        //                         max: 295,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -60,
        //                     heightOffset: -40,
        //                     position: {
        //                         z: -4
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M -wth,+26 -hgh,+26 L -wth,+26 hgh,-26 L wth,-26 hgh,-26 L wth,-26 -hgh,+26 L -wth,+26 -hgh,+26 Z"/>`,
        //                     widthOffset: -60,
        //                     heightOffset: -40,
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
        //                         min: 296,
        //                         max: Infinity,
        //                     },
        //                 },
        //                 figure: {
        //                     svg: `<path d="M -wth -hgh L wth -hgh L wth hgh L -wth hgh L -wth -hgh Z"/>`,
        //                     widthOffset: -57,
        //                     heightOffset: -57,
        //                     position: {
        //                         z: -4
        //                     }
        //                 },
        //                 hole: {
        //                     svg: `<path d="M -wth,+41 -hgh,+41 L -wth,+41 hgh,-41 L wth,-41 hgh,-41 L wth,-41 -hgh,+41 L -wth,+41 -hgh,+41 Z"/>`,
        //                     widthOffset: -57,
        //                     heightOffset: -57,
        //                 },
        //             },
        //         ],
        //     },
        //     {
        //         name: "corner_milling_1",
        //         isCorner: true,
        //         type: 'svg',
        //         extrudeSettings: {
        //             steps: 1,
        //             depth: 1.5,
        //             bevelEnabled: true,
        //             bevelThickness: 4.5,
        //             bevelSize: 7.49,
        //             bevelOffset: -7.49,
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
        //                     position: {
        //                         z: -2
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

        let millingData = this.millings[data] || this.additionaMillinglKeys[data] ? data : 2462671

        const fasadePosition = {
            FASADE_WIDTH: eval(FASADE_POSITIONS[fasadeNdx].FASADE_WIDTH),
            FASADE_HEIGHT: eval(FASADE_POSITIONS[fasadeNdx].FASADE_HEIGHT),
            FASADE_DEPTH: eval(FASADE_POSITIONS[fasadeNdx].FASADE_DEPTH)
        };
        // console.log(fasadePosition, '---fasadePosition')

        this.buildMilling.createMillingFasade(fasade, fasadePosition, millingData, defaultGeometry, patina);


        // this.createMillingHelper(millingData, () => this.buildMilling.createMillingFasade(fasade, fasadePosition, millingData, defaultGeometry));

        FASADE_PROPS[fasadeNdx].MILLING = data
        FASADE_PROPS[fasadeNdx].SHOW = fasade.visible

    }

    deliteMilling(fasadeNdx: number) {
        if (!this._currentMesh) return;
        const product = this._currentMesh
        const { PROPS } = product.userData
        const { CONFIG, FASADE, FASADE_DEFAULT } = PROPS
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE_PROPS[fasadeNdx]

        this.changeMilling({ data: '1596264', fasadeNdx })
        fasade.PATINA = null
        fasade.MILLING = null
    }

    drawPatina({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) {

        if (!this._currentMesh) return;

        // console.log(data, 'PATINA')

        // return;

        const props = this._currentMesh.userData.PROPS
        const { FASADE, CONFIG } = props
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE[fasadeNdx]

        const fasadeGeometry = fasade.geometry
        const startMaterial = fasade.userData.millingMaterial

        const { geometry, material } = this.buildMilling.patinaBuilder.createPatinaColor({ geometry: fasadeGeometry, patinaId: data, startMaterial })
        fasade.geometry = geometry
        fasade.material = material
        fasade.material.needsUpdate = true

        // const helper = new VertexNormalsHelper(fasade, 100, 0xff00ff);
        // this.scene.add(helper);

        // console.log(material)

        FASADE_PROPS[fasadeNdx].PATINA = data


    }

    delitePatina(fasadeNdx: number) {
        if (!this._currentMesh) return;
        console.log('PATINA REMOVE')
        const product = this._currentMesh
        const { PROPS } = product.userData
        const { CONFIG, FASADE, FASADE_DEFAULT } = PROPS
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE_PROPS[fasadeNdx]

        fasade.PATINA = null
        this.changeMilling({ data: fasade.MILLING, fasadeNdx })

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
        FASADE_PROPS[fasadeNdx].GLASS = FASADE_PROPS[fasadeNdx].GLASS ?? toRaw(this.modelState.getCurrentGlassData[0].ID)

    }

    /** Работа с группами */

    сreateUniformGroup() {

        this.buildUniformTexture.crteateUniformGroup({})
        this.uniformState.setPreGroup(0)
        /** Очищаем helper для выделения объектов */
        this.root._customBoxHelper?.clearSelect()

    }

    deliteUniformGroup(id: number) {

        this.buildUniformTexture.deliteUniformGroup(id)
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
        const { PROPS } = product.userData

        const { CONFIG, FASADE, FASADE_DEFAULT } = PROPS
        const { FASADE_PROPS, UNIFORM_TEXTURE } = CONFIG
        const fasadeMeshId = FASADE[fasadeNdx]?.uuid

        if (UNIFORM_TEXTURE.group !== null) {
            this.buildUniformTexture.removeFromUniformGroup(product)
        }

        this.resetFasade(fasadeNdx)

        try {
            if (product instanceof THREE.Object3D && typeof product.traverse === 'function') {
                // product.traverse(children => {
                //     if (children.uuid === fasadeMeshId) {
                //         this.dispose.clearObjectFromParrent(children)
                //     }
                // })
                // props.FASADE = props.FASADE.filter((item, key) => item.uuid != fasadeMeshId)

                FASADE_PROPS[fasadeNdx].COLOR = 7397
                FASADE_PROPS[fasadeNdx].MILLING = null
                FASADE_PROPS[fasadeNdx].PALETTE = null
                FASADE_PROPS[fasadeNdx].SHOW = false
                FASADE_PROPS[fasadeNdx].GLASS = null
                FASADE_PROPS[fasadeNdx].PATINA = null
                CONFIG.UNIFORM_TEXTURE = {
                    group: null,
                    level: null,
                    index: null,
                    column_index: null,
                    backupFasadId: null,
                    color: null
                }
            }
        }
        catch (e) {
        }

        FASADE[fasadeNdx].visible = false
    }

    // Скрыть столешницу
    hideTable() {

    }

    changeModelSize(data: { width: number, height: number, depth: number }) {

        if (!this._currentMesh) return

        const { CONFIG } = this._currentMesh!.userData.PROPS
        const { POSITION, UNIFORM_TEXTURE } = CONFIG

        // const position = this._currentMesh!.userData.PROPS.CONFIG.POSITION as THREE.Vector3

        /** Очищаем родительский объект */
        this.dispose.clearParent(this._currentMesh as THREE.Object3D)

        /** Пересоздаём по новым параметрам */
        let body = this.buildProduct.createProductBody(this._currentMesh as THREE.Object3D, data);
        /** Добавляем к родителю */
        this._currentMesh?.add(body as THREE.Object3D);
        this._currentMesh?.position.set(POSITION.x, POSITION.y, POSITION.z)
        this._currentMesh?.updateMatrixWorld(true);

        const aabb = new THREE.Box3().setFromObject(this._currentMesh);
        const size = new THREE.Vector3()
        aabb.getSize(size);

        /** Для корректного примагничивания к стенам */
        this._currentMesh.userData.trueSizes = {
            DEPTH: data.depth * 0.5, HEIGHT: size.y * 0.5, WIDTH: data.width * 0.5
        }
        /** Пересоздаём UNIFORM_TEXTURE*/
        if (UNIFORM_TEXTURE.group !== null) {

            const uniformGroupCash = { ...UNIFORM_TEXTURE }

            const currentUniformGroup = this.buildUniformTexture._uniformGroups.find(group => {
                return group.id === uniformGroupCash.group
            })

            if (currentUniformGroup?.parts.flat().length < 2) {
                this.buildUniformTexture.removeFromUniformGroup(this._currentMesh)
                this.buildUniformTexture.loadUniformGroup([{
                    objects: [this._currentMesh],
                    id: uniformGroupCash.group,
                    fasadId: uniformGroupCash.backupFasadId
                }])
            }
            else {
                this.buildUniformTexture.removeFromUniformGroup(this._currentMesh)
                this.buildUniformTexture.addToUniformGroup(this._currentMesh, uniformGroupCash.group)
                /** Скрываем helper переходящего рисунка */
            }

            this.root._customBoxHelper.hideGroupBox(this.buildUniformTexture._groupsBoxHelper)


        }

        this.root._customBoxHelper.updateBoxHelper()

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

        this.onDeliteMilling = (fasadeNdx) => {
            this.deliteMilling(fasadeNdx)
        }

        this.onChangeWindow = ({ data, fasadeNdx }) => {
            this.changeWindow({ data, fasadeNdx })
        }

        this.onDrawPatina = ({ data, fasadeNdx }) => {
            this.drawPatina({ data, fasadeNdx })
        }

        this.onDelitePatina = (fasadeNdx) => {
            this.delitePatina(fasadeNdx)
        }

        this.onCreateUniformGroup = () => {
            this.сreateUniformGroup()
        }

        this.onDeliteUniformGroup = (id) => {
            this.deliteUniformGroup(id)
        }

        this.onChangeModelSize = (data) => {
            this.changeModelSize(data as { width: number, height: number, depth: number })
        }

        this.onToggleFasade = (fasad_ndx) => {
            this.toggleFasade(fasad_ndx)
        }

        this.onDeliteFasade = (fasad_ndx) => {
            this.deliteFasade(fasad_ndx)
        }


        this.events.on('A:ChangeModuleTexture', this.onChangeModuleTexture);
        this.events.on('A:ChangeFasade', this.onChangeFasade);
        this.events.on('A:ChangePaletteColor', this.onChangePaletteColor);
        this.events.on('A:ChangeGlassColor', this.onChangeGlassColor);

        this.events.on('A:ChangeMilling', this.onChangeMilling);
        this.events.on('A:DeliteMilling', this.onDeliteMilling);

        this.events.on('A:ChangeWindow', this.onChangeWindow);

        this.events.on('A:DrawPatina', this.onDrawPatina);
        this.events.on('A:DelitePatina', this.onDelitePatina);

        this.events.on('A:Create-Uniform-Group', this.onCreateUniformGroup);
        this.events.on('A:Delite-Uniform-Group', this.onDeliteUniformGroup);

        this.events.on('A:Model-resize', this.onChangeModelSize)
        this.events.on('A:Toggle-Fasad', this.onToggleFasade)

        this.events.on('A:Delite-Fasad', this.onDeliteFasade)

    }

    removeVueEvents() {
        this.events.off('A:ChangeModuleTexture', this.onChangeModuleTexture);
        this.events.off('A:ChangeFasade', this.onChangeFasade);
        this.events.off('A:ChangePaletteColor', this.onChangePaletteColor);
        this.events.off('A:ChangeGlassColor', this.onChangeGlassColor);

        this.events.off('A:ChangeMilling', this.onChangeMilling);
        this.events.off('A:DeliteMilling', this.onDeliteMilling);

        this.events.off('A:ChangeWindow', this.onChangeWindow);

        this.events.off('A:DrawPatina', this.onDrawPatina);
        this.events.off('A:DelitePatina', this.onDelitePatina);

        this.events.off('A:Create-Uniform-Group', this.onCreateUniformGroup);
        this.events.off('A:Delite-Uniform-Group', this.onDeliteUniformGroup);

        this.events.off('A:Model-resize', this.onChangeModelSize)
        this.events.off('A:Toggle-Fasad', this.onToggleFasade)
        this.events.off('A:Delite-Fasad', this.onDeliteFasade)
        this.alumTextures = null
        this.millings = null
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


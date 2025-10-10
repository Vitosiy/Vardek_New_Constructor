
// @ts-nocheck

import * as THREE from 'three'
import * as THREETypes from "@/types/types"
import { TCreateHandleParams } from '../Hendles/Handles';
// import GUI from 'lil-gui';

import { useEventBus } from '@/store/appliction/useEventBus';
import { DeepDispose } from '@/Application/Utils/DeepDispose';
import { BuildProduct } from '../BuildProduct';
import { useAppData } from '@/store/appliction/useAppData';
import { useModelState } from "@/store/appliction/useModelState";
import { useUniformState } from "@/store/appliction/useUniformState";
import { useMenuStore } from '@/store/appStore/useMenuStore';
import { useRoomOptions } from '@/components/left-menu/option/roomOptions/useRoomOptons';
import { BuildersHelper } from '../BuildersHelper';

import { MILLINGS, additionalMillingKeys } from '@/Application/F-millings';
// import { directionToColor } from 'three/webgpu';
// import { VertexNormalsHelper } from "three/examples/jsm/Addons.js";
import { BuildUniversalModule } from "@/Application/Meshes/UniversalModuleUtils/BuildUniversalModule.ts";


// let alumTextures = new URL('@/assets/metall', import.meta.url).href + "/"
type TRotateActions = Record<number, number>
export type TDataCreateHandle = { data: TCreateHandleParams; fasadeNdx: number }
export type TDataWithNdx = { data: number | string, fasadeNdx: number } | { data: { [key: string]: any }, fasadeNdx: number };
export type TDataWithType = { data: { [key: string]: any }, type: string }
export type TResizeModel = { data: { width: number, height: number, depth: number }, mesh?: THREE.Object3D, type?: string }


export class MeshEvents extends BuildersHelper {

    root: THREETypes.TApplication;
    scene: THREETypes.TScene
    events: ReturnType<typeof useEventBus> = useEventBus()
    uniformState: ReturnType<typeof useUniformState> = useUniformState()
    modelState: ReturnType<typeof useModelState> = useModelState()
    menuStore: ReturnType<typeof useMenuStore> = useMenuStore()
    roomOptions: ReturnType<typeof useRoomOptions> = useRoomOptions()
    trafficManager: THREETypes.TTrafficManager

    resources: THREETypes.TResources
    dispose: DeepDispose
    buildProduct: BuildProduct
    buildUMProduct: BuildUniversalModule
    buildMilling: THREETypes.TMillingBuilder
    buildShowcase: THREETypes.TShowcaseBuilder
    buildPalette: THREETypes.TPaletteBulider
    buildAlum: THREETypes.TAlumBuilder
    buildUniformTexture: THREETypes.TUniformTextureBuilder
    plinthBuilder: THREETypes.TPlinthBuilder
    useEdgeBuilder: THREETypes.TUseEdgeBuilder
    handlesBuilder: THREETypes.THandlesBuilder
    private millings: any | null = MILLINGS
    private additionalMillingKeys: any | null = additionalMillingKeys
    // private alumTextures: string | null = alumTextures

    private _overrideMesh?: THREE.Object3D | null;

    _APP: THREETypes.TObject = useAppData().getAppData

    // millHelper = new GUI()

    private onChangeModuleTexture: (data: { [key: string]: any }) => void;
    private onChangeTotalModuleTexture: ({ data, type }: TDataWithType) => void;

    private onChangeFasade: ({ data, fasadeNdx }: TDataWithNdx) => void;
    private onChangeTotalFasadsTexture: ({ data, type }: TDataWithType) => void;

    private onChangeGlobalTopTable: ({ data, type }: TDataWithType) => void;

    private onChangePaletteColor: ({ data, fasadeNdx }: TDataWithNdx) => void;
    private onChangePaletteTotal: ({ data, type }: TDataWithType) => void;

    private onChangeGlassColor: ({ data, fasadeNdx }: TDataWithNdx) => void;

    private onChangeMilling: ({ data, fasadeNdx }: TDataWithNdx) => void;
    private onDeliteMilling: (fasadeNdx: number) => void;
    private onChangeMillingTotal: ({ data, type }: TDataWithType) => void;

    private onChangeShowcase: ({ data, fasadeNdx }: TDataWithNdx) => void;
    private onDeliteShowcase:  (fasadeNdx: number) => void;

    private onDrawPatina: ({ data, fasadeNdx }: TDataWithNdx) => void;
    private onDelitePatina: (fasadeNdx: number) => void;

    private onUpdateUMModel: (data: Object) => void;
    private onToggleFasade: (fasad_ndx: number) => void;
    private onDeliteFasade: (fasad_ndx: number) => void;
    private onCreateUniformGroup: () => void
    private onDeliteUniformGroup: (id: number) => void

    private onAddHandle: ({ data, fasadeNdx }: TDataWithNdx) => void
    private onDeliteHandle: ({ data, fasadeNdx }: TDataWithNdx) => void
    private onChangeHandlePos: ({ data, fasadeNdx }: TDataWithNdx) => void
    private onChangePlinth: () => void

    private onChangeModelSize: ({ data, mesh, type }: TResizeModel) => void;
    private onCgangeRotation: (data: number) => void

    private searchElementsByType: Record<string, string> = {
        moduleTop: "element_up",
        fasadsTop: "element_up",
        moduleBottom: "element_down",
        fasadsBottom: "element_down"

    }

    private rotateActions: TRotateActions = {
        1: Math.PI,
        3: Math.PI * -0.5,
        4: Math.PI * -0.5,
        5: Math.PI * 0.5,
        7: 0
    }

    constructor(root: THREETypes.TApplication) {

        super(root)

        // console.trace('MeshEvents')

        this.root = root;
        this.scene = root._scene!;
        this.resources = root._resources!;
        this.dispose = root._deepDispose!;
        this.trafficManager = root._trafficManager!;
        this.useEdgeBuilder = root._useEdgeBuilder!;

        this.buildProduct = root._geometryBuilder!.buildProduct;
        this.buildUMProduct = root._universalGeometryBuilder!.buildProduct;

        this.onChangeModuleTexture = this.changeModuleTexture.bind(root);
        this.onChangeTotalModuleTexture = this.changeTotalModuleTexture.bind(root);

        this.onChangeFasade = this.changeFasade.bind(root);
        this.onChangeTotalFasadsTexture = this.changeTotalFasadsTexture.bind(root);

        this.onChangeGlobalTopTable = this.changeGlobalTopTable.bind(root);

        this.onChangePaletteColor = this.changePaletteColor.bind(root);
        this.onChangePaletteTotal = this.changePaletteTotal.bind(root)

        this.onChangeGlassColor = this.changeGlassColor.bind(root);

        this.onChangeMilling = this.changeMilling.bind(root);
        this.onDeliteMilling = this.deliteMilling.bind(root);
        this.onChangeMillingTotal = this.changeMillingTotal.bind(root);

        this.onChangeShowcase = this.changeShowcase.bind(root);
        this.onDeliteShowcase = this.deliteShowcase.bind(root)

        this.onDrawPatina = this.drawPatina.bind(root);
        this.onDelitePatina = this.delitePatina.bind(root);

        this.onCreateUniformGroup = this.сreateUniformGroup.bind(root);
        this.onDeliteUniformGroup = this.deliteUniformGroup.bind(root);

        this.onUpdateUMModel = this.updateUMModel.bind(root);

        this.onToggleFasade = this.toggleFasade.bind(root);
        this.onDeliteFasade = this.deliteFasade.bind(root);

        this.onAddHandle = this.addHandle.bind(root);
        this.onDeliteHandle = this.deliteHandle.bind(root);
        this.onChangeHandlePos = this.changeHandlePos.bind(root);
        this.onChangePlinth = this.changePlinth.bind(root)

        this.onChangeModelSize = this.changeModelSize.bind(root);
        this.onCgangeRotation = this.changeRotation.bind(root)

        this.addVueEvents();

        this.buildMilling = this.buildProduct.milling_builder;
        this.buildPalette = this.buildProduct.palette_bulider;
        this.buildShowcase = this.buildProduct.showcase_builder;
        this.buildAlum = this.buildProduct.alum_builder;
        this.buildUniformTexture = this.buildProduct.uniform_texture_builder;
        this.handlesBuilder = this.buildProduct.handles_builder;
        this.plinthBuilder = this.buildProduct.plinth_builder
    }

    get _currentMesh() {
        return this._overrideMesh ?? this.trafficManager._currentObject;
    }

    set _currentMesh(mesh: THREE.Object3D | undefined | null) {
        this._overrideMesh = mesh;
    }

    async resetFasade({ fasadeNdx, incomingModel, totalFasad, remove = false }: { fasadeNdx: number, incomingModel?: any, totalFasad?: THREE.Object3D, remove: boolean }) {

        const fTypeMap: Record<string, keyof THREETypes.TOptionsMap> = {
            element_up: 'fasadsTop',
            element_down: 'fasadsBottom'

        }
        const product = totalFasad ?? this._currentMesh


        if (!product) return;

        const { PROPS } = product.userData
        const { CONFIG, FASADE, FASADE_DEFAULT } = PROPS
        const { FASADE_PROPS, ELEMENT_TYPE } = CONFIG
        const defaultConfig: THREETypes.TDefaultOptionsConfig = this.buildProduct.getDefaultOptionsConfig();
        const fasadeExist = FASADE[fasadeNdx]
        const curGlobalOptions: THREETypes.TOptionsMap = this.roomOptions.getGlobalOptions
        const globalMilling = curGlobalOptions[fTypeMap[ELEMENT_TYPE]] ? curGlobalOptions[fTypeMap[ELEMENT_TYPE]].milling : null

        const rebuild = (fasadeNdx) => {
            this.buildProduct.fasade_builder.getFasade(
                {
                    props: PROPS,
                    model_data: CONFIG.MODEL,
                    fasadeNdx,
                    incomingModel,
                    defaultConfig,
                    remove
                })
        }

        if (fasadeExist) {
            rebuild(fasadeNdx)
        }

        if (incomingModel) {
            FASADE_PROPS[fasadeNdx].ALUM = incomingModel
            this.deliteFasade(fasadeNdx)
            rebuild(fasadeNdx, incomingModel)

            return
        }

        if (FASADE_PROPS[fasadeNdx].MILLING != null) {
            console.log('hhhhhhh')
            FASADE[fasadeNdx].geometry = FASADE_DEFAULT[fasadeNdx].geometry.clone()
            FASADE[fasadeNdx].userData.millingMaterial = null
            FASADE_PROPS[fasadeNdx].MILLING = globalMilling
            FASADE_PROPS[fasadeNdx].PATINA = null
        }
    }

    //------------------
    /** @Цвет_корпуса  */
    //------------------

    async catchChangeModuleTexture(data: { [key: string]: any }, currentMesh?: THREE.Object3D) {

        const product = currentMesh ?? this._currentMesh;
        const { CONFIG, SHELF, BODY, JSON_FILLINGS } = product.userData.PROPS;

        [BODY, ...(SHELF ?? []), ...(JSON_FILLINGS ?? [])].forEach((obj) => {
            if (obj instanceof THREE.Object3D) {
                obj?.traverse((child: THREE.Object3D) => {
                    // Пропускаем меш чертежа
                    if ((child.userData && child.userData.edge) || child.parent?.userData?.edge) return

                    if (child instanceof THREE.Mesh) {
                        this.changeColor({ object: child, url: data.TEXTURE });
                    }
                })
            }
        }
        );

        CONFIG.MODULE_COLOR = data.ID;
    }

    async changeModuleTexture(data: { [key: string]: any }) {

        if (!this._currentMesh) return;
        await this.catchChangeModuleTexture(data)
        this.events.emit('U:ChangeModule')

    }

    changeTotalModuleTexture({ data, type }: TDataWithType) {

        const currentType = this.searchElementsByType[type] /**@Тип_элемента -- @верхний / @нижний */
        const elementsList = this.scene.getObjectsByProperty('elementType', currentType) /** @Находим все элементы выбранного типа */

        if (Array.isArray(elementsList) && elementsList[0]) {
            elementsList.forEach(async (el) => {
                await this.catchChangeModuleTexture(data, el)
            })
        }
    }

    //------------------
    /** @Изменение_поверхности_фасада  */
    //------------------

    async catchFasadeChange({ data, fasadeNdx }: TDataWithNdx) {
        const product = this._currentMesh;
        const drowMode = this.menuStore.getDrowModeValue

        const { CONFIG, FASADE, FASADE_DEFAULT, ELEMENT_TYPE } = product.userData.PROPS;
        const { FASADE_PROPS, UNIFORM_TEXTURE } = CONFIG;

        const incomingModel = data.MODEL;
        const fasade = FASADE[fasadeNdx] ?? FASADE_DEFAULT[fasadeNdx];
        const fasadeProp = FASADE_PROPS[fasadeNdx];

        fasadeProp.COLOR = data.ID

        if (UNIFORM_TEXTURE.group !== null) {
            this.removeFromUniformGroup(product);
        }

        this.resetFasade({ fasadeNdx, incomingModel });
        fasadeProp.ALUM = incomingModel;

        const apply = async () => {
            this.handleWindowChange(CONFIG, fasadeProp, fasadeNdx, incomingModel);
            if (this.tryApplyPalette(data, fasadeNdx, fasadeProp)) return
            if (this.tryApplyTexture(data, fasade, fasadeProp)) return
            this.applyAlumColor(data, fasade, fasadeProp, fasadeNdx);

        }
        await apply();
        if (drowMode) {
            const edgeMeshID = FASADE[fasadeNdx].userData.edgeID
            const edgeMesh = FASADE[fasadeNdx].parent.getObjectById(edgeMeshID)
            this.useEdgeBuilder.drawingMode(drowMode, FASADE[fasadeNdx])
            this.useEdgeBuilder.drawingMode(drowMode, edgeMesh)
        }
    }

    private removeFromUniformGroup(product: THREE.Object3D) {
        this.buildUniformTexture.removeFromUniformGroup(product);
    }

    private handleWindowChange(CONFIG: any, fasadeProp: any, fasadeNdx: number, incomingModel: any) {
        const showcase = CONFIG.SHOWCASE;
        const milling = fasadeProp.MILLING

        if (showcase.length > 0 && (fasadeProp.SHOWCASE === null || !incomingModel)) {
            this.changeShowcase({ data: showcase[0], fasadeNdx });
        } else {
            Object.assign(fasadeProp, { MILLING: milling, PATINA: null });
        }
    }

    private tryApplyPalette(data: any, fasadeNdx: number, fasadeProp: any): boolean {
        if (!data.PALETTE?.[0]) return false;
        fasadeProp.COLOR = data.ID;
        this.modelState.createCurrentPaletteData(data.ID);
        const palette = Object.keys(this.modelState.getCurrentPaletteData)[0];
        this.changePaletteColor({ data: palette, fasadeNdx });
        return true;
    }

    private tryApplyTexture(data: any, fasade: any, fasadeProp: any): boolean {
        if (data.COLOR) return false;

        fasade.visible = true;
        fasade.traverse((child: THREE.Object3D) => {
            // Пропускаем меш чертежа
            if ((child.userData && child.userData.edge) || child.parent?.userData?.edge) {
                return
            }
            if (child instanceof THREE.Mesh) {

                this.changeColor({
                    object: child,
                    url: data.TEXTURE,
                    textureSize: { x: data.TEXTURE_WIDTH, y: data.TEXTURE_HEIGHT }
                });
                fasade.userData.backupMaterial = child.material;
            }
        });

        Object.assign(fasadeProp, { SHOW: true, COLOR: data.ID, PALETTE: null });
        fasade.userData.SHOW = true
        return true;
    }

    private applyAlumColor(data: any, fasade: any, fasadeProp: any, fasadeNdx: number) {
        this.createAlumColor({ data, fasadeNdx });
        Object.assign(fasadeProp, { SHOW: fasade.visible, COLOR: data.ID, PALETTE: null });
        fasade.userData.SHOW = fasade.visible
    }

    async changeFasade({ data, fasadeNdx }: TDataWithNdx) {

        if (!this._currentMesh) return;
        /** Выбран без фасада */
        if (data.ID === 7397) {
            // this.deliteFasade(fasadeNdx)
            return
        }

        await this.catchFasadeChange({ data, fasadeNdx })
        this.events.emit('U:ChangeFasade')
    }

    changeTotalFasadsTexture({ data, type }: TDataWithType) {

        const currentType = this.searchElementsByType[type] /**@Тип_элемента -- @верхний / @нижний */

        const elementsList = this.scene.getObjectsByProperty('elementType', currentType) /** @Находим все элементы выбранного типа */

        if (Array.isArray(elementsList) && elementsList[0]) {
            elementsList.forEach((el) => {
                const fasadeList = el.userData.PROPS.FASADE
                if (fasadeList.length > 0) {
                    fasadeList.forEach(async (fasade, fasadeNdx) => {
                        // const prevMesh = this._currentMesh
                        this._currentMesh = el;

                        if (data.ID == 7397) {
                            await this.catchDeliteFasade(fasadeNdx, el)
                        }
                        else {
                            await this.catchFasadeChange({ data, fasadeNdx })
                        }
                        this._currentMesh = null; // вернуть старое значение
                    })
                }
            })
        }
    }

    //------------------
    /** @Цвет_палитры  */
    //------------------

    async catchChangePaletteColor({ data, fasadeNdx }: TDataWithNdx) {

        const props = this._currentMesh.userData.PROPS
        const { FASADE, CONFIG } = props
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE[fasadeNdx]
        const fasadeProps = FASADE_PROPS[fasadeNdx]

        // console.log({ data, fasadeNdx }, 'PALLIT')

        this.buildPalette.createPaletteColor({ fasade, data, fasadeProps })
    }

    async changePaletteColor({ data, fasadeNdx }: TDataWithNdx) {

        if (!this._currentMesh) return;
        const props = this._currentMesh.userData.PROPS
        const { FASADE, CONFIG } = props
        const { FASADE_PROPS } = CONFIG
        const patina = FASADE_PROPS[fasadeNdx].PATINA


        // console.log(data, 'data')

        await this.catchChangePaletteColor({ data, fasadeNdx } as TDataWithNdx)
        if (patina) {
            await this.catchDrawPatina({ data: patina, fasadeNdx })
        }
        // console.log(FASADE_PROPS[fasadeNdx].PATINA, 'FASADE')
        this.events.emit("U:ChangePaletteColor")

    }

    changePaletteTotal({ data, type }: TDataWithType) {

        const currentType = this.searchElementsByType[type];
        const elementsList = this.scene.getObjectsByProperty('elementType', currentType);

        if (Array.isArray(elementsList) && elementsList.length > 0) {
            elementsList.forEach((el) => {
                const fasadeList = el.userData.PROPS.FASADE;
                if (fasadeList.length > 0) {
                    fasadeList.forEach(async (_fasade, fasadeNdx) => {
                        this._currentMesh = el;
                        await this.catchChangePaletteColor({ data: data.ID, fasadeNdx });
                        this._currentMesh = null
                    });
                }
            });
        }
    }

    //------------------
    /** @Алюминевая_поверхнорсть  */
    //------------------

    createAlumColor({ data, fasadeNdx }: TDataWithNdx) {
        if (!this._currentMesh) return;

        const props = this._currentMesh.userData.PROPS
        const { FASADE, CONFIG } = props
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE[fasadeNdx]

        this.buildAlum.createAlum({ fasade, data })
    }

    //------------------
    /** @Стекло_витринн  */
    //------------------

    changeGlassColor({ data, fasadeNdx }: TDataWithNdx) {

        if (!this._currentMesh) return;

        const props = this._currentMesh.userData.PROPS
        const { FASADE, CONFIG } = props
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE[fasadeNdx]

        this.buildShowcase.changeGlassColor({ fasade, glassId: data })

        FASADE_PROPS[fasadeNdx].GLASS = data

    }

    //------------------
    /** @Фрезеровка  */
    //------------------

    async catchChangeMilling({ data, fasadeNdx }: TDataWithNdx) {
        const props = this._currentMesh.userData.PROPS
        const { FASADE, FASADE_DEFAULT, CONFIG } = props
        const { FASADE_POSITIONS, FASADE_PROPS } = CONFIG

        const fasade: THREE.Mesh = FASADE[fasadeNdx]
        const defaultGeometry = FASADE_DEFAULT[fasadeNdx]
        const patina = FASADE_PROPS[fasadeNdx].PATINA

        let millingData = this.millings[data] || this.additionalMillingKeys[data] ? data : 2462671

        const fasadePosition = {
            FASADE_WIDTH: eval(FASADE_POSITIONS[fasadeNdx].FASADE_WIDTH),
            FASADE_HEIGHT: eval(FASADE_POSITIONS[fasadeNdx].FASADE_HEIGHT),
            FASADE_DEPTH: eval(FASADE_POSITIONS[fasadeNdx].FASADE_DEPTH)
        };

        this.buildMilling.createMillingFasade(fasade, fasadePosition, millingData, defaultGeometry, patina);

        FASADE_PROPS[fasadeNdx].MILLING = data
        FASADE_PROPS[fasadeNdx].SHOW = fasade.visible

    }

    async changeMilling({ data, fasadeNdx }: TDataWithNdx) {
        if (!this._currentMesh) return;

        await this.catchChangeMilling({ data, fasadeNdx })

        this.events.emit("U:ChangeMilling")
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

    changeMillingTotal({ data, type }: TDataWithType) {

        const currentType = this.searchElementsByType[type];
        const elementsList = this.scene.getObjectsByProperty('elementType', currentType);

        if (Array.isArray(elementsList) && elementsList.length > 0) {
            elementsList.forEach((el) => {
                const fasadeList = el.userData.PROPS.FASADE;
                if (fasadeList.length > 0) {
                    fasadeList.forEach(async (_fasade, fasadeNdx) => {
                        this._currentMesh = el;
                        await this.catchChangeMilling({ data: data.ID, fasadeNdx });
                        this._currentMesh = null
                    });
                }
            });
        }
    }

    //------------------
    /** @Патина  */
    //------------------

    async catchDrawPatina({ data, fasadeNdx }: TDataWithNdx) {
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

    async drawPatina({ data, fasadeNdx }: TDataWithNdx) {

        if (!this._currentMesh) return;
        await this.catchDrawPatina({ data, fasadeNdx })
        this.events.emit("U:DrawPatina")

    }

    delitePatina(fasadeNdx: number) {
        if (!this._currentMesh) return;
        const product = this._currentMesh
        const { PROPS } = product.userData
        const { CONFIG, FASADE, FASADE_DEFAULT } = PROPS
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE_PROPS[fasadeNdx]
        fasade.PATINA = null
        const color = fasade.PALETTE
        this.changePaletteColor({ data: color, fasadeNdx })

        // this.changeMilling({ data: fasade.MILLING, fasadeNdx })

    }

    //------------------
    /** @Витрина  */
    //------------------

    changeShowcase({ data, fasadeNdx }: TDataWithNdx) {
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

        this.buildShowcase.createShowcase({
            fasade,
            fasadePosition,
            data,
            defaultGeometry,
            alum
        });

        // console.log(this.modelState.getCurrentGlassData, '-----GLAAS')

        FASADE_PROPS[fasadeNdx].SHOWCASE = data
        FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
        FASADE_PROPS[fasadeNdx].GLASS = FASADE_PROPS[fasadeNdx].GLASS ?? '76033'

    }

    deliteShowcase(fasadeNdx: number) {
        if (!this._currentMesh) return;
        const product = this._currentMesh
        const { PROPS } = product.userData
        const { CONFIG, FASADE, FASADE_DEFAULT } = PROPS
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE_PROPS[fasadeNdx]

        this.changeMilling({ data: '1013628', fasadeNdx })
        fasade.SHOWCASE = 1013628

    }


    //------------------
    /** @Переходящий_рисунок  */
    //------------------

    сreateUniformGroup() {

        this.buildUniformTexture.crteateUniformGroup({})
        this.uniformState.setPreGroup(0)
        /** Очищаем helper для выделения объектов */
        this.root._customBoxHelper?.clearSelect()
    }

    deliteUniformGroup(id: number) {

        this.buildUniformTexture.deliteUniformGroup(id)
    }

    //------------------
    /** @Стандартная_столешница  */
    //------------------

    changeGlobalTopTable({ data, type }: TDataWithType) {
        const elementsList = this.scene.getObjectsByProperty('name', type) /** @Находим все элементы выбранного типа */

        if (Array.isArray(elementsList) && elementsList[0]) {
            elementsList.forEach(el => {
                const parent = this.getRootObject(el)
                this.buildProduct.tabletop_builder.updateTableTop(parent, data)
            })
        }
    }

    //------------------
    /** @Методы_работы_с_фасадом  */
    //------------------

    // Скрыть фасад
    toggleFasade(fasadeNdx: number) {

        if (!this._currentMesh) return;

        const product = this._currentMesh
        const props = product.userData.PROPS
        const fasade = props.FASADE[fasadeNdx]

        if (fasade === null) return
        if (props.CONFIG.FASADE_PROPS[fasadeNdx].COLOR === 7397) return
        fasade.visible = !fasade.visible
        props.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible

    }

    // Удалить фасад

    async catchDeliteFasade(fasadeNdx: number, el: THREE.Object3D) {

        const drowMode = this.menuStore.getDrowModeValue
        const product = el ?? this._currentMesh

        const { PROPS } = product.userData
        const { CONFIG, FASADE, FASADE_DEFAULT } = PROPS
        const { FASADE_PROPS, UNIFORM_TEXTURE } = CONFIG

        if (UNIFORM_TEXTURE.group !== null) {
            this.buildUniformTexture.removeFromUniformGroup(product)
        }

        await this.resetFasade({ fasadeNdx, remove: true })
        if (drowMode) {

            const edgeMeshID = FASADE[fasadeNdx].userData.edgeID
            const edgeMesh = FASADE[fasadeNdx].parent.getObjectById(edgeMeshID)
            this.useEdgeBuilder.drawingMode(drowMode, FASADE[fasadeNdx])
            this.useEdgeBuilder.drawingMode(drowMode, edgeMesh)
        }

    }

    async deliteFasade(fasadeNdx: number) {
        if (!this._currentMesh) return;
        await this.catchDeliteFasade(fasadeNdx)
        this.events.emit("U:DeliteFasad")
    }

    //------------------
    /** @Универсальный_модуль  */
    //------------------

    updateUMModel(data: object) {

        if (!this._currentMesh)
            return

        const { PROPS } = this._currentMesh!.userData
        const { CONFIG } = PROPS
        const { POSITION, UNIFORM_TEXTURE } = CONFIG

        // const position = this._currentMesh!.userData.PROPS.CONFIG.POSITION as THREE.Vector3

        /** Очищаем родительский объект */
        this.dispose.clearParent(this._currentMesh as THREE.Object3D)
        let size = { width: data.width, height: data.height, depth: data.depth }

        /** Пересоздаём по новым параметрам */
        let body = this.buildUMProduct.createProductBody(this._currentMesh as THREE.Object3D, size, data);

        /** Добавляем к родителю */
        this._currentMesh?.add(body as THREE.Object3D);
        this._currentMesh?.position.set(POSITION.x, POSITION.y, POSITION.z)
        this._currentMesh?.updateMatrixWorld(true);

        const aabb = new THREE.Box3().setFromObject(this._currentMesh);
        size = new THREE.Vector3()
        aabb.getSize(size);

        /** Для корректного примагничивания к стенам */
        this._currentMesh.userData.trueSizes = {
            DEPTH: size.depth * 0.5, HEIGHT: size.y * 0.5, WIDTH: size.width * 0.5
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

    //------------------
    /** @Изменение_размеров_модели  */
    //------------------

    async changeModelSize({ data, mesh, type }: TResizeModel) {

        const currentMesh = mesh ? mesh : this._currentMesh

        if (!currentMesh) return
        const { PROPS } = currentMesh!.userData
        const { CONFIG } = PROPS
        const { POSITION, UNIFORM_TEXTURE } = CONFIG

        /** Очищаем родительский объект */
        this.dispose.clearParent(currentMesh as THREE.Object3D)

        const rebuild = async () => {

            /** Пересоздаём по новым параметрам */
            let body = this.buildProduct.createProductBody(currentMesh as THREE.Object3D, data);
            /** Добавляем к родителю */
            currentMesh?.add(body as THREE.Object3D);
            currentMesh?.position.set(POSITION.x, POSITION.y, POSITION.z)
            currentMesh?.updateMatrixWorld(true);


            // const aabb = new THREE.Box3().setFromObject(currentMesh);
            // const aabb = this.buildProduct.computeAABB(currentMesh)
            // const size = new THREE.Vector3()
            // aabb.getSize(size);

            const height = body.userData.trueSizes.HEIGHT

            /** Для корректного примагничивания к стенам */
            currentMesh.userData.trueSizes = {
                DEPTH: data.depth * 0.5, HEIGHT: height, WIDTH: data.width * 0.5
            }
            /** Пересоздаём UNIFORM_TEXTURE*/
            if (UNIFORM_TEXTURE.group !== null) {

                const uniformGroupCash = { ...UNIFORM_TEXTURE }

                const currentUniformGroup = this.buildUniformTexture._uniformGroups.find(group => {
                    return group.id === uniformGroupCash.group
                })

                if (currentUniformGroup?.parts.flat().length < 2) {
                    this.buildUniformTexture.removeFromUniformGroup(currentMesh)
                    this.buildUniformTexture.loadUniformGroup([{
                        objects: [currentMesh],
                        id: uniformGroupCash.group,
                        fasadId: uniformGroupCash.backupFasadId
                    }])
                }
                else {
                    this.buildUniformTexture.removeFromUniformGroup(currentMesh)
                    this.buildUniformTexture.addToUniformGroup(currentMesh, uniformGroupCash.group)
                    /** Скрываем helper переходящего рисунка */
                }

                this.root._customBoxHelper.hideGroupBox(this.buildUniformTexture._groupsBoxHelper)

            }

        }

        await rebuild()

        const adjustedPosition = this.root._roomManager!.adjustPositionWithRaycasting({
            object: currentMesh,
            targetPosition: currentMesh.userData.targetPosition,
            wall: currentMesh.userData.currentWall
        });

        currentMesh.position.copy(adjustedPosition.position);
        currentMesh.rotation.copy(adjustedPosition.rotation);

        const center = new THREE.Vector3();
        currentMesh.userData.aabb.getCenter(center);
        currentMesh.userData.obb.center.copy(center);
        /** @Корректная_коллизия */
        // console.log(currentMesh)

        currentMesh.userData.obb.halfSize.x = data.width * 0.5;

        if (PROPS.FASADE.length === 0) {
            currentMesh.userData.obb.halfSize.y = data.height * 0.5;
        }

        this.root._customBoxHelper!.updateBoxHelper();

        if (type !== 'raspil') {
            this.events.emit("U:Model-resize");
        }

    }

    //------------------
    /** @Позиционирование  */
    //------------------

    async changeRotation(actionId: number) {

        const currentMesh = this._currentMesh
        if (!currentMesh) return

        const curAction = this.rotateActions[actionId]
        if (actionId === 4) {
            currentMesh.rotation.y += curAction
            return
        }
        currentMesh.rotation.y = curAction

    }

    //------------------
    /** @Ручки  */
    //------------------

    async addHandle({ data, fasadeNdx }: TDataCreateHandle) {
        if (!this._currentMesh) return;
        const product = this._currentMesh;

        const { CONFIG, FASADE, FASADE_DEFAULT } = product.userData.PROPS;
        const { FASADE_PROPS, UNIFORM_TEXTURE } = CONFIG;
        const curFasadData = FASADE_PROPS[fasadeNdx]
        const curFasadeMesh = FASADE[fasadeNdx]

        await this.handlesBuilder.createHandle(data, curFasadeMesh, curFasadData)
        curFasadData.HANDLES.id = data.id

    }

    async deliteHandle({ data, fasadeNdx }: TDataWithNdx) {
        if (!this._currentMesh) return;
        const product = this._currentMesh;
        const { FASADE, CONFIG } = product.userData.PROPS;
        const { FASADE_PROPS } = CONFIG;
        const curFasadeMesh = FASADE[fasadeNdx]
        const curFasad = FASADE_PROPS[fasadeNdx]

        await this.handlesBuilder.deliteHandle(curFasadeMesh)
        curFasad.HANDLES.id = data
    }

    async changeHandlePos({ data, fasadeNdx }: TDataWithNdx) {
        if (!this._currentMesh) return;
        const product = this._currentMesh;
        const { FASADE, CONFIG } = product.userData.PROPS;
        const { FASADE_PROPS } = CONFIG;

        const curFasadData = FASADE_PROPS[fasadeNdx]
        const curFasadeMesh = FASADE[fasadeNdx]
        const handle = curFasadeMesh.getObjectByProperty('name', 'HANDLE')

        await this.handlesBuilder.getHandlesPosition(data, handle, curFasadeMesh);
        curFasadData.HANDLES.position = data
    }

    //------------------
    /** @Плинтусы  */
    //------------------

    async changePlinth() {
        const elType = 'element_down'
        const elementsList = this.scene.getObjectsByProperty('elementType', elType) /** @Находим все элементы выбранного типа */
        elementsList.forEach((el: THREE.Object3D) => {
            this.plinthBuilder.updatePlinth(el)
        })
    }


    addVueEvents() {

        this.onChangeModuleTexture = (data) => {
            this.changeModuleTexture(data);
        }

        this.onChangeTotalModuleTexture = ({ data, type }) => {
            this.changeTotalModuleTexture({ data, type })
        }

        this.onChangeFasade = ({ data, fasadeNdx }) => {
            this.changeFasade({ data, fasadeNdx });
        }

        this.onChangeTotalFasadsTexture = ({ data, type }) => {
            this.changeTotalFasadsTexture({ data, type })
        }

        this.onChangeGlobalTopTable = ({ data, type }) => {
            this.changeGlobalTopTable({ data, type })
        }

        this.onChangePaletteColor = ({ data, fasadeNdx }) => {
            this.changePaletteColor({ data, fasadeNdx });
        }

        this.onChangePaletteTotal = ({ data, type }) => {
            this.changePaletteTotal({ data, type })
        }

        this.onChangeGlassColor = ({ data, fasadeNdx }) => {
            this.changeGlassColor({ data, fasadeNdx });
        }

        this.onChangeMilling = ({ data, fasadeNdx }) => {
            this.changeMilling({ data, fasadeNdx });
        }

        this.onDeliteMilling = (fasadeNdx) => {
            this.deliteMilling(fasadeNdx);
        }

        this.onChangeMillingTotal = ({ data, type }) => {
            this.changeMillingTotal({ data, type })
        }

        this.onChangeShowcase = ({ data, fasadeNdx }) => {
            this.changeShowcase({ data, fasadeNdx });
        }

        this.onDeliteShowcase = (fasadeNdx) => {
            this.deliteShowcase(fasadeNdx)
        }

        this.onDrawPatina = (data) => {
            this.drawPatina(data);
        }

        this.onDelitePatina = (fasadeNdx) => {
            this.delitePatina(fasadeNdx);
        }

        this.onCreateUniformGroup = () => {
            this.сreateUniformGroup();
        }

        this.onDeliteUniformGroup = (id) => {
            this.deliteUniformGroup(id);
        }

        this.onChangeModelSize = (data) => {
            this.changeModelSize(data)
        }

        this.onToggleFasade = (fasad_ndx) => {
            this.toggleFasade(fasad_ndx);
        }

        this.onDeliteFasade = (fasad_ndx) => {
            this.deliteFasade(fasad_ndx)
        }

        this.onUpdateUMModel = (data) => {
            this.updateUMModel(data)
        }

        this.onAddHandle = (data) => {
            this.addHandle(data)
        }

        this.onDeliteHandle = (fasad_ndx) => {
            this.deliteHandle(fasad_ndx)
        }

        this.onChangeHandlePos = (data) => {
            this.changeHandlePos(data)
        }

        this.onChangePlinth = () => {
            this.changePlinth()
        }

        this.onCgangeRotation = (data) => {
            this.changeRotation(data)
        }

        this.events.on('A:ChangeModuleTexture', this.onChangeModuleTexture);
        this.events.on('A:ChangeModuleTotalTexture', this.onChangeTotalModuleTexture);

        this.events.on('A:ChangeFasade', this.onChangeFasade);

        this.events.on('A:ChangeFasadsTopTexture', this.onChangeTotalFasadsTexture)
        this.events.on('A:ChangeFasadsBottomTexture', this.onChangeTotalFasadsTexture)

        this.events.on("A:ChangeTableTop", this.onChangeGlobalTopTable)

        this.events.on('A:ChangePaletteColor', this.onChangePaletteColor);
        this.events.on('A:ChangePaletteTotal', this.onChangePaletteTotal)

        this.events.on('A:ChangeGlassColor', this.onChangeGlassColor);

        this.events.on('A:ChangeMilling', this.onChangeMilling);
        this.events.on('A:DeliteMilling', this.onDeliteMilling);
        this.events.on('A:ChangeMillingTotal', this.onChangeMillingTotal)

        this.events.on('A:ChangeShowcase', this.onChangeShowcase);
        this.events.on("A:DeliteShowcase", this.onDeliteShowcase)

        this.events.on('A:DrawPatina', this.onDrawPatina);
        this.events.on('A:DelitePatina', this.onDelitePatina);

        this.events.on('A:Create-Uniform-Group', this.onCreateUniformGroup);
        this.events.on('A:Delite-Uniform-Group', this.onDeliteUniformGroup);

        this.events.on('A:Model-resize', this.onChangeModelSize)
        this.events.on('A:Toggle-Fasad', this.onToggleFasade)

        this.events.on('A:Delite-Fasad', this.onDeliteFasade)

        this.events.on('A:UM-update', this.onUpdateUMModel)

        this.events.on('A:AddHandle', this.onAddHandle)
        this.events.on('A:DeliteHandle', this.onDeliteHandle)
        this.events.on('A:ChangeHandlePose', this.onChangeHandlePos)
        this.events.on('A:ChangePlinthColor', this.onChangePlinth)

        this.events.on('A:RotateModel', this.onCgangeRotation)


    }

    removeVueEvents() {
        this.events.off('A:ChangeModuleTexture', this.onChangeModuleTexture);
        this.events.off('A:ChangeModuleTotalTexture', this.onChangeModuleTexture);

        this.events.off('A:ChangeFasade', this.onChangeFasade);
        this.events.off('A:ChangePaletteColor', this.onChangePaletteColor);
        this.events.off('A:ChangeGlassColor', this.onChangeGlassColor);

        this.events.off("A:ChangeTableTop", this.onChangeGlobalTopTable)

        this.events.off('A:ChangeMilling', this.onChangeMilling);
        this.events.off('A:DeliteMilling', this.onDeliteMilling);

        this.events.off('A:ChangeShowcase', this.onChangeShowcase);

        this.events.off('A:DrawPatina', this.onDrawPatina);
        this.events.off('A:DelitePatina', this.onDelitePatina);

        this.events.off('A:Create-Uniform-Group', this.onCreateUniformGroup);
        this.events.off('A:Delite-Uniform-Group', this.onDeliteUniformGroup);

        this.events.off('A:Model-resize', this.onChangeModelSize)
        this.events.off('A:UM-update', this.onUpdateUMModel)
        this.events.off('A:Toggle-Fasad', this.onToggleFasade)
        this.events.off('A:Delite-Fasad', this.onDeliteFasade)

        this.events.off('A:AddHandle', this.onAddHandle)
        this.events.off('A:DeliteHandle', this.onDeliteHandle)

        // this.alumTextures = null
        this.millings = null
    }

}



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
import { BuildUniversalModule } from "@/Application/Meshes/UniversalModuleUtils/BuildUniversalModule.ts";


let alumTextures = new URL('@/assets/metall', import.meta.url).href + "/"

export class MeshEvents extends BuildersHelper {

    root: THREETypes.TApplication;
    scene: THREETypes.TScene
    events: ReturnType<typeof useEventBus> = useEventBus()
    uniformState: ReturnType<typeof useUniformState> = useUniformState()
    trafficManager: THREETypes.TTrafficManager

    resources: THREETypes.TResources
    dispose: DeepDispose
    buildProduct: BuildProduct
    buildUMProduct: BuildUniversalModule
    buildMilling: THREETypes.TMillingBuilder
    buildWindow: THREETypes.TWindowBuilder
    buildPalette: THREETypes.TPaletteBulider
    buildAlum: THREETypes.TAlumBuilder
    buildUniformTexture: THREETypes.TUniformTextureBuilder
    private millings: any | null = MILLINGS
    private additionaMillinglKeys: any | null = additionaMillinglKeys
    private alumTextures = alumTextures

    private _overrideMesh?: THREE.Object3D | null;

    _APP: THREETypes.TObject = useAppData().getAppData
    modelState = useModelState()
    // millHelper = new GUI()

    private onChangeModuleTexture: (data: { [key: string]: any }) => void;
    private onChangeTotalModuleTexture: ({ data, type }: { data: { [key: string]: any }, type: string }) => void;


    private onChangeFasade: ({ data, fasadeNdx }: { data: { [key: string]: any }, fasadeNdx: number }) => void;
    private onChangeTotalFasadsTexture: ({ data, type }: { data: { [key: string]: any }, type: string }) => void;


    private onChangePaletteColor: ({ data, fasadeNdx }: { data: number, fasadeNdx: number }) => void;
    private onChangeGlassColor: ({ data, fasadeNdx }: { data: number, fasadeNdx: number }) => void;

    private onChangeMilling: ({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) => void;
    private onDeliteMilling: (fasadeNdx: number) => void;

    private onChangeWindow: ({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) => void;

    private onDrawPatina: ({ data, fasadeNdx }: { data: number | string, fasadeNdx: number }) => void;
    private onDelitePatina: (fasadeNdx: number) => void;

    private onChangeModelSize: (data: { width: number, height: number, depth: number }) => void;
    private onUpdateUMModel: (data: Object) => void;
    private onToggleFasade: (fasad_ndx: number) => void;
    private onDeliteFasade: (fasad_ndx: number) => void;
    private onCreateUniformGroup: () => void
    private onDeliteUniformGroup: (id: number) => void

    private searchElementsByType = {
        moduleTop: "element_up",
        fasadsTop: "element_up",
        moduleBottom: "element_down",
        fasadsBottom: "element_down"

    }

    constructor(root: THREETypes.TApplication) {

        super(root)

        // console.trace('MeshEvents')

        this.root = root
        this.scene = root._scene
        this.resources = root._resources
        this.dispose = root._deepDispose
        this.trafficManager = root._trafficManager

        this.buildProduct = root.geometryBuilder.buildProduct
        this.buildUMProduct = root.universalGeometryBuilder.buildProduct

        this.onChangeModuleTexture = this.changeModuleTexture.bind(root)
        this.onChangeTotalModuleTexture = this.changeTotalModuleTexture.bind(root)

        this.onChangeFasade = this.changeFasade.bind(root)
        this.onChangeTotalFasadsTexture = this.changeTotalFasadsTexture.bind(root)


        this.onChangePaletteColor = this.changePaletteColor.bind(root)
        this.onChangeGlassColor = this.changeGlassColor.bind(root)

        this.onChangeMilling = this.changeMilling.bind(root)
        this.onDeliteMilling = this.deliteMilling.bind(root)

        this.onDrawPatina = this.drawPatina.bind(root)
        this.onDelitePatina = this.delitePatina.bind(root)

        this.onCreateUniformGroup = this.сreateUniformGroup.bind(root)
        this.onDeliteUniformGroup = this.deliteUniformGroup.bind(root)

        this.onChangeModelSize = this.changeModelSize.bind(root)
        this.onUpdateUMModel = this.updateUMModel.bind(root)

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
        return this._overrideMesh ?? this.root._trafficManager?._currentObject;
    }

    set _currentMesh(mesh: THREE.Object3D | undefined) {
        this._overrideMesh = mesh;
    }

    resetFasade({ fasadeNdx, incomingModel }: { fasadeNdx: number, incomingModel?: any }) {

        const product = this._currentMesh

        if (!product) return;

        const { PROPS } = product.userData
        const { CONFIG, FASADE, FASADE_DEFAULT } = PROPS
        const { FASADE_PROPS } = CONFIG
        const defaultConfig: THREETypes.TDefaultModuleAndFasadeConfig = this.buildProduct.getDefaultModuleAndFasadeConfig();

        const rootFasadeParent = FASADE_DEFAULT[fasadeNdx].userData.rootFasadeParent
        const fasadeExist = FASADE[fasadeNdx] === null

        const rebuild = (fasadeNdx) => {
            this.buildProduct.fasade_builder.getFasade(
                {
                    group: rootFasadeParent,
                    props: PROPS,
                    model_data: CONFIG.MODEL,
                    fasadeNdx,
                    incomingModel,
                    defaultConfig
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
            console.log('MILLING')
            FASADE[fasadeNdx].geometry = FASADE_DEFAULT[fasadeNdx].geometry.clone()
            FASADE[fasadeNdx].userData.millingMaterial = null
            FASADE_PROPS[fasadeNdx].MILLING = null
            FASADE_PROPS[fasadeNdx].PATINA = null
            return
        }
    }

    /** Цвкет корпуса */
    async catchChangeModuleTexture(data: { [key: string]: any }, currentMesh?: THREE.Object3D) {

        const product = currentMesh ?? this._currentMesh;
        const { CONFIG, SHELF, BODY } = product.userData.PROPS;

        [BODY, ...(SHELF ?? [])].forEach(obj =>
            obj?.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh) {
                    this.changeColor({ object: child, url: data.TEXTURE });
                }
            })
        );
        console.log(data.ID)

        CONFIG.MODULE_COLOR = data.ID;
        console.log(product, CONFIG,
            CONFIG.MODULE_COLOR, data.ID)
    }

    async changeModuleTexture(data: { [key: string]: any }) {

        if (!this._currentMesh) return;
        await this.catchChangeModuleTexture(data)
        this.events.emit('U:ChangeModule')

    }

    changeTotalModuleTexture({ data, type }) {

        const currentType = this.searchElementsByType[type] /**@Тип_элемента -- @верхний / @нижний */
        const elementsList = this.scene.getObjectsByProperty('elementType', currentType) /** @Находим все элементы выбранного типа */

        if (Array.isArray(elementsList) && elementsList[0]) {
            elementsList.forEach(async (el) => {
                await this.catchChangeModuleTexture(data, el)
            })
        }



    }
    /** Цвет Фасада */
    async catchFasadeChange({ data, fasadeNdx }: TObjectData) {
        const product = this._currentMesh;

        const { CONFIG, FASADE, FASADE_DEFAULT } = product.userData.PROPS;
        const { FASADE_PROPS, UNIFORM_TEXTURE } = CONFIG;

        const incomingModel = data.MODEL;
        const fasade = FASADE[fasadeNdx] ?? FASADE_DEFAULT[fasadeNdx];
        const fasadeProp = FASADE_PROPS[fasadeNdx];

        if (UNIFORM_TEXTURE.group) {
            this.removeFromUniformGroup(product);
        }

        this.resetFasade({ fasadeNdx, incomingModel });
        fasadeProp.ALUM = incomingModel;

        this.handleWindowChange(CONFIG, fasadeProp, fasadeNdx, incomingModel);
        if (this.tryApplyPalette(data, fasadeNdx, fasadeProp)) return;
        if (this.tryApplyTexture(data, fasade, fasadeProp)) return;

        this.applyAlumColor(data, fasade, fasadeProp, fasadeNdx);
    }

    private removeFromUniformGroup(product: THREE.Object3D) {
        this.buildUniformTexture.removeFromUniformGroup(product);
    }

    private handleWindowChange(CONFIG: any, fasadeProp: any, fasadeNdx: number, incomingModel: any) {
        const showcaseWindow = CONFIG.SHOWCASE;

        if (showcaseWindow.length > 0 && (fasadeProp.WINDOW === null || !incomingModel)) {
            this.changeWindow({ data: showcaseWindow[0], fasadeNdx });
        } else {
            Object.assign(fasadeProp, { MILLING: null, PATINA: null });
        }
    }

    private tryApplyPalette(data: any, fasadeNdx: number, fasadeProp: any): boolean {
        if (!data.PALETTE?.[0]) return false;
        console.log('PAL1', data)

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
        return true;
    }

    private applyAlumColor(data: any, fasade: any, fasadeProp: any, fasadeNdx: number) {
        this.createAlumColor({ data, fasadeNdx });
        Object.assign(fasadeProp, { SHOW: fasade.visible, COLOR: data.ID, PALETTE: null });
    }

    async changeFasade({ data, fasadeNdx }: TObjectData) {

        if (!this._currentMesh) return;
        /** Выбран без фасада */
        if (data.ID === 7397) {
            // this.deliteFasade(fasadeNdx)
            return
        }

        console.log(fasadeNdx, 'FNDX')

        await this.catchFasadeChange({ data, fasadeNdx })
        this.events.emit('U:ChangeFasade')


    }

    changeTotalFasadsTexture({ data, type }) {

        const currentType = this.searchElementsByType[type] /**@Тип_элемента -- @верхний / @нижний */
        const elementsList = this.scene.getObjectsByProperty('elementType', currentType) /** @Находим все элементы выбранного типа */

        if (Array.isArray(elementsList) && elementsList[0]) {
            elementsList.forEach((el) => {
                const fasadeList = el.userData.PROPS.FASADE
                if (fasadeList.length > 0) {
                    fasadeList.forEach(async (fasade, fasadeNdx) => {
                        const prevMesh = this._currentMesh
                        this._currentMesh = el;
                        if (data.ID == 7397) {
                            await this.catchDeliteFasade(fasadeNdx)
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

    async catchChangePaletteColor({ data, fasadeNdx }: TObjectData) {

        const props = this._currentMesh.userData.PROPS
        const { FASADE, CONFIG } = props
        const { FASADE_PROPS } = CONFIG
        const fasade = FASADE[fasadeNdx]


                console.log('PAL2', data)

        // console.log({ data, fasadeNdx }, 'PALLIT')

        this.buildPalette.createPaletteColor({ fasade, data, fasadeNdx, props })
    }

    async changePaletteColor({ data, fasadeNdx }: TNumeredData) {

        if (!this._currentMesh) return;
        const props = this._currentMesh.userData.PROPS
        const { FASADE, CONFIG } = props
        const { FASADE_PROPS } = CONFIG
        const patina = FASADE_PROPS[fasadeNdx].PATINA


        // console.log(data, 'data')

        await this.catchChangePaletteColor({ data, fasadeNdx })
        if (patina) {
            await this.catchDrawPatina({ data: patina, fasadeNdx })
        }
        // console.log(FASADE_PROPS[fasadeNdx].PATINA, 'FASADE')
        this.events.emit("U:ChangePaletteColor")

    }

    changeTotalFasadsPaletteColor({ data, type }) {
        const currentType = this.searchElementsByType[type];
        const elementsList = this.scene.getObjectsByProperty('elementType', currentType);

        if (Array.isArray(elementsList) && elementsList.length > 0) {
            elementsList.forEach((el) => {
                const fasadeList = el.userData.PROPS.FASADE;
                if (fasadeList.length > 0) {
                    fasadeList.forEach(async (_fasade, fasadeNdx) => {
                        await this.catchChangePaletteColor({ data, fasadeNdx, currentMesh: el });
                    });
                }
            });
        }
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

    async catchChangeMilling({ data, fasadeNdx }: TNumeredData) {
        const props = this._currentMesh.userData.PROPS
        const { FASADE, FASADE_DEFAULT, CONFIG } = props
        const { FASADE_POSITIONS, FASADE_PROPS } = CONFIG

        const fasade: THREE.Mesh = FASADE[fasadeNdx]
        const defaultGeometry = FASADE_DEFAULT[fasadeNdx]
        const patina = FASADE_PROPS[fasadeNdx].PATINA

        let millingData = this.millings[data] || this.additionaMillinglKeys[data] ? data : 2462671

        const fasadePosition = {
            FASADE_WIDTH: eval(FASADE_POSITIONS[fasadeNdx].FASADE_WIDTH),
            FASADE_HEIGHT: eval(FASADE_POSITIONS[fasadeNdx].FASADE_HEIGHT),
            FASADE_DEPTH: eval(FASADE_POSITIONS[fasadeNdx].FASADE_DEPTH)
        };

        this.buildMilling.createMillingFasade(fasade, fasadePosition, millingData, defaultGeometry, patina);

        FASADE_PROPS[fasadeNdx].MILLING = data
        FASADE_PROPS[fasadeNdx].SHOW = fasade.visible

    }

    async changeMilling({ data, fasadeNdx }: TNumeredData) {
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

    async catchDrawPatina({ data, fasadeNdx }: TNumeredData) {
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

    async drawPatina({ data, fasadeNdx }: TNumeredData) {

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

    changeWindow({ data, fasadeNdx }: TNumeredData) {
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

        this.buildWindow.createWindow({
            fasade,
            fasadePosition,
            data,
            defaultGeometry,
            alum
        });

        // console.log(this.modelState.getCurrentGlassData, '-----GLAAS')

        FASADE_PROPS[fasadeNdx].WINDOW = data
        FASADE_PROPS[fasadeNdx].SHOW = fasade.visible
        FASADE_PROPS[fasadeNdx].GLASS = FASADE_PROPS[fasadeNdx].GLASS ?? '76033'

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
        if (props.CONFIG.FASADE_PROPS[fasadeNdx].COLOR === 7397) return
        fasade.visible = !fasade.visible
        props.CONFIG.FASADE_PROPS[fasadeNdx].SHOW = fasade.visible

    }

    // Удалить фасад

    async catchDeliteFasade(fasadeNdx: number) {
        const product = this._currentMesh
        const { PROPS } = product.userData

        const { CONFIG, FASADE, FASADE_DEFAULT } = PROPS
        const { FASADE_PROPS, UNIFORM_TEXTURE } = CONFIG
        const fasadeMeshId = FASADE[fasadeNdx]?.uuid

        if (UNIFORM_TEXTURE.group !== null) {
            this.buildUniformTexture.removeFromUniformGroup(product)
        }

        this.resetFasade({ fasadeNdx })

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
                FASADE_PROPS[fasadeNdx].WINDOW = null
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

    async deliteFasade(fasadeNdx: number) {

        if (!this._currentMesh) return;
        await this.catchDeliteFasade(fasadeNdx)
        this.events.emit("U:DeliteFasad")


    }

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

    async changeModelSize(data: { width: number, height: number, depth: number }, mesh, type) {

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
            const aabb = this.buildProduct.computeAABB(currentMesh)
            const size = new THREE.Vector3()
            aabb.getSize(size);

            /** Для корректного примагничивания к стенам */
            currentMesh.userData.trueSizes = {
                DEPTH: data.depth * 0.5, HEIGHT: size.y * 0.5, WIDTH: data.width * 0.5
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
        console.log(currentMesh, 'await')

        const adjustedPosition = this.root._roomManager.adjustPositionWithRaycasting({
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
            console.log('hhh')
            currentMesh.userData.obb.halfSize.y = data.height * 0.5;
        }

        this.root._customBoxHelper.updateBoxHelper();

        if (type !== 'raspil') {
            this.events.emit("U:Model-resize");
        }

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

        this.onChangePaletteColor = ({ data, fasadeNdx }) => {
            this.changePaletteColor({ data, fasadeNdx });
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

        this.onChangeWindow = ({ data, fasadeNdx }) => {
            this.changeWindow({ data, fasadeNdx });
        }

        this.onDrawPatina = ({ data, fasadeNdx }) => {
            this.drawPatina({ data, fasadeNdx });
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
            this.changeModelSize(data as { width: number, height: number, depth: number })
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


        this.events.on('A:ChangeModuleTexture', this.onChangeModuleTexture);
        this.events.on('A:ChangeModuleTotalTexture', this.onChangeTotalModuleTexture);

        this.events.on('A:ChangeFasade', this.onChangeFasade);

        this.events.on('A:ChangeFasadsTopTexture', this.onChangeTotalFasadsTexture)
        this.events.on('A:ChangeFasadsBottomTexture', this.onChangeTotalFasadsTexture)


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

        this.events.on('A:UM-update', this.onUpdateUMModel)

    }

    removeVueEvents() {
        this.events.off('A:ChangeModuleTexture', this.onChangeModuleTexture);
        this.events.off('A:ChangeModuleTotalTexture', this.onChangeModuleTexture);

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
        this.events.off('A:UM-update', this.onUpdateUMModel)
        this.events.off('A:Toggle-Fasad', this.onToggleFasade)
        this.events.off('A:Delite-Fasad', this.onDeliteFasade)
        this.alumTextures = null
        this.millings = null
    }

}


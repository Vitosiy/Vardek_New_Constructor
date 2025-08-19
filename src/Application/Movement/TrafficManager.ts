//@ts-nocheck

import * as THREE from "three"
import { toRaw } from 'vue';
// import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

import { useEventBus } from '@/store/appliction/useEventBus';
import { useModelState } from '@/store/appliction/useModelState';

import { DragAndDropManager } from "./DragAndDropManager";
import { MoveManager } from "./MoveManager";

import { CustomBoxHelper } from "../Utils/BoxHelperCustom";
import { DeepDispose } from '../Utils/DeepDispose';
import { UniversalGeometryBuilder } from "@/Application/Meshes/UniversalModuleUtils/UniversalGeometryBuilder.ts";

export class TrafficManager {

    root: THREETypes.TApplication
    canvas: HTMLElement;
    scene: THREE.Scene;

    events: ReturnType<typeof useEventBus> = useEventBus()
    modelState: ReturnType<typeof useModelState> = useModelState()

    raycaster: THREE.Raycaster = new THREE.Raycaster()
    mouse: THREE.Vector2 = new THREE.Vector2()
    camera: THREE.Camera | null = null
    controls: OrbitControls | null = null
    room: THREETypes.TRoomManager
    geometryBuilder: THREETypes.TGeometryBuilder
    universalGeometryBuilder: THREETypes.UniversalGeometryBuilder;

    despose: DeepDispose
    dragAndDropManager: DragAndDropManager
    moveManager: MoveManager | null = null
    //boxHelper: CustomBoxHelper
    boxHelper: THREETypes.TCustomBoxHelper
    currentObject: THREE.Object3D | null = null
    ruler: THREETypes.Ruler
    rulerLines: THREE.Object3D[] = [];
    rullerSizeLines: THREE.Object3D[] = [];

    private onRemoveFromRoom: (model: THREE.Object3D | undefined) => void;
    private onClearSelectObject: () => void

    // constructor(canvas: HTMLElement, scene: THREE.Scene, room: RoomManager, camera: THREE.Camera, controls: OrbitControls) {

    constructor(root: THREETypes.TApplication, room: THREETypes.TRoomManager) {

        this.root = root
        this.controls = root._orbitControls
        this.canvas = root._canvas;
        this.scene = root._scene;
        this.camera = root._camera
        this.room = room

        this.ruler = root._ruler

        this.ruler.setParams(
            {
                scene: root._scene,
                room,
                rulerLines: this.rulerLines,
                rullerSizeLines: this.rullerSizeLines
            })

        this.despose = new DeepDispose()
        this.boxHelper = root._customBoxHelper
        this.geometryBuilder = root.geometryBuilder
        this.universalGeometryBuilder = root.universalGeometryBuilder
        //this.dragAndDropManager = new DragAndDropManager(this.canvas, this.scene, this.room, this.camera as THREE.Camera, this.mouse, this.raycaster, this.boxHelper, this)

        this.dragAndDropManager = new DragAndDropManager(root, this.mouse, this.raycaster, this)
        this.moveManager = new MoveManager({ root, mouse: this.mouse, raycaster: this.raycaster, trafficManager: this })

        this.vueEvents()
    }

    get _currentObject() {
        return this.currentObject
    }

    set _currentObject(object) {

        /** Получаем выбранный объект */

        this.currentObject = object


        if (object) {

            this.events.emit("A:Selected", {
                object: object,
                roomContant: this.room._roomContant
            })

            console.log(this.root.geometryBuilder?.buildProduct._PRODUCTS[object.userData.PROPS.PRODUCT], 'PROD')

            if (object.userData.elementType !== 'raspil') {
                const product = this.modelState.getModels[object.userData.PROPS.PRODUCT];
                this.modelState.createCurrentModelFasadesData(product.FACADE);
                this.modelState.createCurrentModuleData(product.MODULECOLOR)
            }
        }
        else {
            this.events.emit("A:ClearSelected", { object: null, roomContant: this.room._roomContant });
            this.modelState.clearCurrentModelFasadesData()
        }

    }

    get _sizes() {
        return this.root._sizes
    }

    get _camera() {
        return this.root._camera
    }

    async update(room: THREETypes.TRoomManager) {

        this.room = room
        this.rulerLines = []

        this.currentObject = null
        this.boxHelper._boxHelperCheck = null
        this.raycaster = new THREE.Raycaster();

        this.dragAndDropManager.updateRoomData(room)
        this.moveManager.updateRoomData(room)
        // this.ruler.update(room, this.rulerLines, this.rullerSizeLines)
    }

    removeFromRoom(product: Event | THREE.Object3D | string | numer) {

        if (!this._currentObject) return

        if (product instanceof THREE.Object3D) {
            const prod = toRaw(product)
            const { RASPIL_LIST } = product.userData.PROPS

            if (RASPIL_LIST.length > 0) {
                RASPIL_LIST.forEach(elem => {
                    this.room.remove(elem.id)
                    const meshInScene = this.scene.getObjectByProperty('id', elem.id) as THREE.Object3D
                    this.despose.clearObject(meshInScene, this.scene)
                    this.boxHelper.removeBoxHelper()
                    this.ruler.clearRuler();
                    this.currentObject = null
                })
            }



            this.room.remove(product.id)
            this.despose.clearObject(product, this.scene)
            this.boxHelper.removeBoxHelper()
            this.ruler.clearRuler();
            this.currentObject = null
            return
        }


        this.room.remove(this._currentObject.id)
        this.despose.clearObject(this._currentObject, this.scene)
        this.boxHelper.removeBoxHelper()
        this.ruler.clearRuler();
        this.currentObject = null
    }

    vueEvents() {

        this.onRemoveFromRoom = (model) => {
            this.removeFromRoom(model)
        }


        this.events.on('A:RemoveModel', this.onRemoveFromRoom);

    }

    removeVueEvents() {
        this.events.off('A:RemoveModel', this.onRemoveFromRoom);

    }

}
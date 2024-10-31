import * as THREE from "three"
// import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

import { useEventBus } from '@/store/appliction/useEventBus';

import { DragAndDropManager } from "./DragAndDropManager";
import { MoveManager } from "./MoveManager";

import { CustomBoxHelper } from "../Utils/BoxHelperCustom";
import { DeepDispose } from '../Utils/DeepDispose';
import { GeometryBuilder } from "../Meshes/GeometryBuilder";
import { Ruler } from "../Utils/Ruler";

export class TrafficManager {

    root: THREETypes.TApplication
    canvas: HTMLElement;
    scene: THREE.Scene;

    eventsStore: ReturnType<typeof useEventBus> = useEventBus()

    raycaster: THREE.Raycaster = new THREE.Raycaster()
    mouse: THREE.Vector2 = new THREE.Vector2()
    camera: THREE.Camera | null = null
    controls: OrbitControls | null = null
    room: THREETypes.TRoomManager
    geometryBuilder: GeometryBuilder

    despose: DeepDispose
    dragAndDropManager: DragAndDropManager
    moveManager: MoveManager
    boxHelper: CustomBoxHelper
    currentObject: THREE.Object3D | null = null
    ruler: Ruler
    rulerLines: THREE.Object3D[] = [];
    rullerSizeLines: THREE.Object3D[] = [];

    // constructor(canvas: HTMLElement, scene: THREE.Scene, room: RoomManager, camera: THREE.Camera, controls: OrbitControls) {

    constructor(root: THREETypes.TApplication, room: THREETypes.TRoomManager) {

        this.root = root
        this.controls = root._orbitControls
        this.canvas = root._canvas;
        this.scene = root._scene;
        this.camera = root._camera
        this.room = room

        this.despose = new DeepDispose()
        this.boxHelper = new CustomBoxHelper(null, this.scene)
        // this.geometryBuilder = new GeometryBuilder(root);
        this.geometryBuilder = room.geometryBuilder

        this.dragAndDropManager = new DragAndDropManager(this.canvas, this.scene, this.room, this.camera as THREE.Camera, this.mouse, this.raycaster, this.boxHelper, this)
        this.moveManager = new MoveManager(this.canvas, this.scene, this.room, this.camera as THREE.Camera, this.controls as OrbitControls, this.mouse, this.raycaster, this.boxHelper, this)

        this.ruler = new Ruler(root._scene, room, this.rulerLines, this.rullerSizeLines)

        this.vueEvents()
    }

    get _currentObject() {
        return this.currentObject
    }

    set _currentObject(object) {
        /** Получаем выбранный объект */
        this.currentObject = object
        this.eventsStore.emit("A:Selected", {
            object: object?.userData,
            roomContant: this.room._roomContant
        })
    }



    get _sizes() {
        return this.root._sizes
    }

    get _camera() {
        return this.root._camera
    }

    update(room: THREETypes.TRoomManager) {

        this.room = room
        this.rulerLines = []

        this._currentObject = null
        this.boxHelper._boxHelperCheck = null
        this.raycaster = new THREE.Raycaster();

        this.dragAndDropManager.updateRoomData(room)
        this.moveManager.updateRoomData(room)
        this.ruler.update(room, this.rulerLines, this.rullerSizeLines)
    }

    removeFromRoom() {
        if (!this._currentObject) return

        this.room.remove(this._currentObject.id)
        this.despose.clearObject(this._currentObject, this.scene)
        this.boxHelper.removeBoxHelper()
        this.ruler.clearRuler();
    }

    removeFromBasket(basketProduct: any) {
        const object = this.scene.getObjectById(basketProduct.id)

        if (!object) return


        this.boxHelper.removeBoxHelper()
        this.ruler.clearRuler();
        this.room.remove(object.id)
        this.despose.clearObject(object, this.scene)
        // this._currentObject = this.scene.getObjectById(basketProduct.id)
        // this.removeFromRoom()
        // if (basketProduct) return
        this._currentObject = null
        // this.despose.clearObject(basketProduct, this.scene)
    }

    vueEvents() {

        this.eventsStore.on('A:RemoveModel', () => {
            this.removeFromRoom()
        })

        this.eventsStore.on('A:RemoveModelFromBasket', (basketProduct: any) => {
            this.removeFromBasket(basketProduct)
        })

        this.eventsStore.on('A:CameraToggle', (value: boolean) => {
            if (value) {
                this.moveManager.dispose()
                this.dragAndDropManager.dispose()
                return
            }
            console.log('Perspective');
            this.moveManager.updateControl(this.root._orbitControls as OrbitControls)
            this.moveManager.setupModelMove();
            this.dragAndDropManager.setupDragAndDrop()
        })
    }

}
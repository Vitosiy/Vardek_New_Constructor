//@ts-nocheck

import * as THREE from "three"
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
import {UniversalGeometryBuilder} from "@/Application/Meshes/UniversalModuleUtils/UniversalGeometryBuilder.ts";

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
    universalGeometryBuilder: UniversalGeometryBuilder;

    despose: DeepDispose
    dragAndDropManager: DragAndDropManager
    moveManager: MoveManager | null = null
    boxHelper: CustomBoxHelper
    currentObject: THREE.Object3D | null = null
    ruler: THREETypes.Ruler
    rulerLines: THREE.Object3D[] = [];
    rullerSizeLines: THREE.Object3D[] = [];

    private onRemoveFromRoom: () => void;

    // constructor(canvas: HTMLElement, scene: THREE.Scene, room: RoomManager, camera: THREE.Camera, controls: OrbitControls) {

    constructor(root: THREETypes.TApplication, room: THREETypes.TRoomManager) {

        this.root = root
        this.controls = root._orbitControls
        this.canvas = root._canvas;
        this.scene = root._scene;
        this.camera = root._camera
        this.room = room

        this.ruler = root.ruler

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
        this.dragAndDropManager = new DragAndDropManager(this.canvas, this.scene, this.room, this.camera as THREE.Camera, this.mouse, this.raycaster, this.boxHelper, this)


        this.moveManager = new MoveManager({
            root,
            room: this.room,
            mouse: this.mouse,
            raycaster: this.raycaster,
            trafficManager: this

        })

        this.vueEvents()
    }

    get _currentObject() {
        return this.currentObject
    }

    set _currentObject(object) {

        /** Получаем выбранный объект */
        // if(!object) return

        this.currentObject = object

        if (object) {

            let product = this.modelState.getModels[object.userData.PROPS.PRODUCT];


            this.modelState.createCurrentModelFasadesData(product.FACADE);
            this.modelState.setCurrentModel(object)

            console.log(object.userData)

        }
        else {
            this.modelState.clearCurrentModelFasadesData()
            this.modelState.setCurrentModel(null)
        }

        this.events.emit("A:Selected", {
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

        // console.log(this._currentObject, 'CurrentObject')

        if (!this._currentObject) return

        this.room.remove(this._currentObject.id)
        this.despose.clearObject(this._currentObject, this.scene)
        this.boxHelper.removeBoxHelper()
        this.ruler.clearRuler();
        this.currentObject = null
    }

    vueEvents() {

        this.onRemoveFromRoom = () => {
            this.removeFromRoom()
        }

        this.events.on('A:RemoveModel', this.onRemoveFromRoom)

        // this.eventsStore.on('A:CameraToggle', (value: boolean) => {
        //     if (value) {
        //         this.moveManager.dispose()
        //         this.dragAndDropManager.dispose()
        //         return
        //     }
        //     console.log('Perspective');
        //     this.moveManager.updateControl(this.root._orbitControls as OrbitControls)
        //     this.moveManager.setupModelMove();
        //     this.dragAndDropManager.setupDragAndDrop()
        // })
    }

    removeVueEvents() {
        this.events.off('A:RemoveModel', this.onRemoveFromRoom)
    }

}
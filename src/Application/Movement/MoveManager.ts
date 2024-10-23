import * as THREE from "three";
import * as THREETypes from "@/types/types"
import { OBB } from 'three/examples/jsm/math/OBB.js';

import { GeometryBuilder } from "../Meshes/GeometryBuilder";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { TrafficManager } from "./TrafficManager";
import { CustomBoxHelper } from "../Utils/BoxHelperCustom";

import { useEventBus } from "@/store/appliction/useEventBus";

import { createOBBFromObject, OBBHelper } from "../Utils/CalculateBoundingBox";

export class MoveManager {

    eventBuss: ReturnType<typeof useEventBus> = useEventBus()
    canvas: HTMLElement;
    scene: THREE.Scene;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    camera: THREE.Camera;
    controls: OrbitControls
    trafficManager: TrafficManager
    objectFactory: GeometryBuilder

    roomManager: THREETypes.TRoomManager
    boxHelper: CustomBoxHelper

    selectedObject: THREE.Object3D | null = null;
    obbHelper: OBBHelper = new OBBHelper()
    // rulerLines: THREE.Object3D[] = []

    private onMouseDownBound: (event: MouseEvent) => void;
    private onMouseMoveBound: (event: MouseEvent) => void;
    private onMouseUpBound: (event: MouseEvent) => void;

    private onTouchStartBound: (event: TouchEvent) => void;
    private onTouchMoveBound: (event: TouchEvent) => void;
    private onTouchEndBound: (event: TouchEvent) => void;

    constructor(canvas: HTMLElement, scene: THREE.Scene, room: THREETypes.TRoomManager, camera: THREE.Camera, controls: OrbitControls, mouse: THREE.Vector2, raycaster: THREE.Raycaster, boxHelper: CustomBoxHelper, trafficManager: TrafficManager) {
        this.canvas = canvas;
        this.scene = scene;
        this.camera = camera;
        this.controls = controls
        this.roomManager = room;
        this.trafficManager = trafficManager

        this.raycaster = raycaster;
        this.mouse = mouse;
        this.objectFactory = trafficManager.geometryBuilder
        this.boxHelper = boxHelper

        this.onMouseDownBound = this.onMouseDown.bind(this)
        this.onMouseMoveBound = this.onMouseMove.bind(this)
        this.onMouseUpBound = this.onMouseUp.bind(this)

        this.onTouchStartBound = this.onTouchStart.bind(this)
        this.onTouchMoveBound = this.onTouchMove.bind(this)
        this.onTouchEndBound = this.onTouchEnd.bind(this)

        this.setupModelMove();
        this.addVueEvents()
    }

    setupModelMove() {
        // Для мышиных событий
        this.canvas.addEventListener('mousedown', this.onMouseDownBound, false);
        this.canvas.addEventListener('mousemove', this.onMouseMoveBound, false);
        this.canvas.addEventListener('mouseup', this.onMouseUpBound, false);

        // Для сенсорных событий (мобильные устройства)
        this.canvas.addEventListener('touchstart', this.onTouchStartBound, false);
        this.canvas.addEventListener('touchmove', this.onTouchMoveBound, false);
        this.canvas.addEventListener('touchend', this.onTouchEndBound, false);
    }

    private onMouseDown(event: MouseEvent) {
        if (event.button !== 0) return;  // Проверка на левую кнопку мыши
        this.handleInteractionStart(event.clientX, event.clientY);
    }

    private onMouseMove(event: MouseEvent) {
        this.handleInteractionMove(event.clientX, event.clientY);
    }

    private onMouseUp(event: MouseEvent) {
        this.handleInteractionEnd();
    }

    private onTouchStart(event: TouchEvent) {
        const touch = event.touches[0];  // Получаем первое касание
        this.handleInteractionStart(touch.clientX, touch.clientY);
    }

    private onTouchMove(event: TouchEvent) {
        const touch = event.touches[0];  // Получаем первое касание
        this.handleInteractionMove(touch.clientX, touch.clientY);
    }

    private onTouchEnd(event: TouchEvent) {
        this.handleInteractionEnd();
    }

    // Универсальная функция для начала взаимодействия (мышь или касание)
    private handleInteractionStart(clientX: number, clientY: number) {
        this.boxHelper._boxHelperCheck ? this.boxHelper.removeBoxHelper() : ''
        this.updateMousePosition(clientX, clientY);
        this.selectObject();
        if (this.selectedObject) {
            // // Создаём линию разметки высоты
            this.roomManager.drawSnapHeightLines(this.roomManager.heightClamp)
        }

    }

    // Универсальная функция для перемещения объекта (мышь или касание)
    private handleInteractionMove(clientX: number, clientY: number) {
        if (this.selectedObject) {
            this.updateMousePosition(clientX, clientY);
            this.moveSelectedObject();
            this.eventBuss.emit('A:Move', false);
        }
    }

    // Универсальная функция для завершения взаимодействия (мышь или касание)
    private handleInteractionEnd() {
        if (this.selectedObject) {
            this.selectedObject.userData.PROPS.CONFIG.POSITION = this.selectedObject.position
            this.selectedObject.userData.PROPS.CONFIG.ROTATION = this.selectedObject.rotation

            this.selectedObject.userData.MOUSE_POSITION = {
                x: this.selectedObject.position.clone().project(this.camera).x * this.trafficManager._sizes.width * 0.5,
                y: this.selectedObject.position.clone().project(this.camera).y * this.trafficManager._sizes.height * -0.5,
            }


            this.eventBuss.emit('A:Move', true);
        }
        this.controls.enabled = true;
        this.selectedObject = null;
        // Срываем линию высоты
        this.roomManager.disposeSnapHeightLines();
    }


    private updateMousePosition(clientX: number, clientY: number) {
        this.mouse.x = ((clientX - this.canvas.getBoundingClientRect().left) / this.canvas.clientWidth) * 2 - 1;
        this.mouse.y = -((clientY - this.canvas.getBoundingClientRect().top) / this.canvas.clientHeight) * 2 + 1;
    }

    // Выбор Объекта 

    private selectObject() {

        this.roomManager._rulerContant = false

        this.raycaster.setFromCamera(this.mouse, this.camera);


        const intersects = this.raycaster.intersectObjects(this.roomManager._roomTotalContant);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const firstObject = intersects[0].object;

            // Выключаем OrbitContrrol
            this.controls.enabled = false

            // Если это GLTF-модель, выбираем её как цель
            this.selectedObject = this.getRootObject(firstObject);
            this.selectedObject.userData.current = true

            // Проверяем наличие BoxHelper 
            !this.boxHelper._boxHelperCheck ? this.boxHelper.addBoxHelper(this.selectedObject) : '';

            this.selectedObject.userData.MOUSE_POSITION = {
                x: point.clone().project(this.camera).x * this.trafficManager._sizes.width * 0.5,
                y: point.clone().project(this.camera).y * this.trafficManager._sizes.height * -0.5,
            }
            // Передаём данные выбранного объекта для events
            this.trafficManager._currentObject = this.selectedObject

            // Создаём линейку до объектов
            this.trafficManager.ruler.drawRulerToObjects(this.selectedObject)

            // Передаём координаты мыши для отрисовкм меню
            this.trafficManager._camera.updateProjectionMatrix();

            return
        }

        this.boxHelper.removeBoxHelper()
        /** Убираем линейку */
        this.trafficManager.ruler.clearRuler()

        // Убираем выбранный объект 
        this.trafficManager._currentObject = null

    }

    private getRootObject(object: THREE.Object3D): THREE.Object3D {
        let root = object;
        while (root.parent && root.parent.type !== 'Scene') {
            root = root.parent;
        }
        return root;
    }

    private moveSelectedObject() {
        if (!this.roomManager._roomFloor || !this.selectedObject) return;

        // this.eventBuss.emit('A:Move')

        // Устанавливаем луч для получения пересечения
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Пересекаем луч с полом и стенами
        const intersects = this.raycaster.intersectObjects([...this.roomManager._roomWalls, this.roomManager._roomFloor]);

        if (intersects.length > 0) {
            const point = intersects[0].point; // Точка пересечения с полом или стеной

            // const face = intersects[0].face // нормали
            // const surface = intersects[0].object // стена

            // Создаем OBB для объекта
            // const newOBB = createOBBFromObject(this.selectedObject);
            // const BBHELPER = this.obbHelper.add(newOBB)
            // this.scene.add(BBHELPER)

            // Перемещаем OBB в точку пересечения
            const newOBB = this.selectedObject.userData.obb.clone();
            newOBB.center.copy(point);

            // Проверяем, выходит ли объект за пределы комнаты
            // const adjustedPosition = this.roomManager.adjustPositionWithinRoomOBB(newOBB, this.selectedObject, face, surface);
            const adjustedPosition = this.roomManager.adjustPositionWithRaycasting(this.selectedObject, point, 500, 2000);

            if (adjustedPosition) {
                this.selectedObject.position.copy(adjustedPosition);
            } else {
                this.selectedObject.position.set(point.x, point.y, point.z);
            }

            // Обновляем BoxHelper для визуализации
            this.boxHelper.updateBoxHelper();

        }

        // Обновляем линейку
        this.trafficManager.ruler.drawRulerToObjects(this.selectedObject)
    }

    dispose() {
        this.canvas.removeEventListener('mousedown', this.onMouseDownBound, false);
        this.canvas.removeEventListener('mousemove', this.onMouseMoveBound, false);
        this.canvas.removeEventListener('mouseup', this.onMouseUpBound, false);
    }

    updateRoomData(roomManager: THREETypes.TRoomManager) {
        this.selectedObject = null
        this.roomManager = roomManager
    }

    updateControl(controls: OrbitControls) {

        this.controls = controls
    }

    checkMove() {
        return false
    }

    addVueEvents() {
        this.eventBuss.emit('A:Move', () => {
            this.checkMove()
        })
    }
}
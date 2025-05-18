// @ts-nocheck

import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

import { useEventBus } from '@/store/appliction/useEventBus';
import { useModelState } from '@/store/appliction/useModelState';
import { useUniformState } from "@/store/appliction/useUniformState";

import { OBB } from 'three/examples/jsm/math/OBB.js';
import { createOBBFromObject, OBBHelper } from "../Utils/CalculateBoundingBox";

export class SetObject {
    eventsStore: ReturnType<typeof useEventBus> = useEventBus()
    modelState: ReturnType<typeof useModelState> = useModelState();
    uniformState: ReturnType<typeof useUniformState> = useUniformState()

    root: THREETypes.TApplication | null = null
    scene: THREE.Scene | null = null
    modelData: any
    object: THREE.Object3D | null = null
    point: THREE.Vector3 | null = null
    roomManager: THREETypes.TRoomManager | null = null
    trafficManager: THREETypes.TTrafficManager | null = null

    boxHelper: THREETypes.TCustomBoxHelper | null = null

    constructor(root: THREETypes.TApplication) {
        this.root = root
    }

    create({ scene, object, point, rotate, roomManager, trafficManager, boxHelper, wall }: THREEInterfases.ISetProduct) {

        const { CONFIG } = object.userData.PROPS
        const { POSITION, ROTATION, UNIFORM_TEXTURE } = CONFIG

        this.uniformState.checkUniformGroupMembership(object)

        const positionEmpty = POSITION == null;
        const rotationEmpty = ROTATION == null;

        let position = POSITION ?? new THREE.Vector3(point.x, point.y, point.z)
        let rotation = ROTATION ?? new THREE.Euler(0, 0, 0, 'XYZ')

        if (rotate) {
            CONFIG.POSITION = new THREE.Vector3(point.x, point.y, point.z)
            CONFIG.ROTATION = new THREE.Euler(rotate._x, rotate._y, rotate._z, 'XYZ')
        }

        object.userData.globalData = CONFIG.ID;

        // /** Проверяем положение объекта внутри комнаты */

        object.position.copy(point);

        const aabb = new THREE.Box3().setFromObject(object);
        let obb = new OBB();
        obb = obb.fromBox3(aabb);
        obb.applyMatrix4(object.matrixWorld)
        object.userData.obb = obb

        const adjustedPosition = positionEmpty && rotationEmpty
            ? roomManager.adjustPositionWithRaycasting({ object, targetPosition: point, targetRotation: rotate, wall })
            : { position, rotation };


        object.position.copy(adjustedPosition.position);
        object.rotation.copy(adjustedPosition.rotation)
        object.userData.obb.applyMatrix4(object.matrixWorld)

        CONFIG.POSITION = object.position.clone();
        CONFIG.ROTATION = object.rotation.clone();

        object.userData.current = true

        scene.add(object);

        /** Добавляем helper */
        object.userData.helper ? scene.add(object.userData.helper) : ''

        /** Добавляем объект в RoomContant для последующего использования */
        roomManager._roomContant = object

        /** Режим объединения в группы для переходящей текстуры */
        if (this.uniformState.getUniformModeData.uniformMode) {

            // const uniformTextureBuilder = this.root._trafficManager?.geometryBuilder.buildProduct.uniform_texture_builder
            // uniformTextureBuilder.preGrouping(object)
            return
        }

        // Передаём данные созданного объекта для events

        if (trafficManager) {
            trafficManager._currentObject = object
            trafficManager.ruler.drawRulerToObjects(object)
        }

        if (!boxHelper) return

        if (!boxHelper._boxHelperCheck) {
            boxHelper.addBoxHelper(object);
            return
        }

        boxHelper.removeBoxHelper();
        boxHelper.addBoxHelper(object);
    }

}

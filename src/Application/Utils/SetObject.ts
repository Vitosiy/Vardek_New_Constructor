// @ts-nocheck

import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

import { useEventBus } from '@/store/appliction/useEventBus';
import { useModelState } from '@/store/appliction/useModelState';

import { OBB } from 'three/examples/jsm/math/OBB.js';
import { createOBBFromObject, OBBHelper } from "../Utils/CalculateBoundingBox";

export class SetObject {
    eventsStore: ReturnType<typeof useEventBus> = useEventBus()
    modelState = useModelState();

    scene: THREE.Scene | null = null
    modelData: any
    object: THREE.Object3D | null = null
    point: THREE.Vector3 | null = null
    roomManager: THREETypes.TRoomManager | null = null
    trafficManager: THREETypes.TTrafficManager | null = null
  
    boxHelper: THREETypes.TCustomBoxHelper | null = null

    create({ scene, config, object, point, rotate, roomManager, trafficManager, boxHelper, wall }: THREEInterfases.ISetProduct) {


        const positionEmpty = object.userData.PROPS.CONFIG.POSITION == null;
        const rotationEmpty = object.userData.PROPS.CONFIG.ROTATION == null;

        let position = object.userData.PROPS.CONFIG.POSITION ?? new THREE.Vector3(point.x, point.y, point.z)
        let rotation = object.userData.PROPS.CONFIG.ROTATION ?? new THREE.Euler(0, 0, 0, 'XYZ')

        if(rotate){
            object.userData.PROPS.CONFIG.POSITION = new THREE.Vector3(point.x, point.y, point.z)
            object.userData.PROPS.CONFIG.ROTATION = new THREE.Euler(rotate._x, rotate._y,rotate._z, 'XYZ')
        }

        object.userData.globalData = config.ID;
        object.userData.modelVector = this.modelState.getModels[object.userData.PROPS.PRODUCT].element_type;

        // /** Проверяем положение объекта внутри комнаты */

        object.userData.current = true
        object.position.copy(point);

        // object.matrixAutoUpdate = false;
        // object.updateMatrix()

        // object.userData.obb.applyMatrix4(object.matrixWorld)

        const aabb = new THREE.Box3().setFromObject(object);
        let obb = new OBB();
        obb = obb.fromBox3(aabb);
        obb.applyMatrix4(object.matrixWorld)
        object.userData.obb = obb

        let adjustedPosition

        if (positionEmpty && rotationEmpty) {
            // console.log('EMPTY')
            adjustedPosition = roomManager.adjustPositionWithRaycasting(
                {
                    object,
                    targetPosition: point,
                    targetRotation: rotate,
                    wall
                })
        }
        else {
            // console.log('NOT_EMPTY')
            adjustedPosition = { position, rotation }
        }

        // let adjustedPosition = positionEmpty && rotationEmpty ? roomManager.adjustPositionWithRaycasting(
        //     {
        //         object,
        //         targetPosition: point,
        //         targetRotation: rotate,
        //         wall
        //     }) : { position, rotation }

        // let adjustedPosition = { position, rotation }

        object.position.copy(adjustedPosition.position);
        object.rotation.copy(adjustedPosition.rotation)
        object.userData.obb.applyMatrix4(object.matrixWorld)

        object.userData.PROPS.CONFIG.POSITION = object.position.clone();
        object.userData.PROPS.CONFIG.ROTATION = object.rotation.clone();

        scene.add(object);

        if (object.userData.helper) {
            scene.add(object.userData.helper)
        }

        /** Добавляем объект в RoomContant для последующего использования */

        roomManager._roomContant = object

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

    isEmpty(obj: {}) {
        return Object.keys(obj).length === 0
    };

}

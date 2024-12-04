// @ts-nocheck

import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

import { useEventBus } from '@/store/appliction/useEventBus';

import { createOBBFromObject, OBBHelper } from "../Utils/CalculateBoundingBox";

export default class SetObject {
    eventsStore: ReturnType<typeof useEventBus> = useEventBus()

    scene: THREE.Scene | null = null
    modelData: any
    object: THREE.Object3D | null = null
    point: THREE.Vector3 | null = null
    roomManager: THREETypes.TRoomManager | null = null
    trafficManager: THREETypes.TTrafficManager | null = null
    boxHelper: THREETypes.TCustomBoxHelper | null = null

    create({ scene, config, object, point, roomManager, trafficManager, boxHelper, wall }: THREEInterfases.ISetProduct) {


        const positionEmpty = this.isEmpty(object.userData.PROPS.CONFIG.POSITION);
        const rotationEmpty = this.isEmpty(object.userData.PROPS.CONFIG.ROTATION);

        let position = positionEmpty ? new THREE.Vector3(point.x, point.y, point.z) : object.userData.PROPS.CONFIG.POSITION
        let rotation = rotationEmpty ? new THREE.Euler(0, 0, 0, 'XYZ') : object.userData.PROPS.CONFIG.ROTATION;

        object.userData.globalData = config.ID;
        object.userData.modelVector = object.userData.PROPS.PRODUCT.element_type;

        // /** Проверяем положение объекта внутри комнаты */

        object.userData.current = true

        object.position.copy(point);
        // object.rotation.copy(rotation)
        object.matrixAutoUpdate = false;

        object.updateMatrix()
        object.userData.obb.applyMatrix4(object.matrixWorld)

        scene.add(object);

        // let adjustedPosition = roomManager.adjustPositionWithRaycasting(
        //     {
        //         object,
        //         targetPosition: point,
        //         wall
        //     })

        let adjustedPosition = positionEmpty && rotationEmpty ? roomManager.adjustPositionWithRaycasting(
            {
                object,
                targetPosition: point,
                wall
            }) : { position, rotation }

        object.position.copy(adjustedPosition.position);
        object.rotation.copy(adjustedPosition.rotation)

        object.updateMatrix()
        object.userData.obb.applyMatrix4(object.matrixWorld)


        object.userData.PROPS.CONFIG.POSITION = object.position.clone();
        object.userData.PROPS.CONFIG.ROTATION = object.rotation.clone();

        console.log(object)



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
    }

    isEmpty(obj: {}) {
        return Object.keys(obj).length === 0
    };

}

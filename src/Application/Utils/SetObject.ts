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
    obbHelper: OBBHelper = new OBBHelper()

    constructor() {

    }

    create({ scene, config, object, point, roomManager, trafficManager, boxHelper, obb }: THREEInterfases.ISetProduct) {

        // const boundingBox = new THREE.Box3().setFromObject(object);
        // const objectWidth = boundingBox.max.x - boundingBox.min.x;
        // const objectHeight = boundingBox.max.y - boundingBox.min.y;
        // const objectDepth = boundingBox.max.z - boundingBox.min.z;


        const positionEmpty = this.isEmpty(object.userData.PROPS.CONFIG.POSITION);
        const rotationEmpty = this.isEmpty(object.userData.PROPS.CONFIG.ROTATION);

        let position = positionEmpty ? new THREE.Vector3(point.x, point.y, point.z) : object.userData.PROPS.CONFIG.POSITION
        let rotation = rotationEmpty ? new THREE.Euler(0, 0, 0, 'XYZ') : object.userData.PROPS.CONFIG.ROTATION



        position = new THREE.Vector3(point.x, point.y, point.z);

        object.userData.globalData = config.ID
        object.userData.modelVector = object.userData.PROPS.PRODUCT.element_type

        // console.log(config, 'config')
        // console.log(object.userData.globalData, 'config.ID')
        // console.log(object.userData.originAtBottom, 'origin at set')

        const OBB = createOBBFromObject(object)
        object.userData.obb = OBB


        // /** Проверяем положение объекта внутри комнаты */

        // if (!roomManager.isWithinRoom(position.x, position.y, position.z, objectWidth, objectHeight, objectDepth)) {
        //     position = roomManager.adjustPositionWithinRoom(
        //         position.x,
        //         position.y,
        //         position.z,
        //         objectWidth,
        //         objectHeight,
        //         objectDepth,
        //         object.userData.originAtBottom,
        //         object.userData.correctPosition
        //     );
        // }
        object.userData.current = true
        const newOBB = object.userData.obb.clone();
        newOBB.center.copy(point);

        // const adjustedPosition = roomManager.adjustPositionWithinRoomOBB(newOBB, object);
        // const adjustedPosition = roomManager.adjustPositionWithRaycasting(object, position, 500, 2000);

        // if (adjustedPosition) {

        //     position = adjustedPosition;
        // }
        // else {
        //     position = point
        // }

        /**Добавляем объект на сцену  */

        // object.position.copy(position);
        // object.updateMatrixWorld(true)
        scene.add(object);
        // object.applyMatrix4(object.matrixWorld)
        console.log(object)

        const adjustedPosition = roomManager.adjustPositionWithRaycasting(object, position, 500, 2000);

        position = adjustedPosition ?? position

        object.position.copy(position);
        // object.rotation.copy(rotation)
        // object.applyMatrix4(object.matrixWorld)


        object.userData.PROPS.CONFIG.POSITION = object.position.clone();
        object.userData.PROPS.CONFIG.ROTATION = object.rotation.clone();

        // object.userData.PROPS.ARROWS.traverse((child: any) => {
        //     if (child.name !== 'ARROW_SIZE') return
        //     child.position.set(...child.userData.translate)
        // })


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

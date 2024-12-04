
import * as THREE from 'three';
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

import { OBB } from 'three/examples/jsm/math/OBB.js';
import { Capsule } from 'three/addons/math/Capsule.js';
import { VertexNormalsHelper } from "three/examples/jsm/Addons.js";

import { useEventBus } from '@/store/appliction/useEventBus';
import { useRoomState } from '@/store/appliction/useRoomState';
import { useModelState } from '@/store/appliction/useModelState';
import { useSceneState } from '@/store/appliction/useSceneState';

import SetObject from '../Utils/SetObject';
import { GeometryBuilder } from '../Meshes/GeometryBuilder';
import { Room } from './Room';
import CreateShape from '../2DScene/CreateShape';


export class RoomManager extends Room {

    private eventsStore: ReturnType<typeof useEventBus> = useEventBus()
    private roomState: ReturnType<typeof useRoomState> = useRoomState()
    private modelState: ReturnType<typeof useModelState> = useModelState()

    createShape: CreateShape
    setObject: SetObject
    geometryBuilder: GeometryBuilder
    contant: { [key: string]: any } = {};
    heightClamp: number = useSceneState().getStartHeightClamp
    heightLine: THREE.Object3D[] = []

    constructor(root: THREETypes.TApplication, light: any) {

        super(root, light)

        this.scene = root.scene
        this.setObject = new SetObject()
        this.geometryBuilder = new GeometryBuilder(root)
        this.createShape = new CreateShape(root.canvas, root.camera.instance as THREE.Camera, root.scene, root)

        this.addVueEvents()
    }

    get _roomTotalContant() {
        return Object.values(this.contant)
    }

    /** Для линейки -------------------------------------------- */

    get _rulerContant() {
        return Object.values(this.contant)
    }

    set _rulerContant(value: boolean | THREE.Object3D[]) {
        this._roomTotalContant.forEach(object => {
            if (object.userData?.current) {
                object.userData.current = value
                return
            }
        });
    }

    get _roomTotalBounds() {

        let boundsArray: THREE.Box3[] = []

        const intersects = this._rulerContant as THREE.Object3D[];

        intersects.forEach(object => {

            if (!object.userData?.current) {
                const box = new THREE.Box3().setFromObject(object);
                const boxTop = new THREE.Box3().setFromObject(object);
                box.max.y = 3000;
                box.min.y = 0

                boundsArray.push(box);
                boundsArray.push(boxTop);
            }

        });

        return boundsArray
    }

    /**-------------------------------------------------------- */

    get _roomContant() {
        return this.contant
    }

    set _roomContant(value) {
        this.contant[`${value.id}`] = value
    }

    adjustPositionWithRaycasting({ object, targetPosition, wall, maxDistance, snapHeight }: { object: THREE.Object3D, targetPosition: THREE.Vector3, wall: THREE.Object3D, maxDistance: number, snapHeight?: number }): THREEInterfases.IClampPosition {
        // object.updateMatrixWorld()

        let heightClamp = this.heightClamp
        const objectBox = new THREE.Box3().setFromObject(object);
        const heightMagnetThreshold = object.userData.trueHeight;

        const position = this.snapToHeight(targetPosition, objectBox, heightClamp, heightMagnetThreshold);

        // const roomBounds = this.getRoomBounds();
        // const smallBoxSize = objectBox.getSize(new THREE.Vector3());


        // let objectOBB = object.userData.obb

        const objectPos = this.roomInterseck({ object, wall, position })

        return {
            position: objectPos.position,
            rotation: objectPos.rotation,
            quaternion: object.quaternion
        }

        // const heightMagnetThreshold = smallBoxSize.y / 2;

        // const adjustedPosition = this.snapToHeight(targetPosition, objectBox, heightClamp, heightMagnetThreshold);

        // const closestWall = this.getClosestWallDistance(adjustedPosition);

        // // Если объект достаточно близко к стене, примагничиваем его
        // if (closestWall.distance <= maxDistance) {
        //     const snappedPosition = this.snapToWall(adjustedPosition, closestWall.wall as THREE.Box3, smallBoxSize);
        //     const clampedPosition = this.clampPositionToWall(snappedPosition, roomBounds, objectBox, object, closestWall.rotation);

        //     return clampedPosition;
        // }
        // else {

        //     const clampedPosition = this.clampPositionToWall(adjustedPosition, roomBounds, objectBox, object, closestWall.rotation);

        //     let rotation = Object.keys(object.userData.PROPS.CONFIG.ROTATION).length > 0 ? object.userData.PROPS.CONFIG.ROTATION : new THREE.Euler(0, 0, 0, 'XYZ');
        //     let quaternion = closestWall.quaternion ?? new THREE.Quaternion()

        //     const data = {
        //         position: clampedPosition.position,
        //         rotation,
        //         quaternion
        //     };

        //     return data
        // }
    }

    private roomInterseck({
        object,
        wall,
        position,
    }: {
        object: THREE.Object3D;
        wall: THREE.Object3D;
        position: THREE.Vector3;
    }): { position: THREE.Vector3; rotation: THREE.Euler } {
        let adjustPosition = position.clone();
        const rotationProps = object.userData.PROPS.CONFIG.ROTATION;
        const rotation = new THREE.Euler(rotationProps.x, rotationProps.y, rotationProps.z, 'XYZ');

        const roomBound = this._roomBounds;
        const aabb = new THREE.Box3().setFromObject(object);
        const objectSize = aabb.getSize(new THREE.Vector3());
        const obb = new OBB().fromBox3(aabb);

        let closestWall: THREE.Mesh | null = null;
        let minDistance = Infinity;

        this._roomTotal.forEach(wall => {

            const wallOBB = wall.userData?.obb;

            if (!wallOBB || wall.userData.name === "floor") return;

            const wallNormal = wall.userData.plane.normal.clone().normalize();
            const distanceToPlane = Math.abs(wallNormal.dot(adjustPosition) + wall.userData.plane.constant);

            if (obb.intersectsOBB(wallOBB) && distanceToPlane < minDistance) {

                minDistance = distanceToPlane;
                closestWall = wall;

                let correctData = this.getClampedPosition({ position: adjustPosition, rotation, wall, object })
                adjustPosition = correctData.correctPosition
                rotation.copy(correctData.correctRotation)

            }

        });

        // Шаг 3: Корректируем положение относительно пересечений
        // if (closestWall) {

        //     let correctData = this.getClampedPosition({ position: adjustPosition, rotation, wall: closestWall, object })
        //     adjustPosition = correctData.correctPosition
        //     rotation.copy(correctData.correctRotation)


        //     // const wallNormal = closestWall.userData.plane.normal.clone().normalize();
        //     // const distanceToPlane = closestWall.userData.plane.distanceToPoint(adjustPosition);
        //     // const side = this.getFacingSideFromOBB(object, closestWall);
        //     // const correctSize = side === "left" || side === "right" ? object.userData.trueLength : object.userData.trueDepth;

        //     // if (distanceToPlane < correctSize) {
        //     //     const correction = wallNormal.multiplyScalar(correctSize - distanceToPlane);
        //     //     adjustPosition.add(correction);
        //     // }

        //     // if (closestWall.userData.name !== "floor") {
        //     //     rotation.copy(closestWall.rotation);
        //     // }
        // }

        // Шаг 4: Ограничение высоты (ось Y)
        adjustPosition.y = Math.max(
            (objectSize.y - 0.001) / 2,
            Math.min(position.y, roomBound.max.y - (objectSize.y - 0.001) / 2)
        );

        // Обновляем конфигурацию объекта
        object.userData.PROPS.CONFIG = { ...object.userData.PROPS.CONFIG, ROTATION: rotation, POSITION: adjustPosition };

        return { position: adjustPosition, rotation };
    }

    private getClampedPosition({ position, rotation, wall, object }: { position: THREE.Vector3, rotation: THREE.Euler, wall: THREE.Mesh, object: THREE.Object3D }) {

        const correctPosition = position.clone()
        const correctRotation = rotation.clone()

        const wallNormal = wall.userData.plane.normal.clone().normalize();
        const distanceToPlane = wall.userData.plane.distanceToPoint(correctPosition);
        const side = this.getFacingSideFromOBB(object, wall);
        const correctSize = side === "left" || side === "right" ? object.userData.trueLength : object.userData.trueDepth;

        if (distanceToPlane < correctSize) {
            const correction = wallNormal.multiplyScalar(correctSize - distanceToPlane);
            correctPosition.add(correction);
        }

        if (wall.userData.name !== "floor") {
            correctRotation.copy(wall.rotation);
        }

        return {
            correctPosition,
            correctRotation
        }
    }

    private getFacingSideFromOBB(object: THREE.Object3D, wall: THREE.Mesh): string {
        // Обновляем OBB объекта
        const obb = new OBB();
        const boundingBox = new THREE.Box3().setFromObject(object);
        const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(object.quaternion);
        obb.fromBox3(boundingBox);
        obb.applyMatrix4(rotationMatrix);

        // Нормаль стены
        const wallNormal = wall.userData.plane.normal.clone().normalize();

        // Направления сторон OBB
        const sides: { [key: string]: number } = {
            forward: new THREE.Vector3(0, 0, 1).applyMatrix3(obb.rotation).dot(wallNormal),
            backward: new THREE.Vector3(0, 0, -1).applyMatrix3(obb.rotation).dot(wallNormal),
            left: new THREE.Vector3(-1, 0, 0).applyMatrix3(obb.rotation).dot(wallNormal),
            right: new THREE.Vector3(1, 0, 0).applyMatrix3(obb.rotation).dot(wallNormal),
            up: new THREE.Vector3(0, 1, 0).applyMatrix3(obb.rotation).dot(wallNormal),
            down: new THREE.Vector3(0, -1, 0).applyMatrix3(obb.rotation).dot(wallNormal),
        }

        // Определяем сторону с максимальным скалярным произведением (по модулю)
        const closestSide = Object.keys(sides).reduce((a, b) => (Math.abs(sides[a]) > Math.abs(sides[b]) ? a : b));

        return closestSide;
    }

    private findClosestSide(target: number, numbers: number[]) {
        return numbers.reduce((closest, current) =>
            Math.abs(current - target) < Math.abs(closest - target) ? current : closest
        );
    }

    private createProgectionPoint(vector: THREE.Vector3, wall: THREE.Mesh, object: THREE.Object3D) {
        const plane = wall.userData.plane
        const objectHeight = object.userData.trueHeight

        const planePoint = new THREE.Vector3();
        plane.coplanarPoint(planePoint);


        const planeNormal = plane.normal;

        // Вычисляем проекцию вектора на плоскость
        const vectorToPlane = vector.clone().sub(planePoint);
        const distanceToPlane = vectorToPlane.dot(planeNormal);
        const projection = vector.clone().sub(planeNormal.clone().multiplyScalar(distanceToPlane));

        // console.log(projection)


        const pointGeometry = new THREE.SphereGeometry(20)

        const projectionPoint = new THREE.Mesh(pointGeometry, new THREE.MeshBasicMaterial({ color: 0x0000ff }));
        projectionPoint.position.copy(projection);

        this.scene.add(projectionPoint);

        return projection
    }


    // private getRoomBounds(): THREE.Box3 {
    //     const roomBox = new THREE.Box3();

    //     // Объединяем границы всех стен и пола
    //     for (const wall of this._roomWalls) {
    //         roomBox.union(new THREE.Box3().setFromObject(wall));
    //     }

    //     roomBox.union(new THREE.Box3().setFromObject(this._roomFloor as THREE.Object3D));

    //     return roomBox;
    // }

    private clampPositionToWall(position: THREE.Vector3, roomBox: THREE.Box3, objectBox: THREE.Box3, object: THREE.Object3D, rotate?: THREE.Vector3 | THREE.Euler | null, quaternion?: THREE.Quaternion): THREEInterfases.IClampPosition {
        const bigBox = roomBox;

        // Получаем размеры маленького бокса
        const smallBoxSize = new THREE.Vector3();
        const boundingBoxCenter = new THREE.Vector3();
        const smallBox = objectBox;
        smallBox.getSize(smallBoxSize);
        smallBox.getCenter(boundingBoxCenter);


        // Ограничиваем координаты позиции по границам большого бокса
        let clampedX = Math.max(bigBox.min.x + smallBoxSize.x / 2, Math.min(position.x, bigBox.max.x - smallBoxSize.x / 2));
        let clampedY = Math.max(0 + smallBoxSize.y / 2, Math.min(position.y, bigBox.max.y - smallBoxSize.y / 2));

        let clampedZ = Math.max(bigBox.min.z + smallBoxSize.z / 2, Math.min(position.z, bigBox.max.z - smallBoxSize.z / 2));

        if (object.userData.PROPS.CONFIG.ORIGIN) {
            clampedY -= smallBoxSize.y / 2
        }

        return {
            position: new THREE.Vector3(clampedX, clampedY, clampedZ),
            rotation: rotate as THREE.Vector3 | THREE.Euler | null,
            quaternion: quaternion as THREE.Quaternion
        };
    }

    private getClosestWallDistance(position: THREE.Vector3) {
        let closestDistance = Infinity;
        let closestWall = null;
        let rotation = null;
        let quaternion = null


        // Проверяем каждую стену и вычисляем расстояние до неё
        for (const wall of this._roomWalls) {
            const wallBox = new THREE.Box3().setFromObject(wall);

            // Вычисляем расстояние от позиции до ближайшей точки стены
            const distance = wallBox.distanceToPoint(position);


            // Обновляем ближайшую стену
            if (distance < closestDistance) {
                closestDistance = distance;
                closestWall = wallBox;
                rotation = wall.rotation.clone();
                quaternion = new THREE.Quaternion();
                quaternion.setFromEuler(wall.rotation).normalize()
            }
        }

        return { distance: closestDistance, wall: closestWall, rotation, quaternion };
    }

    private snapToHeight(
        position: THREE.Vector3,
        objectBox: THREE.Box3,
        snapHeight: number,
        threshold: number,
    ): THREE.Vector3 {

        const adjustedPosition = new THREE.Vector3(position.x, position.y, position.z)

        // Получаем размеры объекта
        const size = new THREE.Vector3();
        objectBox.getSize(size);

        const objectTop = objectBox.max.y;    // Верхняя часть объекта
        const objectBottom = objectBox.min.y; // Нижняя часть объекта

        /** Ограничиваем отслеживание пересечения со стенами */

        if (position.y >= snapHeight - threshold && position.y <= snapHeight + threshold) {

            // Примагничивание верхней части объекта
            if (Math.abs(objectTop - snapHeight) <= threshold) {

                adjustedPosition.y = snapHeight - size.y / 2;
            }
            // Примагничивание нижней части объекта
            else if (Math.abs(objectBottom - snapHeight) <= threshold) {

                adjustedPosition.y = snapHeight + size.y / 2;
            }
        }

        return adjustedPosition;
    }

    /** Функция примагничивания объекта к стене */

    private snapToWall(position: THREE.Vector3, wallBox: THREE.Box3, objectSize: THREE.Vector3,): THREE.Vector3 {
        const snappedPosition = position.clone();

        // Примагничиваем по X
        if (position.x < wallBox.min.x) {
            snappedPosition.x = wallBox.min.x - objectSize.x / 2;
        } else if (position.x > wallBox.max.x) {
            snappedPosition.x = wallBox.max.x + objectSize.x / 2;
        }

        // Примагничиваем по Z
        if (position.z < wallBox.min.z) {
            snappedPosition.z = wallBox.min.z - objectSize.z / 2;
        } else if (position.z > wallBox.max.z) {
            snappedPosition.z = wallBox.max.z + objectSize.z / 2;
        }

        return snappedPosition;
    }

    drawSnapHeightLines(snapHeight: number): void {
        this.disposeSnapHeightLines()

        const lineMaterial = new THREE.LineDashedMaterial({
            color: 0x444444,
            dashSize: 100,
            gapSize: 100,
            linewidth: 20,
            scale: 2.5,
            transparent: true,
            opacity: 0.5,
            depthTest: true,
            depthWrite: true
        });

        for (const wall of this._roomWalls) {
            const wallBox = new THREE.Box3().setFromObject(wall);
            const normal = new THREE.Vector3();  // Вектор нормали
            wall.getWorldDirection(normal);  // Получаем нормаль стены в мировых координатах

            const offset = normal.multiplyScalar(0);  // Скаляр для смещения вдоль нормали

            // Получаем размеры и границы стены
            const minX = wallBox.min.x;
            const maxX = wallBox.max.x;
            const minZ = wallBox.min.z;
            const maxZ = wallBox.max.z;

            // Смещаем линию по направлению нормали
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(minX, snapHeight, minZ).add(offset),  // Нижний левый угол со смещением по нормали
                new THREE.Vector3(maxX, snapHeight, minZ).add(offset),  // Нижний правый угол со смещением
                new THREE.Vector3(maxX, snapHeight, maxZ).add(offset),  // Верхний правый угол со смещением
                new THREE.Vector3(minX, snapHeight, maxZ).add(offset),  // Верхний левый угол со смещением
                new THREE.Vector3(minX, snapHeight, minZ).add(offset)   // Замыкаем линию
            ]);

            const line = new THREE.Line(lineGeometry, lineMaterial);
            line.computeLineDistances();  // Необходимо для корректного отображения пунктира
            line.renderOrder = 1

            this.scene.add(line);
            this.heightLine.push(line);
        }
    }

    disposeSnapHeightLines() {

        if (this.heightLine.length > 0) {

            this.heightLine.forEach(line => {
                this.scene.remove(line)
                line.traverse(children => {
                    if (children instanceof THREE.Mesh) {
                        children.geometry.dispose();
                        (children.material as THREE.Material).dispose();
                    }
                })
            })
        }

        this.heightLine = [];

    }

    save() {
        let mokSave: any[] = []
        Object.values(this.contant).forEach(item => {
            const model: THREETypes.TObject = {}

            model.id = item.userData.globalData

            model.position = item.position.clone()
            model.rotation = item.rotation.clone()

            model.obb = item.userData.obb
            model.data = this.convertProps(item.userData.PROPS)

            mokSave.push(JSON.stringify(model))

            console.log(JSON.parse(mokSave), 'mokSave--')
        })

        return mokSave
    }

    convertProps(data: THREETypes.TObject) {

        let saveData = { ...data }

        saveData.ARROWS = null;
        saveData.BODY = null;
        saveData.LEG = []
        saveData.SHELF = []
        saveData.FASADE = []
        saveData.FASADE_DEFAULT = []
        saveData.TABLETOP = {}
        saveData.CONFIG.HEIGHTCORRECT = 0

        return saveData
    }

    /** Удаление объекта из сцены */

    remove(id: number) {
        delete this.contant[id]
    }

    update() {
        if (this.roomState.getCurrentRoomId?.content) {

            let data = this.roomState.getCurrentRoomId.content

            data.forEach(item => {

                const model = JSON.parse(item as string)
                const point = model.position
                const loadData = model.data

                this.geometryBuilder.craeteModel(this.modelState.getModels[model.id] as THREEInterfases.IModelsData, (object) => {
                    this.setObject.create({ scene: this.scene, config: this.modelState.getModels[model.id], object, point, roomManager: this })
                }, loadData
                )

            })
            return
        }
        this.contant = {}
    }

    addVueEvents() {

        // this.boundSetSize = ({ width, height, depth, thickness }) => {

        //     this.setSize(width, height, depth, thickness);
        // };

        this.boundWallMaterial = (material) => {

            this.updateWallMaterial(material);
        };

        this.boundFloorMaterial = (material) => {

            this.updateFloorMaterial(material);
        };

        this.boundHeightClampValue = (value: number) => {
            this.heightClamp = value
        }


        // this.eventsStore.on('A:Room-resize', this.boundSetSize);

        this.eventsStore.on('A:ChangeWallTexture', this.boundWallMaterial)

        this.eventsStore.on('A:ChangeFloorTexture', this.boundFloorMaterial)

        this.eventsStore.on('A:Height-clamp', this.boundHeightClampValue)

    }

    removeVueEvents() {

        if (this.boundSetSize) {
            this.eventsStore.off('A:Room-resize', this.boundSetSize);
            this.boundSetSize = null;
        }
        if (this.boundWallMaterial) {
            this.eventsStore.off('A:ChangeWallTexture', this.boundWallMaterial);
            this.boundWallMaterial = null;
        }
        if (this.boundFloorMaterial) {
            this.eventsStore.off('A:ChangeFloorTexture', this.boundFloorMaterial);
            this.boundFloorMaterial = null;
        }
        if (this.boundHeightClampValue) {
            this.eventsStore.off('A:Height-clamp', this.boundHeightClampValue);
            this.heightClamp = useSceneState().getStartHeightClamp;
        }
    }

}
//@ts-nocheck
import { toRaw } from 'vue';

import * as THREE from 'three';
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"
import * as UniformTypes from '@/types/uniformTextureTypes'

import { OBB } from 'three/examples/jsm/math/OBB.js';
// import { Capsule } from 'three/addons/math/Capsule.js';
// import { VertexNormalsHelper } from "three/examples/jsm/Addons.js";

import { useEventBus } from '@/store/appliction/useEventBus';
import { useRoomState } from '@/store/appliction/useRoomState';
import { useModelState } from '@/store/appliction/useModelState';
import { useSceneState } from '@/store/appliction/useSceneState';
import { useUniformState } from "@/store/appliction/useUniformState";

import SetObject from '../Utils/SetObject';
import { GeometryBuilder } from '../Meshes/GeometryBuilder';
import { Room } from './Room';
// import CreateShape from '../2DScene/CreateShape';


export class RoomManager extends Room {

    private eventsStore: ReturnType<typeof useEventBus> = useEventBus()
    private roomState: ReturnType<typeof useRoomState> = useRoomState()
    private modelState: ReturnType<typeof useModelState> = useModelState()
    private uniformState: ReturnType<typeof useUniformState> = useUniformState()

    // createShape: CreateShape
    root: THREETypes.TApplication
    setObject: SetObject
    geometryBuilder: GeometryBuilder | null
    uniformTextureBuilder: THREE.TUniformTextureBuilder
    contant: { [key: string]: any } = {};
    heightClamp: number = useSceneState().getStartHeightClamp
    heightLine: THREE.Object3D[] = []

    constructor(root: THREETypes.TApplication, light: any) {

        super(root, light)
        this.root = root
        this.scene = root.scene
        this.setObject = root.setObject
        this.geometryBuilder = root.geometryBuilder
        this.uniformTextureBuilder = root.geometryBuilder?.buildProduct.uniform_texture_builder

        // this.createShape = new CreateShape(root.canvas, root.camera.instance as THREE.Camera, root.scene, root)

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


    adjustPositionWithRaycasting({ object, targetPosition, wall, targetRotation, maxDistance, snapHeight }: { object: THREE.Object3D, targetPosition: THREE.Vector3, targetRotation?: THREE.Euler, wall: THREE.Object3D, maxDistance: number, snapHeight?: number }): THREEInterfases.IClampPosition {

        let heightClamp = this.heightClamp
        const objectBox = new THREE.Box3().setFromObject(object);

        const { DEPTH, HEIGHT, WIDTH } = object.userData.trueSizes

        const heightMagnetThreshold = HEIGHT;

        const position = this.snapToHeight(targetPosition, objectBox, heightClamp, heightMagnetThreshold);

        const objectPos = this.roomInterseck({ object, wall, position, targetRotation })

        return {
            position: objectPos.position,
            rotation: objectPos.rotation,
            quaternion: object.quaternion
        }

    }

    private roomInterseck({ object, wall, position, targetRotation }: { object: THREE.Object3D; wall: THREE.Object3D; position: THREE.Vector3, targetRotation?: THREE.Euler }): { position: THREE.Vector3; rotation: THREE.Euler } {

        let adjustPosition = position.clone();

        // console.log(object.userData.PROPS.CONFIG.ROTATION, 'AR')
        // console.log(adjustPosition, 'AP')

        const rotation = object.userData.PROPS.CONFIG.ROTATION ?? new THREE.Euler(0, 0, 0, 'XYZ');
        const { DEPTH, HEIGHT, WIDTH } = object.userData.trueSizes

        const roomBound = this._roomBounds;
        const aabb = new THREE.Box3().setFromObject(object);
        const obb = new OBB().fromBox3(aabb);

        let minDistance = Infinity;
        let curWall = null;

        /** Для загрузки контента из стора при запуске приложения */

        if (!wall) {

            for (let wallNdx in this._roomTotal) {

                let singleWall = this._roomTotal[wallNdx]

                const wallOBB = singleWall.userData.obb;

                if (obb.intersectsOBB(wallOBB)) {

                    let correctData = this.getClampedPosition({ position: adjustPosition, rotation, wall: singleWall, object, obb })
                    adjustPosition = correctData.correctPosition
                    rotation.copy(correctData.correctRotation)
                    break;
                }

            }
        }
        /** Для работы после запуска приложения */
        else {

            switch (wall.userData.name) {
                case "floor":

                    for (let wallNdx in this._roomTotal) {

                        let singleWall = this._roomTotal[wallNdx]
                        const wallOBB = singleWall.userData.obb;
                        if (!wallOBB || singleWall.userData.name === "floor") break

                        if (obb.intersectsOBB(wallOBB)) {

                            const wallNormal = singleWall.userData.plane.normal.clone().normalize();
                            const distanceToPlane = Math.abs(wallNormal.dot(adjustPosition) + singleWall.userData.plane.constant);
                            const correction = wallNormal.clone().multiplyScalar(distanceToPlane);

                            if (distanceToPlane <= DEPTH * 2) {
                                adjustPosition.sub(correction);
                            }

                            // let g = new THREE.BoxGeometry(20, 20, 20)
                            // let c = new THREE.MeshBasicMaterial({ color: 0xff00ff })
                            // let m = new THREE.Mesh(g, c)
                            // m.position.copy(adjustPosition)
                            // this.scene.add(m)

                            // console.log(singleWall.userData.name)

                            let correctData = this.getClampedPosition({ position: adjustPosition, rotation, wall: singleWall, object, obb, floor: true })

                            adjustPosition = correctData.correctPosition
                            rotation.copy(correctData.correctRotation)

                            break
                        }

                    }

                    break
                default:

                    let correctData = this.getClampedPosition({ position: adjustPosition, rotation, wall: wall, object, obb })

                    adjustPosition = correctData.correctPosition
                    rotation.copy(correctData.correctRotation)

                    break
            }
        }

        // console.log(object)

        /** Проверка на положение объекта только на полу */

        adjustPosition.y = object.userData.elementType == "element_down" ? HEIGHT - 0.001 : Math.max(
            (HEIGHT - 0.001),
            Math.min(position.y, roomBound.max.y - (HEIGHT - 0.001))
        );

        // adjustPosition.y = Math.max((HEIGHT - 0.001), Math.min(position.y, roomBound.max.y - (HEIGHT - 0.001)))

        // Обновляем конфигурацию объекта
        object.userData.PROPS.CONFIG = { ...object.userData.PROPS.CONFIG, ROTATION: rotation, POSITION: adjustPosition };

        return { position: adjustPosition, rotation };
    }

    private getClampedPosition({ position, rotation, wall, object, obb, floor }: { position: THREE.Vector3, rotation: THREE.Euler, wall: THREE.Mesh, object: THREE.Object3D, obb: OBB, floor?: boolean }) {

        let correctPosition = position.clone()
        const correctRotation = rotation.clone()
        const wallCoordinates = wall.userData.coordinates

        const { PROPS } = object.userData
        const { CONFIG, TABLETOP } = PROPS
        const { POSITION, ROTATION } = CONFIG

        const tableTopDepth = Object.keys(TABLETOP).length > 0 ? TABLETOP.userData.trueSize.TABLETOP_DEPTH : null

        const { DEPTH, HEIGHT, WIDTH } = object.userData.trueSizes

        if (!wallCoordinates) {

            let correct = ROTATION.clone()
            correct.y += Math.PI / 2;

            return {
                correctPosition: POSITION,
                correctRotation: ROTATION,
            }
        }

        const wallNormal = wall.userData.plane.normal.clone().normalize();
        const distanceToPlane = wall.userData.plane.distanceToPoint(correctPosition);

        const intersectionPoint = new THREE.Vector3();
        obb.clampPoint(wall.userData.obb.center, intersectionPoint);

        const side = this.getFacingSideFromOBB(object, wall, obb);

        const correctSize = tableTopDepth ? tableTopDepth * 0.5 : DEPTH - 10.5;

        let trueExtremePoint = this.findClosestPoint(position, wallCoordinates[0], wallCoordinates[1]).clone()

        const vectorToCenter = new THREE.Vector3().subVectors(wall.userData.center, trueExtremePoint).normalize();

        trueExtremePoint.y = position.y

        const distanceToExtrene = trueExtremePoint.distanceTo(position)

        if (distanceToExtrene === 0) return {

            correctPosition: POSITION,
            correctRotation: ROTATION,
        }

        if (distanceToExtrene <= WIDTH) {
            let correction
            if (!floor) {
                correction = vectorToCenter.clone().multiplyScalar(WIDTH - distanceToExtrene);
                correctPosition.add(correction);
            }
            else {
                correction = vectorToCenter.clone().multiplyScalar(WIDTH - 0.5);
                correctPosition = trueExtremePoint.clone().add(correction)
            }

        }

        if (distanceToPlane <= correctSize) {
            let correction = wallNormal.clone().multiplyScalar(correctSize - distanceToPlane - 0.5);
            correctPosition.add(correction);
        }

        if (wall.userData.name != "floor") {
            !wall.rotation.equals(correctRotation) ? correctRotation.copy(wall.rotation) : ''
        }


        return {
            correctPosition,
            correctRotation
        }
    }

    private getFacingSideFromOBB(object: THREE.Object3D, wall: THREE.Mesh, obb: OBB): string {

        // Нормаль стены
        const wallNormal = wall.userData.plane.normal.clone().normalize();

        // Направления сторон OBB
        const sides: { [key: string]: number } = {
            forward: new THREE.Vector3(0, 0, 1).applyMatrix4(object.matrixWorld).dot(wallNormal),
            backward: new THREE.Vector3(0, 0, -1).applyMatrix4(object.matrixWorld).dot(wallNormal),
            left: new THREE.Vector3(-1, 0, 0).applyMatrix4(object.matrixWorld).dot(wallNormal),
            right: new THREE.Vector3(1, 0, 0).applyMatrix4(object.matrixWorld).dot(wallNormal),
            up: new THREE.Vector3(0, 1, 0).applyMatrix4(object.matrixWorld).dot(wallNormal),
            down: new THREE.Vector3(0, -1, 0).applyMatrix4(object.matrixWorld).dot(wallNormal),
        }

        // Определяем сторону с максимальным скалярным произведением (по модулю)

        const closestSide = Object.keys(sides).reduce((a, b) => {
            return Math.abs(sides[a]) > Math.abs(sides[b]) ? a : b;
        });

        return closestSide;
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
            // mokSave.push(model)
        })

        // console.log(mokSave)

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
        const product = this.contant[id]
        if (product.userData.PROPS.CONFIG.UNIFORM_TEXTURE.group !== null) {
            this.uniformTextureBuilder.removeFromUniformGroup(product)
        }

        delete this.contant[id]
    }

    update() {
        this.contant = {}
        if (this.roomState.getCurrentRoomId?.content) {

            let data = this.roomState.getCurrentRoomId.content

            data.forEach(item => {

                const model = typeof (item) === 'string' ? JSON.parse(item as string) : item
                const point = model.position
                const rotation = model.rotation
                const loadData = model.data ?? ''
                const size = model.size ?? ''

                this.geometryBuilder.craeteModel(this.modelState.getModels[model.id] as THREEInterfases.IModelsData, (object) => {
                    this.setObject.create({ scene: this.scene, config: this.modelState.getModels[model.id], object, rotate: rotation, point, roomManager: this })
                }, loadData, size
                )

            })
            // return
        }
        // console.log(this.contant, '  this.contant')
        const uniformGroups: UniformTypes.TUniformGroupMembership[] = toRaw(this.uniformState.getUniformGroupMembership) // Получаем доступ непосредственно к объектам, убирая proxy от VUE
        this.uniformTextureBuilder.clearUniformGroups()
        this.uniformTextureBuilder.loadUniformGroup(uniformGroups)
        this.uniformState.clearUniformGroupMembership();

    }

    addVueEvents() {


        this.boundWallMaterial = (material) => {

            this.updateWallMaterial(material);
        };

        this.boundFloorMaterial = (material) => {

            this.updateFloorMaterial(material);
        };

        this.boundHeightClampValue = (value: number) => {
            this.heightClamp = value
        }


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

        this.geometryBuilder = null
        this.setObject = null
        this.geometryBuilder = null
    }

    /**------------------------------------------------------------ */
    findClosestPoint(middlePoint, point1, point2) {
        // Вычисляем расстояния
        const distanceToPoint1 = middlePoint.distanceTo(point1);
        const distanceToPoint2 = middlePoint.distanceTo(point2);

        // Сравниваем расстояния
        if (distanceToPoint1 < distanceToPoint2) {
            // console.log('point1')
            return point1; // Ближе к первой точке
        } else {
            // console.log('point2')
            return point2; // Ближе ко второй точке
        }
    }

}
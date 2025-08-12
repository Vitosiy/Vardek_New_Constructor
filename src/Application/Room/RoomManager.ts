// @ts-nocheck
import { toRaw } from 'vue';

import * as THREE from 'three';
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"
import * as UniformTypes from '@/types/uniformTextureTypes'

import { OBB } from 'three/examples/jsm/math/OBB.js';
import { OBBCollider } from './OBBCollider';
import { OBBHelper } from '../Utils/CalculateBoundingBox';
// import { Capsule } from 'three/addons/math/Capsule.js';
// import { VertexNormalsHelper } from "three/examples/jsm/Addons.js";

import { useEventBus } from '@/store/appliction/useEventBus';
import { useRoomState } from '@/store/appliction/useRoomState';
import { useModelState } from '@/store/appliction/useModelState';
import { useSceneState } from '@/store/appliction/useSceneState';
import { useUniformState } from "@/store/appliction/useUniformState";

import { SetObject } from '../Utils/SetObject';
import { GeometryBuilder } from '../Meshes/GeometryBuilder';
import { Room } from './Room';
// import CreateShape from '../2DScene/CreateShape';


export class RoomManager extends Room {

    private eventsStore: ReturnType<typeof useEventBus> = useEventBus()
    private roomState: ReturnType<typeof useRoomState> = useRoomState()
    private modelState: ReturnType<typeof useModelState> = useModelState()
    private uniformState: ReturnType<typeof useUniformState> = useUniformState()
    private OBBCollider: OBBCollider = new OBBCollider()
    private OBBHealper: OBBHelper = new OBBHelper()

    // createShape: CreateShape
    root: THREETypes.TApplication
    scene: THREE.Scene
    setObject: SetObject | null
    geometryBuilder: GeometryBuilder | null
    uniformTextureBuilder: THREETypes.TUniformTextureBuilder
    contant: { [key: string]: any } = {};
    heightClamp: number = useSceneState().getStartHeightClamp
    heightLine: THREE.Object3D[] = []
    totalObbBounds: OBB[] = []

    constructor(root: THREETypes.TApplication) {

        super(root, root._lights)
        this.root = root
        this.scene = root.scene!
        this.setObject = root.setObject!
        this.geometryBuilder = root.geometryBuilder
        this.uniformTextureBuilder = root.geometryBuilder?.buildProduct.uniform_texture_builder!

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

    createTotalObbBounds() {

        this.totalObbBounds = []
        const intersects = this._roomTotalContant as THREE.Object3D[];

        intersects.forEach(object => {

            if (!object.userData?.current && object.visible) {

                const obb = object.userData.obb.clone()
                obb.center.copy(object.position)
                obb.rotation.setFromMatrix4(object.matrixWorld);

                /** @Визуализация_OBB */

                // const OBBH = this.OBBHealper.add(obb)
                // this.scene.add(OBBH)

                this.totalObbBounds.push(obb);
            }
        });

    }

    clearTotalObbBounds() {
        this.totalObbBounds = []
    }

    get _totalObbBounds() {
        return this.totalObbBounds
    }

    /**-------------------------------------------------------- */

    get _roomContant() {
        return this.contant
    }

    set _roomContant(value) {
        this.contant[`${value.id}`] = value
    }


    adjustPositionWithRaycasting(
        { object,
            targetPosition,
            wall,
            targetRotation,
            snapHeight
        }: {
            object: THREE.Object3D,
            targetPosition: THREE.Vector3,
            targetRotation?: THREE.Euler,
            wall: THREE.Object3D,
            snapHeight?: number
        }): THREETypes.TAdjustPosition {

        const position = this.OBBCollider.getCorrectPosition({
            object,
            targetPosition,
            wall,
            targetRotation,
            snapHeight,
            heightClamp: this.heightClamp,

            wallStore: this._roomTotal,
            boundsStore: this._roomBounds,
            objectsBoundsStore: this._totalObbBounds,
        })

        return position
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

    save(): string[] {
        return Object.values(this.contant)
            .filter(item => item.userData.elementType !== 'raspil')
            .map(item => JSON.stringify({
                id: item.userData.globalData,
                position: item.position.clone(),
                rotation: item.rotation.clone(),
                obb: item.userData.obb,
                data: this.convertProps(item),
                type: item.userData.elementType,
                size: item.userData.PROPS.CONFIG.SIZE

            }));
    }

    convertProps(product: THREETypes.TObject) {

        const { PROPS } = product.userData;

        const saveData = {
            ...PROPS,
            ARROWS: null,
            BODY: null,
            BODY_DEFAULT: null,
            LEG: [],
            SHELF: [],
            FASADE: [],
            FASADE_DEFAULT: [],
            TABLETOP: {},
        };

        const raspilList = saveData.RASPIL_LIST ?? [];
        const raspilData = saveData.RASPIL?.data;

        if (Array.isArray(raspilList) && raspilList.length && raspilData) {
            for (const elem of raspilList) {
                if (!elem || !elem.sectorId) continue;

                const result = this.findElementsBySectorId(raspilData, elem.sectorId);
                if (!result) continue;

                // Создаём клон, если нужно сохранить чистоту
                result.position = elem.position?.clone?.() ?? null;
                result.rotation = elem.rotation?.clone?.() ?? null;
            }
        }

        return saveData;
    }

    /** Удаление объекта из сцены */

    remove(id: number) {
        const product = this.contant[id]
        if (product.userData.PROPS.CONFIG.UNIFORM_TEXTURE.group !== null) {
            this.uniformTextureBuilder.removeFromUniformGroup(product)
        }

        delete this.contant[id]
    }

    async update(loadData?: string[]) {


        this.contant = {}
        let data = loadData ?? this.roomState.getCurrentRoomId?.content
        if (!data) return
        let count;

        count = await this.loadData(data as string[])
        if (count === data.length) {
            this.eventBus.emit('A:ContantLoaded', true)
        }

        const uniformGroups: UniformTypes.TUniformGroupMembership[] = toRaw(this.uniformState.getUniformGroupMembership) // Получаем доступ непосредственно к объектам, убирая proxy от VUE
        this.uniformTextureBuilder.clearUniformGroups()
        this.uniformTextureBuilder.loadUniformGroup(uniformGroups)
        this.uniformState.clearUniformGroupMembership();

    }

    async loadData(data: string[]) {
        let counts = 0;

        for (const item of data) {
            const model = typeof item === 'string' ? JSON.parse(item) : item;
            const point = model.position as THREE.Vector3;
            const rotation = model.rotation as THREE.Euler;
            const loadData = model.data ?? '';
            const size = model.size ?? '';

            await new Promise<void>((resolve) => {
                this.geometryBuilder!.craeteModel(
                    this.modelState.getModels[model.id] as THREEInterfases.IModelsData,
                    (object: THREE.Object3D) => {
                        this.setObject!.create({ object, rotate: rotation, point });

                        if (loadData?.RASPIL_LIST?.length > 0) {
                            this.root.tableTopCreator?.create(loadData.RASPIL, object, object.id);
                        }

                        counts++;
                        resolve();
                    },
                    loadData,
                    size
                );
            });
        }

        return counts;
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


        this.eventBus.on('A:ChangeWallTexture', this.boundWallMaterial)

        this.eventBus.on('A:ChangeFloorTexture', this.boundFloorMaterial)

        this.eventBus.on('A:Height-clamp', this.boundHeightClampValue)

    }

    removeVueEvents() {

        if (this.boundSetSize) {
            this.eventBus.off('A:Room-resize', this.boundSetSize);
            this.boundSetSize = null;
        }
        if (this.boundWallMaterial) {
            this.eventBus.off('A:ChangeWallTexture', this.boundWallMaterial);
            this.boundWallMaterial = null;
        }
        if (this.boundFloorMaterial) {
            this.eventBus.off('A:ChangeFloorTexture', this.boundFloorMaterial);
            this.boundFloorMaterial = null;
        }
        if (this.boundHeightClampValue) {
            this.eventBus.off('A:Height-clamp', this.boundHeightClampValue);
            this.heightClamp = useSceneState().getStartHeightClamp;
        }

        this.geometryBuilder = null
        this.setObject = null
        this.geometryBuilder = null
    }


}
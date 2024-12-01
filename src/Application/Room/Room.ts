import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

// import { OBB } from 'three/examples/jsm/math/OBB.js';
// import { VertexNormalsHelper } from "three/examples/jsm/Addons.js";

import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';

import { useRoomState } from "@/store/appliction/useRoomState";
import { useSceneState } from "@/store/appliction/useSceneState"

import { DeepDispose } from "../Utils/DeepDispose";
import { WallBuilder } from "../Meshes/WallBilder";
import { Resources } from "../Utils/Resources";

import { OBBHelper } from "../Utils/CalculateBoundingBox";


export class Room {

    boundSetSize: ((payload: { width: number; height: number; depth: number, thickness: number }) => void) | null = null;
    boundWallMaterial: ((item: number) => void) | null = null
    boundFloorMaterial: ((item: number) => void) | null = null
    boundHeightClampValue: ((item: number) => void) | null = null


    private parent: THREETypes.TApplication
    private params: { [key: string]: any }
    private wallBuilder: WallBuilder = new WallBuilder()
    private resources: Resources = new Resources()
    private dispose: DeepDispose = new DeepDispose()

    resizeParams: { [key: string]: number | 0 } | THREEInterfases.IWallSizes
    scene: THREE.Scene
    private roomsStore: ReturnType<typeof useRoomState> = useRoomState()
    private startData: ReturnType<typeof useSceneState> = useSceneState()
    roomLight: any

    walls: THREE.Object3D[] = [];
    floor: THREE.Object3D | null = null;
    сeiling: THREE.Object3D | null = null;

    // wallsGroup: THREE.Group = new THREE.Group()
    wallsGroup: THREE.Object3D = new THREE.Object3D()
    wallsGroupSize: { width: number, height: number, depth: number } = { width: 0, height: 0, depth: 0 }
    roomObject: THREE.Object3D = new THREE.Object3D()

    wallTexture: number | string = 0
    floorTexture: number | string = 0

    obbHelper = new OBBHelper();
    worldOctree = new Octree();
    roomBounds: THREE.Box3 = new THREE.Box3()

    constructor(parent: THREETypes.TApplication, light: any) {

        this.parent = parent
        this.scene = parent.scene
        this.roomLight = light
        this.params = {}
        this.resizeParams = {}

        this.getStartSize()
        this.createRoom(this.params)

        this.setRoom();
        this.roomBounds = this.getRoomBounds();

    }

    get _wallsGroupSize() {
        return this.wallsGroupSize
    }

    get _wallsGroup() {
        return this.wallsGroup
    }

    get _roomParams() {
        return this.resizeParams
    }

    set _roomParams(value) {
        this.resizeParams = value
    }

    get _roomWalls() {
        return this.walls
    }

    get _roomFloor() {
        return this.floor
    }

    get _roomTotal() {
        return [...this.walls, this._roomFloor] as THREE.Mesh[]
    }

    get _roomBounds() {
        return this.roomBounds
    }

    // get _roomCeiling() {
    //     return this.сeiling
    // }

    getStartSize() {

        if (!this.roomsStore.getCurrentRoomId) {

            this.params = this.startData.getStartRoomData
            this.wallTexture = this.startData.getStartRoomData.wall as number | string
            this.floorTexture = this.startData.getStartRoomData.floor as number | string

            this.roomsStore.setCurrentRoomSize(this.startData.getStartRoomData)
            this.resizeParams = this.startData.getStartRoomData

            return
        }

        this.roomsStore.setCurrentRoomSize(this.roomsStore.getCurrentRoomId.size)
        this.params = this.roomsStore.getCurrentRoomId.size
        this.resizeParams = this.roomsStore.getCurrentRoomId.size

        this.wallTexture = this.roomsStore.getCurrentRoomId.size.wall as number | string
        this.floorTexture = this.roomsStore.getCurrentRoomId.size.floor as number | string

    }

    createRoom(params: THREEInterfases.IWallSizes | { [key: string]: any }) {

        this.walls = [];
        this.сeiling = null;
        this.floor = null;

        /** OLD */

        params.walls.forEach((wall: THREEInterfases.IWallData) => {
            const part = this.wallBuilder.createPlaneWall(wall.width, wall.height, wall.position, wall.rotation, wall.side, params.wall,)
            this.walls.push(part)
            this.wallsGroup.add(part)

            // helper для вычисления направления нормалей
            // const helper = new VertexNormalsHelper(part, 1000, 0xffffff);
            // this.scene.add(helper);

        })

        const box = new THREE.Box3().setFromObject(this._wallsGroup);
        const size = new THREE.Vector3();
        const totalSize = box.getSize(size);

        // const pbox = calculateUnionBoundingBox(this._wallsGroup)
        // const psize = new THREE.Vector3();
        // const ptotalSize = pbox.getSize(psize);


        // const boxHelper = new THREE.Box3Helper(box, new THREE.Color(0xff00ff));

        /** HELPER для определения размера стены */
        // this.scene.add(boxHelper)

        const width = box!.max.x - box!.min.x;
        const height = totalSize.y
        const depth = box!.max.z - box!.min.z;

        this.wallsGroupSize = {
            width,
            height,
            depth
        }

        this.floor = this.wallBuilder.createFloorFromWalls(params.walls, params.floor,)

        // this.wallsGroup.renderOrder = 0
        // this.floor.renderOrder = 0

        this.roomObject.add(this.floor)
        this.roomObject.add(this.wallsGroup)

        this.wallsGroup.add(this.floor)

        this.roomObject.renderOrder = 2
        // this.roomObject.position.set(0,0,0)

    }

    setRoom() {

        // this.scene.add(...this.walls);
        this.scene.add(this.roomObject)

        this.floor?.userData.obb.applyMatrix4(this.floor.matrixWorld)

        this.walls.forEach(wall => {

            wall.userData.obb.applyMatrix4(wall.matrixWorld)

            /** Helpers для OBB стен */

            // const BBHELPER = this.obbHelper.add(wall.userData.obb)
            // this.scene.add(BBHELPER)

        })

        /** Helpers для OBB  пола */

        // this.createRoomOctree()

        // const BBHELPER = this.obbHelper.add(this.floor?.userData.obb)
        // this.scene.add(BBHELPER)

        return
    }

    updateWallMaterial(materialId: number | string) {
        this.walls.forEach(wall => {
            this.wallBuilder.updateTexture(wall as THREE.Mesh, 'wall', materialId, wall.userData.dimensions);
        })

        // Сохраняем материал локально
        this.wallTexture = materialId
        // Щтправляем материал в хранилище
        this.roomsStore.setWallTexture(materialId)
    }

    updateFloorMaterial(materialId: number | string) {
        this.wallBuilder.updateTexture(this.floor as THREE.Mesh, 'floor', materialId, this.floor?.userData.dimensions);

        // Сохраняем материал локально
        this.floorTexture = materialId
        // Щтправляем материал в хранилище
        this.roomsStore.setFloorTexture(materialId)
    }

    private createRoomOctree() {
        this.worldOctree.fromGraphNode(this.wallsGroup)
        this.worldOctree.split(16)

        const helper = new OctreeHelper(this.worldOctree, 0x00ff00);
        helper.visible = true;
        this.scene.add(helper);

        console.log(this.worldOctree)
    }

    private getRoomBounds(): THREE.Box3 {
        console.log('getRoomBounds')
        const roomBox = new THREE.Box3();

        // Объединяем границы всех стен и пола
        for (const wall of this.walls) {
            roomBox.union(new THREE.Box3().setFromObject(wall));
        }

        roomBox.union(new THREE.Box3().setFromObject(this._roomFloor as THREE.Object3D));

        return roomBox
    }

    // setSize(width: number, height: number, depth: number, thickness: number) {

    //     // Обновляем параметры комнаты
    //     const sizes = {
    //         width,
    //         height,
    //         depth,
    //         thickness,
    //         wall: this.wallTexture,
    //         floor: this.floorTexture
    //     }

    //     this._roomParams = sizes

    //     // Удаляем комнату из сцены

    //     this.walls.forEach(wall => {
    //         this.dispose.clearRoom(wall, this.scene)
    //         this.scene.remove(wall)
    //     })

    //     this.сeiling ? this.scene.remove(this.сeiling) : ''
    //     this.floor ? this.scene.remove(this.floor) : ''

    //     // Пересоздаём комнату с новыми размерами

    //     this.createRoom(sizes)
    //     this.setRoom()

    //     this.roomsStore.setCurrentRoomSize(sizes)
    //     this.roomLight.setLightPosition(sizes, 3)

    //     console.log(this.roomsStore.getCurrentRoomSize)
    // }
}
/**//@ts-nocheck */

import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"
import { BuildersHelper } from "../Meshes/BuildersHelper";

// import { OBB } from 'three/examples/jsm/math/OBB.js';
// import { VertexNormalsHelper } from "three/examples/jsm/Addons.js";

import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
// import { Octree } from 'three/addons/math/Octree.js';
// import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';

import { useRoomState } from "@/store/appliction/useRoomState";
import { useSceneState } from "@/store/appliction/useSceneState"
import { useEventBus } from '@/store/appliction/useEventBus';

import { WallBuilder } from "../Meshes/WallBilder";
import { OBBHelper } from "../Utils/CalculateBoundingBox";


export class Room extends BuildersHelper {

    boundSetSize: ((payload: { width: number; height: number; depth: number, thickness: number }) => void) | null = null;
    boundWallMaterial: ((item: number) => void) | null = null
    boundFloorMaterial: ((item: number) => void) | null = null
    boundHeightClampValue: ((item: number) => void) | null = null



    root: THREETypes.TApplication
    private params: { [key: string]: any }
    private wallBuilder: WallBuilder

    resizeParams: { [key: string]: number | 0 } | THREEInterfases.IWallSizes
    scene: THREE.Scene
    private roomState: ReturnType<typeof useRoomState> = useRoomState()
    private sceneState: ReturnType<typeof useSceneState> = useSceneState()
    eventBus: ReturnType<typeof useEventBus> = useEventBus()
    roomLight: any

    walls: THREE.Object3D[] = [];
    floor: THREE.Object3D | null = null;
    сeiling: THREE.Object3D | null = null;

    // wallsGroup: THREE.Group = new THREE.Group()
    wallsGroup: THREE.Object3D = new THREE.Object3D()
    wallsGroupSize: { width: number, height: number, depth: number } = { width: 0, height: 0, depth: 0 }
    roomObject: THREE.Object3D = new THREE.Object3D()

    // wallTexture: number | string = 0
    // floorTexture: number | string = 0

    obbHelper = new OBBHelper();
    // worldOctree = new Octree();
    roomBounds: THREE.Box3 = new THREE.Box3()

    constructor(root: THREETypes.TApplication, light: any) {

        super(root)

        this.wallBuilder = new WallBuilder(root)

        this.root = root
        this.scene = root.scene!
        this.roomLight = light
        this.params = {}
        this.resizeParams = {}

        this.createRoom(this.getStartSize())

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

    loadRoom(light, roomId?: string | number) {
        // console.log(roomId, 'roomId')
        this.roomLight = light
        const params = this.getStartSize(roomId)
        this.createRoom(params)

        this.setRoom();
        this.roomBounds = this.getRoomBounds();
    }

    getStartSize(roomId?: string | number) {
        let params

        if (!roomId) {
            this.eventBus.emit('A:ContantLoaded', true)

            console.log('Not exist')

            params = JSON.parse(JSON.stringify(this.sceneState.getStartRoomData))
            console.log(params)

            this.roomState.setCurrentRoomParams(params)
            return params
        }

        console.log('Exist', this.roomState.getRooms, this.roomState.getCurrentRoomData(roomId)    )

        params = JSON.parse(JSON.stringify(this.roomState.getCurrentRoomData(roomId)!.params))
        this.roomState.setCurrentRoomParams(params)

        return params
    }

    createRoom(params: THREEInterfases.IWallSizes | { [key: string]: any }) {

        this.walls = [];
        this.сeiling = null;
        this.floor = null;

        /** OLD */

        console.log(params, 'params')

        params.walls.forEach((wall: THREEInterfases.IWallData, key: number) => {
            const part = this.wallBuilder.createPlaneWall(wall.width, wall.height, wall.position, wall.rotation, wall.side, params.wall,)
            part.userData.name = `wall_${key}`
            this.walls.push(part)
            this.wallsGroup.add(part)

            // helper для вычисления направления нормалей
            // const helper = new VertexNormalsHelper(part, 1000, 0xffffff);
            // this.scene.add(helper);

        })

        const box = new THREE.Box3().setFromObject(this._wallsGroup);
        const size = new THREE.Vector3();
        const totalSize = box.getSize(size);

        const width = box!.max.x - box!.min.x;
        const height = totalSize.y
        const depth = box!.max.z - box!.min.z;

        this.wallsGroup.userData.elementType = "element_room"

        this.wallsGroupSize = {
            width,
            height,
            depth
        }

        this.floor = this.wallBuilder.createFloorFromWalls(params.walls, params.floor,)
        this.floor.userData.name = 'floor'

        // this.wallsGroup.renderOrder = 0
        // this.floor.renderOrder = 0

        this.roomObject.add(this.floor)
        this.roomObject.add(this.wallsGroup)
        this.wallsGroup.add(this.floor)

        // this.roomObject.renderOrder = 2
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

        // console.log(materialId, 'materialId')
        // this.walls.forEach(wall => {
        //     this.wallBuilder.updateTexture(wall as THREE.Mesh, 'wall', materialId, wall.userData.dimensions);
        // })
        this.scene.traverse(child => {
            if (child instanceof THREE.Object3D && child.userData.elementType == 'element_room') {

                let demention
                child.traverse(children => {
                    if (children instanceof THREE.Mesh && !children.userData.isArrowHelper && children.userData.name != 'floor') {
                        if (children.userData.dimensions) {
                            demention = children.userData.dimensions
                            this.wallBuilder.updateTexture(children as THREE.Mesh, 'wall', materialId, demention);
                            return
                        }
                        const parent = this.getRootObject(children)
                        const { DEPTH, HEIGHT } = parent.userData.trueSizes

                        demention = [DEPTH * 2, HEIGHT * 2]
                        this.wallBuilder.updateTexture(children as THREE.Mesh, 'wall', materialId, demention)

                    }
                })

            }
        })

        // Отправляем материал в хранилище
        this.roomState.setWallTexture(materialId)
        console.log(this.roomState.getCurrentRoomParams, 'WALL')
    }

    updateFloorMaterial(materialId: number | string) {

        this.wallBuilder.updateTexture(this.floor as THREE.Mesh, 'floor', materialId, this.floor?.userData.dimensions);

        // Отправляем материал в хранилище
        this.roomState.setFloorTexture(materialId)
        console.log(this.roomState.getCurrentRoomParams, 'FLOOR')
    }


    private getRoomBounds(): THREE.Box3 {
        const roomBox = new THREE.Box3();

        // Объединяем границы всех стен и пола
        for (const wall of this.walls) {
            roomBox.union(new THREE.Box3().setFromObject(wall));
        }

        roomBox.union(new THREE.Box3().setFromObject(this._roomFloor as THREE.Object3D));

        return roomBox
    }


}


//@ts-nocheck
import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

// import { RoomManager } from "../Room/RoomManager"
// import { MeshEvents } from "../Meshes/Utils/Events"

import { TrafficManager } from "../Movement/TrafficManager"

import { Environment } from "../World/Environment"
import { DeepDispose } from "../Utils/DeepDispose"
import { useSceneState } from "@/store/appliction/useSceneState"
import { useRoomState } from "@/store/appliction/useRoomState";
import { useEventBus } from '@/store/appliction/useEventBus';
import { useUniformState } from "@/store/appliction/useUniformState";

export class World {

    root: THREETypes.TApplication
    scene: THREE.Scene

    deepDispose: THREETypes.TDeepDispose
    resources: any

    sceneState: ReturnType<typeof useSceneState> = useSceneState()
    roomsStore: ReturnType<typeof useRoomState> = useRoomState()
    eventsStore: ReturnType<typeof useEventBus> = useEventBus()
    uniformState: ReturnType<typeof useUniformState> = useUniformState()

    trafficManager: THREETypes.TTrafficManager | null
    room: THREETypes.TRoomManager | null = null
    lights: THREETypes.TAppLights
    enviroment: any
    // meshEvents: MeshEvents | null = null

    private onCreateRoom: () => void;
    private onSaveRoom: () => void;
    private onLoadRoom: (data: number) => void;


    constructor(root: THREETypes.TApplication) {


        this.root = root
        this.scene = root.scene!
        this.resources = root.resources;
        this.lights = root._lights
        this.room = root._roomManager
        this.deepDispose = root._deepDispose
        this.trafficManager = root._trafficManager

        this.onCreateRoom = this.createRoom.bind(this)
        this.onSaveRoom = this.saveRoom.bind(this)
        this.onLoadRoom = this.loadRoom.bind(this)

        this.resources.on('cubeTextureLoaded', () => {
            this.enviroment = new Environment(root)
        })
        this.vueEvents()

        this.scene.add(new THREE.AxesHelper(2000))
        this.room!.update()
        this.lights.setLight(this.room!._wallsGroupSize, 2)


        const startRoomId = this.roomsStore.getRooms[0].id
        // this.loadRoom(startRoomId)

    }

    async setRoom(roomId) {

        this.scene.add(new THREE.AxesHelper(2000))
        this.room!.loadRoom(this.lights, roomId)
        await this.room!.update();
        if (this.roomsStore.getCurrentRoomData(roomId)?.params.wall) {
            const wallTextureId = this.roomsStore.getCurrentRoomData(roomId)?.params.wall
            this.room!.updateWallMaterial(wallTextureId)
        }
        // const wallTextureId = this.roomsStore.getCurrentRoomData(roomId)?.size.wall
        // this.room!.updateWallMaterial(wallTextureId)
    }

    async createRoom(name: string) {

        this.roomsStore.clearTempRoomSize();
        this.roomsStore.clearCurrentRoomId();
        this.deepDispose.clearScene(this.scene);
        await this.setRoom();
        this.lights.setLight(this.room!._wallsGroupSize, 2)

        if (this.trafficManager) {
            this.trafficManager.update(this.room!)
        }

        this.saveRoom(name)
        const toAction: string[] = this.room?.save()
        this.root.userHistory.clearHistory(toAction as string[])

    }

    saveRoom(name: string) {

        if (!this.roomsStore.getRoomId) {
            const roomId = Date.now().toString()
            console.log('Комнаты ещё нет')

            const contant = this.room!.save() as string[]

            this.roomsStore.addRoom({
                id: roomId, // Присваиваем id 
                label: name ?? `Комната N:${this.roomsStore.rooms.length + 1}`,
                params: this.roomsStore.getCurrentRoomParams as THREEInterfases.IWallSizes,
                content: contant
            })

            const rooms = this.roomsStore.getRooms

            this.sceneState.updateProjectParams({ rooms })
            this.roomsStore.setCurrentRoomId(roomId)
            return
        }

        console.log('Комната уже существует')

        const contant = this.room!.save() as string[]
        const roomId = this.roomsStore.getRoomId as number
        // const roomParams = this.roomsStore.getCurrentRoomData(roomId)?.size as THREEInterfases.IWallSizes
        const roomParams = this.roomsStore.getCurrentRoomParams as THREEInterfases.IWallSizes

        this.roomsStore.updateRoom(roomId, contant, roomParams)
        const rooms = this.roomsStore.getRooms

        this.sceneState.updateProjectParams({ rooms })

    }

    async loadRoom(roomId: number) {
        this.uniformState.clearUniformGroupMembership();
        this.uniformState.clearUniformGroupsStors()
        this.roomsStore.clearCurrentRoomId()
        this.roomsStore.clearTempRoomSize()

        /** Добавляем ID комнаты в хранилище */
        this.roomsStore.setCurrentRoomId(roomId);

        this.deepDispose.clearScene(this.scene);

        await this.setRoom(roomId);
        this.lights.setLight(this.room!._wallsGroupSize, 2)
        await this.trafficManager!.update(this.room!)

        const toAction: string[] = this.room?.save()
        this.root.userHistory.clearHistory(toAction as string[])

    }

    vueEvents() {

        this.onCreateRoom = (name?: string) => {
            this.createRoom(name)
        }

        this.onSaveRoom = (name?: string) => {
            this.saveRoom(name)
        }

        this.onLoadRoom = (value) => {
            this.loadRoom(value)
        }

        this.eventsStore.on('A:Create', this.onCreateRoom);
        this.eventsStore.on('A:Save', this.onSaveRoom)
        this.eventsStore.on('A:Load', this.onLoadRoom)

        // this.eventsStore.on("A:ContantLoaded", () => {
        //     console.log()
        //     const toAction: string[] = this.room?.save()!
        //     this.root.userHistory.clearHistory(toAction)

        // });

    }

    removeVueEvents() {
        // this.resources.off('cubeTextureLoaded', this.onFirstCreate);
        this.eventsStore.off('A:Create', this.onCreateRoom);
        this.eventsStore.off('A:Save', this.onSaveRoom)
        this.eventsStore.off('A:Load', this.onLoadRoom)
        // this.meshEvents?.removeVueEvents()

        this.room?.removeVueEvents();
        this.trafficManager?.moveManager.dispose();
        this.trafficManager?.removeVueEvents();
        this.trafficManager?.dragAndDropManager.dispose();

        this.lights = null
        this.enviroment = null
        this.room = null;
        // this.meshEvents = null
        this.trafficManager = null
    }
}
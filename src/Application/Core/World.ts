

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

        this.deepDispose = new DeepDispose()

        this.root = root
        this.scene = root.scene!
        this.resources = root.resources;

        this.lights = root._lights

        this.onCreateRoom = this.createRoom.bind(this)
        this.onSaveRoom = this.saveRoom.bind(this)
        this.onLoadRoom = this.loadRoom.bind(this)


        // this.scene.add(new THREE.AxesHelper(2000))
        this.room = root._roomManager
        this.room!.update()

        this.lights.setLight(this.room!._wallsGroupSize, 2)
        this.trafficManager = root._trafficManager
        this.vueEvents()

        // this.meshEvents = new MeshEvents(root)

        this.resources.on('cubeTextureLoaded', () => {
            this.enviroment = new Environment(root)
        })

    }

    async setRoom() {

        // this.scene.add(new THREE.AxesHelper(2000))
        this.room!.loadRoom(this.lights)
        await this.room!.update()
        this.room!.updateWallMaterial(this.room!.wallTexture)
    }

    async createRoom() {

        this.roomsStore.clearTempRoomSize();
        this.roomsStore.clearCurrentRoomId();
        this.deepDispose.clearScene(this.scene);
        await this.setRoom();
        this.lights.setLight(this.room!._wallsGroupSize, 2)

        if (this.trafficManager) {
            this.trafficManager.update(this.room!)
        }

    }

    saveRoom() {

        if (!this.roomsStore.getCurrentRoomId) {

            // console.log('Комнаты ещё нет')

            this.roomsStore.setCurrentRoomId(this.roomsStore.rooms.length)

            this.roomsStore.addRoom({
                id: this.roomsStore.rooms.length, // Присваиваем id 
                label: Date.now().toString(), // Присваиваем Название
                size: this.roomsStore.getCurrentRoomSize as THREEInterfases.IWallSizes,
                content: this.room!.save() as string[]
            })
            this.sceneState.updateProjectParams({ rooms: this.roomsStore.getRooms })
            // console.log(this.sceneState.getCurrentProjectParams)
            return
        }

        // console.log('Комната уже существует')

        this.roomsStore.updateRoom(this.roomsStore.getRoomId as number, this.room!.save(), this.roomsStore.getCurrentRoomSize as THREEInterfases.IWallSizes)
        this.sceneState.updateProjectParams({ rooms: this.roomsStore.getRooms })

        // console.log(this.sceneState.getCurrentProjectParams)

    }

    async loadRoom(roomId: number) {
        this.uniformState.clearUniformGroupMembership();
        this.uniformState.clearUniformGroupsStors()

        /** Добавляем ID комнаты в хранилище */
        this.roomsStore.setCurrentRoomId(roomId);

        this.deepDispose.clearScene(this.scene);

        await this.setRoom();
        this.lights.setLight(this.room!._wallsGroupSize, 2)
        await this.trafficManager!.update(this.room!)

        this.root.userHistory.clearHistory(this.room?._roomContant as string[])
    }

    vueEvents() {

        this.onCreateRoom = () => {
            this.createRoom()
        }

        this.onSaveRoom = () => {
            this.saveRoom()
        }

        this.onLoadRoom = (value) => {
            this.loadRoom(value)
        }

        this.eventsStore.on('A:Create', this.onCreateRoom);
        this.eventsStore.on('A:Save', this.onSaveRoom)
        this.eventsStore.on('A:Load', this.onLoadRoom)

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
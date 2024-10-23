import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

// import { Room } from "../Meshes/Room"
import {RoomManager} from "../Room/RoomManager"
// import { DragAndDropManager } from "../Utils/DragAndDropManager"
import {TrafficManager} from "../Movement/TrafficManager"
import { AppLights } from "../World/Lights"
import { Environment } from "../World/Environment"
import { DeepDispose } from "../Utils/DeepDispose"

import { useSceneState } from "@/store/appliction/useSceneState"
import { useRoomState } from "@/store/appliction/useRoomState";
// import { useAppContext } from "@/store/useAppContext"
import { useEventBus } from '@/store/appliction/useEventBus';

export class World {

    root: THREETypes.TApplication
    scene: THREE.Scene

    deepDispose: DeepDispose
    resources: any
    roomsStore: ReturnType<typeof useRoomState>
    sceneState: ReturnType<typeof useSceneState>
    eventsStore: ReturnType<typeof useEventBus>

    trafficManager: TrafficManager | null
    room: any
    lights: AppLights | any
    enviroment: any

    constructor(root: THREETypes.TApplication) {

        this.sceneState = useSceneState()
        this.roomsStore = useRoomState()
        this.eventsStore = useEventBus()
        this.deepDispose = new DeepDispose()

        this.trafficManager = null

        this.root = root
        this.scene = root.scene
        this.resources = root.resources;

        this.lights = new AppLights(root)

        this.room = null;

        this.resources.on('cubeTextureLoaded', () => {

            this.enviroment = new Environment(this.root)

            // console.log(this.startData.getStartRoomData)

            this.setRoom()

            this.lights.setLight(this.room._wallsGroupSize, 3)

            this.trafficManager = new TrafficManager(root, this.room)

            this.vueEvents()
        })
    }

    setRoom() {

        this.scene.add(new THREE.AxesHelper(2000))
        this.room = new RoomManager(this.root, this.lights);
        this.room.update()
    }

    createRoom() {

        this.roomsStore.clearTempRoomSize();
        this.roomsStore.clearCurrentRoomId();

        this.room.removeVueEvents();
        this.room = null;
        this.deepDispose.clearScene(this.scene);

        this.setRoom();
        this.lights.setLight(this.room._wallsGroupSize, 3)

        if (this.trafficManager) {
            this.trafficManager.update(this.room)
        }

    }

    saveRoom() {

        if (!this.roomsStore.getCurrentRoomId) {

            console.log('Комнаты ещё нет')

            this.roomsStore.setCurrentRoomId(this.roomsStore.rooms.length)

            this.roomsStore.addRoom({
                id: this.roomsStore.rooms.length, // Присваиваем id 
                label: Date.now().toString(), // Присваиваем Название
                size: this.roomsStore.getCurrentRoomSize as THREEInterfases.IWallSizes,
                content: this.room.save()
            })
            this.sceneState.updateProjectParams({ rooms: this.roomsStore.getRooms})
            console.log(this.sceneState.getCurrentProjectParams)
            return
        }

        // console.log('Комната уже существует')

        this.roomsStore.updateRoom(this.roomsStore.getRoomId as number, this.room.save(), this.roomsStore.getCurrentRoomSize as THREEInterfases.IWallSizes)
        this.sceneState.updateProjectParams({ rooms: this.roomsStore.getRooms })

        console.log(this.sceneState.getCurrentProjectParams)

    }

    loadRoom(roomId: number) {

        /** Добавляем ID комнаты в хранилище */
        this.roomsStore.setCurrentRoomId(roomId);

        this.room.removeVueEvents();
        this.room = null;
        this.deepDispose.clearScene(this.scene);

        this.setRoom();
        this.lights.setLight(this.room._wallsGroupSize, 3)

        if (this.trafficManager) {
            this.trafficManager.update(this.room)

        }
        // console.log(this.roomsStore.getRooms)
    }

    vueEvents() {

        this.eventsStore.on('A:Create', () => {
            this.createRoom()
        })

        this.eventsStore.on('A:Save', () => {
            this.saveRoom()
        })

        this.eventsStore.on('A:Load', (roomId: number) => {
            this.loadRoom(roomId)
        })
    }
}
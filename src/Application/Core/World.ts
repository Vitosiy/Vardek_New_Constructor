
//@ts-nocheck
import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

import { RoomManager } from "../Room/RoomManager"
import { MeshEvents } from "../Meshes/Utils/Events"

import { TrafficManager } from "../Movement/TrafficManager"
import { AppLights } from "../World/Lights"
import { Environment } from "../World/Environment"
import { DeepDispose } from "../Utils/DeepDispose"

import { useSceneState } from "@/store/appliction/useSceneState"
import { useRoomState } from "@/store/appliction/useRoomState";
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
    room: THREETypes.TRoomManager | null = null
    lights: AppLights | any
    enviroment: any
    // meshEvents: MeshEvents | null = null

    private onCreateRoom: () => void;
    private onSaveRoom: () => void;
    private onLoadRoom: (data: number) => void;
    private onFirstCreate: () => void;

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

        // this.room = null;

        this.onCreateRoom = this.createRoom.bind(this)
        this.onSaveRoom = this.saveRoom.bind(this)
        this.onLoadRoom = this.loadRoom.bind(this)

        // this.firstCreate()


        this.scene.add(new THREE.AxesHelper(2000))
        this.room = new RoomManager(this.root, this.lights);
        this.room.update()

        this.lights.setLight(this.room._wallsGroupSize, 2)
        this.trafficManager = new TrafficManager(this.root, this.room)
        this.vueEvents()

        // this.meshEvents = new MeshEvents(root)

        // this.resources.on('cubeTextureLoaded', ()=>{
        //     this.enviroment = new Environment(this.root)
        // })

    }

    firstCreate() {
        // this.enviroment = new Environment(this.root)
        this.scene.add(new THREE.AxesHelper(2000))
        this.room = new RoomManager(this.root, this.lights);
        this.room.update()

        this.lights.setLight(this.room._wallsGroupSize, 2)
        this.trafficManager = new TrafficManager(this.root, this.room)
        this.vueEvents()
    }

    setRoom() {

        this.scene.add(new THREE.AxesHelper(2000))
        this.room.loadRoom(this.lights)
        this.room.update()
        this.room.updateWallMaterial(this.room.wallTexture)
    }

    createRoom() {

        this.roomsStore.clearTempRoomSize();
        this.roomsStore.clearCurrentRoomId();
        this.deepDispose.clearScene(this.scene);
        this.setRoom();
        this.lights.setLight(this.room._wallsGroupSize, 2)

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
            this.sceneState.updateProjectParams({ rooms: this.roomsStore.getRooms })
            // console.log(this.sceneState.getCurrentProjectParams)
            return
        }

        // console.log('Комната уже существует')

        this.roomsStore.updateRoom(this.roomsStore.getRoomId as number, this.room.save(), this.roomsStore.getCurrentRoomSize as THREEInterfases.IWallSizes)
        this.sceneState.updateProjectParams({ rooms: this.roomsStore.getRooms })

        // console.log(this.sceneState.getCurrentProjectParams)

    }

    loadRoom(roomId: number) {


        /** Добавляем ID комнаты в хранилище */
        this.roomsStore.setCurrentRoomId(roomId);

        this.deepDispose.clearScene(this.scene);

        this.setRoom();
        this.lights.setLight(this.room._wallsGroupSize, 2)

        if (this.trafficManager) {
            this.trafficManager.update(this.room)

        }
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
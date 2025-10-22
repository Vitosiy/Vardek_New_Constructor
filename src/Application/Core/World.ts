

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
import { useRoomOptions } from '@/components/left-menu/option/roomOptions/useRoomOptons';
import { useEventBus } from '@/store/appliction/useEventBus';
import { useUniformState } from "@/store/appliction/useUniformState";
import { useModelState } from "@/store/appliction/useModelState"
import { useBasketStore } from "@/store/appStore/useBasketStore"

export class World {

    root: THREETypes.TApplication;
    scene: THREE.Scene;

    deepDispose: THREETypes.TDeepDispose;
    resources: any;

    sceneState: ReturnType<typeof useSceneState> = useSceneState();
    roomState: ReturnType<typeof useRoomState> = useRoomState();
    eventsStore: ReturnType<typeof useEventBus> = useEventBus();
    uniformState: ReturnType<typeof useUniformState> = useUniformState();
    roomOptions: ReturnType<typeof useRoomOptions> = useRoomOptions();
    modelState: ReturnType<typeof useModelState> = useModelState()
    basketStore: ReturnType<typeof useBasketStore> = useBasketStore()

    trafficManager: THREETypes.TTrafficManager | null;
    room: THREETypes.TRoomManager | null = null;
    lights: THREETypes.TAppLights;
    enviroment: any;
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


        if (this.roomState.getRooms.length > 0) {
            console.log('LOAD')
            const startRoomId = this.roomState.getRooms[0].id
            this.loadRoom(startRoomId)
        }
        else {
            this.room?.defaultCreate()
            this.lights.setLight(this.room!._wallsGroupSize, 3)
        }

        /** @Для_dev */
        // this.scene.add(new THREE.AxesHelper(2000))
        // this.room!.update()
        // this.lights.setLight(this.room!._wallsGroupSize, 2)

    }

    async setRoom(roomId) {

        // this.scene.add(new THREE.AxesHelper(2000))
        this.room!.loadRoom(this.lights, roomId)
        await this.room!.update();

    }

    async createRoom(name: string) {

        this.roomState.clearTempRoomSize();
        this.roomState.clearCurrentRoomId();
        this.deepDispose.clearScene(this.scene);
        await this.setRoom();
        this.lights.setLight(this.room!._wallsGroupSize, 3)

        if (this.trafficManager) {
            this.trafficManager.update(this.room!)
        }

        this.saveRoom(name)
        const toAction: string[] = this.room?.save()
        this.root.userHistory.clearHistory(toAction as string[])
        this.modelState.setCurrentModel(null)
        this.modelState.setTransformControlsValue(false)
        this.basketStore.clearBasket();
    }

    saveRoom(name: string) {

        
        if (!this.roomState.getRoomId) {
            const roomId = Date.now().toString()
            // console.log('Комнаты ещё нет')

            const contant = this.room!.save() as string[]
                
            this.roomState.addRoom({
                id: roomId, // Присваиваем id 
                label: name ?? `Комната N:${this.roomState.rooms.length + 1}`,
                params: this.roomState.getCurrentRoomParams as THREEInterfases.IWallSizes,
                content: contant,
                basket: JSON.stringify({
                    scene: this.basketStore.mainConstructor,
                    catalog: this.basketStore.mainCatalog
                })
            })
            this.basketStore.clearBasket();

            const rooms = this.roomState.getRooms
            console.log(rooms)

            this.sceneState.updateProjectParams({ rooms: rooms })
            this.roomState.setCurrentRoomId(roomId)
            return
        }

        // console.log('Комната уже существует')

        const contant = this.room!.save() as string[]
        const roomId = this.roomState.getRoomId as number
        // const roomParams = this.roomState.getCurrentRoomData(roomId)?.size as THREEInterfases.IWallSizes
        const roomParams = this.roomState.getCurrentRoomParams as THREEInterfases.IWallSizes
        const basket = JSON.stringify({
                    scene: this.basketStore.mainConstructor,
                    catalog: this.basketStore.mainCatalog
                })
        this.roomState.updateRoom(roomId, contant, roomParams, basket)
        const rooms = this.roomState.getRooms
               console.log(rooms)

               
        // console.log(rooms, 'ROOMS')
        this.sceneState.updateProjectParams({ rooms })

    }

    async loadRoom(roomId: number) {
        this.uniformState.clearUniformGroupMembership();
        this.uniformState.clearUniformGroupsStors()
        this.roomState.clearCurrentRoomId()
        this.roomState.clearTempRoomSize()
        this.modelState.setCurrentModel(null)
        this.modelState.setTransformControlsValue(false)

        /** Добавляем ID комнаты в хранилище */
        this.roomState.setCurrentRoomId(roomId);

        this.deepDispose.clearScene(this.scene);

        await this.setRoom(roomId);
        this.lights.setLight(this.room!._wallsGroupSize, 2)
        await this.trafficManager!.update(this.room!)

        // if (this.roomState.getCurrentRoomData(roomId)?.params.wall) {
        //     const wallTextureId = this.roomState.getCurrentRoomData(roomId)?.params.wall
        //     this.room!.updateWallMaterial(wallTextureId)
        // }

        const toAction: string[] = this.room?.save()
        this.root.userHistory.clearHistory(toAction as string[])

        const invValue = this.roomOptions.getRefractionValue
        if (this.enviroment) this.enviroment.toggleRefraction(invValue)

        const basket = JSON.parse(this.roomState.rooms.find(el=> el.id === roomId).basket);
        console.log('basket', basket);
        if (basket) this.basketStore.loadBasket(basket)

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
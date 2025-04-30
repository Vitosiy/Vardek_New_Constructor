import * as THREE from "three"


import { Sizes } from "../Utils/Sizes"
import { Time } from "../Utils/Time"
import { Camera } from "./Camera";
import { Renderer } from "./Renderer";
import { World } from "./World";
import { CustomBoxHelper } from "@/Application/Utils/BoxHelperCustom";

import { GeometryBuilder } from '../Meshes/GeometryBuilder';
import { MeshEvents } from "../Meshes/Utils/Events"
import { SetObject } from "../Utils/SetObject";
import { Ruler } from "../Utils/Ruler";
import { SystemInfo } from "../Utils/SystemInfo";
import { KeybordListeners } from "../Utils/KeybordListeners";

import { useEventBus } from '../../store/appliction/useEventBus';
import { useAppData } from "@/store/appliction/useAppData";
// import { MeshEvents } from '../Meshes/Utils/Events';

import { Resources } from "../Utils/Resources";
import { ENVIROMENT_MAP } from "../F-mockapi";

export class Application {

    /** Хранилища */
    eventsStore: ReturnType<typeof useEventBus> = useEventBus();
    appData: ReturnType<typeof useAppData> = useAppData();
    // meshEvents: MeshEvents | null = null

    canvas: HTMLElement | null;
    sizes: Sizes | null = null;
    time: Time | null = null;
    scene: THREE.Scene | null = null;
    camera: Camera | null = null;
    renderer: Renderer | null = null;
    resources: Resources | null = null
    enviromentData: { [key: string]: any } | null = ENVIROMENT_MAP[0]

    world: World | null = null;
    geometryBuilder: GeometryBuilder | null
    meshEvents: MeshEvents | null = null
    setObject: SetObject | null = null
    ruler: Ruler | null = null
    systemInfo: SystemInfo | null = null
    keybordListeners: KeybordListeners | null = null
    customBoxHelper: CustomBoxHelper | null = null

    draft: boolean = false

    constructor(canvas: HTMLElement) {

        // (window as any).aplication = this // Для разработки

        /** Инициализация */

        this.systemInfo = new SystemInfo()
        this.keybordListeners = new KeybordListeners(this)
        this.resources = new Resources();
        this.canvas = canvas

        this.sizes = new Sizes(canvas)
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.camera = new Camera(this)
        this.renderer = new Renderer(this)

        this.customBoxHelper = new CustomBoxHelper(this)
        this.ruler = new Ruler();
        this.geometryBuilder = new GeometryBuilder(this);
        this.meshEvents = new MeshEvents(this);
        this.setObject = new SetObject(this);

        this.world = new World(this)


        this.resources.startLoading(this.enviromentData!.texture, this.enviromentData!.type)

        // /** Привязка методов */

        this.resize = this.resize.bind(this)
        this.update = this.update.bind(this)

        this.sizes.on('resize', this.resize)
        this.time.on('tick', this.update)

        this.vueEvents()
        // this.checkLostContext()
    }

    get _camera() {
        return this.camera!.instance
    }

    get _orbitControls() {
        return this.camera!.controls
    }

    get _renderer() {
        return this.renderer!.instance
    }

    get _scene() {
        return this.scene
    }

    get _canvas() {
        return this.canvas
    }

    get _sizes() {
        return this.sizes
    }

    get _draft() {
        return this.draft
    }

    get _resources() {
        return this.resources
    }

    get _trafficManager() {
        return this.world!.trafficManager
    }

    get _geometryBuilder() {
        return this.geometryBuilder
    }

    get _systemInfo() {
        return this.systemInfo
    }

    get _customBoxHelper() {
        return this.customBoxHelper
    }

    resize() {
        this.camera!.resize()
        this.renderer!.resize()
    }

    update() {
        this.camera!.update()
        this.renderer!.update()
    }

    destroy() {
        this.keybordListeners?.removeKeyListeners()
        this.sizes!.off('resize')
        this.sizes!.destroy();
        this.time!.off('tick')
        this.time?.tickStop();
        this.camera?.removeCamera()
        this.world!.removeVueEvents();
        this.renderer!.removeVueEvents();
        this.meshEvents!.removeVueEvents();
        this.world!.deepDispose.clearTotal(this.scene!);

        this.keybordListeners = null
        this.meshEvents = null
        this.enviromentData = null
        this.setObject = null
        this.resources = null
        this.sizes = null
        this.time = null
        this.scene = null
        this.camera = null
        this.renderer = null
        this.geometryBuilder = null
        this.world = null
        this.canvas = null
        // this.clearScene(this.scene, this.renderer.instance)

    }

    // checkLostContext() {
    //     this.canvas.addEventListener('webglcontextlost', (event) => {
    //         event.preventDefault();
    //         console.log('WebGL context lost');
    //     }, false);
    // }

    udateCamera(value: boolean) {
        this.camera!.ortoCamera = value
        this.camera!.setInstance()
        this.renderer!.camera = this.camera!.instance
        this.renderer!.setInstance()
    }

    vueEvents() {

        // this.eventsStore.on('A:CameraToggle', (value: boolean) => {
        //     this.draft = value
        //     this.udateCamera(value)
        //     this.world!.room.createShape.hideDraft()
        // })

        // this.meshEvents = new MeshEvents(this)
    }

}
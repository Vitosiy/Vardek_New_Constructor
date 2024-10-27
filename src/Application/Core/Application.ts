import * as THREE from "three"


import { Sizes } from "../Utils/Sizes"
import { Time } from "../Utils/Time"
import { Camera } from "./Camera";
import { Renderer } from "./Renderer";
import { World } from "./World";


import { useEventBus } from '../../store/appliction/useEventBus';
import { useAppData } from "@/store/appliction/useAppData";
import { MeshEvents } from '../Meshes/Utils/Events';

import { Resources } from "../Utils/Resources";

import { ENVIROMENT_MAP } from "../F-mockapi";

export class Application {

    /** Хранилища */
    eventsStore: ReturnType<typeof useEventBus> = useEventBus();
    appData: ReturnType<typeof useAppData> = useAppData();
    meshEvents: MeshEvents | null = null

    canvas: HTMLElement;
    sizes: Sizes;
    time: Time;
    scene: THREE.Scene;
    camera: Camera;
    renderer: Renderer;
    resources: Resources = new Resources();
    enviromentData: { [key: string]: any } = ENVIROMENT_MAP[0]
    world: World;

    draft: boolean = false

    constructor(canvas: HTMLElement) {

        (window as any).aplication = this // Для разработки

        /** Инициализация */

        this.canvas = canvas

        this.sizes = new Sizes(this.canvas)
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.camera = new Camera(this)

        this.renderer = new Renderer(this)
        this.world = new World(this)
        this.resources.startLoading(this.enviromentData.texture, this.enviromentData.type)

        // /** Привязка методов */

        this.resize = this.resize.bind(this)
        this.update = this.update.bind(this)

        this.sizes.on('resize', this.resize)
        this.time.on('tick', this.update)

        this.vueEvents()
        this.checkLostContext()
    }

    get _camera() {
        return this.camera.instance
    }

    get _orbitControls() {
        return this.camera.controls
    }

    get _renderer() {
        return this.renderer.instance
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
        return this.world.trafficManager
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update() {
        this.camera.update()
        this.renderer.update()
    }

    destroy() {

        this.sizes.off('resize')
        this.time.off('tick')
        this.removeVueEvents()
        this.clearScene(this.scene, this.renderer.instance)
  
    }

    clearScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        if (!scene || !renderer) return;

        // Очистка сцены
        const objects = [...scene.children];
        objects.forEach((child) => {
            // Удаление геометрий, материалов и текстур
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach((material) => {
                        material.map?.dispose();
                        material.dispose();
                    });
                } else {
                    child.material.map?.dispose();
                    child.material.dispose();
                }
            }
            // Удаление объекта из сцены
            scene.remove(child);
        });

        // Очищаем WebGL контекст
        renderer.dispose();

        // Удаляем все слушатели событий и контролы
        renderer.domElement.remove();
    }

    checkLostContext() {
        this.canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            console.log('WebGL context lost');
        }, false);
    }

    udateCamera(value: boolean) {
        this.camera.ortoCamera = value
        this.camera.setInstance()
        this.renderer.camera = this.camera.instance
        this.renderer.setInstance()
    }

    vueEvents() {

        this.eventsStore.on('A:CameraToggle', (value: boolean) => {
            this.draft = value
            this.udateCamera(value)
            this.world.room.createShape.hideDraft()
        })

        this.meshEvents = new MeshEvents(this)
    }

    removeVueEvents(){
        this.meshEvents?.removeVueEvents()
    }
}
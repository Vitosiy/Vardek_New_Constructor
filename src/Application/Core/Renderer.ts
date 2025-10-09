//@ts-nocheck
import * as THREE from "three"
// import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

import { Sizes } from "../Utils/Sizes"
import { useEventBus } from '@/store/appliction/useEventBus';

export class Renderer {

    parent: THREETypes.TApplication
    /** Глобальное хранилище Events */
    eventsStore: ReturnType<typeof useEventBus>
    sizes: Sizes
    canvas: HTMLElement
    camera: THREE.Camera | null = null
    scene: THREE.Scene | null = null

    instance: THREE.WebGLRenderer | any
    labelRenderer: CSS2DRenderer = new CSS2DRenderer();
    ratio: number

    enviroment: any
    resources: any
    antialiasing: boolean

    onSetQuality: (value: string) => void

    constructor(parent: THREETypes.TApplication) {

        this.antialiasing = true
        this.parent = parent

        this.sizes = parent._sizes
        this.canvas = parent._canvas
        this.scene = parent._scene
        this.camera = parent._camera

        this.ratio = this.sizes.pixelRatio

        this.eventsStore = useEventBus()

        this.onSetQuality = this.setQuality.bind(parent)

        this.setInstance();
        this.setLableRenderer()
        this.setQuality('medium')
        this.vueEvents()

    }

    get _instance(){
        return this.instance
    }

    setInstance() {

        if (this.instance) {
            try {
                if (this.canvas.contains(this.instance.domElement)) {
                    this.canvas.removeChild(this.instance.domElement);
                }

                // Безопасно освобождаем ресурсы старого рендерера
                if (typeof this.instance.dispose === 'function') {
                    try {
                        this.instance.dispose();
                    } catch (error) {
                        console.warn('Ошибка при dispose старого рендерера:', error);
                    }
                }
            } catch (error) {
                console.warn('Ошибка при очистке старого рендерера:', error);
            }
        }

        try {
            this.instance = new THREE.WebGLRenderer({
                antialias: this.antialiasing,
                preserveDrawingBuffer: true
            });

            this.instance.outputColorSpace = THREE.SRGBColorSpace;
            this.instance.setSize(this.sizes.width, this.sizes.height);
            this.instance.setPixelRatio(this.sizes.pixelRatio);
            this.instance.setClearColor('#cccccc')
            this.instance.logarithmicDepthBuffer = true
            // this.instance.shadowMap.autoUpdate = true;
            this.canvas.appendChild(this.instance.domElement)

            this.instance.physicallyCorrectLights = true;
            this.instance.shadowMap.enabled = true;
            this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
            this.instance.toneMapping = THREE.ReinhardToneMapping;
            this.instance.toneMappingExposure = 1.8;
            this.instance.receiveShadow = true;
        } catch (error) {
            console.error('Ошибка при создании нового WebGL рендерера:', error);
        }

    }

    setLableRenderer() {
        this.labelRenderer.setSize(this.sizes.width, this.sizes.height);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.canvas.appendChild(this.labelRenderer.domElement);
    }

    // toggleAntialias(params: string) {
    //     if (!this.antialiasing && params == 'hight') {
    //         this.antialiasing = true
    //         this.setInstance()
    //         return
    //     }
    //     if (this.antialiasing && params != 'hight') {
    //         this.antialiasing = false
    //         this.setInstance()
    //         return
    //     }
    // }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.labelRenderer.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(this.ratio))
    }

    update() {

        if (!this.scene || !this.camera) return
        this.instance.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }

    setQuality(params: string) {

        switch (params) {
            case 'low':
                // this.toggleAntialias('low')

                this.instance.physicallyCorrectLights = false;
                this.instance.shadowMap.enabled = true;

                this.instance.shadowMap.type = THREE.BasicShadowMap;
                this.instance.toneMapping = THREE.ReinhardToneMapping;
                this.instance.toneMappingExposure = 1.8;
                this.instance.receiveShadow = true;

                this.instance.shadowMap.needsUpdate = true
                this.instance.setPixelRatio(1);
                break;
            case 'medium':
                // this.toggleAntialias('medium')

                this.instance.physicallyCorrectLights = false;
                this.instance.shadowMap.enabled = true;
                this.instance.shadowMap.type = THREE.BasicShadowMap;
                this.instance.toneMapping = THREE.ReinhardToneMapping;
                this.instance.toneMappingExposure = 1.8;
                this.instance.receiveShadow = true;
                // this.instance.shadowMap.autoUpdate = true;
                this.instance.shadowMap.needsUpdate = true
                this.instance.setPixelRatio(this.sizes.pixelRatio);
                break;
            case 'hight':
                // this.toggleAntialias('hight')

                this.instance.physicallyCorrectLights = true;
                this.instance.shadowMap.enabled = true;
                this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
                this.instance.toneMapping = THREE.ReinhardToneMapping;
                this.instance.toneMappingExposure = 1.8;
                this.instance.receiveShadow = true;
                // this.instance.shadowMap.autoUpdate = true;
                this.instance.shadowMap.needsUpdate = true
                this.instance.setPixelRatio(this.sizes.pixelRatio);


                break;
            default:
                throw new Error(`Качество ${params}`);
        }
    }

    vueEvents() {

        this.onSetQuality = (value) => {
            this.setQuality(value)
        }

        this.eventsStore.on('A:Quality', this.onSetQuality)

    }

    removeVueEvents() {
        this.eventsStore.off('A:Quality', this.onSetQuality)

        // Безопасная очистка WebGL рендерера
        if (this.instance) {
            try {
                // Очищаем DOM элементы
                this.cleanupRenderer(this.instance)
                this.cleanupRenderer(this.labelRenderer)

                // Безопасно освобождаем ресурсы рендерера
                if (this.instance.renderLists && typeof this.instance.renderLists.dispose === 'function') {
                    try {
                        this.instance.renderLists.dispose();
                    } catch (error) {
                        console.warn('Ошибка при освобождении renderLists:', error);
                    }
                }

                // Освобождаем ресурсы рендерера
                if (typeof this.instance.dispose === 'function') {
                    try {
                        this.instance.dispose();
                    } catch (error) {
                        console.warn('Ошибка при dispose рендерера:', error);
                    }
                }

                // Очищаем ссылки
                this.instance.domElement = null;
                this.instance = null;
            } catch (error) {
                console.error('Ошибка при очистке WebGL рендерера:', error);
            }
        }
    }

    cleanupRenderer(renderer) {
        if (!renderer || !renderer.domElement) {
            return;
        }

        try {
            // Проверяем, не является ли это PIXI рендерером
            if (renderer.constructor && renderer.constructor.name && 
                renderer.constructor.name.toLowerCase().includes('pixi')) {
                console.warn('Обнаружен PIXI рендерер, пропускаем очистку DOM элементов');
                return;
            }

            // Удаляем все дочерние элементы
            const rendererElements = renderer.domElement.querySelectorAll('*');
            rendererElements.forEach((element) => {
                if (element && element.remove) {
                    try {
                        element.remove();
                    } catch (error) {
                        console.warn('Ошибка при удалении элемента:', error);
                    }
                }
            });

            // Удаляем DOM элемент из родителя
            if (renderer.domElement.parentElement) {
                try {
                    renderer.domElement.parentElement.removeChild(renderer.domElement);
                } catch (error) {
                    console.warn('Ошибка при удалении DOM элемента из родителя:', error);
                }
            }

            // Очищаем ссылку на DOM элемент
            renderer.domElement = null;
        } catch (error) {
            console.warn('Ошибка при очистке DOM элементов рендерера:', error);
        }
    }
}
//@ts-nocheck
import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// import { useAppContext } from "@/store/useAppContext"
import { useSceneState } from "@/store/appliction/useSceneState"
import { useEventBus } from "@/store/appliction/useEventBus";

import { Sizes } from "../Utils/Sizes"

export class Camera {

    eventBuss: ReturnType<typeof useEventBus> = useEventBus()
    sizes: Sizes
    canvas: HTMLElement
    parent: THREETypes.TApplication

    scene: THREE.Scene
    instance: THREE.Camera | any = null
    controls: OrbitControls | null = null
    params: THREEInterfases.ICameraData
    ortoParams: THREEInterfases.IOrtoCameraData
    ortoCamera: boolean = false
    screenSpacePanning: boolean = false
    keybordListeners: TKeybordListeners

    private onKeyDown: (event) => void;
    private onKeyUp: (event) => void


    constructor(parent: THREETypes.TApplication) {

        this.parent = parent
        this.keybordListeners = parent.keybordListeners
        this.sizes = parent.sizes
        this.canvas = parent.canvas
        this.params = useSceneState().getStartCameraData
        this.ortoParams = useSceneState().getStartOrtoCameraData
        this.scene = parent.scene

        this.onKeyDown = this.keyDown.bind(this)
        this.onKeyUp = this.keyUp.bind(this)

        this.setInstance();
        this.setOrbitControls();
        this.setupKeys()
    }

    get _controls() {
        return this.controls
    }

    setupKeys() {
        this.keybordListeners.addKeydownCallback(this.onKeyDown)
        this.keybordListeners.addKeyupCallback(this.onKeyUp)
    }

    keyDown(event) {

        if (event.ctrlKey || event.metaKey) {
           
            this.controls.screenSpacePanning = true
            // console.log('screenSpacePanning TRUE')
        }
    }

    keyUp(event) {

        if (!event.ctrlKey || !event.metaKey) {
            this.controls.screenSpacePanning = false
            // console.log('screenSpacePanning FALSE')
        }

    }

    screenPanningChange() {
        this.screenSpacePanning = !this.screenSpacePanning
    }

    setInstance(): void {
        this.instance = new THREE.PerspectiveCamera(this.params.fov, this.sizes.width / this.sizes.height, this.params.near, this.params.far)
        this.instance.position.set(...this.params.position)
        this.instance.lookAt(this.params.target.x, this.params.target.y, this.params.target.z)
        this.scene.add(this.instance)
        this.resize()
    }

    setOrbitControls(): void {

        this.controls = new OrbitControls(this.instance as THREE.Camera, this.canvas)

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.2
        this.controls.target.set(this.params.target.x, this.params.target.y, this.params.target.z)
        this.controls.maxDistance = 15000
        this.controls.minDistance = 3000
        this.controls.enableRotate = true;
        this.controls.minZoom = 10;
        this.controls.maxZoom = 50;
        this.controls.screenSpacePanning = false
    }

    resetOrbitControls(): void {
        if (this.controls instanceof OrbitControls) {
            this.controls.dispose();
            this.controls = null
            this.setOrbitControls();
        }
    }

    resize(): void {
        let aspect = this.sizes.width / this.sizes.height;

        if (this.ortoCamera) {
            this.instance!.left = (this.sizes.width / -2) * 0.01;
            this.instance!.right = (this.sizes.width / 2) * 0.01;
            this.instance!.top = (this.sizes.height / 2) * 0.01;
            this.instance!.bottom = (this.sizes.height / -2) * 0.01
        } else {
            this.instance!.aspect = aspect;
        }
        this.instance?.updateProjectionMatrix()
    }

    update() {
        if (this.instance instanceof THREE.OrthographicCamera) return
        this.controls!.update()
    }

    removeCamera() {
    }

}
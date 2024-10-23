
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

    scene: THREE.Scene
    instance: THREE.Camera | any = null
    controls: OrbitControls | null = null
    params: THREEInterfases.ICameraData
    ortoParams: THREEInterfases.IOrtoCameraData
    ortoCamera: boolean = false


    constructor(parent: THREETypes.TApplication) {

        this.sizes = parent.sizes
        this.canvas = parent.canvas
        this.params = useSceneState().getStartCameraData
        this.ortoParams = useSceneState().getStartOrtoCameraData

        this.scene = parent.scene

        this.setInstance();
        this.setOrbitControls();
    }

    get _controls() {
        return this.controls
    }

    setInstance(): void {

        switch (this.ortoCamera) {
            case false:
                this.scene.children.forEach(child => {
                    if (child instanceof THREE.PerspectiveCamera) {
                        this.instance = child
                        this.instance.lookAt(this.params.target.x, this.params.target.y, this.params.target.z)
                        this.resetOrbitControls()
                        this.resize()
                        return
                    }
                })

                if (!(this.instance instanceof THREE.PerspectiveCamera) && this.instance == null) {
                    this.instance = new THREE.PerspectiveCamera(this.params.fov, this.sizes.width / this.sizes.height, this.params.near, this.params.far)
                    this.instance.position.set(...this.params.position)
                    this.instance.lookAt(this.params.target.x, this.params.target.y, this.params.target.z)
                    this.scene.add(this.instance)
                    this.resize()
                }

                break;

            case true:

                this.scene.children.forEach(child => {
                    if (child instanceof THREE.OrthographicCamera) {
                        this.instance = child
                        this.instance.position.set(...this.ortoParams.position)
                        this.instance.rotateZ(Math.PI * 0.5)
                        this.resetOrbitControls()
                        this.resize()
                        return
                    }
                })

                if (!(this.instance instanceof THREE.OrthographicCamera)) {

                    this.instance = new THREE.OrthographicCamera(this.sizes.width / -2 * 0.01,
                        this.sizes.width / 2 * 0.01,
                        this.sizes.height / 2 * 0.01,
                        this.sizes.height / -2 * 0.01,
                        0.01,
                        100)

                    // this.instance.position.set(...this.ortoParams.position);

                    this.instance.position.set(...this.ortoParams.position);
                    this.instance.lookAt(new THREE.Vector3(0, 0, 0))
                    this.instance.rotation.z = Math.PI * 0.5;
                    this.instance.updateMatrixWorld();
                    this.scene.add(this.instance)

                    this.resetOrbitControls()
                    this.resize()

                }
                break;
        }
    }

    setOrbitControls(): void {


        this.controls = new OrbitControls(this.instance as THREE.Camera, this.canvas)

        // Вращение камеры
        if (this.instance instanceof THREE.OrthographicCamera) {

            this.controls.minZoom = 0.5 * 0.001
            this.controls.maxZoom = 3 * 0.001
            this.controls.target.set(0, 0, 0)
            this.controls.minAzimuthAngle = Math.PI * 0.5; // Ограничить вращение по оси Z
            this.controls.maxAzimuthAngle = Math.PI * 0.5;
            this.controls.update();
            this.controls.enableRotate = false;
           
            return
        }

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

}
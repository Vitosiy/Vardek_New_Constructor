//@ts-nocheck

import * as THREE from "three";
import * as THREETypes from "@/types/types"

import { OBBHelper } from "./CalculateBoundingBox";


export class CustomBoxHelper {

    private scene: THREE.Scene
    private selectedObject: THREE.Object3D | null = null;
    private boxHelper: THREE.Mesh |THREE.BoxHelper| null = null;
    private root: THREETypes.TApplication
    private obbh: OBBHelper

    constructor(selectedObject: THREE.Mesh | null, scene: THREE.Scene, root: THREETypes.TApplication) {

        this.scene = scene
        this.selectedObject = selectedObject
        this.root = root
        this.obbh = new OBBHelper()

    }

    get _boxHelperCheck() {
        return this.boxHelper
    }

    get _currentObject() {
        return this.root._trafficManager?._currentObject
    }

    set _boxHelperCheck(value) {
        this.boxHelper = value
    }

    addBoxHelper(object: any) {

        this.selectedObject = object

        if (this.selectedObject) {

            this.boxHelper= new THREE.BoxHelper(this.selectedObject,  0x00ff00)

            // console.log(this.boxHelper, '!!this.boxHelper')
            this.boxHelper.material.depthTest = false;
            this.boxHelper.material.depthWrite = false;
            this.boxHelper.material.opacity = 0.5

            this.boxHelper.material.transparent = true

            this.boxHelper.renderOrder = 1
            this.scene.add(this.boxHelper);
            this.boxHelper.update()

            // const obb = this.selectedObject.userData.obb
            // const size = this.selectedObject.userData.trueSizes

            // const trashhold = 15


            // const geometry = new THREE.BoxGeometry(size.x * 2 + trashhold, size.y * 2 + trashhold, size.z * 2 + trashhold);
            // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.25 });
            // this.boxHelper = new THREE.Mesh(geometry, material);
            // this.boxHelper.userData.obb = obb
            // this.boxHelper.userData.name = 'boxHelper'
            // this.boxHelper.renderOrder = 1


            // const matrix4 = new THREE.Matrix4();
            // matrix4.setFromMatrix3(obb.rotation);

            // const quaternion = new THREE.Quaternion();
            // quaternion.setFromRotationMatrix(matrix4);

            // this.boxHelper.position.copy(this.selectedObject.position);

            // this.boxHelper.rotation.copy(this.selectedObject.rotation);

            // // this.boxHelper.updateMatrixWorld(true)

            // this.scene.add(this.boxHelper);

            // this.updateBoxHelper()

        }
    }

    updateBoxHelper() {

        if (this.boxHelper && this.selectedObject) {
            this.boxHelper.update()
            // this.boxHelper.position.copy(this.selectedObject.position)
            // this.boxHelper.rotation.copy(this.selectedObject.rotation)
        }
    }

    removeBoxHelper() {
        if (this.boxHelper) {
            this.scene.remove(this.boxHelper);
            this.boxHelper.geometry.dispose();
            (this.boxHelper.material as THREE.Material).dispose();
            this.boxHelper = null;
        }
    }
}
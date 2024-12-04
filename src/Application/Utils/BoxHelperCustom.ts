import * as THREE from "three";
import * as THREETypes from "@/types/types"
import { OBB } from 'three/examples/jsm/math/OBB.js';
import { OBBHelper } from "./CalculateBoundingBox";
import { separateArrows } from "./CalculateBoundingBox";

export class CustomBoxHelper {

    private scene: THREE.Scene
    private selectedObject: THREE.Object3D | null = null;
    private boxHelper: THREE.Mesh | null = null;
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

            const obb = this.selectedObject.userData.obb
            const trashhold = 15
  

            const geometry = new THREE.BoxGeometry(obb.halfSize.x * 2 + trashhold, obb.halfSize.y * 2 + trashhold, obb.halfSize.z * 2 + trashhold);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.25 });
            this.boxHelper = new THREE.Mesh(geometry, material);
            this.boxHelper.userData.obb = obb
            this.boxHelper.userData.name = 'boxHelper'
            this.boxHelper.renderOrder = 1


            const matrix4 = new THREE.Matrix4();
            matrix4.setFromMatrix3(obb.rotation);

            const quaternion = new THREE.Quaternion();
            quaternion.setFromRotationMatrix(matrix4);

            this.boxHelper.position.copy(obb.center);

            this.boxHelper.quaternion.copy(quaternion);

            this.scene.add(this.boxHelper);

            this.updateBoxHelper()

        }
    }

    updateBoxHelper() {

        if (this.boxHelper && this.selectedObject) {

            this.boxHelper.position.copy(this.selectedObject.position)
            this.boxHelper.rotation.copy(this.selectedObject.rotation)

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
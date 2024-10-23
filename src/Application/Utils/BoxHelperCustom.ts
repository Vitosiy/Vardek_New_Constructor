import * as THREE from "three";
import { separateArrows } from "./CalculateBoundingBox";

export class CustomBoxHelper {

    scene: THREE.Scene
    selectedObject: THREE.Object3D | null = null;
    boxHelper: THREE.Mesh | null = null;
    bb: any

    constructor(selectedObject: THREE.Mesh | null, scene: THREE.Scene) {

        this.scene = scene
        this.selectedObject = selectedObject

    }

    get _boxHelperCheck() {
        return this.boxHelper
    }

    set _boxHelperCheck(value) {
        this.boxHelper = value
    }

    addBoxHelper(object: any) {

        this.selectedObject = object

        if (this.selectedObject) {

            // const boundingBox = new THREE.Box3()
            // separateArrows(this.selectedObject, boundingBox)
 

            const boundingBox = new THREE.Box3().setFromObject(this.selectedObject!);
            const vec = new THREE.Vector3()
            const size = boundingBox.getSize(vec)
          
            const objectWidth = Math.round(size.x) + 15;
            const objectHeight = Math.round(size.y) + 10;
            const objectDepth = Math.round(size.z) + 15;


            const boxGeometry = new THREE.BoxGeometry(objectWidth, objectHeight, objectDepth);

            const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.25 });

            this.boxHelper = new THREE.Mesh(boxGeometry, boxMaterial);
            this.boxHelper.renderOrder = 1
            this.boxHelper.userData.name = 'boxHelper'

            this.boxHelper.position.copy(this.selectedObject.position);
            this.updateBoxHelper()
            this.scene.add(this.boxHelper);
        }
    }

    updateBoxHelper() {

        if (this.boxHelper && this.selectedObject) {
            // const boundingBox = new THREE.Box3().setFromObject(this.selectedObject!);
            
            const boundingBox = new THREE.Box3()
            separateArrows(this.selectedObject, boundingBox)

            const center = boundingBox.getCenter(new THREE.Vector3());
            this.boxHelper.position.copy(center);
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
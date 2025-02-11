
import * as THREE from "three"
import * as THREETypes from "@/types/types"

export class AlumBulider {

    parent: THREETypes.TBuildProduct
    resources: THREETypes.TResources
    alumTextures = new URL('@/assets/metall', import.meta.url).href + "/"

    constructor(parent: THREETypes.TBuildProduct) {

        this.parent = parent
        this.resources = parent.resources
    }

    createAlum({ fasade, data}: { fasade: THREE.Object3D, data: number | string}) {

        fasade.traverse((children: THREE.Object3D) => {

            fasade.visible = true

            if (children instanceof THREE.Mesh && children.userData.type != 'glass') {

                !children.userData.ORIGINAL_COLOR ? children.userData.ORIGINAL_COLOR = children.material : ''

                children.material = new THREE.MeshStandardMaterial();

                this.resources.startLoading(`${this.alumTextures}metal_roughness.jpg`, 'localTexture', (file) => {
                    children.material.roughnessMap = file
                    children.material.roughnessMap.wrapS = children.material.roughnessMap.wrapT = THREE.RepeatWrapping;
                    children.material.roughnessMap.repeat.set(
                        1 / 512,
                        1 / 512
                    );
                    children.material.roughnessMap.offset.set(0.5, 0.5);
                    children.material.needsUpdate = true;
                })

                this.resources.startLoading(`${this.alumTextures}metal_metallic.jpg`, 'localTexture', (file) => {
                    children.material.metallicMap = file
                    children.material.metallicMap.wrapS = THREE.RepeatWrapping;
                    children.material.metallicMap.wrapT = THREE.RepeatWrapping;
                    children.material.metallicMap.repeat.set(
                        1 / 512,
                        1 / 512
                    );
                    children.material.metallicMap.offset.set(0.5, 0.5);
                    children.material.needsUpdate = true;
                })

                children.material.color.set(`${data.COLOR}`)
                children.material.metalness = 0.5
                children.material.roughness = 0.5

                // children.material.clearcoat = 1
                // children.material.clearcoatRoughness = 0

                children.material.receiveShadow = true;
                children.material.castShadow = true;
                children.material.encoding = THREE.SRGBColorSpace;

                children.material.needsUpdate = true;
            }
        })
    }

}
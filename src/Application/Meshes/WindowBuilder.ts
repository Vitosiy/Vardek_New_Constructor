//@ts-nocheck
import * as THREE from 'three';
import * as THREETypes from "@/types/types"
import { MillingBuilder } from './MillingBuilder';

export class WindowBuilder extends MillingBuilder {

    constructor(root: THREETypes.TApplication) {
        super(root)
    }

    createWindow({
        fasade,
        fasadePosition,
        data,
        defaultGeometry

    }) {
        this.createMillingFasade(fasade, fasadePosition, data, defaultGeometry);
        this.createGlass(fasade, fasadePosition)
    }

    createGlass(fasade, fasadePosition) {
        const aabb = new THREE.Box3().setFromObject(fasade);
        const size = new THREE.Vector3()
        aabb.getSize(size);
        const offset = 10

        const params = {
            width: size.x - offset,
            height: size.y - offset,
            depth: 5,
            material:{
                reflectivity: 1,
                transmission: 1.0,
                roughness: 0.1,
                metalness: 0.2,
                color: new THREE.Color(0xffffff),
                ior: 1.2,
                thickness: 10.0,
            }

        }

        const geometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
        const material = new THREE.MeshPhysicalMaterial({ ...params.material });
        const mesh = new THREE.Mesh(geometry,material);
        mesh.position.z = 10
        mesh.userData.type = 'glass'
        fasade.add(mesh)
    }


}  
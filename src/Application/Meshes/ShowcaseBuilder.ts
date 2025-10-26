// @ts-nocheck
import { toRaw } from 'vue';
import * as THREE from 'three';
import { TApplication, TDeepDispose } from "@/types/types"
// import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
// import { CSG } from 'three-csg-ts';

import { MillingBuilder } from './MillingBuilder';
import { useModelState } from "@/store/appliction/useModelState";

export class ShowcaseBuilder extends MillingBuilder {
    scene: THREE.Scene
    clear: TDeepDispose
    private modelState = useModelState()

    constructor(root: TApplication) {
        super(root)
        this.scene = root._scene!
        this.clear = root._deepDispose!
    }

    createShowcase({
        fasade,
        fasadePosition,
        data,
        defaultGeometry,
        alum

    }) {

        console.log(data,alum, 'SHOWCASE')

        const showcaseData = alum ?? data

        this.createMillingFasade(fasade, fasadePosition, showcaseData, defaultGeometry);
        this.createGlass(fasade, fasadePosition, alum)
        // this.createHeandless(fasade, fasadePosition)
    }

    createGlass(fasade, fasadePosition, alum) {

        let offset = alum ? 2 : 10
        let zPos = alum ? 10 : 10

        const { FASADE_WIDTH, FASADE_HEIGHT } = fasade.userData.trueSize

        const glassId = toRaw(this.modelState.getCurrentGlassData[0])
        // console.log(glassId, '--glassId')

        const glassColor = glassId ? `#${glassId.COLOR}` : '#ffffff'

        let roughness

        if (glassId) {
            roughness = glassId.NAME.toLowerCase().includes('матовое') ? 0.2 : 0.05
        }
        else {
            roughness = 0.05
        }


        const params = {
            width: FASADE_WIDTH - offset,
            height: FASADE_HEIGHT - offset,
            depth: 5,
            material: {
                reflectivity: 1,
                transmission: 0.95,
                roughness: roughness,
                metalness: 0.25,
                color: glassColor,
                ior: 1.5,
                thickness: 0.5,
                clearcoat: 0.1,
                clearcoatRoughness: 0.1,
                opacity: 0.8,
            }

        }

        const geometry = new THREE.BoxGeometry(params.width, params.height, params.depth);
        const material = new THREE.MeshPhysicalMaterial({ ...params.material });
        material.encoding = THREE.SRGBColorSpace;

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = zPos
        mesh.userData.type = 'glass'

        if (!fasade.children.some(obj => obj.userData.type === 'glass')) {
            fasade.add(mesh)
        }

    }

    changeGlassColor({ fasade, glassId }) {

        const glassData = this._GLASS[glassId]
        const glassColor = `#${glassData.COLOR}`

        const roughness = glassData.NAME.toLowerCase().includes('матовое') ? 0.2 : 0.05

        // console.log(roughness, glassData, 'AFCHANGE')

        fasade.traverse(children => {
            if (children instanceof THREE.Mesh && children.userData.type == 'glass') {
                children.material.color.set(glassColor)
                children.material.roughness = roughness
                children.material.needsUpdate = true
            }
        })
    }

    createHeandless(fasade, fasadePosition, incomePosition) {

        const type = this.modelState.getCurrentFasadeTypesData
        const { FASADE_WIDTH, FASADE_HEIGHT, FASADE_DEPTH } = fasade.userData.trueSize

        if (type.length == 0) {
            fasade.traverse((child: THREE.Object3D) => {
                if (child instanceof THREE.Mesh) {
                    if (child.userData.type === 'hendless') {
                        this.clear.clearObjectFromParrent(child)

                    }
                }
            })
            return
        }

        const hendlePath = `
        <svg>
        <path d=" M -1.5 0 L 1.5 0 L 1.5 -12 L -10 -12 L -10 -10 L -1.523 -7 Z"/>
        </svg>`

        const paths = this.svgLoader.parse(hendlePath).paths
        // console.log(paths)
        const shape = paths[0].toShapes()
        const depth = FASADE_WIDTH * 0.85

        const geometry = new THREE.ExtrudeGeometry(
            shape,
            { steps: 1, depth, bevelEnabled: false }
        );
        const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, transparent: true, opacity: 1 });
        const shapeMesh = new THREE.Mesh(geometry, material);
        shapeMesh.position.z = 16
        shapeMesh.position.x = depth * -0.5
        shapeMesh.position.y = FASADE_HEIGHT * -0.5 + 1.5
        shapeMesh.rotateY(Math.PI * 0.5)
        shapeMesh.rotateZ(Math.PI * -0.5)

        shapeMesh.userData.type = 'hendless'
        if (!fasade.children.some(obj => obj.userData.type === 'hendless')) {
            fasade.add(shapeMesh)
        }

    }

}  
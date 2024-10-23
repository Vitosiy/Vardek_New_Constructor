
import * as THREE from "three"
import * as THREETypes from "@/types/types"

import { Resources } from '../Utils/Resources'
import { BuildProduct } from './BuildProduct'

export class ModelsBuilder {

    root: BuildProduct
    resources: Resources
    ruler: THREETypes.TRuler

    constructor(root: BuildProduct) {
        this.root = root
        this.resources = root.resources
        this.ruler = root.ruler

    }

    create(url: string, onLoad: (object: THREE.Object3D) => void, props: THREETypes.TObject) {

        const arrows = new THREE.Object3D()
        const type = props.CONFIG.MODEL.model_type


        this.resources.startLoading(url, type, (file: any) => {

            const box = new THREE.Box3().setFromObject(file);
            const point = new THREE.Vector3()
            const size = box.getSize(point)


            file.userData.PROPS = props
            file.userData.PROPS.CONFIG.ORIGIN = true

            file.traverse((child: any) => {
                if (child instanceof THREE.Mesh) {

                    if (child.material.map) {
                        child.material.map.encoding = THREE.SRGBColorSpace;
                        child.material.emissiveMap = child.material.map;
                        child.material.emissive = new THREE.Color(0xffffff);
                        child.material.emissiveIntensity = 0.1
                        child.material.needsUpdate = true;
                    }
                }
            })

            /** Добавляем стрелки размеров */

            let ruler = this.ruler.drawRullerObjects(file)
            ruler.forEach(item => {
                for (let i in item) {
                    arrows.add(item[i])
                }
            })

            file.add(arrows)


            onLoad(file)
        })
        return
    }
}
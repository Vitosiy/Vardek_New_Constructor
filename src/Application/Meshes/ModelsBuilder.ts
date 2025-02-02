// @ts-nocheck 31

import * as THREE from "three"
import * as THREETypes from "@/types/types"

import { Resources } from '../Utils/Resources'
import { BuildProduct } from './BuildProduct'
import { OBB } from 'three/examples/jsm/math/OBB.js';

export class ModelsBuilder {

    root: BuildProduct
    resources: Resources
    ruler: THREETypes.TRuler

    constructor(root: BuildProduct) {
        this.root = root
        this.resources = root.resources
        this.ruler = root.ruler

    }

    create(url: any, onLoad: (object: THREE.Object3D) => void, props: THREETypes.TObject) {

        const arrows = new THREE.Object3D()
        const model = props.CONFIG.MODEL



        this.resources.startLoading(url, model.model_type, (file: any) => {

            if (!file) {
                console.error('Модель не может быть загружена', file)
            }
            //3689569

            let aabb = new THREE.Box3().setFromObject(file);
            const center = new THREE.Vector3();
            aabb.getCenter(center);
            let size = aabb.getSize(center)


            file.traverse((child: any) => {
                if (child instanceof THREE.Mesh) {

                    if (model.scale > 1) {
                        // Центрируем геометрию
                        child.geometry.center();
                        // Масштабируем объект
                        child.scale.set(model.scale, model.scale, model.scale);
                        child.position.y = 0
                        child.position.x = 0
                        child.position.z = 0
                    }

                    else{
                        child.position.sub(center);
                        child.position.y += size.y / 2
                        child.position.x = 0
                        child.position.z = 0
                    }


                    if (child.material.map) {
                        child.material.map.encoding = THREE.SRGBColorSpace;
                        child.material.emissiveMap = child.material.map;
                        child.material.emissive = new THREE.Color(0xffffff);
                        child.material.emissiveIntensity = 0.1
                        // child.material.needsUpdate = true;

                        child.material.map.generateMipmaps = true;
                        child.material.map.minFilter = THREE.LinearMipmapLinearFilter; // Включение mipmaps
                        child.material.map.maxFilter = THREE.LinearFilter;
                        child.material.map.needsUpdate = true; // Обновление текстуры

                    }

                    if (child.material.normalMap) {
                        child.material.normalMap.generateMipmaps = true;
                        child.material.normalMap.minFilter = THREE.LinearMipmapLinearFilter;
                        child.material.normalMap.needsUpdate = true;
                    }
                }

            })

            if (model.scale > 1) {
                file.position.copy(center);
            }

            file.userData.PROPS = props


            // parentObject.updateMatrixWorld(true)

            let box = new THREE.Box3().setFromObject(file);
            let boxSize = box.getSize(center)

            let obb = new OBB();
            obb = obb.fromBox3(box);


            file.userData.obb = obb
            file.userData.trueDepth = boxSize.z * 0.5
            file.userData.trueHeight = boxSize.y * 0.5
            file.userData.trueLength = boxSize.x * 0.5
            file.userData.trueSizes = {
                z: boxSize.z * 0.5, y: boxSize.y * 0.5, x: boxSize.x * 0.5
            }

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
//@ts-nocheck
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

    create(url: any, onLoad: (object: THREE.Object3D) => void, props: THREETypes.TObject, sizeRulers: boolean = true) {

        const arrows = new THREE.Object3D()
        const model = props.CONFIG.MODEL
        // console.log(model, 'TT')


        this.resources.startLoading(url, model.model_type, (file: any) => {

            if (!file) {
                console.error('Модель не может быть загружена', file)
            }

            const parentObject = new THREE.Object3D()

            // console.log(model.id, 'CCreate')

            //3689569

            const aabb = new THREE.Box3().setFromObject(file);
            const center = new THREE.Vector3();
            aabb.getCenter(center);
            let size = aabb.getSize(center)

            file.traverse((child: any) => {
                if (child instanceof THREE.Mesh) {

                    // child.geometry.center();

                    child.scale.set(model.scale, model.scale, model.scale)
                    child.position.sub(center);
                    child.position.y += size.y / 2
                    child.position.x = 0
                    child.position.z = 0
                    // child.geometry.translate(0, -size.y * 0.5, 0);


                    if (child.material.map) {
                        child.material.map.encoding = THREE.SRGBColorSpace;
                        child.material.emissiveMap = child.material.map;
                        child.material.emissive = new THREE.Color(0xffffff);
                        child.material.emissiveIntensity = 0.1
                        child.material.needsUpdate = true;

                        child.material.map.generateMipmaps = true;
                        child.material.map.minFilter = THREE.LinearMipmapLinearFilter; // Включение mipmaps
                        child.material.map.needsUpdate = true; // Обновление текстуры

                    }
                    if (child.material.normalMap) {
                        child.material.normalMap.generateMipmaps = true;
                        child.material.normalMap.minFilter = THREE.LinearMipmapLinearFilter;
                        child.material.normalMap.needsUpdate = true;
                    }
                }

            })

            /** Добавляем стрелки размеров */

            if(sizeRulers) {
                let ruler = this.ruler.drawRullerObjects(file)
                ruler.forEach(item => {
                    for (let i in item) {
                        arrows.add(item[i])
                    }
                })
            }

            // file.add(file)
            file.userData.PROPS = props


            parentObject.position.sub(center);
            parentObject.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    // Создаем матрицу смещения
                    // const offsetMatrix = new THREE.Matrix4();
                    // // offsetMatrix.makeTranslation(-size.x * 0.5, -size.y * 0.5, -size.z * 0.5);
                    // // Применяем смещение
                    // child.geometry.applyMatrix4(offsetMatrix);
                }
            })


            // parentObject.updateMatrixWorld(true)

            let obb = new OBB();
            obb = obb.fromBox3(aabb);

            file.userData.obb = obb
            file.userData.aabb = aabb

            file.userData.trueSizes = {
                DEPTH: size.z * 0.5, HEIGHT: size.y * 0.5, WIDTH: size.x * 0.5
            }

            file.add(arrows)

            onLoad(file)
        })
        return
    }
}
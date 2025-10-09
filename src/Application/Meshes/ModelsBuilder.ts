//@ts-nocheck
import * as THREE from "three"
import * as THREETypes from "@/types/types"
import { TBuildProduct } from "@/types/types"

import { Resources } from '../Utils/Resources'
import { BuildProduct } from './BuildProduct'
import { OBB } from 'three/examples/jsm/math/OBB.js';

interface CreateParams {
    url?: string;
    onLoad: (object: THREE.Object3D) => void;
    props: THREETypes.TObject;
    sizeRulers?: boolean; // Опциональный параметр, так как есть значение по умолчанию
}

export class ModelsBuilder {

    parent: TBuildProduct
    resources: Resources
    ruler: THREETypes.TRuler

    constructor(parent: TBuildProduct) {
        this.parent = parent
        this.resources = parent.resources
        this.ruler = parent.ruler

    }

    public create(params: CreateParams) {
        const { url, onLoad, props, sizeRulers = true } = params;

        const arrows = new THREE.Object3D()
        const model = this.parent._MODELS[props.CONFIG.MODELID]
        const path = url ?? model.file ?? model.DAE

        this.resources.startLoading(path, model.model_type, (file: any) => {

            if (!file) {
                console.error('Модель не может быть загружена', file)
            }

            const normolized = this.normalizeUploadedModel(file, model);
            normolized.name = 'MODEL'

            // const parentObject = new THREE.Object3D()

            // console.log(model.id, 'CCreate')

            //3689569

            const aabb = new THREE.Box3().setFromObject(normolized);
            const center = new THREE.Vector3();
            aabb.getCenter(center);
            let size = aabb.getSize(center)

            // file.traverse((child: any) => {
            //     if (child instanceof THREE.Mesh) {

            //         // child.geometry.center();

            //         child.scale.set(model.scale, model.scale, model.scale)
            //         child.position.sub(center);
            //         child.position.y += size.y / 2
            //         child.position.x = 0
            //         child.position.z = 0
            //         // child.geometry.translate(0, -size.y * 0.5, 0);


            //         if (child.material.map) {
            //             child.material.map.encoding = THREE.SRGBColorSpace;
            //             child.material.emissiveMap = child.material.map;
            //             child.material.emissive = new THREE.Color(0xffffff);
            //             child.material.emissiveIntensity = 0.1
            //             child.material.needsUpdate = true;

            //             child.material.map.generateMipmaps = true;
            //             child.material.map.minFilter = THREE.LinearMipmapLinearFilter; // Включение mipmaps
            //             child.material.map.needsUpdate = true; // Обновление текстуры

            //         }
            //         if (child.material.normalMap) {
            //             child.material.normalMap.generateMipmaps = true;
            //             child.material.normalMap.minFilter = THREE.LinearMipmapLinearFilter;
            //             child.material.normalMap.needsUpdate = true;
            //         }
            //     }

            // })

            /** Добавляем стрелки размеров */

            // if (sizeRulers) {
            //     const scale = 1 / model.scale
            //     let ruler = this.ruler.drawRullerObjects(normolized, scale)
            //     ruler.forEach(item => {
            //         for (let i in item) {
            //             arrows.add(item[i])
            //         }
            //     })
            // }

            // file.add(file)
            normolized.userData.PROPS = props


            // parentObject.position.sub(center);
            // parentObject.traverse(child => {
            //     if (child instanceof THREE.Mesh) {
            //         // Создаем матрицу смещения
            //         // const offsetMatrix = new THREE.Matrix4();
            //         // // offsetMatrix.makeTranslation(-size.x * 0.5, -size.y * 0.5, -size.z * 0.5);
            //         // // Применяем смещение
            //         // child.geometry.applyMatrix4(offsetMatrix);
            //     }
            // })


            // parentObject.updateMatrixWorld(true)

            let obb = new OBB();
            obb = obb.fromBox3(aabb);

            normolized.userData.obb = obb
            normolized.userData.aabb = aabb

            normolized.userData.trueSizes = {
                DEPTH: size.z * 0.5, HEIGHT: size.y * 0.5, WIDTH: size.x * 0.5
            }

            // normolized.add(arrows)

            onLoad(normolized)
        })
        return
    }

    public normalizeUploadedModel(model, params = {}) {
        // Проверяем входные параметры
        if (!model || !model.isObject3D) {
            throw new Error('Invalid model: Must be a valid THREE.Object3D');
        }

        // Центрируем модель
        const box = this.calculateUnionBoundingBox(model);
        if (!box) return model; // Возвращаем модель без изменений, если нет bounding box

        const center = new THREE.Vector3();
        box.getCenter(center);

        // Перемещаем геометрию модели
        const translateVector = center.negate(); // Инвертируем центр для смещения
        this.translateGeometry(model, translateVector);

        // Обновляем bounding box и матрицу
        model.unionBoundingBox = this.calculateUnionBoundingBox(model);
        model.updateMatrixWorld(true);

        // Применяем масштабирование
        const scale = params.scale || 1;
        const targetScale = new THREE.Vector3(
            params.width || scale,
            params.height || scale,
            params.depth || scale
        );

        if (params.width || params.height || params.depth) {
            this.changeModelScale(model, targetScale);
        } else {
            model.scale.set(scale, scale, scale);
        }

        return model;
    }

    private changeModelScale(model, scaleVector = new THREE.Vector3(1, 1, 1)) {
        if (!model || !model.isObject3D) {
            throw new Error('Invalid model: Must be a valid THREE.Object3D');
        }

        const box = this.calculateUnionBoundingBox(model);
        if (!box) return;

        const size = new THREE.Vector3();
        box.getSize(size);

        // Вычисляем коэффициенты масштабирования
        const scale = new THREE.Vector3(
            size.x !== 0 ? scaleVector.x / size.x : 1,
            size.y !== 0 ? scaleVector.y / size.y : 1,
            size.z !== 0 ? scaleVector.z / size.z : 1
        );

        // Масштабируем геометрию
        this.scaleGeometry(model, scale);

        // Обновляем bounding box и матрицу
        model.unionBoundingBox = this.calculateUnionBoundingBox(model);
        model.updateMatrixWorld(true);
    }

    private translateGeometry(model, translateVector) {
        if (model.geometry) {
            model.geometry.translate(translateVector.x, translateVector.y, translateVector.z);
            model.geometry.computeVertexNormals();
        }

        for (const child of model.children) {
            this.translateGeometry(child, translateVector);
        }
    }

    private scaleGeometry(model, scaleVector) {
        if (model.geometry) {
            model.geometry.scale(scaleVector.x, scaleVector.y, scaleVector.z);
        }

        for (const child of model.children) {
            this.scaleGeometry(child, scaleVector);
        }
    }

    private calculateUnionBoundingBox(group) {
        const boundingBox = new THREE.Box3();

        if (group.geometry) {
            group.geometry.computeBoundingBox();
            const geometryBox = group.geometry.boundingBox;
            if (geometryBox.isEmpty()) return null; // Проверяем валидность bounding box
            boundingBox.copy(geometryBox).applyMatrix4(group.matrixWorld);
        }

        for (const child of group.children) {
            const childBox = this.calculateUnionBoundingBox(child);
            if (childBox) boundingBox.union(childBox);
        }

        // Сохраняем bounding box только если он валиден
        if (!boundingBox.isEmpty()) {
            group.unionBoundingBox = boundingBox;
            return boundingBox;
        }

        return null;
    }
}


//@ts-nocheck
import * as THREE from "three"
import * as THREETypes from "@/types/types"
import { TBuildProduct } from "@/types/types"

import { Resources } from '../../Utils/Resources'
import { BuildProduct } from '../BuildProduct'
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
        const PROD = this.parent._PRODUCTS[props.PRODUCT]
        let normolized;

        return new Promise((resolve, reject) => {

            this.resources.startLoading(path, model.model_type, (file: any) => {

                if (!file) {
                    console.error('Модель не может быть загружена', file)
                }

                const normolized = this.normalizeUploadedModel(file, model);

                normolized.name = 'MODEL'
                if (PROD) {
                    normolized.userData.disableRaycast = PROD.disable_raycast == 1
                }

                const aabb = new THREE.Box3().setFromObject(normolized);
                const center = new THREE.Vector3();
                aabb.getCenter(center);
                let size = aabb.getSize(center)

                normolized.userData.PROPS = props

                let obb = new OBB();
                obb = obb.fromBox3(aabb);

                normolized.userData.obb = obb
                normolized.userData.aabb = aabb

                normolized.userData.trueSizes = {
                    DEPTH: size.z * 0.5, HEIGHT: size.y * 0.5, WIDTH: size.x * 0.5
                }



                if (onLoad) {
                    onLoad(normolized)
                }
                else {
                    resolve(normolized)
                }

                // onLoad(normolized) 
                // return normolized

            })

        })
    }

    public normalizeUploadedModel(model, params = {}) {
        // Проверяем входные параметры
        if (!model || !model.isObject3D) {
            throw new Error('Invalid model: Must be a valid THREE.Object3D');
        }

        if (isNaN(params.width) || isNaN(params.height) || isNaN(params.depth)) {
            model.scale.set(1000, 1000, 1000);
            return model
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


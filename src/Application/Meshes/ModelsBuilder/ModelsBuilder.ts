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
        const modelData = this.parent._MODELS[props.CONFIG.MODELID]
        const path = url ?? modelData.file ?? modelData.DAE
        const PROD = this.parent._PRODUCTS[props.PRODUCT]
        const { width, height, depth } = props.CONFIG.SIZE

        let normolized;

        const model = this.parent.expressionsReplace(modelData, {
            "#X#": width,
            "#Y#": height,
            "#Z#": depth,
        })

        console.log(props, 'props', model)

        return new Promise((resolve, reject) => {

            this.resources.startLoading(path, model.model_type || 'DAE', (file: any) => {

                if (!file) {
                    console.error('Модель не может быть загружена', file)
                }

                const normolized = this.normalizeUploadedModel(file, model) as THREE.Object3D;
                console.log(model.model_type.length)
                if (model.model_type.length === 0) {
                    console.log(model.model_type, 'model_type')
                    console.log(normolized.children)

                    normolized.traverse(child => {
                        if (child instanceof THREE.Mesh) {
                            child.rotation.x = -Math.PI * 0.5;
                        }
                    })
                }

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

                if (model.model_type.length == 0 || 'DAE') {
                    normolized.userData.trueSizes = {
                        DEPTH: depth * 0.5, HEIGHT: height * 0.5, WIDTH: width * 0.5
                    }
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

    private normalizeUploadedModel = function (model, params) {
        const center = new THREE.Vector3()
        const box = this.calculateUnionBoundingBox(model);
        box.getCenter(center)      
        const translateVector = new THREE.Vector3()

        const calculateTranslateVector = () => {
            translateVector.x = center.x !== 0 ? -center.x : 0
            translateVector.y = center.y !== 0 ? -center.y : 0
            translateVector.z = center.z !== 0 ? -center.z : 0
        }

        const translateGeometry = (mesh) => {
            if (mesh.geometry) {
                mesh.geometry.translate(translateVector.x, translateVector.y, translateVector.z);
                mesh.geometry.computeVertexNormals();
            }
            for (let child of mesh.children) {
                translateGeometry(child);
            }
        }

        calculateTranslateVector()
        translateGeometry(model);

        model.unionBoundingBox = this.calculateUnionBoundingBox(model);
        model.updateMatrixWorld(true)

        box.setFromObject(model);
        box.getCenter(center)     

        if (params.width || params.height || params.depth)
            this.changeModelScale(model, new THREE.Vector3(
                params.width || params.scale || 1,
                params.height || params.scale || 1,
                params.depth || params.scale || 1))
        else
            model.scale.x = model.scale.y = model.scale.z = params.scale;
        return model;
    }

    private changeModelScale = (model, scale_vector = new THREE.Vector3(1, 1, 1)) => {
        const scaleVector = new THREE.Vector3()
        const box = model.unionBoundingBox
        scaleVector.subVectors(box.max, box.min)
        scaleVector.x = scale_vector.x / Math.abs(scaleVector.x)
        scaleVector.y = scale_vector.y / Math.abs(scaleVector.y)
        scaleVector.z = scale_vector.z / Math.abs(scaleVector.z)

        const scaleGeometry = (mesh) => {
            if (mesh.geometry) {
                mesh.geometry.scale(scaleVector.x, scaleVector.y, scaleVector.z)
            }
            for (let child of mesh.children)
                scaleGeometry(child)
        }

        scaleGeometry(model)

        model.unionBoundingBox = this.calculateUnionBoundingBox(model);
        model.updateMatrixWorld(true)
    }


    private calculateUnionBoundingBox = (group) => {
        let boundingBox = new THREE.Box3();
        if (group.geometry) {
            group.geometry.computeBoundingBox();
            boundingBox = group.geometry.boundingBox.clone();
            if (boundingBox?.min?.length() === Infinity || boundingBox?.max?.length() === Infinity) {
                return null;
            }
        }

        for (let child of group.children) {
            let childBoundingBox = this.calculateUnionBoundingBox(child)
            if (childBoundingBox)
                boundingBox.union(childBoundingBox);
        }

        if (!group.geometry)
            group.unionBoudingBox = boundingBox

        return boundingBox;
    }

}


// @ts-nocheck 31

import * as THREE from 'three'
import * as THREETypes from "@/types/types"

import { BuildProduct } from './BuildProduct'


export class JsonBuilder {

    root: BuildProduct
    resources: THREETypes.TResources

    constructor(root: BuildProduct) {
        this.root = root
        this.resources = root.root._resources
    }

    createMesh({ data, parent_size, fasade }: { data: THREETypes.TObject, parent_size?: THREETypes.TObject, fasade?: THREETypes.TObject }) {

        let json = data.json ? data.json : data
        let group = new THREE.Object3D();
        let obj: THREETypes.TObject = {};


        json.items.forEach((item: THREETypes.TObject, key: number) => {
            let material, geometry, textureUrl: string

            if (json.material instanceof THREE.Material) {
                material = json.material;
            }

            if(data.material instanceof THREE.Material){
                material = data.material;
            }

            fasade ? textureUrl = fasade.TEXTURE : textureUrl = ''

            if (item.id === 'forwardbox') {

                if (eval(item.geometry.opt.x) <= 0) {
                    return true;
                }
            }

            if (json.material.type) {

                switch (json.material.type) {
                    case 'MeshBasicMaterial':
                        material = new THREE.MeshBasicMaterial(material);
                        if (fasade) {
                            this.getTexture(material, textureUrl)
                        }
                        break;
                    case 'MeshStandardMaterial':
                        material = new THREE.MeshStandardMaterial(material);
                        if (fasade) {
                            this.getTexture(material, textureUrl)
                        }
                        break
                    case 'MeshPhongMaterial':
                        material = new THREE.MeshPhongMaterial(material);
                        if (fasade) {
                            this.getTexture(material, textureUrl)
                        }
                        break
                    case 'MeshPhysicalMaterial':
                        material = new THREE.MeshPhysicalMaterial(material);
                        if (fasade) {
                            this.getTexture(material, textureUrl)
                        }
                        break
                    case 'MeshLambertMaterial':
                        material = new THREE.MeshLambertMaterial(material);
                        if (fasade) {
                            this.getTexture(material, textureUrl)
                        }
                        break
                }
            }


            if (item.type == "object") {
                switch (item.geometry.type) {
                    case 'BoxGeometry':
                        geometry = this.createGeometry(item.geometry, parent_size)
                        break;
                    case 'ExtrudeGeometry':
                        geometry = this.createShapeGeometry(item.geometry, parent_size)
                        break;
                }
                obj[item.id] = new THREE.Mesh(geometry, material);
                obj[item.id].receiveShadow = true;
                obj[item.id].castShadow = true;
            }

            if (item.type == "link") {
                obj[item.id] = obj[item.link].clone();
                obj[item.id].name = item.id
            }

            if (item.position) {
                obj[item.id].position.set(eval(item.position.x), eval(item.position.y), eval(item.position.z));
            }
            if (item.rotation) {
                obj[item.id].rotation.set(eval(item.rotation.x), eval(item.rotation.y), eval(item.rotation.z));
            }

            if (item.id === 'back') {
                obj[item.id].position.y = 0
            }

            group.add(obj[item.id])
            group.applyMatrix4(group.matrixWorld)

        })

        return group
    }

    createGeometry(geometry_data: THREETypes.TObject, parent_size?: THREETypes.TObject) {

        let geometry = new THREE.BoxGeometry(
            parseInt(geometry_data.opt.x),
            parseInt(geometry_data.opt.y),
            parseInt(geometry_data.opt.z)
        )
        // geometry.computeBoundingBox();
        return geometry
    }

    createShapeGeometry(geometry_data: THREETypes.TObject, parent_size?: THREETypes.TObject) {

        // const height = parent_size?.height ?? 0
        // const depth = parent_size?.depth ?? 0
        // const width = parent_size?.width ?? 0

        for (let i in geometry_data.opt) {

            geometry_data.opt[i] = eval(geometry_data.opt[i])

            i == 'amount' ? geometry_data.opt.depth = eval(geometry_data.opt[i]) : ''
        }

        let shape: THREE.Shape = new THREE.Shape()
        let profileGeometryCommand = geometry_data.command

        profileGeometryCommand.forEach((command: { [key: string]: any }) => {

            let structure = Object.keys(command.opt).map(function (key) {
                return command.opt[key];
            })

            for (let i in structure) {
                structure[i] = eval(structure[i])
            }

            if (typeof shape[command.type as keyof THREE.Shape] === 'function') {
                (shape[command.type as keyof THREE.Shape] as Function)(...structure);
            } else {
                console.error(`Метод ${command.type} не найден в объекте shape`);
            }
        })

        let geometry

        switch (geometry_data.type) {
            case "ExtrudeGeometry":
                geometry = new THREE.ExtrudeGeometry(shape, geometry_data.opt);
                break;
            case "ShapeGeometry":
                geometry = new THREE.ShapeGeometry(shape, geometry_data.opt);
                break;
        }

        // geometry!.computeBoundingBox();
        return geometry
    }

    getTexture(material: any, url: string) {
        this.resources.startLoading(url, 'texture', (file) => {
            if (file instanceof THREE.Texture) {
                file.colorSpace = THREE.SRGBColorSpace
                material.map = file
                material.needsUpdate = true;
            }
        });
    }

    update(root: BuildProduct) {
        this.root = root
    }

}
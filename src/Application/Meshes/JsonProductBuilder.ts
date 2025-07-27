//@ts-nocheck

import * as THREE from 'three'
import * as THREETypes from "@/types/types"

import { BuildProduct } from './BuildProduct'


export class JsonBuilder {

    parent: BuildProduct
    resources: THREETypes.TResources
    convert: Function

    constructor(parent: BuildProduct) {
        this.parent = parent
        this.convert = parent.calculateFromString
        // this.resources = parent._resources
    }

    createMesh({ data, parent_size, fasade }: { data: THREETypes.TObject, parent_size?: THREETypes.TObject, fasade?: THREETypes.TObject }) {

        // console.log(data, 'PARENT_data')

        const json = data.json ? data.json : data
        const group = new THREE.Object3D();
        const obj: THREETypes.TObject = {};

        // if (!Array.isArray(json.items)) {

        //     console.log(parent_size,'PSZ')

        //     let expdata = null
        //     let modelData = null

        //     let clone = JSON.parse(JSON.stringify(json.items))

        //     expdata = this.parent.expressionsReplace(clone, {
        //         "#FWIDTH#": parent_size.x,
        //         "#FHEIGHT#": parent_size.y,
        //         "#FDEPTH#": parent_size.z,
        //     })

        //     // console.log(expdata, 'Expdata')
        //     json.items = Object.values(expdata)
        // }

        // console.log(json, Array.isArray(json.items), 'JSON')
        const JSONitems = Array.isArray(json.items) ? json.items : Object.values(json.items)
        JSONitems.forEach((item: THREETypes.TObject, key: number) => {
            let material, geometry, textureUrl: string

            // console.log(item)

            if (json.material instanceof THREE.Material) {
                material = json.material;
            }

            if (data.material instanceof THREE.Material) {
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
                            this.parent.getTexture({ material, url: textureUrl })
                        }
                        break;
                    case 'MeshStandardMaterial':
                        material = new THREE.MeshStandardMaterial(material);
                        if (fasade) {
                            this.parent.getTexture({ material, url: textureUrl })
                        }
                        break
                    case 'MeshPhongMaterial':
                        material = new THREE.MeshPhongMaterial(material);
                        if (fasade) {
                            this.parent.getTexture({ material, url: textureUrl })
                        }
                        break
                    case 'MeshPhysicalMaterial':
                        material = new THREE.MeshPhysicalMaterial(material);
                        if (fasade) {
                            this.parent.getTexture({ material, url: textureUrl })
                        }
                        break
                    case 'MeshLambertMaterial':
                        material = new THREE.MeshLambertMaterial(material);
                        if (fasade) {
                            this.parent.getTexture({ material, url: textureUrl })
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
                    case "PlaneGeometry":
                        geometry = this.createPlaneGeometry(item.geometry, parent_size)

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
                      obj[item.id].position.set(this.convert(item.position.x), this.convert(item.position.y), this.convert(item.position.z));
                // obj[item.id].userData.position = obj[item.id].position
            }
            if (item.rotation) {
                 obj[item.id].rotation.set(this.convert(item.rotation.x), this.convert(item.rotation.y), this.convert(item.rotation.z));
                // obj[item.id].userData.rotation = item.rotation
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
            this.convert(geometry_data.opt.x),
            this.convert(geometry_data.opt.y),
            this.convert(geometry_data.opt.z)
        )
        // geometry.computeBoundingBox();
        return geometry
    }

    createPlaneGeometry(geometry_data: THREETypes.TObject, parent_size?: THREETypes.TObject) {
        let geometry = new THREE.PlaneGeometry(
            this.convert(geometry_data.opt.x), this.convert(geometry_data.opt.y)
        )
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

    update(parent: BuildProduct) {
        this.parent = parent
    }

}
// @ts-nocheck

import * as THREE from 'three'
import * as THREETypes from "@/types/types"

import { BuildProduct } from './BuildProduct'


export class JsonBuilder {

    parent: BuildProduct
    material: THREE.Material | null = null
    keys: string[] = ['fasade', 'center', 'front', 'front1', 'front2']
    convert: Function

    constructor(parent: BuildProduct) {
        this.parent = parent
        this.convert = parent.calculateFromString
    }

    createMesh({ data, parent_size, fasade }: { data: THREETypes.TObject, parent_size?: THREETypes.TObject, fasade?: THREETypes.TObject }) {

        console.log(data, 'JSONDATA')
        const json = data.json ? data.json : data
        const group = new THREE.Object3D();
        const obj: THREETypes.TObject = {};

        this.material = this.createMaterial(json.material, fasade) as THREE.Material

        if (Array.isArray(json.items)) {

            json.items.forEach((item: THREETypes.TObject, _: number, array: []) => {

                this.parseDate({ data: item, group, obj, array })
            })

        } else if (typeof json.items === 'object' && json.items !== null && !(json.items instanceof Date)) {


            let clone = JSON.parse(JSON.stringify(json.items))

            if (parent_size) {
                clone = this.parent.expressionsReplace(clone, {
                    "#FWIDTH#": parent_size!.x,
                    "#FHEIGHT#": parent_size!.y,
                    "#FDEPTH#": parent_size!.z,
                    "#X#": parent_size!.mX,
                    "#Y#": parent_size!.mY,
                    "#Z#": parent_size!.mZ,
                })
            }

            if (Object.values(clone).length > 1) {
                Object.values(clone).forEach(el => {
                    this.parseDate({ data: el, group, obj, parent_size })
                })
            } else {
                const type = this.parent.findKeyInObject(clone, this.keys)
                this.parseDate({ data: clone[type], group, obj, parent_size })
            }





        }
        else {
            // console.log('other')
        }

        return group
    }

    parseDate({ data, group, obj, parent_size, array }: { data: THREETypes.TObject, group: THREE.Object3D, obj, parent_size?, array?: [] }) {

        let geometry

        if (data.id === 'forwardbox') {

            if (this.convert(data.geometry.opt.x) <= 0) {
                return true;
            }
        }

        if (data.type == "object") {
            switch (data.geometry.type) {
                case 'BoxGeometry':
                case 'ExtrudeBoxGeometry':
                    geometry = this.createGeometry(data.geometry, parent_size)
                    break;
                case 'ExtrudeGeometry':
                    geometry = this.createShapeGeometry(data.geometry, parent_size)
                    break;
                case "PlaneGeometry":
                    geometry = this.createPlaneGeometry(data.geometry, parent_size)

            }
            obj[data.id] = new THREE.Mesh(geometry, this.material);
            obj[data.id].receiveShadow = true;
            obj[data.id].castShadow = true;
        }


        if (data.type == "link") {
            obj[data.id] = obj[data.link].clone();
            obj[data.id].name = data.id
        }

        if (data.position) {
            obj[data.id].position.set(this.convert(data.position.x), this.convert(data.position.y), this.convert(data.position.z));
            // obj[data.id].geometry.translate(this.convert(data.position.x), this.convert(data.position.y), this.convert(data.position.z));
        }
        if (data.rotation) {
            obj[data.id].rotation.set(this.convert(data.rotation.x), this.convert(data.rotation.y), this.convert(data.rotation.z));
            // obj[item.id].userData.rotation = item.rotation
        }
        if (data.id === 'back') {
            obj[data.id].position.y = 0
        }

        // const type =

        if (!data.geometry) {
            const fill = array?.filter(item => {
                if (data.link && item.id === data.link) {
                    return item
                }
            })

            group.userData.geometryType = fill[0].geometry.type
        }
        else {
            group.userData.geometryType = data.geometry.type
        }


        group.add(obj[data.id])
        group.applyMatrix4(group.matrixWorld)

    }

    createGeometry(geometry_data: THREETypes.TObject, parent_size?: THREETypes.TObject) {

        let geometry = new THREE.BoxGeometry(
            this.convert(geometry_data.opt.x),
            this.convert(geometry_data.opt.y),
            this.convert(geometry_data.opt.z)
        )

        geometry.computeBoundingBox()
        return geometry
    }

    createPlaneGeometry(geometry_data: THREETypes.TObject, parent_size?: THREETypes.TObject) {
        let geometry = new THREE.PlaneGeometry(
            this.convert(geometry_data.opt.x), this.convert(geometry_data.opt.y)
        )
        return geometry
    }

    createShapeGeometry(geometry_data: THREETypes.TObject, parent_size?: THREETypes.TObject) {

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

    createMaterial(data, fasade) {

        console.log(data, fasade, '--in JSONB')

        if (!data) return

        let material, textureUrl

        if (data instanceof THREE.Material) {
            material = data
            return material
        }

        fasade ? textureUrl = fasade.TEXTURE : textureUrl = ''

        if (data.type) {

            switch ((data.type as THREETypes.TMaterialType)) {
                case 'MeshBasicMaterial':
                    material = new THREE.MeshBasicMaterial(data);
                    break;
                case 'MeshStandardMaterial':
                    material = new THREE.MeshStandardMaterial(data);
                    break
                case 'MeshPhongMaterial':
                    material = new THREE.MeshPhongMaterial(data);
                    break
                case 'MeshPhysicalMaterial':
                    material = new THREE.MeshPhysicalMaterial(data);
                    break
                case 'MeshLambertMaterial':
                    material = new THREE.MeshLambertMaterial(data);
                    break
            }
        }

        if (fasade) {
            this.parent.getTexture({ material, url: textureUrl })
        }

        return material

    }

}
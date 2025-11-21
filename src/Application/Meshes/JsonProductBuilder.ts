// @ts-nocheck

import * as THREE from 'three'
import * as THREETypes from "@/types/types"

import { BuildProduct } from './BuildProduct'


export class JsonBuilder {

    parent: BuildProduct
    material: THREE.Material | null = null
    rightMaterial: THREE.Material | null = null
    leftMaterial: THREE.Material | null = null
    backMaterial: THREE.Material | null = null
    topMaterial: THREE.Material | null = null
    tsargaMaterial: THREE.Material | null = null
    keys: string[] = ['fasade', 'center', 'front', 'front1', 'front2']
    convert: Function

    constructor(parent: BuildProduct) {
        this.parent = parent
        this.convert = parent.calculateFromString
    }

    createMesh({ data, parent_size, fasade, left, right, back, top, tsarga }: {
        data: THREETypes.TObject,
        parent_size?: THREETypes.TObject,
        fasade?: THREETypes.TObject,
        left?: THREETypes.TObject,
        right?: THREETypes.TObject,
        back?: THREETypes.TObject,
        top?: THREETypes.TObject,
        tsarga?: THREETypes.TObject,
    }) {

        const json = data.json ? data.json : data
        const group = new THREE.Object3D();
        const obj: THREETypes.TObject = {};

        this.material = this.createMaterial(json.material, fasade) as THREE.Material

        if(left) {
            if (left.PALETTE) {
                this.leftMaterial = this.parent.palette_bulider.getPalette(left.COLOR, left.PALETTE)
            }
            else
                this.leftMaterial = this.createMaterial(json.material, this.parent._FASADE[left.COLOR]) as THREE.Material
        }

        if(right) {
            if (right.PALETTE) {
                this.rightMaterial = this.parent.palette_bulider.getPalette(right.COLOR, right.PALETTE)
            }
            else
                this.rightMaterial = this.createMaterial(json.material, this.parent._FASADE[right.COLOR]) as THREE.Material
        }

        if(back) {
            if (back.PALETTE) {
                this.backMaterial = this.parent.palette_bulider.getPalette(back.COLOR, back.PALETTE)
            }
            else
                this.backMaterial = this.createMaterial(json.material, this.parent._FASADE[back.COLOR]) as THREE.Material
        }

        if(top) {
            if (top.PALETTE) {
                this.topMaterial = this.parent.palette_bulider.getPalette(top.COLOR, top.PALETTE)
            }
            else
                this.topMaterial = this.createMaterial(json.material, this.parent._FASADE[top.COLOR]) as THREE.Material
        }

        if(tsarga) {
            if (tsarga.PALETTE) {
                this.tsargaMaterial = this.parent.palette_bulider.getPalette(tsarga.COLOR, tsarga.PALETTE)
            }
            else
                this.tsargaMaterial = this.createMaterial(json.material, this.parent._FASADE[tsarga.COLOR]) as THREE.Material
        }

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
            const geometryMap: Record<string, Function> = {
                'BoxGeometry': () => this.createGeometry(data.geometry, parent_size),
                'ExtrudeBoxGeometry': () => this.createGeometry(data.geometry, parent_size),
                'ExtrudeGeometry': () => this.createShapeGeometry(data.geometry, parent_size),
                'PlaneGeometry': () => this.createPlaneGeometry(data.geometry, parent_size)
            };

            const geometryCreator = geometryMap[data.geometry.type];
            if (geometryCreator) {
                geometry = geometryCreator();
            }

            let material = this.material
            if (data.glass) {
                const materialConf = {
                    color: "#" + 939393,
                    transparent: true,
                    opacity: 0.5,
                    shininess: 100,
                    specular: 0x999999,
                };
                material = new THREE.MeshPhongMaterial(materialConf);
                material.color.convertSRGBToLinear();
            }

            if(data.id.includes("left") && this.leftMaterial) {
                material = this.leftMaterial
            }
            else if(data.id.includes("right") && this.rightMaterial) {
                material = this.rightMaterial
            }
            else if(data.id.includes("back") && this.backMaterial) {
                material = this.backMaterial
            }
            else if(data.id.includes("top_fasade") && this.topMaterial) {
                material = this.topMaterial
            }
            else if(data.id.includes("horizontalline") && this.tsargaMaterial) {
                material = this.tsargaMaterial
            }

            obj[data.id] = new THREE.Mesh(geometry, material);
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
            obj[data.id].position.y = this.convert(data.position.y) ?? 0
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

        // geometry.computeBoundingBox()
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

        geometry!.computeBoundingBox();
        return geometry
    }

    update(parent: BuildProduct) {
        this.parent = parent
    }

    createMaterial(data, fasade) {

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
                    material = new THREE.MeshBasicMaterial(data.opt);
                    break;
                case 'MeshStandardMaterial':
                    material = new THREE.MeshStandardMaterial(data.opt);
                    break
                case 'MeshPhongMaterial':
                    material = new THREE.MeshPhongMaterial(data.opt);
                    break
                case 'MeshPhysicalMaterial':
                    material = new THREE.MeshPhysicalMaterial(data.opt);
                    break
                case 'MeshLambertMaterial':
                    material = new THREE.MeshLambertMaterial();
                    break
            }
        }

        if (fasade) {
            this.parent.getTexture({ material, url: textureUrl })
        }

        return material
    }
}
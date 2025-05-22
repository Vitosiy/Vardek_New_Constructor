
//@ts-nocheck
import * as THREE from 'three'
import * as THREETypes from "@/types/types"
import { useAppData } from "@/store/appliction/useAppData"

import { GlobalsData } from './Utils/Globals'
import { CUTTER_PARAMS } from "@/ConstructorTabletop/CutterScripts/CutterConst"
export class BuildersHelper extends GlobalsData {

    resources: THREETypes.TResources
    scene: THREE.Scene

    constructor(root: THREETypes.TApplication) {

        super();
        this.resources = root._resources
        this.scene = root._scene
    }

    createModelData(data: THREETypes.TObject, props: THREETypes.TObject, size: { width: number, height: number, depth: number }) {
        let model_data = { ...data }
        let color = this._FASADE[props.CONFIG.MODULE_COLOR]

        model_data = this.expressionsReplace(
            model_data,
            {
                "#X#": size.width,
                "#Y#": size.height,
                "#Z#": size.depth,
                "#MATERIAL_THICKNESS#": color?.DEPTH,
                "#HORIZONT#": props.CONFIG.NOBOTTOM ? 0 :
                    props.CONFIG.HORIZONT || props.CONFIG.HORIZONT === 0 ? props.CONFIG.HORIZONT :
                        props.EXPRESSIONS["#HORIZONT#"] || 78,  //78 - стандартная высота цоколя на случай отсутствия данных
            },
        )

        model_data = this.expressionsReplace(
            model_data,
            props.CONFIG.EXPRESSIONS
        )

        return model_data
    };

    getProductSize(PARAMS: any, product_data: THREETypes.TObject) {

        const MATERIAL_THICKNESS = this._FASADE[PARAMS.MODULE_COLOR]?.DEPTH || 18
        const HORIZONT = PARAMS.NOBOTTOM ? 0 : PARAMS.HORIZONT || PARAMS.HORIZONT === 0 ? PARAMS.HORIZONT : 78

        PARAMS.EXPRESSIONS = {
            "#MWIDTH#": product_data.width,
            "#MODUL_MWIDTH#": product_data.width,
            "#MODUL_WIDTH#": product_data.width,
            "#X#": product_data.width,
            "#MHEIGHT#": product_data.height,
            "#MODUL_MHEIGHT#": product_data.height,
            "#MODUL_HEIGHT#": product_data.height,
            "#Y#": product_data.height,
            "#MDEPTH#": product_data.depth,
            "#MODUL_MDEPTH#": product_data.depth,
            "#MODUL_DEPTH#": product_data.depth,
            "#Z#": product_data.depth,
            "#SIZEEDITJOINDEPTH#": product_data.SIZE_EDIT_JOINDEPTH_MIN,
            "#MATERIAL_THICKNESS#": MATERIAL_THICKNESS,
            "#HORIZONT#": HORIZONT,
        };

        Object.entries(PARAMS.FASADE_SIZE).forEach(([key, item]) => {

            PARAMS.EXPRESSIONS["#" + key + "#"] = item
            switch (key) {
                case "FASADESIZE1":
                    PARAMS.EXPRESSIONS["#FASADESIZEWIDTH1#"] = this._FASADESIZE[item as number].WIDTH;
                    PARAMS.EXPRESSIONS["#FASADESIZEDEPTH1#"] = this._FASADESIZE[item as number].DEPTH;
                    PARAMS.EXPRESSIONS["#FASADESIZEDIFFWIDTH1#"] = this._FASADESIZE[item as number].DIFFWIDTH;
                    PARAMS.EXPRESSIONS["#FASADESIZEDIFFDEPTH1#"] = this._FASADESIZE[item as number].DIFFDEPTH;
                    break;
                case "FASADESIZE2":
                    PARAMS.EXPRESSIONS["#FASADESIZEWIDTH2#"] = this._FASADESIZE[item as number].WIDTH;
                    PARAMS.EXPRESSIONS["#FASADESIZEDEPTH2#"] = this._FASADESIZE[item as number].DEPTH;
                    PARAMS.EXPRESSIONS["#FASADESIZEDIFFWIDTH2#"] = this._FASADESIZE[item as number].DIFFWIDTH;
                    PARAMS.EXPRESSIONS["#FASADESIZEDIFFDEPTH2#"] = this._FASADESIZE[item as number].DIFFDEPTH;
                    break;
            }
        })

        let depthCalc = product_data.SIZE_EDIT_DEPTH_MAX ? PARAMS.SIZE.depth : product_data.depth;

        let size = {
            width: parseInt(PARAMS.SIZE.width),
            height: parseInt(PARAMS.SIZE.height),
            depth: parseInt(depthCalc),
        };

        if (PARAMS.MODEL) {
            let selectmodel = this.expressionsReplace(
                PARAMS.MODEL,
                PARAMS.EXPRESSIONS
            );

            if (selectmodel.width) size.width = parseInt(eval(selectmodel.width));
            if (selectmodel.height) size.height = parseInt(eval(selectmodel.height));
            if (selectmodel.depth) size.depth = parseInt(eval(selectmodel.depth));
        }

        if (!size.width) size.width = parseInt(product_data.width);
        if (!size.height) size.height = parseInt(product_data.height);
        if (!size.depth) size.depth = parseInt(product_data.depth);

        return size;
    };

    getSizeEdit(product_data: THREETypes.TObject, props: THREETypes.TObject) {

        let sizeEdit = Object.keys(props.SIZE_EDIT)
        let productArr = this.filterObjectByKeys(product_data, sizeEdit)
        return productArr
    }

    expressionsReplace(obj: any, expressions: THREETypes.TObject) {

        if (!expressions || !Object.keys(expressions).length) return obj;

        let objStr: THREETypes.TObject | string | number = obj;

        // Преобразуем объект в строку, если это объект
        if (typeof obj == "object") {
            objStr = JSON.stringify(obj);
        }

        // Заменяем выражения
        Object.entries(expressions).forEach(([k, v]) => {
            if (typeof objStr != "number") {
                objStr = objStr.split(k).join(v);
            }
        });

        // Возвращаем объект или строку
        if (typeof obj == "object") {
            return JSON.parse(objStr as string);
        } else {
            return objStr;
        }
    };

    getStartPosition(size: THREETypes.TObject) {
        return { x: -size.width * 0.5, y: -size.height * 0.5, z: -size.depth * 0.5 };
    };

    checkColor(product: THREETypes.TObject) {
        let self = this
        let curProduct = this._PRODUCTS[product.PRODUCT]

        let color = product.CONFIG.BASKET.COLOR
            ? this._COLOR[product.CONFIG.BASKET.COLOR]
            : product.CONFIG.BASKET.MODULECOLOR
                ? checkModuleColor() :
                product.texture
                    ? {
                        TEXTURE: product.texture.src,
                        TEXTURE_HEIGHT: product.texture.height,
                        TEXTURE_WIDTH: product.texture.width,
                    }
                    : false;

        function checkModuleColor() {
            if (!self._FASADE[product.CONFIG.BASKET.MODULECOLOR]) {
                product.CONFIG.BASKET.MODULECOLOR = curProduct.MODULECOLOR[0];

                // показать сообщение
                //   self.scope.alerts[product.MODULECOLOR[0]] = "Цвет корпуса изменен.";

                return self._FASADE[curProduct.MODULECOLOR[0]];
            }

            return self._FASADE[product.CONFIG.BASKET.MODULECOLOR];
        }

        return color;
    }

    calculateHeight(object: THREE.Object3D) {

        let box = new THREE.Box3().setFromObject(object)
        const forTableSize = new THREE.Vector3()
        const tableSize = box.getSize(forTableSize)
        return tableSize.y
    }

    isEmpty(obj: {}) {
        return Object.keys(obj).length === 0
    };

    filterObjectByKeys(obj: THREETypes.TObject, keys: string[]) {
        return Object.fromEntries(
            Object.entries(obj).filter(([key]) => keys.includes(key))
        );
    }

    getTexture({ material, url, texture_size }: { material: any, url: string, texture_size?: THREETypes.TObject }) {

        this.resources.startLoading(url, 'texture', (file) => {
            if (file instanceof THREE.Texture) {
                file.colorSpace = THREE.SRGBColorSpace
                material.map = file
                material.needsUpdate = true;
                if (texture_size) {
                    material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
                    material.map.repeat.set(
                        1 / texture_size.width,
                        1 / texture_size.height
                    );
                    material.map.offset.set(0.5, 0.5);
                }
                material.needsUpdate = true;

            }
        });
    }

    changeColor({ object, url, textureSize, type }: { object: THREE.Object3D, url: string, textureSize?: THREETypes.TObject, type?: string }) {

        // console.log(object, 'OBJECT IN COLOR')

        object.traverse(children => {
            if (children instanceof THREE.Mesh) {

                if (children.userData.type === 'glass') return

                children.userData.ORIGINAL_COLOR != null ? children.material = children.userData.ORIGINAL_COLOR : ''

                this.resources.startLoading(url, 'texture', (file) => {

                    if (type === "Palette" || type === "Glass") {
                        children.material = new THREE.MeshStandardMaterial()
                    }

                    if (file instanceof THREE.Texture) {

                        file.colorSpace = THREE.SRGBColorSpace
                        children.material.map = file

                        if (textureSize) {
                            children.material.map.wrapS = children.material.map.wrapT = THREE.RepeatWrapping;
                            children.material.map.repeat.set(
                                1 / textureSize.x,
                                1 / textureSize.y
                            );
                            children.material.map.offset.set(0.5, 0.5);
                        }
                        if (type === "Palette") {
                            children.material.metalness = 0.7
                            children.material.roughness = 0.05
                            children.material.clearcoat = 1
                            children.material.clearcoatRoughness = 0
                            children.material.needsUpdate = true;
                        }

                        children.material.needsUpdate = true;
                    }
                });
            }
        })
    }

    createExtrudeBoxGeometry(options: THREETypes.TObject) {
        let extrusionSettings = Object.assign({
            depth: 16,
            curveSegments: 1,
            bevelThickness: 0,
            bevelSize: 1,
            bevelSegments: 1,
            bevelEnabled: false,
        }, options);

        extrusionSettings.depth = options.z;

        if (options.bevelEnabled) {
            options.x -= extrusionSettings.bevelSize * 2;
            options.y -= extrusionSettings.bevelSize * 2;
        }

        let geometry = new THREE.ExtrudeGeometry(
            new THREE.Shape([
                new THREE.Vector2(-options.x / 2, -options.y / 2),
                new THREE.Vector2(options.x / 2, -options.y / 2),
                new THREE.Vector2(options.x / 2, options.y / 2),
                new THREE.Vector2(-options.x / 2, options.y / 2),
            ]),
            extrusionSettings
        );

        // console.log(geometry, 'KKgeometry')

        return geometry;
    }

    addIfNotExists(array, obj) {
        const exists = array.some(item =>
            Object.keys(obj).every(key => item[key] === obj[key])
        );

        if (!exists) {
            return true
        }
        return false
    }

    getRandomInt(min: number, max: number) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
    }

    planarUV(geometry) {

        geometry.computeBoundingBox();

        var max = geometry.boundingBox.max,
            min = geometry.boundingBox.min;
        var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
        var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
        // var faces = geometry.faces;

        const faces = geometry.getAttribute('position');

        for (let i = 0; i < faces.count; i += 3) {

            const a = i;
            const b = i + 1;
            const c = i + 2;

        }

        geometry.getAttribute('uv')[0] = [];

        for (var i = 0; i < faces.length; i++) {

            var v1 = geometry.vertices[faces[i].a],
                v2 = geometry.vertices[faces[i].b],
                v3 = geometry.vertices[faces[i].c];

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
                new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
                new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
            ]);
        }
        geometry.uvsNeedUpdate = true;
    }

    addAdditionalKeys = (obj, additionalKeys) => (
        Object.entries(additionalKeys).forEach(([newKey, existingKey]) =>
            obj[newKey] = obj[existingKey] ?? console.warn(`Ключ "${existingKey}" не найден в объекте.`)
        ), obj
    );

    getRootObject(object: THREE.Object3D): THREE.Object3D {
        let root = object;
        while (root.parent && root.parent.type !== 'Scene') {
            root = root.parent;
        }

        return root;
    }

    calculateFromString(expression) {
        try {
            const func = new Function("return " + expression);
            return func();
        } catch (error) {
            return "Недопустимое выражение!";
        }
    }

    createStartTopTableCutData(uslugi, product_data) {

        const { width, depth } = product_data
        const startCutData = {
            canvasHeight: depth,
            data: [
                [
                    {
                        width,
                        height: depth,
                        roundCut: {},
                        holes: [],
                        serviseData: CUTTER_PARAMS.CUT_SERVISES

                    }
                ]
            ]
        }

        return startCutData
    }
}
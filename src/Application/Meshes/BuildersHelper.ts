
// @ts-nocheck
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

    getProductSize(PARAMS: any, productData: THREETypes.TObject) {
        const product = this._PRODUCTS[PARAMS.ID];
        const materialThickness = this._FASADE[PARAMS.MODULE_COLOR]?.DEPTH ?? 18;
        const horizont =
            PARAMS.NOBOTTOM ? 0 :
                PARAMS.HORIZONT ?? 78;

        const filling = this._FILLING[product.FILLING[0]] || {};

        // Базовые подстановки
        const expressions: Record<string, any> = {
            "#MWIDTH#": productData.width,
            "#MODUL_MWIDTH#": productData.width,
            "#MODUL_WIDTH#": productData.width,
            "#X#": productData.width,
            "#MHEIGHT#": productData.height,
            "#MODUL_MHEIGHT#": productData.height,
            "#MODUL_HEIGHT#": productData.height,
            "#Y#": productData.height,
            "#MDEPTH#": productData.depth,
            "#MODUL_MDEPTH#": productData.depth,
            "#MODUL_DEPTH#": productData.depth,
            "#Z#": productData.depth,
            "#SIZEEDITJOINDEPTH#": productData.SIZE_EDIT_JOINDEPTH_MIN,
            "#MATERIAL_THICKNESS#": materialThickness,
            "#HORIZONT#": horizont,
            "#VSECTION_MAX#": filling.VSECTION_MAX,
            "#VSECTION_MIN#": filling.VSECTION_MIN,
        };

        // Обработка фасадных размеров
        Object.entries(PARAMS.FASADE_SIZE).forEach(([key, value]) => {
            expressions[`#${key}#`] = value;
            if (key === "FASADESIZE1" || key === "FASADESIZE2") {
                const idx = value as number;
                const size = this._FASADESIZE[idx];
                const suffix = key.endsWith("1") ? "1" : "2";
                expressions[`#FASADESIZEWIDTH${suffix}#`] = size.WIDTH;
                expressions[`#FASADESIZEDEPTH${suffix}#`] = size.DEPTH;
                expressions[`#FASADESIZEDIFFWIDTH${suffix}#`] = size.DIFFWIDTH;
                expressions[`#FASADESIZEDIFFDEPTH${suffix}#`] = size.DIFFDEPTH;
            }
        });

        PARAMS.EXPRESSIONS = expressions;

        const depthCalc = productData.SIZE_EDIT_DEPTH_MAX
            ? PARAMS.SIZE.depth
            : productData.depth;

        const size = {
            width: parseInt(PARAMS.SIZE.width),
            height: parseInt(PARAMS.SIZE.height),
            depth: parseInt(depthCalc),
        };

        if (PARAMS.MODELID) {
            const modelData = this._MODELS[PARAMS.MODELID]
            const model = this.expressionsReplace(modelData, expressions);
            if (model.width) size.width = parseInt(eval(model.width));
            if (model.height) size.height = parseInt(eval(model.height));
            if (model.depth) size.depth = parseInt(eval(model.depth));
        }

        // Запасные значения
        size.width ||= parseInt(productData.width);
        size.height ||= parseInt(productData.height);
        size.depth ||= parseInt(productData.depth);

        return size;
    }

    getSizeEdit(product_data: THREETypes.TObject, props: THREETypes.TObject) {

        let sizeEdit = Object.keys(props.SIZE_EDIT)
        let productArr = this.filterObjectByKeys(product_data, sizeEdit)
        return productArr
    }

    getExec(obj) {
        Object.entries(obj).forEach(([key, value]) => {
            if (key == "NAME" || key == "drawer" || key == "box_color" || key == "fasade_color") {
                obj[key] = value;
            } else {
                obj[key] = eval(value);
            }
        });
        return obj;
    };

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
        return new THREE.Vector3(-size.width * 0.5, -size.height * 0.5, -size.depth * 0.5);
    };

    checkColor(product: THREETypes.TObject) {
        const { PRODUCT, CONFIG, texture } = product;
        const { BASKET } = CONFIG;
        const curProduct = this._PRODUCTS[PRODUCT];

        const checkModuleColor = () => {
            const moduleColor = BASKET.MODULECOLOR;
            if (!this._FASADE[moduleColor]) {
                BASKET.MODULECOLOR = curProduct.MODULECOLOR[0];
                return this._FASADE[curProduct.MODULECOLOR[0]];
            }
            return this._FASADE[moduleColor];
        };

        if (BASKET.COLOR) {
            return this._COLOR[BASKET.COLOR];
        }
        if (BASKET.MODULECOLOR) {
            return checkModuleColor();
        }
        if (texture) {
            return {
                TEXTURE: texture.src,
                TEXTURE_HEIGHT: texture.height,
                TEXTURE_WIDTH: texture.width,
            };
        }
        return false;
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

    //----------------------------------------------------------
    /** @Настройка материала */
    //----------------------------------------------------------
    changeColor({
        object,
        url,
        textureSize,
        type
    }: {
        object: THREE.Object3D;
        url: string;
        textureSize?: { x: number, y: number };
        type?: string;
    }) {
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ffffff'),
            opacity: 1
        });
        object.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            if (child.userData.type === "glass") return;

            // // Восстановление оригинального материала при наличии
            // if (child.userData.ORIGINAL_COLOR) {
            //     child.material = child.userData.ORIGINAL_COLOR;
            // }
            // if (child.material.opacity < 1) {
            //     child.material.opacity = 1
            //     child.material.color = new THREE.Color('rgb(255,255,255)')
            // }

            this.resources.startLoading(url, "texture", (file) => {
                if (!(file instanceof THREE.Texture)) return;
                child.material = material
                // child.material.needsUpdate = true
                // Создание материала при необходимости
                // if (type && ["Palette", "Glass"].includes(type)) {
                //     child.material = new THREE.MeshStandardMaterial();
                // }

                this.applyTexture(child, file, textureSize, type);
            });
        });
    }

    //----------------------------------------------------------
    /** @Настройка текстуры и параметров материала */
    //----------------------------------------------------------
    private applyTexture(
        child: THREE.Mesh,
        texture: THREE.Texture,
        textureSize?: THREE.Vector3,
        type?: string
    ) {
        texture.colorSpace = THREE.SRGBColorSpace;
        child.material.map = texture;

        // Настройка повторения и смещения
        if (textureSize) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1 / textureSize.x, 1 / textureSize.y);
            texture.offset.set(0.5, 0.5);
        }

        // Настройки для палитры
        if (type === "Palette" && child.material instanceof THREE.MeshStandardMaterial) {
            Object.assign(child.material, {
                metalness: 0.7,
                roughness: 0.05,
                clearcoat: 1,
                clearcoatRoughness: 0
            });
        }

        child.material.needsUpdate = true;
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

        console.log(uslugi, 'uslugi')

        const convert = this.createCutterParams(uslugi)
        console.log(convert, 'convert')

        const { width, depth, height } = product_data
        const startCutData = {
            groupID: `f${(~~(Math.random() * 1e8)).toString(16)}`, // Идентификатор группы
            modelHeight: height, // Высота для итогового объекта в THREE js
            canvasHeight: depth, // Высота для PIXI js
            data: [
                [
                    {
                        width,
                        height: depth,
                        roundCut: {},
                        holes: [],
                        serviseData: convert

                    }
                ]
            ]
        }

        return startCutData
    }

    createCutterParams(uslugi) {
        const SERVISES = CUTTER_PARAMS.CUT_SERVISES
        return uslugi.map(obj1 => {
            const obj2 = SERVISES.find(o => o.ID === obj1.ID);
            let merged;
            if (obj2) {
                const extras = Object.fromEntries(
                    Object.entries(obj2).filter(([key]) => !(key in obj1))
                );
                merged = { ...obj1, ...extras };

                // if ("width" in merged) {
                //     const w1 = obj1.width;
                //     const w2 = obj2.width;

                //     // случай: строка + число → число
                //     if (typeof w1 === "string" && typeof w2 === "number") {
                //         merged.width = w2;
                //     }

                //     // случай: строка + отсутствует → удалить
                //     if (typeof w1 === "string" && w2 === undefined) {
                //         delete merged.width;
                //     }
                // }

                // return merged;
            }

            else {
                merged = { ...obj1 };
                if (!("pos" in merged)) {
                    merged.pos = "CENTER";
                }
            }

            if ("width" in merged) {
                const w1 = obj1.width;
                const w2 = obj2 ? obj2.width : undefined;

                if (typeof w1 === "string" && typeof w2 === "number") {
                    merged.width = w2;
                }

                if (typeof w1 === "string" && w2 === undefined) {
                    delete merged.width;
                }
            }

            return merged;

        }).filter(el => el.ID !== 98683);

        // .filter(el => parseInt(el.separated) !== 0);
    }

    findElementsBySectorId(data, sectorId) {
        let result = null;

        // Рекурсивная функция для обхода массива
        function traverse(arr) {
            for (const item of arr) {
                if (Array.isArray(item)) {
                    // Если элемент — массив, рекурсивно обходим его
                    traverse(item);
                } else if (item && typeof item === 'object' && item.sectorId === sectorId) {
                    // Если элемент — объект и его sectorId совпадает, добавляем в результат
                    result = item;
                }
            }
        }

        traverse(data);

        return result;
    }

    findKeyInObject(obj, keys) {
        for (const key of keys) {
            if (obj.hasOwnProperty(key)) {
                return key;
            }
        }
        return null;
    }

    computeAABB(object: THREE.Object3D): THREE.Box3 {
        const box = new THREE.Box3();
        const size = new THREE.Vector3()


        object.traverse((child) => {
            if (child instanceof THREE.Mesh && child.userData.name !== 'TABLETOP' && child.name !== "ARROWS" && child.name !== 'FASADE') {
                const geometry = child.geometry;
                if (!geometry.boundingBox) {
                    geometry.computeBoundingBox();
                }

                const childBox = geometry.boundingBox!.clone();
                childBox.applyMatrix4(child.matrixWorld);

                box.union(childBox);
            }
        });

        box.getSize(size)

        return box;
    }

    mergeArrays(arr1, arr2, { key = "ID", overwrite = false } = {}) {
        return arr1.map(obj1 => {
            const obj2 = arr2.find(o => o[key] === obj1[key]);
            let merged;

            if (obj2) {
                if (overwrite) {
                    merged = { ...obj1, ...obj2 };
                } else {
                    const extras = Object.fromEntries(
                        Object.entries(obj2).filter(([k]) => !(k in obj1))
                    );
                    merged = { ...obj1, ...extras };
                }
            } else {
                merged = { ...obj1 };
                if (!("pos" in merged)) {
                    merged.pos = "CENTER";
                }
            }

            // обработка width у всех объектов
            if ("width" in merged) {
                const w1 = obj1.width;
                const w2 = obj2 ? obj2.width : undefined;

                if (typeof w1 === "string" && typeof w2 === "number") {
                    merged.width = w2;
                }

                if (typeof w1 === "string" && w2 === undefined) {
                    delete merged.width;
                }
            }

            return merged;
        });
    }

}
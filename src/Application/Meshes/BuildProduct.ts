/**// @ts-nocheck */

import * as THREE from 'three'
import type { Material } from 'three';
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

import { OBB } from 'three/examples/jsm/math/OBB.js';

import { useAppData } from "@/store/appliction/useAppData"
import { useSceneState } from "@/store/appliction/useSceneState"
import { useModelState } from '@/store/appliction/useModelState';
import { useMenuStore } from '@/store/appStore/useMenuStore.ts';

import { Resources } from '../Utils/Resources'
import { Ruler } from '../Utils/Ruler'

import { Filters } from './Utils/Filters'

import { JsonBuilder } from './JsonProductBuilder'
import { ModelsBuilder } from './ModelsBuilder'
import { MillingBuilder } from './MillingBuilder';
import { WindowBuilder } from './WindowBuilder';

import { FasadeBuilder } from './FasadeBuilder';
import { PaletteBuilder } from './PaletteBuilder';
import { AlumBuilder } from './AlumBuilder.ts';
import { UniformTextureBuilder } from './UniformTextureBuilder.ts';
import { BuildersHelper } from "./BuildersHelper"
// import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
// import { group } from 'console';

export class BuildProduct extends BuildersHelper {

    root: THREETypes.TApplication;
    resources: Resources;

    project = useSceneState().getCurrentProjectParams;
    menuStore: ReturnType<typeof useMenuStore> = useMenuStore()
    modelState: ReturnType<typeof useModelState> = useModelState();

    ruler: THREETypes.TRuler
    filters: Filters;
    json_builder: JsonBuilder;
    models_builder: ModelsBuilder;
    milling_builder: MillingBuilder;
    window_builder: WindowBuilder;
    fasade_builder: FasadeBuilder;
    palette_bulider: PaletteBuilder
    alum_builder: AlumBuilder
    uniform_texture_builder: UniformTextureBuilder
    heightCorrect: number = 0

    constructor(root: THREETypes.TApplication) {
        super(root)

        // console.trace('BuildProduct')

        this.root = root
        this.ruler = root.ruler!

        this.resources = root._resources!
        this.filters = new Filters(root)
        this.json_builder = new JsonBuilder(this);
        this.models_builder = new ModelsBuilder(this)
        this.milling_builder = new MillingBuilder(root)
        this.window_builder = new WindowBuilder(root)
        this.palette_bulider = new PaletteBuilder(this)
        this.alum_builder = new AlumBuilder(this)
        this.uniform_texture_builder = new UniformTextureBuilder(root, this)
        this.fasade_builder = new FasadeBuilder(this)
    }

    get _heightCorrect() {
        return this.heightCorrect
    }

    get _currentProduct() {
        return this
    }

    set _heightCorrect(value) {
        this.heightCorrect += value
    }

    getModel(product_data: THREETypes.TObject, onLoad: (object: THREE.Object3D) => void, loaded_props?: THREETypes.TObject, loaded_size?: THREETypes.TObject): void {

        const type = this._MODELS[product_data.models[0]]

        // console.log(type, 'TYPE')

        let model = this.createPerentGroup(product_data, onLoad, type, loaded_props, loaded_size);

        if (!!type.DAE) return;

        onLoad(model as THREE.Object3D)
    }

    /** Создание данных модели */

    createPerentGroup(product_data: THREETypes.TObject, onLoad: (object: THREE.Object3D) => void, type: THREETypes.TObject, loadedProps?: THREETypes.TObject, loaded_size?: THREETypes.TObject) {

        let parent_group = new THREE.Object3D();

        /** Проверяем на загружаемы контент */
        let props: THREETypes.TObject = !loadedProps ? this.createStartProps(product_data) : loadedProps;

        parent_group.userData.PROPS = props

        /** Если модель */

        if (type.DAE) {
            this.models_builder.create(type.file, onLoad, props)
            return
        }

        /** Если json  */ /** Если есть загружаемые размеры */

        let product = loaded_size ? this.createProductBody(parent_group, loaded_size) : this.createProductBody(parent_group)

        parent_group.add(product as THREE.Object3D)


        product!.name = product_data.NAME

        // const aabb = new THREE.Box3().setFromObject(parent_group);

        const aabb = this.computeAABB(parent_group)
        const obb = new OBB().fromBox3(aabb);

        const productSize = new THREE.Vector3();
        /** Для корректного примагничивания к стенам */
        aabb.getSize(productSize);

        /** Присваиваем тип объекта */
        parent_group.userData.elementType = product_data.element_type
        parent_group.elementType = product_data.element_type

        parent_group.userData.trueSizes = {
            DEPTH: productSize.z * 0.5,
            HEIGHT: productSize.y * 0.5,
            WIDTH: productSize.x * 0.5
        }

        parent_group.userData.aabb = aabb
        parent_group.userData.obb = obb

        console.log(parent_group, 'PROBG')

        return parent_group
    }

    createStartProps(product_data: THREETypes.TObject) {

        let props: THREETypes.TObject = {
            ARROWS: [],
            BODY: [],
            CONFIG: {},
            DRAWERS: {},
            EXPRESSIONS: {},
            FASADE: [],
            FASADE_DEFAULT: [],
            GLASS: {},
            HANDLES: {},
            HIDDENCHILDREN: {},
            HIDDEN: false,
            LEG: {},
            MILLINGS: [],
            PRODUCT: product_data.ID,
            RASPIL: [],
            RASPIL_LIST: [],
            RASPIL_COUNT: 0,
            SHELF: [],
            SEPARATED: [],
            SECTIONSOBJ: [],
            SECTIONCONTROL: [],
            TABLETOP: {},
            WINDOW_DEFAULT: []
        }

        let params = this.createProductObject(product_data, props)
        props.CONFIG = params

        return props
    }

    private createProductObject(product_data: THREETypes.TObject, props: THREETypes.TObject) {
        const {
            element_type,
            ID,
            models,
            width,
            height,
            depth,
            tabletop,
            FASADE_SIZES,
            FACADE,
            MODULECOLOR,
            type_showcase,
            USLUGI
        } = product_data;

        const PARAMS: THREETypes.TObject = {
            DISABLE_MOVE: false,
            ELEMENT_TYPE: element_type,
            ID,
            FASADE_PROPS: [],
            FASADE_SIZE: [],
            FASADE_POSITIONS: [],
            FASADE_TYPE: [],
            HANDLES: {},
            HANDLES_POSITION: {},
            HAVETABLETOP: tabletop != null && this.project.table_top_type_auto,
            HIDE_FASADE: false,
            HIDDEN: false,
            HEIGHTCORRECT: 0,
            MODELID: models[0],
            MODEL: this._MODELS[models[0]],
            MODULE_COLOR: null,
            SIZE: { width, height, depth },
            SIZE_EDIT: {
                SIZE_EDIT_WIDTH_MIN: null,
                SIZE_EDIT_WIDTH_MAX: null,
                SIZE_EDIT_HEIGHT_MIN: null,
                SIZE_EDIT_HEIGHT_MAX: null,
                SIZE_EDIT_DEPTH_MIN: null,
                SIZE_EDIT_DEPTH_MAX: null
            },
            SHOWCASE: [],
            POSITION: null,
            ROTATION: null,
            UNIFORM_TEXTURE: {
                group: null,
                level: null,
                index: null,
                column_index: null,
                backupFasadId: null,
                color: null
            },
            USLUGI: []
        };

        if (FASADE_SIZES?.length) {
            PARAMS.FASADE_SIZE = this.filters.filterFasadeSizer(FASADE_SIZES, false) as any[];
        }

        if (FACADE?.[0]) {
            this.filters.filterFasadePosition(PARAMS, product_data);
        }

        if (MODULECOLOR?.[0] != null) {
            PARAMS.MODULE_COLOR = this.filters.filterModuleColor(MODULECOLOR)[0];
        }

        if (type_showcase?.[0] != null) {
            PARAMS.SHOWCASE = [...type_showcase];
        }

        if (USLUGI?.[0] != null) {
            PARAMS.USLUGI = this.filters.filterUslugi(USLUGI);
            props.RASPIL = this.createStartTopTableCutData(PARAMS.USLUGI, product_data);
        }

        PARAMS.SIZE = this.getProductSize(PARAMS, product_data);
        PARAMS.SIZE_EDIT = this.getSizeEdit(product_data, PARAMS);

        return PARAMS;
    }

    /** Создание модели */

    private createProductBody(
        parentGroup: THREE.Object3D,
        size?: { width: number; height: number; depth: number }
    ) {
        const total = new THREE.Object3D();
        const { PROPS } = parentGroup.userData;
        const { CONFIG } = PROPS;

        const defaultConfig: THREETypes.TDefaultModuleAndFasadeConfig = this.getDefaultModuleAndFasadeConfig();

        PROPS.FASADE = [];
        PROPS.FASADE_DEFAULT = [];

        const productId = CONFIG.ID;
        const modelData = CONFIG.MODEL;
        const modelSize = size ?? CONFIG.SIZE;

        if (size) {
            PROPS.CONFIG.SIZE = size;
            this.getProductSize(CONFIG, size);
        }

        if (!modelData) return;

        let heightCorrect = 0;
        const adjustHeight = (value: number, type: string) => {
            heightCorrect += type === "top" ? -value : value;
            return heightCorrect;
        };

        const data = this.createModelData(modelData, PROPS, modelSize);

        // Сборка частей
        const { body, tempMaterial } = !this.isEmpty(modelData)
            ? this.createBody(data, PROPS, defaultConfig)
            : { body: null, tempMaterial: null };

        const shelf = this._SHELF_POSITION[productId]
            ? this.createShelf(total, PROPS, this._SHELF_POSITION[productId], tempMaterial)
            : null;

        const legs = this._PRODUCTS[productId]?.leg_length
            ? this.buildLegs(PROPS, data, total, adjustHeight)
            : null;

        const tableTop = CONFIG.HAVETABLETOP
            ? this.createTableTop(total, PROPS, data, adjustHeight)
            : null;

        const fasade = Object.keys(CONFIG.FASADE_PROPS).length
            ? this.fasade_builder.getFasade({
                group: total,
                props: PROPS,
                defaultConfig
            })
            : null;

        const arrows = this.addArrowSize({ object: body, props: PROPS });

        // Вычисление высот
        const legsHeight = legs ? this.calculateHeight(legs) : 0;
        const bodyHeight = body ? this.calculateHeight(body) : 0;
        const tableTopHeight = tableTop ? this.calculateHeight(tableTop) : 0;

        // Позиционирование
        const baseY = legsHeight * 0.5;
        if (legs) legs.position.y = baseY;
        if (body) body.position.y = baseY;
        if (shelf) shelf.position.y = baseY;
        if (fasade) fasade.position.y = baseY;
        if (tableTop) {
            tableTop.position.y = baseY + bodyHeight * 0.5 + tableTopHeight * 0.5;
        }
        arrows.position.y = baseY;

        // Добавление в итоговую группу
        [tableTop, legs, body, shelf, fasade, arrows]
            .filter(Boolean)
            .forEach((part) => total.add(part as THREE.Object3D));

        return total;
    }

    /** Создание тела модели */

    createBody(data: THREETypes.TObject, props: THREETypes.TObject, defaultConfig: THREETypes.TDefaultModuleAndFasadeConfig) {
        const { CONFIG } = props;
        const { ELEMENT_TYPE, MODULE_COLOR, ID } = CONFIG;

        const { defModuleUp, defModuleDown, moduleTop, moduleBottom } = defaultConfig

        const resolveColorId = () => {
            const isDefault = MODULE_COLOR === this.project.default_module_color;
            switch (ELEMENT_TYPE) {
                case "element_down":
                    return (defModuleDown && isDefault) || moduleBottom.global ? defModuleDown : MODULE_COLOR;
                case "element_up":
                    return (defModuleUp && isDefault) || moduleTop.global ? defModuleUp : MODULE_COLOR;
                default:
                    return MODULE_COLOR;
            }
        };

        const moduleColorId = resolveColorId();
        CONFIG.MODULE_COLOR = moduleColorId;

        const moduleColor = this._FASADE[moduleColorId];
        const body = this.json_builder.createMesh({ data, fasade: moduleColor });
        const { geometryType } = body.userData;

        const texture = this._PRODUCTS[ID].texture;
        if ("src" in texture && !moduleColor) {
            const textureSize = {
                width: geometryType === "ExtrudeGeometry" ? texture.width : 1,
                height: geometryType === "ExtrudeGeometry" ? texture.height : 1,
            };

            body.children.forEach((child) => {
                if (!(child instanceof THREE.Mesh)) return;

                const params: any = { material: child.material, url: texture.src, texture_size: textureSize };
                if (geometryType === "ExtrudeGeometry") params.rotation = Math.PI * 0.5;

                this.getTexture(params);
                body.userData.MATERIAL = child.material;
            });
        }

        body.matrixWorldNeedsUpdate = true;
        body.name = "BODY";
        body.userData.MATERIAL_TYPE = data.json.material.type;

        const move = new THREE.Vector3(eval(data.corr_x), 0, eval(data.corr_z));
        body.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.translate(move);
            }
        });

        props.BODY = body;

        const size = new THREE.Box3().setFromObject(body).getSize(new THREE.Vector3());
        body.userData.trueSize = {
            BODY_WIDTH: size.x,
            BODY_HEIGHT: size.y,
            BODY_DEPTH: size.z,
        };

        props.BODY_DEFAULT = body.clone();

        return { body, tempMaterial: body.children[0]?.material };
    }

    /** Создание столешницы */

    createTableTop(group: THREE.Object3D, props: THREETypes.TObject, model_data: THREETypes.TObject, height_correct?: (value: number, type: string) => number) {

        let defaultTop = props.CONFIG.HAVETABLETOP ? this.project.table : false;

        if (!defaultTop) return

        let local_expression = { ...props.CONFIG.EXPRESSIONS }

        const sizes = props.CONFIG.SIZE
        let start_position = this.getStartPosition(sizes)

        let model = this.project.table
        let params = this.project.table_params


        let topJson = model_data.json.tables
        let material = new THREE.MeshPhongMaterial()

        // console.log(topJson, 'topJson')

        /** Если установлен материалстолешницы */
        if (this.project.table_color) {
            let texture = this._COLOR[this.project.table_color].TEXTURE
            this.resources.startLoading(texture, 'texture', (file) => {
                if (!file) return
                material.map = file as THREE.Texture
                material.map.wrapS = material.map.wrapT = THREE.MirroredRepeatWrapping;
            })
        }
        else {
            material.color.set("#ffffff")
            material.transparent = true;
            material.opacity = 0.5;
            material.depthWrite = true
            // material.depthTest = false
        }

        if (topJson) {
            let tableTop: THREE.Object3D = new THREE.Object3D();

            Object.values(topJson).forEach((table: any) => {

                let width = parseInt(eval(table.width));
                let depth = parseInt(eval(table.depth));
                if (width || depth) {

                    // console.log(props.CONFIG.EXPRESSIONS, 'table_1')

                    let expr = Object.assign(local_expression, {
                        "#MHEIGHT#": params!.height,
                        "#MODUL_HEIGHT#": params!.height,
                        "#MODUL_MHEIGHT#": params!.height,
                        "#MDEPTH#": params!.depth,
                        "#MODUL_DEPTH#": depth || props.CONFIG.SIZE.depth,
                        "#MODUL_MDEPTH#": params!.depth,
                        "#MODUL_MWIDTH#": props.CONFIG.SIZE.width,
                        "#MODUL_WIDTH#": width || props.CONFIG.SIZE.width,
                        "#MWIDTH#": props.CONFIG.SIZE.width,
                        "#X#": width || props.CONFIG.SIZE.width,
                        "#Y#": params!.height,
                        "#Z#": depth || props.CONFIG.SIZE.depth,
                    });

                    // console.log(props.CONFIG.EXPRESSIONS, 'table_2')

                    let opt = Object.assign(this.expressionsReplace(model, expr), {
                        material: material,
                    });

                    let tablet = this.json_builder.createMesh({ data: opt });

                    if (table.position) {
                        tablet.position.setX(eval(table.position.x));
                        tablet.position.setZ(eval(table.position.z));
                    }
                    if (table.rotation) {
                        tablet.rotation.set(0, eval(table.rotation.y), 0);
                    }

                    // tablet.renderOrder = 2

                    tableTop.add(tablet);

                }

            })

            let tableHeight = this.calculateHeight(tableTop)

            // tableTop.position.setY(start_position.y + sizes.height + 38 / 2);
            tableTop.position.setZ(start_position.z + 300);
            tableTop.name = 'TABLETOP'

            tableBody.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.userData.name = 'TABLETOP'
                    // child.updateMatrixWorld()
                }
            })


            // group.add(tableTop)

            // height_correct ? height_correct(tableHeight, 'top') : ""

            props.TABLETOP = tableTop

            // console.log(props, 'table top')

            return tableTop
        }

        let expr = Object.assign(props.CONFIG.EXPRESSIONS, {
            "#MHEIGHT#": params!.height,
            "#MODUL_HEIGHT#": params!.height,
            "#MODUL_MHEIGHT#": params!.height,
            "#MDEPTH#": params!.depth,
            "#MODUL_DEPTH#": params!.depth,
            "#MODUL_MDEPTH#": params!.depth,
            "#MODUL_MWIDTH#": props.CONFIG.SIZE.width,
            "#MODUL_WIDTH#": props.CONFIG.SIZE.width,
            "#MWIDTH#": props.CONFIG.SIZE.width,
            "#Y#": params!.height,
        });

        let opt = Object.assign(this.expressionsReplace(model!, expr), {
            material: material,
        });

        let tableBody = this.json_builder.createMesh({ data: opt, parent_size: sizes });
        let tableHeight = this.calculateHeight(tableBody)
        tableBody.position.setY(-tableHeight);

        // tableBody.position.setY(start_position.y + sizes.height + 38 / 2);

        tableBody.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.userData.name = 'TABLETOP'
                const pos = new THREE.Vector3(30, 0, 0)
                child.geometry.translate(pos)
                // child.geometry.applyMatrix4(tableBody.matrixWorld)
            }
        })

        // tableBody.position.setZ(start_position.z + 300);

        /** Для корректного примагничивания к стенам */
        // const box = new THREE.Box3().setFromObject(tableBody);
        // const size = box.getSize(new THREE.Vector3());

        // tableBody.userData.trueSize = {
        //     TABLETOP_WIDTH: size.x,
        //     TABLETOP_HEIGHT: size.y,
        //     TABLETOP_DEPTH: size.z,
        // }


        tableBody.name = 'TABLETOP'
        props.TABLETOP = tableBody

        return tableBody
    };

    /** Создание полок */

    createShelf(
        group: THREE.Object3D,
        props: THREETypes.TObject,
        shelfs: THREEInterfases.IShelfData,
        material?: Material
    ) {
        const { depth, width: initWidth, height } = props.CONFIG.SIZE;
        const correction = shelfs.WIDTH_CORRECTION;
        const startPos = this.getStartPosition(props.CONFIG.SIZE);
        const parent = new THREE.Object3D();

        // Выбор материала
        const materialMap: Record<string, Material> = {
            MeshBasicMaterial: new THREE.MeshBasicMaterial(),
            MeshStandardMaterial: new THREE.MeshStandardMaterial(),
            MeshPhongMaterial: new THREE.MeshPhongMaterial(),
            MeshPhysicalMaterial: new THREE.MeshPhysicalMaterial(),
            MeshLambertMaterial: new THREE.MeshLambertMaterial(),
        };
        const matType = props.BODY.userData.MATERIAL_TYPE ?? "MeshStandardMaterial";
        const shelfMaterial = material || materialMap[matType] || materialMap.MeshStandardMaterial;

        // Очищаем массив полок
        props.SHELF = [];

        // Функция создания полок
        const createShelves = (axis: "X" | "Y", sizeKey: "width" | "height", posKey: "x" | "y", prefix: string) => {
            let width = initWidth;
            shelfs[axis].forEach((shelf, key) => {
                if (correction) width += correction;

                const mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(width - 32, 16, depth),
                    shelfMaterial
                );
                mesh.receiveShadow = true;
                mesh.position[posKey] = startPos[posKey] + eval(this.expressionsReplace(shelf, { [`#${axis}#`]: props.CONFIG.SIZE[sizeKey] }));
                mesh.name = `${prefix}_${key}`;

                props.SHELF.push(mesh);
                parent.add(mesh);
            });
        };

        createShelves("Y", "height", "y", "SHELF_HORIZONT");
        createShelves("X", "width", "x", "SHELF_VERTICAL");

        return parent;
    }

    /** Создание ножек модели */

    buildLegs(props: THREETypes.TObject, model_data: THREETypes.TObject, group: THREE.Object3D, height_correct?: (value: number, type: string) => number) {

        let size = props.CONFIG.SIZE
        // let leg_length = props.PRODUCT.leg_length
        let leg_length = this.modelState.getModels[props.PRODUCT].leg_length
        let legs = new THREE.Object3D()
        let model = model_data
        let start_position = this.getStartPosition(size)
        let leg_position

        if (model_data.json.legs) {
            leg_position = model_data.json.legs
        }
        else {
            leg_position = this.getLegPositions(start_position, size, model)
        }

        Object.values(leg_position as THREETypes.TObject[]).forEach((position, ndx) => {
            let leg = this.createLeg(leg_length)
            leg.position.set(position.x, position.y, position.z)
            legs.add(leg)
            // leg.updateMatrixWorld()


        })

        legs.name = 'LEGS'

        // group.add(legs)
        props.LEG = legs

        // console.log(leg_length, 'LEG')

        /** Добавляем высоту для корректировки положения модели */
        // height_correct ? height_correct(leg_length, 'bottom') : ""
        return legs
    };

    getLegPositions(start_position: THREETypes.TObject, size: THREETypes.TObject, model: THREETypes.TObject) {
        const { x, y, z } = start_position;
        const corr_x = model ? eval(model.corr_x) : 0;
        const corr_y = model ? eval(model.corr_y) : 0;
        const corr_z = model ? eval(model.corr_z) : 0;

        start_position.x += corr_x;
        start_position.y += corr_y;
        start_position.z += corr_z;

        let leg_position: { [key: string]: { x: number, y: number, z: number } } = {
            '1': { x: x + 70, y, z: z + 70 },
            '2': { x: x + size.width - 70, y, z: z + 70 },
            '3': { x: x + size.width - 70, y, z: z + size.depth - 70 },
            '4': { x: x + 70, y, z: z + size.depth - 70 },
        };

        if (model?.json?.sixLegs) {
            leg_position['5'] = { x: x + size.width / 2, y, z: z + 70 };
            leg_position['6'] = { x: x + size.width / 2, y, z: z + size.depth - 70 };
        }

        return leg_position;
    };

    createLeg(leg_length: number) {

        let group, top, bottom

        let material = new THREE.MeshPhongMaterial(
            { emissive: "#000000", color: "#000000", reflectivity: 0.05 }
            // this.outlineType
            //     ? {color: "#ffffff", opacity: 0.5, transparent: true}
            //     : {emissive: "#000000", color: "#000000", reflectivity: 0.05}
        );

        let topGeometry = new THREE.CylinderGeometry(14, 14, leg_length, 8);
        let bottomGeometry = new THREE.CylinderGeometry(25, 25, 20, 12);
        topGeometry.computeBoundingBox();
        bottomGeometry.computeBoundingBox();

        group = new THREE.Object3D();
        top = new THREE.Mesh(topGeometry, material);
        bottom = new THREE.Mesh(bottomGeometry, material);
        top.castShadow = true
        bottom.castShadow = true

        top.position.setY(-(leg_length / 2));
        bottom.position.setY(-leg_length + 10);

        group.add(top, bottom);

        return group;
    };

    /** Создание стрелок размеров модели */

    addArrowSize({ group, object, props }: { group: THREE.Object3D, object: THREE.Object3D, props: THREETypes.TObject }) {
        const arrows = new THREE.Object3D()
        let ruler = this.ruler.drawRullerObjects(object)

        ruler.forEach(item => {
            for (let i in item) {
                arrows.add(item[i])
            }
        })
        arrows.name = "ARROWS"
        props.ARROWS = arrows

        return arrows

        group.add(arrows)
    };

    /** @Дефолдтные глобальные значения цвета фасада/модуля */
    getDefaultModuleAndFasadeConfig(): THREETypes.TDefaultModuleAndFasadeConfig {
        const { moduleTop, moduleBottom, fasadsTop, fasadsBottom } = this.menuStore.getGlobalOptions;

        return {
            defModuleUp: moduleTop.id ?? this.project.default_module_color_up,
            defModuleDown: moduleBottom.id ?? this.project.default_module_color_down,
            defFasadeUp: fasadsTop.id ?? this.project.default_fasade_up,
            defFasadeDown: fasadsBottom.id ?? this.project.default_fasade_down,
            moduleTop,
            moduleBottom,
            fasadsTop,
            fasadsBottom
        }
    }

}
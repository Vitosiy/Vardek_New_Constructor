// @ts-nocheck

import * as THREE from 'three'
import type { Material } from 'three';
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

import { OBB } from 'three/examples/jsm/math/OBB.js';

import { useAppData } from "@/store/appliction/useAppData"
import { useSceneState } from "@/store/appliction/useSceneState"
import { useModelState } from '@/store/appliction/useModelState';
import { useMenuStore } from '@/store/appStore/useMenuStore.ts';
import { useRoomOptions } from "@/components/left-menu/option/roomOptions/useRoomOptons";

import { Resources } from '../Utils/Resources'
import { Ruler } from '../Utils/Ruler'

import { Filters } from './Utils/Filters'

import { JsonBuilder } from './JsonProductBuilder'
import { ModelsBuilder } from './ModelsBuilder/ModelsBuilder.ts'
import { MillingBuilder } from './MillingBuilder';
import { ShowcaseBuilder } from './ShowcaseBuilder.ts';

import { FasadeBuilder } from './FasadeBuilder';
import { TableTopBuilder } from './TableTopBuilder/TableTopBuilder.ts';
import { PaletteBuilder } from './PaletteBuilder';
import { AlumBuilder } from './AlumBuilder.ts';
import { UniformTextureBuilder } from './UniformTextureBuilder.ts';
import { BuildersHelper } from "./BuildersHelper"
import { EdgeBuilder } from './EdgeBuilder/EdgeBuilder.ts';
import { HandlesBuilder } from './Hendles/Handles.ts';
import { PlinthBuilder } from './PlinthBuilder/PlinthBuilder.ts';
import { DrowerBuilder } from './Drowers/DrowerBuilder.ts';
// import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
// import { group } from 'console';

export class BuildProduct extends BuildersHelper {

    root: THREETypes.TApplication;
    resources: Resources;

    project = useSceneState().getCurrentProjectParams;
    menuStore: ReturnType<typeof useMenuStore> = useMenuStore();
    roomOptions: ReturnType<typeof useRoomOptions> = useRoomOptions();
    modelState: ReturnType<typeof useModelState> = useModelState();

    ruler: THREETypes.TRuler
    filters: Filters;
    json_builder: JsonBuilder;
    models_builder: ModelsBuilder;
    milling_builder: MillingBuilder;
    showcase_builder: ShowcaseBuilder;
    handles_builder: HandlesBuilder
    fasade_builder: FasadeBuilder;
    palette_bulider: PaletteBuilder
    tabletop_builder: TableTopBuilder
    alum_builder: AlumBuilder
    edge_builder: EdgeBuilder
    plinth_builder: PlinthBuilder
    drower_builder: DrowerBuilder
    uniform_texture_builder: UniformTextureBuilder
    useEdgeBuilder: THREETypes.TUseEdgeBuilder


    constructor(root: THREETypes.TApplication) {
        super(root)

        this.root = root
        this.ruler = root.ruler!
        this.resources = root._resources!
        this.useEdgeBuilder = root.useEdgeBuilder
        this.disabledProducts = {};

        this.filters = new Filters(root);
        this.json_builder = new JsonBuilder(this);
        this.edge_builder = new EdgeBuilder(this);
        this.models_builder = new ModelsBuilder(this);
        this.milling_builder = new MillingBuilder(root);
        this.showcase_builder = new ShowcaseBuilder(root);
        this.palette_bulider = new PaletteBuilder(this);
        this.alum_builder = new AlumBuilder(this);
        this.uniform_texture_builder = new UniformTextureBuilder(root, this);
        this.handles_builder = new HandlesBuilder(this)
        this.fasade_builder = new FasadeBuilder(this);
        this.tabletop_builder = new TableTopBuilder(this);
        this.drower_builder = new DrowerBuilder(this)
        this.plinth_builder = new PlinthBuilder(this)
    }

    get _currentProduct() {
        return this
    }

    //========================================================================================================

    getModel(
        product_data: THREETypes.TObject,
        loaded_props?: THREETypes.TObject,
        loaded_size?: THREETypes.TObject
    ): Promise<THREE.Object3D> {
        return new Promise((resolve) => {
            const type = this._MODELS[product_data.models[0]];
            if (type.DAE) {
                return this.models_builder.create({
                    props: this.createStartProps(product_data),
                    size: loaded_size
                }).then(model => {
                    return this.finalizeModel(model, resolve, type);
                }).catch(err => {
                    console.error('Ошибка загрузки DAE:', err);
                });
            } else {

                const parentGroup = this.createPerentGroup(product_data, type, loaded_props, loaded_size);
                return this.finalizeModel(parentGroup, resolve);
            }


        });
    }

    private finalizeModel(model: THREE.Object3D, resolve: (obj: THREE.Object3D) => void, type: any) {
        if (type) {
            resolve(model);
            return;
        }

        const textures: THREE.Texture[] = [];

        model.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            const materials = Array.isArray(child.material) ? child.material : [child.material];

            materials.forEach((mat: THREE.Material) => {
                if (!mat) return;

                const maps = [
                    mat.map,
                    mat.normalMap,
                    mat.roughnessMap,
                    mat.metalnessMap,
                    mat.emissiveMap,
                    mat.aoMap,
                    mat.lightMap
                ];

                maps.forEach(tex => {
                    if (tex instanceof THREE.Texture && !tex.image) {
                        textures.push(tex);
                    }
                });
            });
        });

        if (textures.length === 0) {
            resolve(model);
            return;
        }

        let loaded = 0;
        const check = () => {
            if (++loaded === textures.length) {
                textures.forEach(tex => tex.removeEventListener('load', onTextureLoad));
                resolve(model);
            }
        };

        const onTextureLoad = () => check();

        textures.forEach(tex => {
            if (tex.image?.complete) {
                check();
            } else {
                tex.addEventListener('load', onTextureLoad());
            }
        });
    }

    private setupModel(model: THREE.Object3D, product_data: THREETypes.TObject) {
        model.userData.PROPS = this.createStartProps(product_data);
    }

    //========================================================================================================

    /** Создание данных модели */
    createPerentGroup(product_data: THREETypes.TObject, type: THREETypes.TObject, loadedProps?: THREETypes.TObject, loaded_size?: THREETypes.TObject) {
        // createPerentGroup(product_data: THREETypes.TObject, onLoad: (object: THREE.Object3D) => void, type: THREETypes.TObject, loadedProps?: THREETypes.TObject, loaded_size?: THREETypes.TObject) {

        let parent_group = new THREE.Object3D();

        /** Проверяем на загружаемы контент */
        let props: THREETypes.TObject = !loadedProps ? this.createStartProps(product_data) : loadedProps;

        parent_group.userData.PROPS = props

        /** Если модель */

        if (type.DAE) {
            // this.models_builder.create({ props })
            return parent_group
        }

        /** Если json  */ /** Если есть загружаемые размеры */

        let product = loaded_size ? this.createProductBody(parent_group, loaded_size) : this.createProductBody(parent_group)

        parent_group.add(product as THREE.Object3D)


        product!.name = product_data.NAME

        const aabb = new THREE.Box3().setFromObject(parent_group);

        // const aabb = this.computeAABB(parent_group)
        const obb = new OBB().fromBox3(aabb);
        const productSize = new THREE.Vector3();
        /** Для корректного примагничивания к стенам */
        aabb.getSize(productSize);
        /** Присваиваем тип объекта */
        parent_group.userData.elementType = product_data.element_type
        parent_group.elementType = product_data.element_type
        // if (product_data.element_type === null && Number.isInteger(product_data.leg_length)) {
        //     if (product_data.leg_length > 0) {
        //         parent_group.userData.elementType = "element_down"
        //         parent_group.elementType = "element_down"
        //     }

        // }

        parent_group.userData.trueSizes = product.userData.trueSizes ?? {
            DEPTH: productSize.z * 0.5,
            HEIGHT: productSize.y * 0.5,
            WIDTH: productSize.x * 0.5
        }

        parent_group.userData.disableRaycast = product_data.disable_raycast == 1
        parent_group.userData.aabb = product.userData.aabb ?? aabb
        parent_group.userData.obb = product.userData.obb ?? obb

        return parent_group
    }

    createStartProps(product_data: THREEInterfases.IProduct) {

        let props: THREETypes.TTotalProps = {
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
            JSON_FILLINGS: [],
            LEG: {},
            MILLINGS: [],
            PRODUCT: product_data.ID,
            PLINTH_MESH: null,
            RASPIL: [],
            RASPIL_LIST: [],
            RASPIL_COUNT: 0,
            SHELF: [],
            SEPARATED: [],
            SECTIONSOBJ: [],
            SECTIONCONTROL: [],
            TABLETOP: null,
            NAME: product_data.NAME
        }

        let params = this.createProductObject(product_data, props)
        props.CONFIG = params

        return props
    }

    private createProductObject(product_data: THREEInterfases.IProduct, props: THREETypes.TObject): THREETypes.TConfig {
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
            USLUGI,
            leg_length,
            OPTION
        } = product_data;

        let elType: THREETypes.TElementType
        if (element_type === null && Number.isInteger(leg_length)) {
            elType = "element_down"
        }
        else {
            elType = element_type
        }

        const PARAMS: THREETypes.TConfig = {
            DISABLE_MOVE: false,
            ELEMENT_TYPE: elType,
            ID,
            FASADE_PROPS: [],
            FASADE_SIZE: {},
            FASADE_POSITIONS: [],
            FASADE_TYPE: [],
            FILLING: false,
            HANDLES: {},
            HANDLES_POSITION: {},
            HAVETABLETOP: tabletop != null && this.project.table_top_type_auto,
            TABLETOP_ID: null,
            HIDE_FASADE: false,
            HIDDEN: false,
            MODELID: models[0],
            MODEL: models,
            MODULE_COLOR: null,
            MECHANIZM: null,
            MECHANIZM_TEMP: [],
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
            PLINTH_ACTIONS: {},
            PRODUCT_SHOWCASE: null,
            // ROTATION: null,
            UNIFORM_TEXTURE: {
                group: null,
                level: null,
                index: null,
                column_index: null,
                backupFasadId: null,
                color: null
            },
            OPTIONS: [],
            USLUGI: [],
            PROFILE: [],
            KROMKA: null
        };

        if (product_data.FILLING.length && product_data.FILLING[0]) {
            let filling_list = this.filters.filterFilling(this._FILLING, {
                PR: PARAMS,
                ID: product_data.FILLING,
            });

            PARAMS.FILLING = filling_list[0]?.ID;
        }

        if (this._PRODUCTS[ID].leg_length) {
            PARAMS.PLINTH_ACTIONS = this.createPlinthParams(this._PRODUCTS[ID].models)
        }

        if (OPTION.length && OPTION[0] !== null) {
            PARAMS.OPTIONS = this.filters.filterOption(OPTION)
        }

        if (FASADE_SIZES?.length) {

            PARAMS.FASADE_SIZE = this.filters.filterFasadeSizer(FASADE_SIZES, this._PRODUCTS[ID]) as any[];
            console.log(PARAMS.FASADE_SIZE, 'PARAMS.FASADE_SIZE')
        }

        if (FACADE?.[0]) {
            this.filters.filterFasadePosition(PARAMS, product_data);
        }

        if (MODULECOLOR?.[0] != null) {
            PARAMS.MODULE_COLOR = this.filters.filterModuleColor(MODULECOLOR)[0];
        }

        if (type_showcase?.[0] != null) {
            PARAMS.SHOWCASE = [...type_showcase];
            PARAMS.PRODUCT_SHOWCASE = type_showcase[0]
        }

        if (USLUGI?.[0] != null) {
            const { uslugi, profile } = this.filters.filterUslugi(USLUGI, product_data);
            PARAMS.PROFILE = profile
            PARAMS.USLUGI = this.createCutterParams(uslugi);
            props.RASPIL = this.createStartTopTableCutData(uslugi, product_data);
        }

        PARAMS.SIZE = this.getProductSize(PARAMS, product_data);
        PARAMS.SIZE_EDIT = this.getSizeEdit(product_data, PARAMS);

        console.log(PARAMS.SIZE, 'PARAMS.SIZE')

        return PARAMS;
    }

    /** Создание модели */

    public createProductBody(
        parentGroup: THREE.Object3D,
        size?: { width: number; height: number; depth: number } | null,
        fisadeSize?: boolean = false
    ) {
        // Режим чертежа
        const drowMode = this.menuStore.getDrowModeValue
        //---------------

        const total = new THREE.Object3D();
        const edgeBody = new THREE.Object3D()

        const { PROPS } = parentGroup.userData;
        const { CONFIG } = PROPS;

        const defaultConfig: THREETypes.TDefaultOptionsConfig = this.getDefaultOptionsConfig();

        PROPS.FASADE = [];
        PROPS.FASADE_DEFAULT = [];

        const productId = CONFIG.ID;
        const modelData = this._MODELS[CONFIG.MODELID];
        const modelSize = size ?? CONFIG.SIZE;
        const bodyExceptions = this.project.default_overlay_id
        const legsHeight = this._PRODUCTS[productId]?.leg_length
        const fasadeProps = Object.values(CONFIG.FASADE_PROPS)


        if (size && !fisadeSize) {
            // PROPS.CONFIG.SIZE = this.getProductSize(CONFIG, size);
            PROPS.CONFIG.SIZE = size;
        }
        if (size && fisadeSize) {
            PROPS.CONFIG.SIZE = this.getProductSize(CONFIG, size);
        }
        /** @Раскоментировать_по_необходимости   */
        // if (size === null && !fisadeSize) {
        //     PROPS.CONFIG.SIZE = this.getProductSize(CONFIG, this._PRODUCTS[PROPS.PRODUCT]);
        // }

        total.userData.prodSize = PROPS.CONFIG.SIZE

        if (!modelData) return;

        const data = this.createModelData(modelData, PROPS, modelSize);
        const curBodyExceptions = bodyExceptions?.includes(modelData.id)

        // Сборка частей
        const { body, tempMaterial, move } = !this.isEmpty(modelData)
            ? this.createBody(data, PROPS, defaultConfig)
            : { body: null, tempMaterial: null, move: null };

        const shelf = this._SHELF_POSITION[productId]
            ? this.createShelf(PROPS, this._SHELF_POSITION[productId], tempMaterial, move)
            : null;

        const legs = legsHeight
            ? this.buildLegs(PROPS, data, total)
            : null;

        const plinth = legsHeight > 0
            ? this.plinth_builder.buildPlinth(PROPS, legsHeight)
            : null;

        /** @Раскоментировать_по_необходимости   */
        // const tableTop = CONFIG.HAVETABLETOP
        //     ? this.tabletop_builder.createTableTop({ props: PROPS })
        //     : null;

        const fasade = fasadeProps.length
            ? this.fasade_builder.getFasade({
                props: PROPS,
                defaultConfig,
                curBodyExceptions
            })
            : null;

        const drower = fasadeProps.length > 0 && fasadeProps.some(item => item.DRAWER.drawer) ?
            this.drower_builder.createDrowers({
                props: PROPS,
            }) : null


        const arrows = this.addArrowSize({ object: body, props: PROPS, group: total });
        // Вычисление высот

        const bodyHeight = body ? this.calculateHeight(body) : 0;

        // Позиционирование
        const baseY = legsHeight * 0.5;

        if (legs) legs.position.y = baseY;
        if (plinth) plinth.position.y = 0;
        if (body) {
            body.position.set(move.x, move.y, move.z)
            body.position.y = baseY;
            body.visible = !curBodyExceptions;
        }
        if (shelf) shelf.position.y = baseY;
        if (fasade) fasade.position.y = baseY;
        if(drower) drower.position.y = baseY

        /** @Раскоментировать_по_необходимости   */
        // if (tableTop) {
        //     tableTop.position.y = baseY + bodyHeight * 0.5 + tableTopHeight * 0.5;
        //     tableTop.userData.positionWithoutTableTopHeight = baseY + bodyHeight * 0.5
        // }
        arrows.position.copy(body?.position);
        arrows.position.y = baseY;

        const getTotalGroup = () => {
            if (curBodyExceptions) {
                return [body, shelf, fasade, arrows]
            }
            return [plinth, legs, body, shelf, fasade, drower, arrows]
        }

        const totalGroup = getTotalGroup()


        // Добавление в итоговую группу
        totalGroup
            .filter(Boolean)
            .forEach((part) => {
                total.add(part as THREE.Object3D)
            });

        //---------------------------
        /** @Для корректной коллизии */
        //---------------------------

        const tempTotal = new THREE.Object3D();
        const exept = new THREE.Object3D();

        [legs?.clone(), body?.clone(), shelf?.clone()]
            .filter(Boolean)
            .forEach(part => tempTotal.add(part));

        [legs?.clone(), body?.clone(), plinth?.clone()].filter(Boolean)
            .forEach(part => exept.add(part));

        const sourceForBounds = curBodyExceptions ? exept : tempTotal;
        if (sourceForBounds) {
            this.setBounds(total, sourceForBounds);
        }

        if (drowMode) {
            this.useEdgeBuilder.drawingMode(drowMode, total)
        }

        return total;
    }

    /** Создание тела модели */

    private createBody(data: THREETypes.TObject, props: THREETypes.TObject, defaultConfig: THREETypes.TDefaultOptionsConfig) {
        const { CONFIG } = props;
        const { ELEMENT_TYPE, MODULE_COLOR, ID, SIZE } = CONFIG;
        const { defModuleUp, defModuleDown, moduleTop, moduleBottom } = defaultConfig
        const product = this._PRODUCTS[ID]
        const texture = product.texture;

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

        const moduleColorId = "src" in texture && !this._FASADE[MODULE_COLOR] ? MODULE_COLOR : resolveColorId();

        CONFIG.MODULE_COLOR = moduleColorId;

        const moduleColor = this._FASADE[moduleColorId];
        let left, right, top, back;

        const { BACKWALL, LEFTSIDECOLOR, RIGHTSIDECOLOR, TOPFASADECOLOR } = CONFIG;

        if (TOPFASADECOLOR?.SHOW) {
            let moduleThickness = this._FASADE[CONFIG.FASADE_PROPS[0]?.COLOR]?.DEPTH || moduleColor.DEPTH
            top = this._FASADE[TOPFASADECOLOR.COLOR]

            let topFasade_width = CONFIG.SIZE.width;
            let topFasade_depth = CONFIG.SIZE.depth + moduleThickness;
            let topFasade_thickness = top.DEPTH;

            TOPFASADECOLOR.width = topFasade_width
            TOPFASADECOLOR.depth = topFasade_depth
            TOPFASADECOLOR.thickness = topFasade_thickness

            let startPos = this.getStartPosition(CONFIG.SIZE);

            data.json.items.push({
                id: 'top_fasade',
                "type": "object",
                "geometry": {
                    "type": "BoxGeometry",
                    "opt": {
                        "x": topFasade_width,
                        "y": topFasade_thickness,
                        "z": topFasade_depth
                    }
                },
                "rotation": { "x": 0, "y": 0, "z": 0 },
                "position": {
                    "x": 0,
                    "y": startPos.y + CONFIG.SIZE.height + top.DEPTH / 2,
                    "z": startPos.z + CONFIG.SIZE.depth / 2 + moduleThickness / 2
                }
            })

            if (TOPFASADECOLOR.PALETTE)
                top = this._PALETTE[TOPFASADECOLOR.PALETTE]
        }
        if (LEFTSIDECOLOR?.SHOW) {
            left = this._FASADE[LEFTSIDECOLOR.COLOR]
            if (LEFTSIDECOLOR.PALETTE)
                left = this._PALETTE[LEFTSIDECOLOR.PALETTE]
        }
        if (RIGHTSIDECOLOR?.SHOW) {
            right = this._FASADE[RIGHTSIDECOLOR.COLOR]
            if (RIGHTSIDECOLOR.PALETTE)
                right = this._PALETTE[RIGHTSIDECOLOR.PALETTE]
        }
        if (BACKWALL?.SHOW) {
            back = this._FASADE[BACKWALL.COLOR]
            if (BACKWALL.PALETTE)
                back = this._PALETTE[BACKWALL.PALETTE]
        }

        const body = this.json_builder.createMesh({
            data,
            fasade: moduleColor,
            left,
            right,
            back,
            top,
        });

        const edge = this.edge_builder.createEdge(body);

        body.add(edge)

        const { geometryType } = body.userData;

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
        // console.log(move, data, 'CORRECT')
        // body.traverse((child) => {
        //     if (child instanceof THREE.Mesh) {
        //         child.geometry.translate(move);
        //     }
        // });

        props.BODY = body;

        const size = new THREE.Box3().setFromObject(body).getSize(new THREE.Vector3());
        body.userData.trueSize = {
            BODY_WIDTH: size.x,
            BODY_HEIGHT: size.y,
            BODY_DEPTH: size.z,
        };

        /** @Зеркало */
        if (product.productType == this.project.mirror_type) {

            body.traverse(el => {
                if (el instanceof THREE.Mesh && !el.userData.edge) {
                    const mirrorMat = new THREE.MeshPhysicalMaterial({
                        color: new THREE.Color(`#ffffff`),
                        metalness: 0.85,
                        roughness: 0,
                        clearcoat: 1,
                        clearcoatRoughness: 0.0,
                    })

                    el.material = mirrorMat
                    el.material.needsUpdate = true;
                }
            })
        }

        props.BODY_DEFAULT = body.clone();

        return { body, tempMaterial: body.children[0]?.material, move };
    }

    /** Создание полок */

    private createShelf(
        props: THREETypes.TObject,
        shelfs: THREEInterfases.IShelfData,
        material?: Material,
        move: THREETypes.TVector3
    ) {

        // console.log(props.CONFIG.SIZE, 'CONFIG')

        const { depth, width: initWidth, height } = props.CONFIG.SIZE;
        const correction = shelfs.WIDTH_CORRECTION;
        const startPos = this.getStartPosition(props.CONFIG.SIZE);
        const parent = new THREE.Object3D();

        const { BODY_DEPTH, BODY_WIDTH, BODY_HEIGHT } = props.BODY.userData.trueSize
        const correctDepth = depth > BODY_DEPTH ? BODY_DEPTH : depth
        // const { depth, width, height } = props.CONFIG.SIZE;
        // const checkCorrect = depth >= BODY_DEPTH
        // const sizes = checkCorrect ? { depth: BODY_DEPTH, width: BODY_WIDTH, height: BODY_HEIGHT } : props.CONFIG.SIZE


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
                    new THREE.BoxGeometry(width - 32, 16, correctDepth),
                    shelfMaterial
                );
                mesh.receiveShadow = true;
                mesh.position[posKey] = startPos[posKey] + eval(this.expressionsReplace(shelf, { [`#${axis}#`]: props.CONFIG.SIZE[sizeKey] }));
                mesh.position.z = move.z
                mesh.name = `${prefix}_${key}`;

                props.SHELF.push(mesh);

                const edge = this.edge_builder.createEdge(mesh);
                parent.add(mesh, edge);
            });
        };

        createShelves("Y", "height", "y", "SHELF_HORIZONT");
        createShelves("X", "width", "x", "SHELF_VERTICAL");

        return parent;
    }

    /** Создание ножек модели */

    private buildLegs(props: THREETypes.TObject, model_data: THREETypes.TObject, group: THREE.Object3D) {

        let size = props.CONFIG.SIZE
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

            // leg.updateMatrix();
            // leg.geometry.applyMatrix4(leg.matrix);
            // leg.position.set(0, 0, 0);

            legs.add(leg)
        })

        legs.name = 'LEGS'
        props.LEG = legs

        return legs
    };

    private getLegPositions(start_position: THREETypes.TObject, size: THREETypes.TObject, model: THREETypes.TObject) {
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

    private createLeg(leg_length: number) {

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

        // применяем матрицу трансформации к геометрии
        top.updateMatrix();
        top.geometry.applyMatrix4(top.matrix);
        top.position.set(0, 0, 0); // сброс позиции

        bottom.updateMatrix();
        bottom.geometry.applyMatrix4(bottom.matrix);
        bottom.position.set(0, 0, 0);

        const edgeTop = this.edge_builder.createEdge(top);
        const edgeBottom = this.edge_builder.createEdge(bottom);

        group.add(top, bottom, edgeTop, edgeBottom);

        return group;
    };

    /** Создание стрелок размеров модели */

    private addArrowSize({ group, object, props }: { group: THREE.Object3D, object: THREE.Object3D, props: THREETypes.TObject }) {
        const arrows = new THREE.Object3D()
        let ruler = this.ruler.drawRullerObjects(object, group)

        ruler.forEach(item => {
            for (let i in item) {
                if (!this.menuStore.getRulerVisibility) {
                    item[i].visible = false
                    item[i].traverse(child => {
                        child.visible = false;
                    });
                }

                arrows.add(item[i])
            }
        })
        arrows.name = "ARROWS"
        props.ARROWS = arrows

        return arrows

    };

    private setBounds(target: THREE.Object3D, source: THREE.Object3D) {
        const aabb = new THREE.Box3().setFromObject(source);
        const obb = new OBB().fromBox3(aabb);
        const size = new THREE.Vector3();
        aabb.getSize(size);

        target.userData.trueSizes = {
            DEPTH: size.z * 0.5,
            HEIGHT: size.y * 0.5,
            WIDTH: size.x * 0.5
        };
        target.userData.aabb = aabb;
        target.userData.obb = obb;
    }

    /** @Дефолдтные глобальные значения цвета фасада/модуля */
    getDefaultOptionsConfig(): THREETypes.TDefaultOptionsConfig {
        const { moduleTop, moduleBottom, fasadsTop, fasadsBottom, tableTop, plinth } = this.roomOptions.getGlobalOptions;
        return {
            defModuleUp: moduleTop.id ?? this.project.default_module_color_up,
            defModuleDown: moduleBottom.id ?? this.project.default_module_color_down,
            defFasadeUp: fasadsTop.id ?? this.project.default_fasade_up,
            defFasadeDown: fasadsBottom.id ?? this.project.default_fasade_down,
            deffShowcase: this.project.default_showcase,
            defMilling: this.project.default_milling,
            moduleTop,
            moduleBottom,
            fasadsTop,
            fasadsBottom,
            tableTop,
            plinth
        }
    }

}
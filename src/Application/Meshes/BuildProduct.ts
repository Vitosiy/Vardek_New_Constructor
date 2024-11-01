// @ts-nocheck 31

import * as THREE from 'three'
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types/types"

import { useAppData } from "@/store/appliction/useAppData"
import { useSceneState } from "@/store/appliction/useSceneState"
import { Resources } from '../Utils/Resources'
import { Ruler } from '../Utils/Ruler'

import { Filters } from './Utils/Filters'
// import { FasadeController } from './Utils/FasadeController'
import { JsonBuilder } from './JsonProductBuilder'
import { ModelsBuilder } from './ModelsBuilder'

export class BuildProduct {

    root: THREETypes.TApplication;
    resources: Resources;
    project = useSceneState().getCurrentProjectParams;
    ruler: Ruler = new Ruler()

    filters: Filters;
    // fasadController: FasadeController
    json_builder: JsonBuilder;
    models_builder: ModelsBuilder;

    private _APP: THREETypes.TObject = useAppData().getAppData
    private _MODELS: THREETypes.TObject = this._APP.MODELS
    private _CATALOG: THREETypes.TObject = this._APP.CATALOG
    private _SHELF_POSITION: THREETypes.TObject = this._APP.PRODUCT_SHELF_POSITION
    private _COLOR: THREETypes.TObject = this._APP.COLOR
    private _FASADE: THREETypes.TObject = this._APP.FASADE
    private _FASADESIZE: THREETypes.TObject = this._APP.FASADESIZE
    private _FASADE_SECTION: THREETypes.TObject = this._APP.FASADE_SECTION
    private _FASADE_POSITION: THREETypes.TObject = this._APP.FASADE_POSITION
    private _OPTION: THREETypes.TObject = this._APP.OPTION

    heightCorrect: number = 0

    constructor(root: THREETypes.TApplication) {
        this.root = root
        this.resources = root._resources

        this.filters = new Filters(root)
        // this.fasadController = new FasadeController(root)
        this.json_builder = new JsonBuilder(this);
        this.models_builder = new ModelsBuilder(this)
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

    getModel(product_data: THREETypes.TObject, onLoad: (object: THREE.Object3D) => void, loaded_props?: THREETypes.TObject): void {

        // console.log(product_data,'product_data')

        const type = this._MODELS[product_data.models[0]]

        let model = this.createPerentGroup(product_data, onLoad, type, loaded_props);


        if (!!type.DAE) return;

        onLoad(model as THREE.Object3D)
    }

    createPerentGroup(product_data: THREETypes.TObject, onLoad: (object: THREE.Object3D) => void, type: THREETypes.TObject, loadedProps?: THREETypes.TObject) {

        let perent_group = new THREE.Object3D();

        /** Проверяем на загружаемы контент */
        let props: THREETypes.TObject = !loadedProps ? this.createStartProps(product_data) : loadedProps;

        perent_group.userData.PROPS = props

        /** Если модель */

        if (type.DAE) {
            this.models_builder.create(type.file, onLoad, props)
            return
        }
        /** Если json */

        let product = this.createProductBody(perent_group)

        perent_group.add(product as THREE.Object3D)

        // body!.updateMatrixWorld(true)

        product!.name = product_data.NAME

        return perent_group
    }

    createProductObject(product_data: THREETypes.TObject, self: BuildProduct = this) {

        let PARAMS: THREETypes.TObject = {
            BASKET: {},
            DISABLE_MOVE: false,
            ELEMENT_TYPE: product_data.element_type,
            ID: product_data.ID,

            FASADE_COLOR_LIST: [],
            FASADE_COLOR: null,
            FASADE_LIST: {},
            FASADE_SIZE: {},
            FASADE_HEIGHT: {},
            FASADE_TYPE: {},
            FASADE_POSITIONS: {},
            FASADE_SHOW: false,

            HANDLES: {},
            HANDLES_POSITION: {},
            HAVETABLETOP: true,
            HIDE_FASADE: false,
            HIDDEN: false,
            HEIGHTCORRECT: 0,
            MODELID: product_data.models[0],
            MODEL: this._MODELS[product_data.models[0]],
            MODULE_COLOR: null,
            MODULE_COLOR_LIST: [],
            SIZE: {
                width: product_data.width,
                height: product_data.height,
                depth: product_data.depth,
            },
            SIZE_EDIT: {
                SIZE_EDIT_WIDTH_MIN: null,
                SIZE_EDIT_WIDTH_MAX: null,
                SIZE_EDIT_HEIGHT_MIN: null,
                SIZE_EDIT_HEIGHT_MAX: null,
                SIZE_EDIT_DEPTH_MIN: null,
                SIZE_EDIT_DEPTH_MAX: null
            },
            POSITION: {},
            ROTATION: {},
        }

        console.log(PARAMS.MODEL, "PARAMSMODEL")

        PARAMS.HAVETABLETOP = (product_data.tabletop != null && this.project.table_top_type_auto) as boolean

        // if (product_data.COLOR.length && product_data.COLOR[0]) {
        //     let color_list = this.filters.filterColor(this._COLOR, product_data);
        //     PARAMS.BASKET["COLOR"] = color_list[0].ID;
        // };


        if (product_data.FASADE_SIZES[0]) {

            let fasade_list = this.filters.filterFasadeSizer(product_data.FASADE_SIZES, false) as any[] /** Дополнить тип / интерфейс */

            Object.entries(fasade_list).forEach(([key, fasade]) => {
                PARAMS.FASADE_SIZE["FASADESIZE" + key] = fasade[0];
            })

        };

        if (product_data.FACADE.length && product_data.FACADE[0]) {

            // PARAMS.FASADE_POSITION = product_data.FASADE_POSITION

            let fasadeList = this.filters.filterFasadePosition(PARAMS, product_data)

            let fasade_color = this.filters.filteFasadeColor(product_data.FACADE);
            fasade_color.forEach((item: number) => {
                PARAMS.FASADE_COLOR_LIST.push(this._FASADE[item])
            })


        }

        if (product_data.MODULECOLOR.length && product_data.MODULECOLOR[0]) {
            let modulecolor_list = this.filters.filterModuleColor(product_data.MODULECOLOR)
            PARAMS.MODULE_COLOR = modulecolor_list[0];
            modulecolor_list.forEach((item: number) => {
                PARAMS.MODULE_COLOR_LIST.push(this._FASADE[item])
            })
        }

        PARAMS.SIZE = this.getProductSize(PARAMS, product_data);
        PARAMS.SIZE_EDIT = this.getSizeEdit(product_data, PARAMS)

        return PARAMS
    }

    createProductBody(perent_group: THREE.Object3D, size?: { width: number, height: number, depth: number }, self: BuildProduct = this) {

        const total = new THREE.Object3D();

        let model_props = perent_group.userData.PROPS

        const product_id = model_props.CONFIG.ID

        let model_data = model_props.CONFIG.MODEL

        let model_size = size ?? model_props.CONFIG.SIZE

        if (size) {
            model_props.CONFIG.SIZE = size
            this.getProductSize(model_props.CONFIG, size)
        }

        let height_correct = 0

        const getHeightCorrect = (value: number, type: string) => {
            switch (type) {
                case 'top':
                    height_correct -= value;
                    break
                case 'bottom':
                    height_correct += value;
            }

            return height_correct;
        }

        if (!model_data) return

        const data = this.createModelData(model_data, model_props, model_size)


        /**Добавляем каркас  */
        !this.isEmpty(model_data) ? this.createBody(total, data, model_props) : ""

        /** Добавляем столешницу если есть */
        model_props.CONFIG.HAVETABLETOP ? this.createTableTop(total, model_props, data, getHeightCorrect) : "";

        /** Добавляем полки если есть */
        this._SHELF_POSITION[product_id] ? this.createShelf(total, model_props, this._SHELF_POSITION[product_id]) : "";

        /** Добавляем ножки если есть */
        model_props.PRODUCT.leg_length ? this.buildLegs(model_props, data, total, getHeightCorrect) : "";

        /** Добавляем фасад */
        Object.keys(model_props.CONFIG.FASADE_LIST).length > 0 ? this.getFasade(total, model_props, data) : "";

        /** Корректировка общего Box3 по высоте  */
        total.position.y += height_correct / 2

        model_props.CONFIG.HEIGHTCORRECT = height_correct

        return total
    };

    /** Создание тела модели */

    createBody(group: THREE.Object3D, data: THREETypes.TObject, props: THREETypes.TObject) {

        let fasade = this._FASADE[props.CONFIG.MODULE_COLOR]

        let body = this.json_builder.createMesh({ data: data, fasade: fasade })

        body.position.set(eval(data.corr_x), eval(data.corr_y), eval(data.corr_z));
        body.matrixWorldNeedsUpdate = true
        body.name = "BODY"
        body.userData.MATERIAL = data.json.material.type

        group.add(body)

        props.BODY = body

        /** Добавляем стреки размеров */
        this.addArrowSize(group, body, props)
    };

    /** Создание фасада */

    getFasade(group: THREE.Object3D, props: THREETypes.TObject, model_data: THREETypes.TObject) {

        const sizes = props.CONFIG.SIZE
        let start_position = this.getStartPosition(sizes);

        const fasade_list = props.CONFIG.FASADE_LIST
        const product = props.PRODUCT

        Object.entries(fasade_list).forEach(([key, value]) => {

            const fasade_position = this.getFasadePosition(props.CONFIG, key);

            const fasade_position_number = this.calcFasadePosition(props.CONFIG, fasade_position)

            const fasade_id = props.CONFIG.FASADE_TYPE["FASADE" + key][0]

            props.CONFIG.FASADE_HEIGHT[`FASADESIZES${key}`] = [eval(fasade_position.FASADE_HEIGHT)];
            props.CONFIG.FASADE_POSITIONS[key] = fasade_position_number;

            let fasade = this.createFasade(fasade_position, start_position, fasade_id, props, key);

            if(fasade){
                fasade.visible = props.CONFIG.FASADE_SHOW
            }

            props.FASADE[key] = fasade

          

            group.add(fasade)

        })
    }

    createFasade(fasade_position: THREETypes.TObject, start_position: THREETypes.TObject, fasade_id: number | string, props: THREETypes.TObject, key: number | string) {

        const fasade_color = this._FASADE[fasade_id];

        let fasade;

        let model = fasade_position.FASADE_MODEL ? fasade_position.FASADE_MODEL : false;

        let geometry_height = eval(fasade_position.FASADE_HEIGHT);

        let product_model_type = props.CONFIG.MODEL?.type ?? "left";


        let geometry_config = {
            x: eval(fasade_position.FASADE_WIDTH),
            y: geometry_height,
            z: eval(fasade_position.FASADE_DEPTH),
        }

        let geometry = this.createExtrudeBoxGeometry(geometry_config);

        let material = new THREE.MeshPhongMaterial();

        if (props.CONFIG.FASADE_COLOR) {

            const url = this._FASADE[props.CONFIG.FASADE_COLOR].TEXTURE
            const textureSize = {
                width: this._FASADE[props.CONFIG.FASADE_COLOR].TEXTURE_WIDTH,
                height: this._FASADE[props.CONFIG.FASADE_COLOR].TEXTURE_HEIGHT,
            }

            this.getTexture(material, url, textureSize)
        }

        if (fasade_color.TYPE == "no_fasade") {
            fasade = new THREE.Mesh(geometry, material)
        }

        const position = this.setFasadePosition(fasade, fasade_position, product_model_type, props, start_position);
        fasade.geometry.computeBoundingBox()

        // console.log(fasade,'createFasade')

        return fasade

    }

    getFasadePosition(props: THREETypes.TObject, key: string | number) {
        const fasade_list = props.FASADE_LIST[key] || props.FASADE_LIST[1];
        const expressions = props.EXPRESSIONS;
        const fasadeThickness = 18;

        let fasade_position = this._FASADE_POSITION[fasade_list];
        const product_id = fasade_position?.PRODUCT || props.PRODUCT.ID

        let fasade_width = props.SIZE.width

        fasade_position = this.expressionsReplace(fasade_position,
            Object.assign(expressions,
                {
                    "#X#": fasade_width,
                    "#Y#": props.SIZE.height || 2100,
                    "#Z#": props.SIZE.depth,
                }))

        return fasade_position
    }

    setFasadePosition(fasade: THREE.Mesh, fasade_position: THREETypes.TObject, product_model_type: string, props: THREETypes.TObject, start_position: THREETypes.TObject) {
        fasade.rotation.set(0, 0, 0);

        // const setRotation = (axis: string, primary: string, fallback: string) => {
        //     // Получаем значение вращения из основного или запасного ключа
        //     const rotationValue = fasade_position[primary] ?? fasade_position[fallback];
        //     // Если значение есть, вычисляем радианы, иначе устанавливаем 0
        //     fasade.rotation[axis] = rotationValue ? (-rotationValue * Math.PI) / 180 : 0;
        // };

        // if (product_model_type === "left") {
        //     // Для "left" используем базовые значения
        //     ['y', 'z', 'x'].forEach((axis) => setRotation(axis, `ROTATE_${axis.toUpperCase()}`, `ROTATE_${axis.toUpperCase()}`));
        // }

        // if (product_model_type === "right") {
        //     // Для "right" используем приоритетные значения ROTATE_2_*
        //     ['y', 'x', 'z'].forEach(axis => setRotation(axis, `ROTATE_2_${axis.toUpperCase()}`, `ROTATE_${axis.toUpperCase()}`));
        // }

        // console.log(fasade.rotation)

        console.log(fasade_position, 'FFPP')


        let posx = eval(fasade_position.POSITION_X);
        let posy = eval(fasade_position.POSITION_Y);
        let posz = eval(fasade_position.POSITION_Z);

        posx = start_position.x + eval(fasade_position.FASADE_WIDTH) / 2 + posx;
        posy = start_position.y + eval(fasade_position.FASADE_HEIGHT) / 2 + posy;
        posz = start_position.z + posz;

        let position = new THREE.Vector3(posx, posy, posz)

        fasade.position.set(position.x, position.y, position.z)
    }

    calcFasadePosition(props: THREETypes.TObject, fasade_position: THREETypes.TObject) {

        const fasade_sizes = [eval(fasade_position.FASADE_HEIGHT)];

        let bottomFasadePosition = -(props.SIZE.height / 2);

        let fasadeSectionPositions: THREETypes.TObject = {}

        fasade_sizes.forEach((item, key) => {

            fasadeSectionPositions[key] = bottomFasadePosition + eval(fasade_position.POSITION_Y)
        });

        return fasadeSectionPositions;
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

                    console.log(props.CONFIG.EXPRESSIONS, 'table_1')

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

                    console.log(props.CONFIG.EXPRESSIONS, 'table_2')

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

                    tablet.renderOrder = 2

                    tableTop.add(tablet);

                }

            })

            let tableHeight = this.calculateHeight(tableTop)

            tableTop.position.setY(start_position.y + sizes.height + 38 / 2);
            tableTop.position.setZ(start_position.z + 300);
            tableTop.name = 'TABLETOP'

            group.add(tableTop)

            height_correct ? height_correct(tableHeight, 'top') : ""

            props.TABLETOP = tableTop

            console.log(props, 'table top')

            return
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
        console.log(tableBody, "TB")

        let tableHeight = this.calculateHeight(tableBody)

        tableBody.position.setY(start_position.y + sizes.height + 38 / 2);
        tableBody.position.setZ(start_position.z + 300);

        tableBody.name = 'TABLETOP'
        group.add(tableBody)
        height_correct ? height_correct(tableHeight, 'top') : ""
        props.TABLETOP = tableBody
        return
    };

    /** Создание полок */

    createShelf(group: THREE.Object3D, props: THREETypes.TObject, shelfs: THREEInterfases.IShelfData) {

        const size = props.CONFIG.SIZE
        let depth = size.depth;
        let width = size.width;
        const correction = shelfs.WIDTH_CORRECTION;
        let start_position = this.getStartPosition(size);
        let material: any /** THREE.Material */

        switch (props.BODY.userData.MATERIAL) {
            case 'MeshBasicMaterial':
                material = new THREE.MeshBasicMaterial();
                break;

            case 'MeshStandardMaterial':
            case undefined:
            case null:
                material = new THREE.MeshStandardMaterial();
                break

            case 'MeshPhongMaterial':
                material = new THREE.MeshPhongMaterial();
                break

            case 'MeshPhysicalMaterial':
                material = new THREE.MeshPhysicalMaterial();
                break

            case 'MeshLambertMaterial':
                material = new THREE.MeshLambertMaterial();
                break;
        }

        let module_color = this._FASADE[props.CONFIG.MODULE_COLOR].TEXTURE

        if (module_color) {
            this.getTexture(material, module_color)
        }

        /** Очищаем массив полок для корректной ззагрузки */
        props.SHELF = []

        if (shelfs['Y'].length > 0) {
            shelfs['Y'].forEach((shelf, key) => {
                correction ? width = width += correction : ''

                let horizont = new THREE.Mesh(
                    new THREE.BoxGeometry(width - 32, 16, depth),
                    material
                );
                horizont.receiveShadow = true;
                horizont.position.y = start_position.y + eval(this.expressionsReplace(shelf, { "#Y#": size.height }));
                horizont.name = `SHELF_HORIZONT_${key}`

                group.add(horizont);
                props.SHELF.push(horizont)
            })
        }
        if (shelfs['X'].length > 0) {
            shelfs['X'].forEach((shelf, key) => {
                correction ? width = width += correction : ''

                let vertical = new THREE.Mesh(
                    new THREE.BoxGeometry(width - 32, 16, depth),
                    material
                );
                vertical.receiveShadow = true;
                vertical.position.x = start_position.x + eval(this.expressionsReplace(shelf, { "#X#": size.width }));
                vertical.name = `SHELF_VERTICAL_${key}`

                group.add(vertical);
                props.SHELF.push(vertical)
            })
        }

    };

    /** Создание ножек модели */

    buildLegs(props: THREETypes.TObject, model_data: THREETypes.TObject, group: THREE.Object3D, height_correct?: (value: number, type: string) => number) {

        let size = props.CONFIG.SIZE
        let leg_length = props.PRODUCT.leg_length
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


        })

        legs.name = 'LEGS'

        group.add(legs)
        props.LEG = legs

        /** Добавляем высоту для корректировки положения модели */
        height_correct ? height_correct(leg_length, 'bottom') : ""
        return
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

    addArrowSize(group: THREE.Object3D, object: THREE.Object3D, props: THREETypes.TObject) {
        const arrows = new THREE.Object3D()
        let ruler = this.ruler.drawRullerObjects(object)

        ruler.forEach(item => {
            for (let i in item) {
                arrows.add(item[i])
            }
        })
        arrows.name = "ARROWS"
        props.ARROWS = arrows

        group.add(arrows)
    };

    getModuleColor() {

    }

    /** Дополнительные функции */

    createStartProps(product_data: THREETypes.TObject) {

        let props: THREETypes.TObject = {
            ARROWS: null,
            BODY: null,
            CONFIG: {},
            DRAWERS: {},
            EXPRESSIONS: {},
            FASADE: {},
            GLASS: {},
            HANDLES: {},
            HIDDENCHILDREN: {},
            HIDDEN: false,
            LEG: {},
            PRODUCT: product_data,
            RASPILLIST: [],
            RASPILFRAGMENT: [],
            SHELF: [],
            SEPARATED: [],
            SECTIONSOBJ: [],
            SECTIONCONTROL: [],
            TABLETOP: {},
        }

        let params = this.createProductObject(product_data)
        props.CONFIG = params

        return props
    }

    createModelData(data: THREETypes.TObject, props: THREETypes.TObject, size: { width: number, height: number, depth: number }) {
        let model_data = { ...data }

        model_data = this.expressionsReplace(
            model_data,
            {
                "#X#": size.width,
                "#Y#": size.height,
                "#Z#": size.depth,
            },
        )

        model_data = this.expressionsReplace(
            model_data,
            props.CONFIG.EXPRESSIONS
        )

        return model_data
    };

    getProductSize(PARAMS: any, product_data: THREETypes.TObject, EXPRESSIONS?: any) {

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
        return { x: -size.width / 2, y: -size.height / 2, z: -size.depth / 2 };
    };

    checkColor(product: THREETypes.TObject) {
        let self = this

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
                product.CONFIG.BASKET.MODULECOLOR = product.PRODUCT.MODULECOLOR[0];

                // показать сообщение
                //   self.scope.alerts[product.MODULECOLOR[0]] = "Цвет корпуса изменен.";

                return self._FASADE[product.PRODUCT.MODULECOLOR[0]];
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

    getTexture(material: any, url: string, texture_size?: THREETypes.TObject) {
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

        console.log(geometry, 'KKgeometry')

        return geometry;
    }

}
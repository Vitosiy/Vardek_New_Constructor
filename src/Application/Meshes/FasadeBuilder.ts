// @ts-nocheck 

import * as THREE from "three"
import * as THREETypes from "@/types/types"
import * as BufferGeometry from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { useAppData } from "@/store/appliction/useAppData"
import { useModelState } from "@/store/appliction/useModelState";
import { OBB } from 'three/examples/jsm/math/OBB.js';


type TFasadePartPosition = {
    WIDTH: number | null,
    FASADE_NUMBER: number | null
    TYPE_POSITION: string | null,
}


export class FasadeBuilder {

    modelState: ReturnType<typeof useModelState> = useModelState()
    parent: THREETypes.TBuildProduct
    uniformeTextureStartData: TFasadePartPosition[] = []
    _APP: THREETypes.TObject
    jsonBuilder: THREETypes.TJSONBuilder
    edgeBuilder: THREETypes.TEdgeBuilder
    useEdgeBuilder: THREETypes.TUseEdgeBuilder
    menuStore: THREETypes.TMenuStore
    handlesBuilder: THREETypes.THandlesBuilder


    constructor(parent: THREETypes.TBuildProduct) {
        this.parent = parent
        this._APP = parent._APP
        this.jsonBuilder = parent.json_builder
        this.edgeBuilder = parent.edge_builder
        this.useEdgeBuilder = parent.root.useEdgeBuilder
        this.menuStore = parent.root.menuStore
        this.handlesBuilder = parent.handles_builder
    }

    getFasade({
        props,
        fasadeNdx,
        incomingModel,
        isUMmodule = false,
        defaultConfig,
        curBodyExceptions,
        remove = false
    }: {
        props: THREETypes.TObject,
        fasadeNdx?: number,
        incomingModel?: number,
        isUMmodule?: boolean,
        defaultConfig: THREETypes.TDefaultOptionsConfig,
        curBodyExceptions?: boolean,
        remove?: boolean
    }) {
        // Режим чертежа (как в исходнике, не используем, но не убираем)
        const drowMode = this.menuStore.getDrowModeValue;

        const { FASADE_DEFAULT, FASADE, CONFIG, PRODUCT } = props;
        const { SIZE, FASADE_PROPS, FASADE_POSITIONS, FASADE_TYPE, ELEMENT_TYPE, PRODUCT_SHOWCASE, SHOWCASE } = CONFIG;
        const { defFasadeUp, defFasadeDown, fasadsTop, fasadsBottom, deffShowcase, default_milling } = defaultConfig;
        const currentProduct = this.modelState._PRODUCTS[PRODUCT]

        const startPosition = this.parent.getStartPosition(SIZE);
        const parent = new THREE.Object3D();
        const modelType = CONFIG.MODEL?.type ?? "left";

        if (remove) {
            CONFIG.UNIFORM_TEXTURE = {
                group: null,
                level: null,
                index: null,
                column_index: null,
                backupFasadId: null,
                color: null
            };
        }

        // Индексация под униформное текстурирование
        this.indexedFasadeToUtiformTexturing(props, isUMmodule);

        const resolveColorId = (fasadeColor: number) => {

            const isDefault = fasadeColor === this.parent.project.default_fasade_color;

            switch (ELEMENT_TYPE) {
                case "element_down":

                    return {
                        color: (defFasadeDown && isDefault) || fasadsBottom.global ? defFasadeDown : fasadeColor,
                        pallite: fasadsBottom.palitte,
                        milling: fasadsBottom.milling
                    }
                case "element_up":

                    return {
                        color: (defFasadeUp && isDefault) || fasadsTop.global ? defFasadeUp : fasadeColor,
                        pallite: fasadsTop.palitte,
                        milling: fasadsTop.milling
                    }
                default:
                    // console.log('None ')
                    return {
                        color: fasadeColor,
                        pallite: null,
                        milling: null
                    };
            }
        };

        if (Number.isInteger(fasadeNdx)) {

            const fasadeData: THREETypes.TFasadeProp = FASADE_PROPS[fasadeNdx];
            const { color, pallite, milling } = resolveColorId(fasadeData.COLOR);


            const haveShowcase = FASADE_POSITIONS[fasadeNdx].SHOWCASE === 1
            const curFasade = FASADE[fasadeNdx]
            curFasade.geometry = FASADE_DEFAULT[fasadeNdx].geometry.clone()
            if (remove) {
                fasadeData.COLOR = 7397;
                fasadeData.PALETTE = null;
                fasadeData.SHOW = false;
                fasadeData.GLASS = null;
                fasadeData.PATINA = null;
                fasadeData.SHOWCASE = null;
                fasadeData.ALUM = null
                fasadeData.HANDLES = this.handlesBuilder.restoreDefaultHandleData(fasadeData)
            }
            else {

                const includeIncomeFasade = currentProduct.FACADE.includes(color)
                fasadeData.COLOR = includeIncomeFasade ? color : 7397;
                fasadeData.SHOW = curBodyExceptions ? true : fasadeData.COLOR !== 7397;
                fasadeData.SHOWCASE = fasadeData.SHOW && haveShowcase ? fasadeData.SHOWCASE ?? SHOWCASE[0] ?? deffShowcase : null

                const firstValuePall = Object.values(this.parent.modelState.createCurrentPaletteData(fasadeData.COLOR))[0] as any;
                const firstValueGlass = this.parent.modelState.getCurrentGlassData[0] as any;
                const firstValueMilling = this.parent.modelState.createCurrentMillingData({ fasadeId: fasadeData.COLOR, productId: PRODUCT, fasadeNdx })[0] as any;

                if (fasadeData.SHOW && pallite && fasadeData.PALETTE === null) {
                    fasadeData.PALETTE = pallite;
                }

                if (fasadeData.SHOW && !firstValuePall && fasadeData.PALETTE != null) {
                    fasadeData.PALETTE = null;
                }

                if (fasadeData.SHOW && milling && fasadeData.MILLING === null) {
                    fasadeData.MILLING = milling;
                }

                if (fasadeData.SHOW && !firstValueMilling && fasadeData.MILLING != null && haveShowcase) {
                    fasadeData.MILLING = null;
                }

                if (fasadeData.SHOW && firstValueGlass && fasadeData.GLASS === null) {
                    fasadeData.GLASS = firstValueGlass.ID;
                }
            }

            // Позиция фасада вычисляется один раз
            const fasadePositionData = this.getFasadePosition(CONFIG, fasadeNdx, isUMmodule);
            curFasade.userData.SHOW = fasadeData.SHOW;


            // Палитра
            if (fasadeData.PALETTE != null) {
                this.parent.palette_bulider.createPaletteColor({
                    fasade: curFasade,
                    data: fasadeData.PALETTE,
                    fasadeProps: fasadeData,
                });
            }

            // Фрезеровка
            if (fasadeData.MILLING != null) {

                const millingParams = remove ? 2462671 : fasadeData.MILLING;
                if (remove) {
                    this.parent.milling_builder.createMillingFasade(
                        curFasade,
                        curFasade.userData.trueSize,
                        millingParams,
                        FASADE_DEFAULT[fasadeNdx],
                        fasadeData.PATINA
                    );
                    fasadeData.MILLING = null;
                } else {
                    this.parent.milling_builder.createMillingFasade(
                        curFasade,
                        curFasade.userData.trueSize,
                        millingParams,
                        FASADE_DEFAULT[fasadeNdx],
                        fasadeData.PATINA
                    );
                }
            }

            // Окно
            if (fasadeData.SHOWCASE != null) {

                this.parent.showcase_builder.createShowcase({
                    fasade: curFasade,
                    fasadePosition: curFasade.userData.trueSize,
                    data: fasadeData.SHOWCASE,
                    defaultGeometry: FASADE_DEFAULT[fasadeNdx],
                    alum: FASADE_PROPS[fasadeNdx].ALUM
                });
            }

            // Алюм. профиль
            if (fasadeData.ALUM != null && FASADE_PROPS[fasadeNdx].COLOR != null) {

                const alumData = this.parent._FASADE[FASADE_PROPS[fasadeNdx].COLOR];
                this.parent.alum_builder.createAlum({ fasade: curFasade, data: alumData });
            }


            // Цвет стекла
            if (fasadeData.GLASS != null) {
                this.parent.showcase_builder.changeGlassColor({
                    fasade: curFasade,
                    glassId: FASADE_PROPS[fasadeNdx].GLASS
                });
            }

            // Ручки
            if (fasadeData.HANDLES.id !== this.handlesBuilder.clearId) {
                const handleId = fasadeData.HANDLES.id
                const handleModel = this._APP.CATALOG.PRODUCTS[handleId].models[0]
                this.handlesBuilder.createHandle({ id: handleId, model: handleModel }, curFasade, fasadeData)
            }

            // Видимость фасада с учётом исключений
            if (!fasadeData.SHOW) {

                const canKeepException =
                    (curFasade.userData.curBodyExceptions && curFasade instanceof THREE.Mesh)

                if (canKeepException) {
                    curFasade.material = curFasade.userData.curBodyExceptionsMaterial.clone();
                    curFasade.material.needsUpdate = true;
                    curFasade.visible = true;
                } else {
                    curFasade.visible = false;
                }
            }

            this.uniformeTextureStartData = [];
            return;
        }

        // Перебор фасадов. Сохраняем исходную семантику фильтра по fasadeNdx.
        for (let key = 0; key < FASADE_PROPS.length; key++) {

            const fasadeData = FASADE_PROPS[key];
            const haveShowcase = FASADE_POSITIONS[key].SHOWCASE === 1

            // Массовая инициализация, когда remove=false и индекс не задан
            if (!remove && !fasadeNdx) {

                const { color, pallite, milling } = resolveColorId(fasadeData.COLOR);
                const includeIncomeFasade = currentProduct.FACADE.includes(color)

                console.log(currentProduct.FACADE.includes(color), 'currentProduct.FASADE')

                fasadeData.COLOR = includeIncomeFasade ? color : 7397;
                fasadeData.SHOW = curBodyExceptions ? true : fasadeData.COLOR !== 7397;
                fasadeData.SHOWCASE = fasadeData.SHOW && haveShowcase ? fasadeData.SHOWCASE ?? SHOWCASE[0] ?? deffShowcase : null

                const firstValuePall = Object.values(this.parent.modelState.createCurrentPaletteData(fasadeData.COLOR))[0] as any;
                const firstValueGlass = this.parent.modelState.createCurrentGlassData({ fasadeId: fasadeData.COLOR, productId: PRODUCT })[0] as any;
                const firstValueMilling = this.parent.modelState.createCurrentMillingData({ fasadeId: fasadeData.COLOR, productId: PRODUCT, fasadeNdx: key })[0] as any;

                if (fasadeData.SHOW && pallite && fasadeData.PALETTE === null) {
                    fasadeData.PALETTE = pallite;
                }
                if (fasadeData.SHOW && !firstValuePall && fasadeData.PALETTE != null) {
                    fasadeData.PALETTE = null;
                }

                if (fasadeData.SHOW && milling && fasadeData.MILLING === null) {

                    console.log('HERE')
                    fasadeData.MILLING = milling;
                }
                if (fasadeData.SHOW && !firstValueMilling && fasadeData.MILLING != null && PRODUCT_SHOWCASE && haveShowcase) {
                    fasadeData.MILLING = null;
                }

                if (fasadeData.SHOW && firstValueGlass && fasadeData.GLASS === null) {
                    fasadeData.GLASS = firstValueGlass.ID;
                }

            }

            // Позиция фасада вычисляется один раз
            const fasadePositionData = this.getFasadePosition(CONFIG, key, isUMmodule);

            // Создание фасада
            let { fasade, fasadeEdge, defaultEdge } = this.createFasade({
                fasade_position: fasadePositionData,
                start_position: startPosition,
                props_array: FASADE_PROPS,
                props,
                key,
                incomingModel,
                curBodyExceptions
            }) as THREE.Object3D;

            // Истинные размеры фасада и запись в CONFIG.FASADE_POSITIONS[key]

            const box = new THREE.Box3().setFromObject(fasade);
            const size = box.getSize(new THREE.Vector3());
            const sizeRec = {
                FASADE_WIDTH: size.x,
                FASADE_HEIGHT: size.y,
                FASADE_DEPTH: size.z
            };
            FASADE_POSITIONS[key].FASADE_WIDTH = size.x;
            FASADE_POSITIONS[key].FASADE_HEIGHT = size.y;
            FASADE_POSITIONS[key].FASADE_DEPTH = size.z;

            // fasade.userData.trueSize = sizeRec;
            // fasade.userData.type = FASADE_TYPE;

            // Позиционирование в сцене
            const result = this.setFasadePosition(fasade, fasadePositionData, modelType, startPosition, fasadeEdge);

            result.userData.trueSize = sizeRec;
            result.userData.type = FASADE_TYPE;

            // Создание ребра и добавление/восстановление фасада в массивы (точно как в исходнике)
            const isNewFasade = FASADE_DEFAULT.length < FASADE_PROPS.length;
            // const fasadeEdge = this.edgeBuilder.createEdge(fasade);
            result.userData.edgeID = fasadeEdge.id;

            if (isNewFasade) {
                FASADE.push(result);
                const copy = result.clone();
                FASADE_DEFAULT.push(copy);
                result.visible = result.userData.SHOW = FASADE_PROPS[key].SHOW;
                parent.add(result, fasadeEdge);

            }

            // Палитра
            if (fasadeData.PALETTE != null) {

                this.parent.palette_bulider.createPaletteColor({
                    fasade: result,
                    data: fasadeData.PALETTE,
                    fasadeProps: fasadeData
                });
            }

            // Фрезеровка
            if (fasadeData.MILLING != null) {
                this.parent.milling_builder.createMillingFasade(
                    result,
                    result.userData.trueSize,
                    fasadeData.MILLING,
                    FASADE_DEFAULT[key],
                    fasadeData.PATINA
                );
            }

            // Окно
            if (fasadeData.SHOWCASE != null) {
                this.parent.showcase_builder.createShowcase({
                    fasade: result,
                    fasadePosition: result.userData.trueSize,
                    data: fasadeData.SHOWCASE,
                    defaultGeometry: FASADE_DEFAULT[key],
                    alum: FASADE_PROPS[key].ALUM
                });
            }

            // Алюм. профиль
            if (fasadeData.ALUM != null && FASADE_PROPS[key].COLOR != null) {

                console.log('RESET ALUM')

                this.parent.showcase_builder.createShowcase({
                    fasade: result,
                    fasadePosition: result.userData.trueSize,
                    defaultGeometry: FASADE_DEFAULT[key],
                    alum: FASADE_PROPS[key].ALUM
                });

                const alumData = this.parent._FASADE[FASADE_PROPS[key].COLOR];
                this.parent.alum_builder.createAlum({ fasade: result, data: alumData });
            }

            // Цвет стекла
            if (fasadeData.GLASS != null) {
                this.parent.showcase_builder.changeGlassColor({
                    fasade: result,
                    glassId: FASADE_PROPS[key].GLASS
                });
            }

            if (fasadeData.HANDLES.id !== this.handlesBuilder.clearId) {
                const handleId = fasadeData.HANDLES.id
                const handleModel = this._APP.CATALOG.PRODUCTS[handleId].models[0]
                this.handlesBuilder.createHandle({ id: handleId, model: handleModel }, result, fasadeData)
            }

            // Видимость фасада с учётом исключений
            if (!fasadeData.SHOW) {

                const canKeepException =
                    (result.userData.curBodyExceptions && result instanceof THREE.Mesh);

                if (canKeepException) {
                    result.visible = true;
                } else {
                    result.visible = false;
                }
            }
        }
        // Очистка стартовых данных текстур как в исходнике

        this.uniformeTextureStartData = [];
        return parent;
    }

    createFasade({
        fasade_position,
        start_position,
        props,
        key,
        incomingModel,
        props_array,
        curBodyExceptions = false
    }: {
        fasade_position: THREETypes.TObject,
        start_position: THREETypes.TObject,
        props: THREETypes.TObject,
        key: number,
        incomingModel?: number,
        props_array: THREETypes.TObject[],
        curBodyExceptions: boolean
    }) {
        // const fasadeData = this.parent._FASADE[fasade_id];
        const { FASADE_PROPS, MODEL } = props.CONFIG;
        const currentFasadeColor = FASADE_PROPS[key]?.COLOR;
        const textureCheck = currentFasadeColor && currentFasadeColor != 7397
        const modelName = fasade_position.FASADE_MODEL;

        if (modelName) {
            const fasadeModel = this._APP.MODELS[modelName];
            if (fasadeModel) {
                // Создание фасада из модели
                let createdFasade
                let fasade = this.parent.json_builder.createMesh({
                    data: fasadeModel,
                    parent_size: {
                        x: this.parent.calculateFromString(fasade_position.FASADE_WIDTH ?? props.CONFIG.SIZE.width),
                        y: eval(fasade_position.FASADE_HEIGHT),
                        z: this.parent.calculateFromString(fasade_position.FASADE_DEPTH),
                        mX: props.CONFIG.SIZE.width,
                        mY: props.CONFIG.SIZE.height,
                        mZ: props.CONFIG.SIZE.depth
                    }
                });

                if (fasade.isObject3D && fasade.children.length > 1) {

                    const geometries: THREE.BufferGeometry[] = [];
                    fasade.children.forEach((el: THREE.Object3D, key: number) => { // Добавил key, если нужно
                        const clone = el.geometry.clone();
                        el.updateMatrixWorld();
                        clone.applyMatrix4(el.matrixWorld); // Запекаем мировую трансформацию

                        // КЛЮЧЕВОЕ: Локальная UV для каждой части перед merge — это фиксит размазывание
                        this.parent.planarUV(clone);

                        geometries.push(clone);
                    });

                    const material = new THREE.MeshPhongMaterial();
                    const merged = BufferGeometry.mergeGeometries(geometries, true);
                    this.parent.planarUV(merged);

                    if (textureCheck) {
                        const fasadeInfo = this.parent._FASADE[currentFasadeColor];
                        if (fasadeInfo?.TEXTURE) {

                            this.parent.getTexture({
                                material,
                                url: fasadeInfo.TEXTURE,
                            });
                        }
                    }

                    fasade = new THREE.Mesh(merged, material);
                    fasade.userData.mergedGeometry = true

                }

                const material = new THREE.MeshPhongMaterial();
                if (textureCheck && fasade.children.length == 1) {
                    const fasadeInfo = this.parent._FASADE[currentFasadeColor];
                    if (fasadeInfo?.TEXTURE) {

                        this.parent.getTexture({
                            material,
                            url: fasadeInfo.TEXTURE,
                            texture_size: {
                                width: fasadeInfo.TEXTURE_WIDTH,
                                height: fasadeInfo.TEXTURE_HEIGHT,
                            }
                        });
                    }
                    fasade.traverse(child => {
                        if (child instanceof THREE.Mesh) {
                            child.material = material
                            child.material.needsUpdate = true
                        }
                    })
                }

                /** ------ @Доделать_для_радиусного_шкафа ------ */

                if (fasade.isObject3D && fasade.children.length == 1) {


                    fasade.children[0].userData.partPosition = this.uniformeTextureStartData[key];
                    if (curBodyExceptions) fasade.userData.curBodyExceptionsMaterial = curExceptionsMaterial.clone()

                    const aabb = new THREE.Box3().setFromObject(fasade.children[0]);
                    const obb = new OBB().fromBox3(aabb);
                    fasade.children[0].userData.obb = obb
                    fasade.children[0].userData.curBodyExceptions = curBodyExceptions
                    fasade.children[0].name = 'fasade'
                    fasade.children[0].receiveShadow = true;
                    fasade.children[0].castShadow = true

                    const fasadeEdge = this.edgeBuilder.createEdge(fasade, fasade);
                    const defaultEdge = this.edgeBuilder.createVisibleEdge(fasade.children[0])

                    return { fasade, fasadeEdge }

                }

                fasade.userData.partPosition = this.uniformeTextureStartData[key];
                if (curBodyExceptions) fasade.userData.curBodyExceptionsMaterial = curExceptionsMaterial.clone()

                const aabb = new THREE.Box3().setFromObject(fasade);
                const obb = new OBB().fromBox3(aabb);
                fasade.userData.obb = obb
                fasade.userData.curBodyExceptions = curBodyExceptions
                fasade.name = 'fasade'
                fasade.receiveShadow = true;
                fasade.castShadow = true

                const fasadeEdge = this.edgeBuilder.createEdge(fasade, fasade);
                const defaultEdge = this.edgeBuilder.createVisibleEdge(fasade)

                return { fasade, fasadeEdge }
            }
        }
        // Если нет готовой модели — создаём стандартный фасад
        const geometryConfig = {
            x: this.parent.calculateFromString(fasade_position.FASADE_WIDTH),
            y: eval(fasade_position.FASADE_HEIGHT),
            z: this.parent.calculateFromString(fasade_position.FASADE_DEPTH),
        };
        const geometry = this.parent.createExtrudeBoxGeometry(geometryConfig);
        const material = new THREE.MeshPhongMaterial();
        const curExceptionsMaterial = new THREE.MeshPhongMaterial({
            transparent: true,
            opacity: 0.5,
            color: new THREE.Color('rgb(255, 0, 0)')
        });

        if (curBodyExceptions && currentFasadeColor == 7397) {
            material.transparent = true
            material.opacity = 0.5
            material.color = new THREE.Color('rgb(255, 0, 0)')
        }
        // Применяем текстуру, если задан цвет фасада
        if (textureCheck) {
            const fasadeInfo = this.parent._FASADE[currentFasadeColor];
            if (fasadeInfo?.TEXTURE) {

                this.parent.getTexture({
                    material,
                    url: fasadeInfo.TEXTURE,
                    texture_size: {
                        width: fasadeInfo.TEXTURE_WIDTH,
                        height: fasadeInfo.TEXTURE_HEIGHT,
                    }
                });
            }
        }

        let fasade = new THREE.Mesh(geometry, material);

        fasade.geometry.computeBoundingBox();
        fasade.userData.partPosition = this.uniformeTextureStartData[key];
        fasade.updateMatrixWorld();
        if (curBodyExceptions) fasade.userData.curBodyExceptionsMaterial = curExceptionsMaterial.clone()
        fasade.userData.curBodyExceptions = curBodyExceptions

        const aabb = new THREE.Box3().setFromObject(fasade);
        const obb = new OBB().fromBox3(aabb);
        fasade.userData.obb = obb

        fasade.name = 'fasade'
        const fasadeEdge = this.edgeBuilder.createEdge(fasade);
        const defaultEdge = this.edgeBuilder.createVisibleEdge(fasade)
        fasade.receiveShadow = true;
        fasade.castShadow = true

        fasade.add(defaultEdge)

        return { fasade, fasadeEdge }
    }

    private getFasadePosition(
        props: THREETypes.TObject,
        key: string | number,
        isUMmodule: boolean = false
    ) {

        if (isUMmodule) return props.FASADE_POSITIONS[key];

        const { SIZE, EXPRESSIONS, FASADE_PROPS, FASADE_POSITIONS, FASADE_SIZE } = props;

        const fasadeList = FASADE_PROPS[key]?.POSITION ?? FASADE_PROPS[0]?.POSITION;

        let fasadePosition = this.parent._FASADE_POSITION[fasadeList];

        const replacedExpressions = this.parent.expressionsReplace(fasadePosition, {
            ...EXPRESSIONS,
            "#X#": SIZE.width,
            "#Y#": SIZE.height || 2100,
            "#Z#": SIZE.depth,
        });

        const fasadePositionsData = {
            FASADE_WIDTH: this.parent.calculateFromString(replacedExpressions.FASADE_WIDTH),
            FASADE_HEIGHT: this.parent.calculateFromString(replacedExpressions.FASADE_HEIGHT),
            FASADE_DEPTH: this.parent.calculateFromString(replacedExpressions.FASADE_DEPTH),
            POSITION_X: this.parent.calculateFromString(replacedExpressions.POSITION_X),
            POSITION_Y: this.parent.calculateFromString(replacedExpressions.POSITION_Y),
            POSITION_Z: this.parent.calculateFromString(replacedExpressions.POSITION_Z),
            ROTATE_X: replacedExpressions.ROTATE_X,
            ROTATE_Y: replacedExpressions.ROTATE_Y,
            ROTATE_Z: replacedExpressions.ROTATE_Z,
            ROTATE_2_X: replacedExpressions.ROTATE_2_X,
            ROTATE_2_Y: replacedExpressions.ROTATE_2_Y,
            ROTATE_2_Z: replacedExpressions.ROTATE_2_Z,
            FASADE_NUMBER: replacedExpressions.FASADE_NUMBER - 1, // массив начинается с 0
            FASADE_MODEL: replacedExpressions.FASADE_MODEL,
            SHOWCASE: replacedExpressions.glass
        };

        // Добавляем фасадную позицию в CONFIG, если ещё не существует
        if (this.parent.addIfNotExists(FASADE_POSITIONS, fasadePositionsData)) {
            if (!FASADE_POSITIONS.length) {
                FASADE_POSITIONS.push(fasadePositionsData);
            } else {
                FASADE_POSITIONS[key] = fasadePositionsData;
            }
        }

        return replacedExpressions;
    }

    private setFasadePosition(
        fasade: THREE.Mesh,
        fasade_position: THREETypes.TObject,
        product_model_type: string,
        start_position: THREETypes.TObject,
        fasadeEdge: THREE.Mesh,
    ) {
        // Выбор углов поворота в зависимости от типа модели


        const isRightModel = product_model_type === "right";
        const rotX = THREE.MathUtils.degToRad(isRightModel ? fasade_position.ROTATE_2_X : fasade_position.ROTATE_X);
        const rotY = THREE.MathUtils.degToRad(-(isRightModel ? fasade_position.ROTATE_2_Y : fasade_position.ROTATE_Y));
        const rotZ = THREE.MathUtils.degToRad(isRightModel ? fasade_position.ROTATE_2_Z : fasade_position.ROTATE_Z);

        // Вычисляем позицию фасада
        const posX = this.parent.calculateFromString(fasade_position.POSITION_X)
            + start_position.x
            + this.parent.calculateFromString(fasade_position.FASADE_WIDTH) * 0.5;

        const posY = this.parent.calculateFromString(fasade_position.POSITION_Y)
            + start_position.y
            + this.parent.calculateFromString(fasade_position.FASADE_HEIGHT) * 0.5;

        const posZ = this.parent.calculateFromString(fasade_position.POSITION_Z)
            + start_position.z;


        fasade.rotation.set(rotX, rotY, rotZ);
        fasade.position.set(posX, posY, posZ);
        fasadeEdge.rotation.set(rotX, rotY, rotZ);
        fasadeEdge.position.set(posX, posY, posZ);

        const cloned: THREE.Mesh = fasade.clone()

        const modelName = fasade_position.FASADE_MODEL
        if (modelName) {

            if (cloned.isObject3D && cloned.children.length == 1) {
                const copy = cloned.children[0].clone()
                cloned.updateMatrixWorld(true);
                const worldMatrix = cloned.matrixWorld;
                copy.applyMatrix4(worldMatrix);

                return copy

            }
        }

        return fasade
    }

    //------------------------------
    /** @Для переходящего рисунка */
    //------------------------------

    private numberingToUniform(FASADE_PROPS, CONFIG, BODY, isUMmodule?: boolean = false) {

        const numered: TFasadePartPosition[] = []

        FASADE_PROPS.forEach((prop, propNdx) => {

            const fasade_position = this.getFasadePosition(CONFIG, propNdx, isUMmodule);

            const { BODY_WIDTH } = BODY.userData.trueSize
            const { FASADE_WIDTH } = fasade_position
            const fasadeWidth = this.parent.calculateFromString(FASADE_WIDTH)

            // console.log(fasade_position, 'fasade_position')


            const partPosition: TFasadePartPosition = {
                TYPE_POSITION: null,
                WIDTH: null,
                FASADE_NUMBER: null,
            }

            partPosition.TYPE_POSITION = fasadeWidth < BODY_WIDTH - 4 ? partPosition.TYPE_POSITION = 'row' : partPosition.TYPE_POSITION = 'col'
            partPosition.WIDTH = fasadeWidth
            partPosition.FASADE_NUMBER = propNdx

            numered.push(partPosition)

            // console.log(numered)

        })

        const hasColType = numered.some(obj => obj.TYPE_POSITION === 'col');
        const hasRowType = numered.some(obj => obj.TYPE_POSITION === 'row');
        const hasMixedTypes = hasColType && hasRowType;

        const result = {
            numeredArray: numered,
            hasMixedTypes
        }

        // console.log(result)

        return result

    }

    private rearrangeFasadeNumbers(inputArray) {
        const outputArray = [];
        let tempArray = [];
        const result = []
        const def = []
        let str = []
        let strNdx

        // Шаг 1: Изменяем порядок элементов с TYPE_POSITION: "STRING"
        for (let i = 0; i < inputArray.length; i++) {
            if (inputArray[i].TYPE_POSITION === "col") {
                if (tempArray.length > 0) {
                    outputArray.push(...tempArray.reverse()); // Добавляем элементы в обратном порядке
                    tempArray = []; // Очищаем временный массив
                }
                outputArray.push(inputArray[i]); // Добавляем элемент с DEFAULT
            } else if (inputArray[i].TYPE_POSITION === "row") {
                tempArray.push(inputArray[i]); // Добавляем элемент с STRING во временный массив
            }
        }

        // Если остались элементы в tempArray, добавляем их в outputArray
        if (tempArray.length > 0) {
            outputArray.push(...tempArray.reverse());
        }

        // Шаг 2: Обновляем значения FASADE_NUMBER
        let currentFasadeNumber = outputArray.length - 1; // Начинаем с максимального значения


        for (let i = 0; i < outputArray.length; i++) {
            if (outputArray[i].TYPE_POSITION === "col") {
                outputArray[i].FASADE_NUMBER = currentFasadeNumber;
                currentFasadeNumber--;
            } else if (outputArray[i].TYPE_POSITION === "row") {
                outputArray[i].FASADE_NUMBER = currentFasadeNumber;
                currentFasadeNumber--;
            }
        }

        // Шаг 3: Группируем значения STRING с лева на право
        outputArray.forEach((item, ndx, array) => {

            if (item.TYPE_POSITION === "col") def.push({ id: ndx + 1, type: item })

            if (ndx > 0 && array[ndx - 1].TYPE_POSITION === "col") {
                strNdx = ndx
                str.push({
                    id: ndx,
                    subStr: []
                })

            }

            if (item.TYPE_POSITION === "row") {
                str.forEach(elem => {
                    if (elem.id === strNdx) {
                        elem.subStr.push(item)
                    }
                })

            }

        })

        str.forEach(item => {
            item.subStr.reverse()
        })

        def.forEach((item, ndx) => {

            result.push(item.type)

            str.forEach(elem => {
                if (elem.id === item.id) {
                    result.push(elem.subStr)
                }
            })
        })

        return result.flat();
    }

    private indexedFasadeToUtiformTexturing(props: any, isUMmodule?: boolean = false) {

        const { CONFIG, BODY } = props
        const { FASADE_PROPS } = CONFIG

        const numeredFasade = this.numberingToUniform(FASADE_PROPS, CONFIG, BODY, isUMmodule)

        // console.log(this.rearrangeFasadeNumbers(this.originalArray), 'numeredFasade')




        if (numeredFasade.hasMixedTypes) {
            numeredFasade.numeredArray = this.rearrangeFasadeNumbers(numeredFasade.numeredArray)
        }

        this.uniformeTextureStartData = numeredFasade.numeredArray

    }

}
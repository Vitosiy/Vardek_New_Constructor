// @ts-nocheck 

import * as THREE from "three"
import * as THREETypes from "@/types/types"
import { useAppData } from "@/store/appliction/useAppData"
import { OBB } from 'three/examples/jsm/math/OBB.js';
// import * as THREEInterfases from "@/types/interfases"

type TFasadePartPosition = {
    WIDTH: number | null,
    FASADE_NUMBER: number | null
    TYPE_POSITION: string | null,
}


export class FasadeBuilder {

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
        const { SIZE, FASADE_PROPS, FASADE_POSITIONS, FASADE_TYPE, ELEMENT_TYPE, SHOWCASE } = CONFIG;
        const { defFasadeUp, defFasadeDown, fasadsTop, fasadsBottom } = defaultConfig;

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

        // Хелпер: выбор дефолтного цвета по типу элемента (точно как в исходнике)
        const resolveColorId = (fasadeColor: number) => {
            const isDefault = fasadeColor === this.parent.project.default_fasade_color;
            switch (ELEMENT_TYPE) {
                case "element_down":
                    // return ((defFasadeDown && isDefault) || (fasadsBottom.global && (defFasadeDown && isDefault))) ? defFasadeDown : fasadeColor;

                    return (defFasadeDown && isDefault) || fasadsBottom.global ? defFasadeDown : fasadeColor;
                case "element_up":
                    // return ((defFasadeUp && isDefault) || (fasadsTop.global && (defFasadeDown && isDefault))) ? defFasadeUp : fasadeColor; 

                    return (defFasadeUp && isDefault) || fasadsTop.global ? defFasadeUp : fasadeColor;
                default:
                    return fasadeColor;
            }
        };

        if (Number.isInteger(fasadeNdx)) {
            console.log('--2')
            const fasadeData: THREETypes.TFasadeProp = FASADE_PROPS[fasadeNdx];
            const curFasade = FASADE[fasadeNdx]
            if (remove) {
                fasadeData.COLOR = 7397;
                fasadeData.PALETTE = null;
                fasadeData.SHOW = false;
                fasadeData.GLASS = null;
                fasadeData.PATINA = null;
                fasadeData.WINDOW = null;
                fasadeData.HANDLES = this.handlesBuilder.restoreDefaultHandleData(fasadeData)
            }
            else {
                fasadeData.COLOR = resolveColorId(fasadeData.COLOR);
                fasadeData.SHOW = curBodyExceptions ? true : fasadeData.COLOR !== 7397;
                fasadeData.WINDOW = fasadeData.SHOW ? SHOWCASE[0] : null;

                const firstValuePall = Object.values(this.parent.modelState.createCurrentPaletteData(fasadeData.COLOR))[0] as any;
                const firstValueGlass = this.parent.modelState.createCurrentGlassData({ fasadeId: fasadeData.COLOR, productId: PRODUCT })[0] as any;

                if (fasadeData.SHOW && firstValuePall && fasadeData.PALETTE === null) {
                    fasadeData.PALETTE = firstValuePall.ID;
                }
                if (fasadeData.SHOW && !firstValuePall && fasadeData.PALETTE != null) {
                    fasadeData.PALETTE = null;
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
            if (fasadeData.WINDOW != null) {
                this.parent.window_builder.createWindow({
                    fasade: curFasade,
                    fasadePosition: curFasade.userData.trueSize,
                    data: fasadeData.WINDOW,
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
                this.parent.window_builder.changeGlassColor({
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

            // if (fasadeNdx !== null && fasadeNdx !== key) continue; // важно: 0 считается как "все", как в исходнике

            // Обнуление при remove + точечный индекс
            // if (remove && fasadeNdx === key) {
            //     fasadeData.COLOR = 7397;
            //     fasadeData.PALETTE = null;
            //     fasadeData.SHOW = false;
            //     fasadeData.GLASS = null;
            //     fasadeData.PATINA = null;
            //     fasadeData.WINDOW = null;
            // }

            // Массовая инициализация, когда remove=false и индекс не задан
            if (!remove && !fasadeNdx) {

                fasadeData.COLOR = resolveColorId(fasadeData.COLOR);
                fasadeData.SHOW = curBodyExceptions ? true : fasadeData.COLOR !== 7397;
                fasadeData.WINDOW = fasadeData.SHOW ? SHOWCASE[0] : null;

                const firstValuePall = Object.values(this.parent.modelState.createCurrentPaletteData(fasadeData.COLOR))[0] as any;
                const firstValueGlass = this.parent.modelState.createCurrentGlassData({ fasadeId: fasadeData.COLOR, productId: PRODUCT })[0] as any;

                if (fasadeData.SHOW && firstValuePall && fasadeData.PALETTE === null) {
                    fasadeData.PALETTE = firstValuePall.ID;
                }
                if (fasadeData.SHOW && !firstValuePall && fasadeData.PALETTE != null) {
                    fasadeData.PALETTE = null;
                }
                if (fasadeData.SHOW && firstValueGlass && fasadeData.GLASS === null) {
                    fasadeData.GLASS = firstValueGlass.ID;
                }

            }

            // Позиция фасада вычисляется один раз
            const fasadePositionData = this.getFasadePosition(CONFIG, key, isUMmodule);

            // Создание фасада
            const { fasade, fasadeEdge } = this.createFasade({
                fasade_position: fasadePositionData,
                start_position: startPosition,
                fasade_id: fasadeData.BODY,
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

            fasade.userData.trueSize = sizeRec;
            fasade.userData.type = FASADE_TYPE;

            // Позиционирование в сцене
            this.setFasadePosition(fasade, fasadePositionData, modelType, startPosition, fasadeEdge);

            // Создание ребра и добавление/восстановление фасада в массивы (точно как в исходнике)
            const isNewFasade = FASADE_DEFAULT.length < FASADE_PROPS.length;
            // const fasadeEdge = this.edgeBuilder.createEdge(fasade);
            fasade.userData.edgeID = fasadeEdge.id;

            if (isNewFasade) {
                FASADE.push(fasade);
                const copy = fasade.clone();
                FASADE_DEFAULT.push(copy);
                fasade.visible = fasade.userData.SHOW = FASADE_PROPS[key].SHOW;
                parent.add(fasade, fasadeEdge);
            }

            // Палитра
            if (fasadeData.PALETTE != null) {
                this.parent.palette_bulider.createPaletteColor({
                    fasade,
                    data: fasadeData.PALETTE,
                    fasadeProps: fasadeData
                });
            }

            // Фрезеровка
            if (fasadeData.MILLING != null) {
                this.parent.milling_builder.createMillingFasade(
                    fasade,
                    fasade.userData.trueSize,
                    fasadeData.MILLING,
                    FASADE_DEFAULT[key],
                    fasadeData.PATINA
                );

            }

            // Окно
            if (fasadeData.WINDOW != null) {
                this.parent.window_builder.createWindow({
                    fasade,
                    fasadePosition: fasade.userData.trueSize,
                    data: fasadeData.WINDOW,
                    defaultGeometry: FASADE_DEFAULT[key],
                    alum: FASADE_PROPS[key].ALUM
                });
            }

            // Алюм. профиль
            if (fasadeData.ALUM != null && FASADE_PROPS[key].COLOR != null) {
                const alumData = this.parent._FASADE[FASADE_PROPS[key].COLOR];
                this.parent.alum_builder.createAlum({ fasade, data: alumData });
            }

            // Цвет стекла
            if (fasadeData.GLASS != null) {
                this.parent.window_builder.changeGlassColor({
                    fasade,
                    glassId: FASADE_PROPS[key].GLASS
                });
            }

            if (fasadeData.HANDLES.id !== this.handlesBuilder.clearId) {
                const handleId = fasadeData.HANDLES.id
                const handleModel = this._APP.CATALOG.PRODUCTS[handleId].models[0]
                this.handlesBuilder.createHandle({ id: handleId, model: handleModel }, fasade, fasadeData)
            }

            // Видимость фасада с учётом исключений
            if (!fasadeData.SHOW) {

                const canKeepException =
                    (fasade.userData.curBodyExceptions && fasade instanceof THREE.Mesh);

                if (canKeepException) {
                    fasade.visible = true;
                } else {
                    fasade.visible = false;
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
        fasade_id,
        props,
        key,
        incomingModel,
        props_array,
        curBodyExceptions = false
    }: {
        fasade_position: THREETypes.TObject,
        start_position: THREETypes.TObject,
        fasade_id: number,
        props: THREETypes.TObject,
        key: number,
        incomingModel?: number,
        props_array: THREETypes.TObject[],
        curBodyExceptions: boolean
    }) {
        const fasadeData = this.parent._FASADE[fasade_id];

        const { FASADE_PROPS, MODEL } = props.CONFIG;
        const currentFasadeColor = FASADE_PROPS[key]?.COLOR;

        // const productModelType = MODEL?.type ?? "left";
        const modelName = fasade_position.FASADE_MODEL;

        if (modelName) {
            const fasadeModel = this._APP.MODELS[modelName];
            if (fasadeModel) {
                // Создание фасада из модели
                const fasade = this.parent.json_builder.createMesh({
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
                const created = fasade.children[0]

                fasade.userData.partPosition = this.uniformeTextureStartData[key];
                if (curBodyExceptions) fasade.userData.curBodyExceptionsMaterial = curExceptionsMaterial.clone()

                const aabb = new THREE.Box3().setFromObject(fasade);
                const obb = new OBB().fromBox3(aabb);
                // created.name = 'fasade'
                fasade.userData.obb = obb
                fasade.userData.curBodyExceptions = curBodyExceptions
                fasade.name = 'fasade'

                const fasadeEdge = this.edgeBuilder.createEdge(fasade, fasade);

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

        console.log(curBodyExceptions)

        if (curBodyExceptions && currentFasadeColor == 7397) {
            material.transparent = true
            material.opacity = 0.5
            material.color = new THREE.Color('rgb(255, 0, 0)')
        }
        // Применяем текстуру, если задан цвет фасада
        if (currentFasadeColor && currentFasadeColor != 7397) {
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
        fasade.receiveShadow = true;

        return { fasade, fasadeEdge }
    }

    private getFasadePosition(
        props: THREETypes.TObject,
        key: string | number,
        isUMmodule: boolean = false
    ) {
        if (isUMmodule) return props.FASADE_POSITIONS[key];

        const { SIZE, EXPRESSIONS, FASADE_PROPS, FASADE_POSITIONS } = props;
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
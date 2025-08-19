// @ts-nocheck

import * as THREE from "three"
import * as THREETypes from "@/types/types"
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

    constructor(parent: THREETypes.TBuildProduct) {
        this.parent = parent
        this._APP = parent._APP
        this.jsonBuilder = parent.json_builder
    }

    getFasade({
        group,
        props,
        fasadeNdx,
        incomingModel,
        isUMmodule = false,
        defaultConfig
    }: {
        group: THREE.Object3D,
        props: THREETypes.TObject,
        fasadeNdx?: number,
        incomingModel?: number,
        isUMmodule?: boolean,
        defaultConfig: THREETypes.TDefaultModuleAndFasadeConfig
    }) {
        const { FASADE_DEFAULT, FASADE, CONFIG, PRODUCT } = props;
        const { SIZE, FASADE_PROPS, FASADE_POSITIONS, FASADE_TYPE, ELEMENT_TYPE, SHOWCASE } = CONFIG;

        const { defFasadeUp, defFasadeDown, fasadsTop, fasadsBottom } = defaultConfig;
        const startPosition = this.parent.getStartPosition(SIZE);
        const parent = new THREE.Object3D();

        // Подготовка индексации для текстурирования
        this.indexedFasadeToUtiformTexturing(props, isUMmodule);

        // Перебор данных о фасадах
        FASADE_PROPS.forEach((fasadeData, key) => {

            // Получение позиции фасада
            const fasadePositionData = this.getFasadePosition(CONFIG, key, isUMmodule);
            const fasadeId = fasadeData.BODY;
            const fasadeColor = fasadeData.COLOR;

            // Определение цвета фасада с учетом типа элемента
            const resolveColorId = () => {
                const isDefault = fasadeColor === this.parent.project.default_fasade_color;

                switch (ELEMENT_TYPE) {
                    case "element_down":
                        return (defFasadeDown && isDefault) || fasadsBottom.global ? defFasadeDown : fasadeColor;
                    case "element_up":
                        return (defFasadeUp && isDefault) || fasadsTop.global ? defFasadeUp : fasadeColor;
                    default:
                        return fasadeColor;
                }
            };
            //------------------------------------------------
            /** @Временная заглушка */
            //------------------------------------------------
            if (!isUMmodule) {

                fasadeData.COLOR = resolveColorId();
                fasadeData.SHOW = fasadeData.COLOR != 7397;
                fasadeData.WINDOW = fasadeData.SHOW ? SHOWCASE[0] : null

                const firstValuePall = Object.values(this.parent.modelState.createCurrentPaletteData(fasadeData.COLOR))[0];
                const firstValueGlass = this.parent.modelState.createCurrentGlassData({ fasadeId: fasadeData.COLOR, productId: PRODUCT })[0]


                if (fasadeData.SHOW && firstValuePall && fasadeData.PALETTE === null) {
                    fasadeData.PALETTE = firstValuePall.ID
                }
                if (fasadeData.SHOW && firstValueGlass && fasadeData.GLAAS === null) {
                    fasadeData.GLAAS = firstValueGlass.ID
                }


            }

            // Создание объекта фасада
            const fasade = this.createFasade({
                fasade_position: fasadePositionData,
                start_position: startPosition,
                fasade_id: fasadeId,
                props,
                key,
                incomingModel,
                props_array: FASADE_PROPS,
            }) as THREE.Object3D;

            // Определение реальных размеров фасада
            const box = new THREE.Box3().setFromObject(fasade);
            const sizeVec = new THREE.Vector3();
            const size = box.getSize(sizeVec);

            const fasadeSize = {
                FASADE_WIDTH: FASADE_POSITIONS[key].FASADE_WIDTH = size.x,
                FASADE_HEIGHT: FASADE_POSITIONS[key].FASADE_HEIGHT = size.y,
                FASADE_DEPTH: FASADE_POSITIONS[key].FASADE_DEPTH = size.z,
            };

            fasade.userData.trueSize = fasadeSize;
            fasade.userData.type = FASADE_TYPE;

            // Позиционирование фасада в модели
            const modelType = CONFIG.MODEL?.type ?? "left";
            this.setFasadePosition(fasade, fasadePositionData, modelType, props, startPosition);

            // Добавление нового фасада, если он отсутствует
            const isNewFasade = FASADE_DEFAULT.length < FASADE_PROPS.length;
            if (isNewFasade) {
                FASADE.push(fasade);
                const copy = fasade.clone();
                copy.userData.rootFasadeParent = group;
                FASADE_DEFAULT.push(copy);
                fasade.visible = FASADE_PROPS[key].SHOW;
                parent.add(fasade);
            }

            // Восстановление фасада, если он был удален
            if (fasadeNdx === key && FASADE[fasadeNdx!] === null) {
                FASADE[key] = fasade;
                fasade.visible = true;
                parent.add(fasade);
            }

            // Добавление палитры, если она есть
            if (fasadeData.PALETTE != null) {
                this.parent.palette_bulider.createPaletteColor({ fasade, data: fasadeData.PALETTE, fasadeNdx: key, props });
            }

            // Добавление фрезеровки, если она есть
            if (fasadeData.MILLING != null) {
                this.parent.milling_builder.createMillingFasade(fasade, fasadeSize, fasadeData.MILLING, FASADE_DEFAULT[key], fasadeData.PATINA);
            }

            // Добавление окна, если оно есть
            if (fasadeData.WINDOW != null) {
                this.parent.window_builder.createWindow({
                    fasade,
                    fasadePosition: fasadeSize,
                    data: fasadeData.WINDOW,
                    defaultGeometry: FASADE_DEFAULT[key],
                    alum: FASADE_PROPS[key].ALUM,
                });
            }

            // Добавление алюминиевого профиля, если он есть
            if (fasadeData.ALUM != null && FASADE_PROPS[key].COLOR != null) {
                const alumData = this.parent._FASADE[FASADE_PROPS[key].COLOR];
                this.parent.alum_builder.createAlum({ fasade, data: alumData });
            }

            // Изменение цвета стекла, если оно есть
            if (fasadeData.GLASS != null) {
                this.parent.window_builder.changeGlassColor({ fasade, glassId: FASADE_PROPS[key].GLASS });
            }
        });

        // Очистка данных о текстурах
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
        props_array
    }: {
        fasade_position: THREETypes.TObject,
        start_position: THREETypes.TObject,
        fasade_id: number,
        props: THREETypes.TObject,
        key: number,
        incomingModel?: number,
        props_array: THREETypes.TObject[]
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
                return this.parent.json_builder.createMesh({
                    data: fasadeModel,
                    parent_size: {
                        x: this.parent.calculateFromString(fasade_position.FASADE_WIDTH),
                        y: eval(fasade_position.FASADE_HEIGHT),
                        z: this.parent.calculateFromString(fasade_position.FASADE_DEPTH),
                    }
                });
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

        // Применяем текстуру, если задан цвет фасада
        if (currentFasadeColor) {
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

        return fasade;
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
        props: THREETypes.TObject,
        start_position: THREETypes.TObject
    ) {
        // Выбор углов поворота в зависимости от типа модели
        const isRightModel = product_model_type === "right";
        const rotX = THREE.MathUtils.degToRad(isRightModel ? fasade_position.ROTATE_2_X : fasade_position.ROTATE_X);
        const rotY = THREE.MathUtils.degToRad(-(isRightModel ? fasade_position.ROTATE_2_Y : fasade_position.ROTATE_Y));
        const rotZ = THREE.MathUtils.degToRad(isRightModel ? fasade_position.ROTATE_2_Z : fasade_position.ROTATE_Z);

        fasade.rotation.set(rotX, rotY, rotZ);

        // Вычисляем позицию фасада
        const posX = this.parent.calculateFromString(fasade_position.POSITION_X)
            + start_position.x
            + this.parent.calculateFromString(fasade_position.FASADE_WIDTH) * 0.5;

        const posY = this.parent.calculateFromString(fasade_position.POSITION_Y)
            + start_position.y
            + this.parent.calculateFromString(fasade_position.FASADE_HEIGHT) * 0.5;

        const posZ = this.parent.calculateFromString(fasade_position.POSITION_Z)
            + start_position.z;

        fasade.position.set(posX, posY, posZ);
    }

    private calcFasadePosition(props: THREETypes.TObject, fasade_position: THREETypes.TObject) {

        const fasade_sizes = [eval(fasade_position.FASADE_HEIGHT)];

        let bottomFasadePosition = -(props.SIZE.height * 0.5);

        let fasadeSectionPositions: THREETypes.TObject = {}

        fasade_sizes.forEach((item, key) => {

            fasadeSectionPositions[key] = bottomFasadePosition + eval(fasade_position.POSITION_Y)
        });

        return fasadeSectionPositions;
    }

    // Для переходящего рисунка
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
// @ts-nocheck
import { useAppData } from "@/store/appliction/useAppData";
import { useModelState } from "@/store/appliction/useModelState";
import { useSceneState } from "@/store/appliction/useSceneState";
import { TFasadeProp } from "@/types/types";

type TWheightData = {
    width: number
    height: number
    square: number
    weight: number
}

type TMechanizmData = {
    ID: number,
    NAME: string,
    CLOSE_OTHER_OPTIONS: number | string,
    TYPE: string,
    active: boolean,
    visible: boolean
}

type TMechanizmListData = {
    NAME: string, CONTANT: TMechanizmData[]
}

export const useMechanizm = () => {

    const appData = useAppData()
    const modelState = useModelState();
    const sceneState = useSceneState();

    const weightCalculation = (): TWheightData[] | null[] | [] => {
        try {
            const { fasade_weight, milling_weight, CATALOG } = appData.getAppData
            const { PRODUCTS } = CATALOG
            const { PROPS } = modelState.getCurrentModel!.userData
            const { CONFIG, FASADE } = PROPS
            const { FASADE_PROPS } = CONFIG

            const defMilling = sceneState.getCurrentProjectParams.default_milling as number

            const weightData = FASADE_PROPS.map((fasade: TFasadeProp, ndx: number) => {
                if (fasade.COLOR == 7397) return null

                const { PRODUCT } = PROPS
                const { FASADE_WIDTH, FASADE_HEIGHT } = FASADE[ndx].userData.trueSize
                const product = PRODUCTS[PRODUCT]

                const prodMill = product.type_showcase[0] !== null && product.MILLING[0] !== null

                const curWeight = fasade_weight[fasade.COLOR]
                const curMilling = fasade.MILLING ? milling_weight[fasade.MILLING!] : prodMill ? milling_weight[defMilling] : null

                if (curWeight) {
                    const square = FASADE_WIDTH * FASADE_HEIGHT
                    const weight = parseFloat(curWeight) * (square / 1000000);

                    return {
                        width: FASADE_WIDTH,
                        height: FASADE_HEIGHT,
                        square: parseFloat(square.toFixed(2)),
                        weight: parseFloat(weight.toFixed(2))
                    }
                }
                else if (curMilling) {

                    const square = FASADE_WIDTH * FASADE_HEIGHT
                    const weight = parseFloat(curMilling) * (square / 1000000);

                    return {
                        width: FASADE_WIDTH,
                        height: FASADE_HEIGHT,
                        square: parseFloat(square.toFixed(2)),
                        weight: parseFloat(weight.toFixed(2))
                    }
                }
                return null

            })

            console.log(weightData, '✅ IN useMechanizm/weightCalculation -- weightData')
            return weightData

        } catch (e) {
            console.log('❌ Ошибка в методе weightCalculation объекта useMechanizm', e)
            return []
        }
    }

    const createMeckhanizmList = (): TMechanizmListData | [] => {
        try {
            const curModel = modelState.getCurrentModel;
            if (!curModel) return [];

            const { MECHANISM, CATALOG, condition_mechanism, OPTIONS_GROUP } = appData.getAppData;
            const { PRODUCTS } = CATALOG;
            const { PROPS } = curModel.userData;
            const { PRODUCT, CONFIG } = PROPS;
            const { SIZE, MECHANIZM } = CONFIG;
            const prodOptions = PRODUCTS[PRODUCT].OPTION;
            const weightsData = weightCalculation()

            if (weightsData.includes(null)) {

                console.log('❌ Результат метода weightCalculation объекта useMechanizm содержит null');
                CONFIG.MECHANIZM = null
                CONFIG.MECHANIZM_TEMP = []
                return [];
            }

            const totalWeight: number = weightsData
                .filter(Boolean)
                .reduce((sum, item) => sum + item!.weight, 0);

            if (!totalWeight) {
                CONFIG.MECHANIZM = null
                CONFIG.MECHANIZM_TEMP = []
                return []
            };

            const filtered: Record<string, string> = {};
            const mechanism: Record<string, Record<string, any>> | TMechanizmData[] = {};


            for (const optionKey in prodOptions) {
                const mechID = prodOptions[optionKey];
                const mech = MECHANISM[mechID]?.[PRODUCT];
                if (!mech) continue;

                const { PROPERTY_MECHANISM_LINK_VALUE, SECTION, GROUP, PROPERTY_TYPE_MECHANISM_VALUE, NAME } = mech;

                for (const linkID of PROPERTY_MECHANISM_LINK_VALUE) {
                    const cond = condition_mechanism[linkID];
                    if (!cond) continue;

                    const minH = parseFloat(cond.PROPERTY_RANGE_MIN_HEIGHT_VALUE);
                    const maxH = parseFloat(cond.PROPERTY_RANGE_MAX_HEIGHT_VALUE);
                    const minW = parseFloat(cond.PROPERTY_RANGE_MIN_WEIGHT_VALUE);
                    const maxW = parseFloat(cond.PROPERTY_RANGE_MAX_WEIGHT_VALUE);

                    const heightInRange = SIZE.height >= minH && SIZE.height <= maxH;
                    const weightInRange = totalWeight >= minW && totalWeight <= maxW;

                    if (!heightInRange || !weightInRange) continue;

                    if (filtered[SECTION] && filtered[SECTION] !== PROPERTY_TYPE_MECHANISM_VALUE) continue;
                    filtered[SECTION] = PROPERTY_TYPE_MECHANISM_VALUE;

                    mechanism[GROUP] ??= [];
                    mechanism[GROUP].push({
                        ID: mechID,
                        NAME,

                        TYPE: 'mechanizm',
                        group: GROUP,
                        close: '2',
                        active: MECHANIZM === parseFloat(mechID),
                        visible: true
                    })

                    // MINHEIGHT: minH,
                    // MAXHEIGHT: maxH,
                    // ALLWEIGHT: totalWeight,
                    // MINWEIGHT: minW,
                    // MAXWEIGHT: maxW,
                }
            }
            const result = Object.entries(mechanism).map(([key, value]) => {

                if (OPTIONS_GROUP[key]) {
                    return { NAME: OPTIONS_GROUP[key].NAME, CONTANT: value }
                }

            })

            createMeckhanizmTemp(mechanism)

            return result;

        } catch (e) {
            console.log('❌ Ошибка в методе createMeckhanizmList объекта useMechanizm', e);
            return [];
        }
    };

    const createMeckhanizmTemp = (data: TMechanizmData[] | []) => {
        const curModel = modelState.getCurrentModel;
        const { PROPS } = curModel!.userData;
        const { CONFIG } = PROPS;

        CONFIG.MECHANIZM_TEMP = Object.values(data).flat()

        console.log(CONFIG.MECHANIZM_TEMP, '_MECHANIZM')
    }

    return { weightCalculation, createMeckhanizmList }

}
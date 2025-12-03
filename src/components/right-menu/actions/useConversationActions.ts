import { useModelState } from "@/store/appliction/useModelState";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useToast } from "@/features/toaster/useToast";
import { TFasadeGroupSize } from "@/store/appliction/useModelState";

import { TTotalProps, TFasadeItem, TFasadeTrueSizes } from "@/types/types";

type TsizeData = {
    width: number
    height: number
    depth: number
}

export const useConversationActions = () => {

    const modelState = useModelState();
    const eventBus = useEventBus();
    const toaster = useToast();


    const onRsizeConversations = async (size: TsizeData) => {
        const curModel = modelState.getCurrentModel
        const restrictData = curModel?.userData.restrictData
        const { FASADE } = curModel?.userData.PROPS as TTotalProps;

        const { width, height } = size;

        if (Object.values(restrictData).length == 0) return;
       
        FASADE.forEach((_, key) => {
            const { MAX_HEIGHT, MIN_HEIGHT, MAX_WIDTH, MIN_WIDTH } = restrictData[key];
            const check =
                height <= MAX_HEIGHT &&
                height >= MIN_HEIGHT &&
                width <= MAX_WIDTH &&
                width >= MIN_WIDTH;

            if (!check) {
                eventBus.emit("A:Delite-Fasad", key);
                toaster.error(`Фасад №${key + 1} удалён`)
                toaster.error(`Размер Фасада №${key + 1} не соответствует доступному размеру полотна`)
            }
        });
    }

    const createFasadeConversations = (fasadeId: number): TFasadeGroupSize => {

        const temp = {
            MAX_HEIGHT: Infinity,
            MIN_HEIGHT: -Infinity,
            MAX_WIDTH: Infinity,
            MIN_WIDTH: -Infinity,
        }

        const { _FASADE_SECTION, _FASADE_SIZE_RESTRICT, _FASADE } = modelState
        const fasadeData = (_FASADE as TFasadeItem[])[fasadeId]
        const section = _FASADE_SECTION[fasadeData.IBLOCK_SECTION_ID];
        const groupId = section.UF_GROUP ?? section;

        if (!groupId) return temp

        const toCheck = modelState._FASADE_SIZE_RESTRICT[section.ID];
        const restrict = {
            MAX_HEIGHT: toCheck ? _FASADE_SIZE_RESTRICT[section.ID].SIZE_RESTRICT.HEIGHT : Infinity,
            MIN_HEIGHT: toCheck ? _FASADE_SIZE_RESTRICT[section.ID].SIZE_RESTRICT.MIN_HEIGHT : -Infinity,
            MAX_WIDTH: toCheck ? _FASADE_SIZE_RESTRICT[section.ID].SIZE_RESTRICT.WIDTH : Infinity,
            MIN_WIDTH: toCheck ? _FASADE_SIZE_RESTRICT[section.ID].SIZE_RESTRICT.MIN_WIDTH : -Infinity,
        }

        return restrict

    }

    const checkFasadeConversations = (fasadeId: number, size: TFasadeTrueSizes) => {
        const { FASADE_WIDTH, FASADE_HEIGHT } = size
        const { MAX_HEIGHT, MIN_HEIGHT, MAX_WIDTH, MIN_WIDTH } = createFasadeConversations(fasadeId)
        const check =
            FASADE_HEIGHT <= MAX_HEIGHT &&
            FASADE_HEIGHT >= MIN_HEIGHT &&
            FASADE_WIDTH <= MAX_WIDTH &&
            FASADE_WIDTH >= MIN_WIDTH;

        if (!check) {
            toaster.error(`Размер Фасада №${fasadeId + 1} не соответствует доступному размеру полотна`)
        }

        return check

    }

    const filterFasadeConversations = (fasadeNdx: number) => {
        const sceneModel = modelState.getCurrentModel;
        const { FASADE } = sceneModel?.userData.PROPS;
        const { FASADE_WIDTH, FASADE_HEIGHT } =
            FASADE[fasadeNdx].userData.trueSize;

        const tempList = modelState.getCurrentModelFasadesData
            .map((el) => {
                const check =
                    FASADE_HEIGHT <= el.GROUP_SIZE.MAX_HEIGHT &&
                    FASADE_HEIGHT >= el.GROUP_SIZE.MIN_HEIGHT &&
                    FASADE_WIDTH <= el.GROUP_SIZE.MAX_WIDTH &&
                    FASADE_WIDTH >= el.GROUP_SIZE.MIN_WIDTH;
                if (check) return el;
            })
            .filter(Boolean);

        console.log(tempList, 'tempList')


        return tempList;
    };


    return { onRsizeConversations, createFasadeConversations, checkFasadeConversations, filterFasadeConversations }

}
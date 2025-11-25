import { useModelState } from "@/store/appliction/useModelState";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useToast } from "@/features/toaster/useToast";

import { TTotalProps, TFasadeItem } from "@/types/types";

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
        console.log(restrictData, '=== restrictData ===')

        FASADE.forEach((_, key) => {
            const { HEIGHT, MIN_HEIGHT, WIDTH, MIN_WIDTH } = restrictData[key];
            const check =
                height <= HEIGHT &&
                height >= MIN_HEIGHT &&
                width <= WIDTH &&
                width >= MIN_WIDTH;

            if (!check) {
                eventBus.emit("A:Delite-Fasad", key);
                toaster.error(`Фасад №${key + 1} удалён`)
                toaster.error(`Размер Фасада №${key + 1} не соответствует доступному размеру полотна`)
            }
        });
    }

    const createFasadeConversations = async (data: TFasadeItem) => {
        const { _FASADE_SECTION } = modelState

    }

    return { onRsizeConversations, createFasadeConversations }

}
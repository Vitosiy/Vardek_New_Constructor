import { useAppData } from "@/store/appliction/useAppData";
import { useModelState } from "@/store/appliction/useModelState";

export const useRailsRightPage = () => {
    const appData = useAppData()
    const modelState = useModelState();

    const createOptionList = () => {

        const data = appData.getAppData
        const options = data.OPTION
        const optGroup = data.OPTIONS_GROUP
        const { PROPS } = modelState.getCurrentModel;
        // const option = data.CATALOG.PRODUCTS[PROPS.PRODUCT].OPTION
        const option = PROPS.CONFIG.OPTIONS


        let filtered = []
        const curOptionsList = option
            .map(el => {
                return { ...options[el.id], active: el.active }
            })
            .filter(Boolean);

        for (const el in optGroup) {

            filtered.push({
                NAME: optGroup[el].NAME,
                CONTANT: curOptionsList.filter(opt => opt.GROUP == el)
            })
        }

        filtered = filtered.filter(item => {
            if (item.CONTANT.length > 0) return item

        })

        return {
            props: PROPS.CONFIG.OPTIONS,
            data: filtered
        }
    }

    const checkActive = (id: string | number, values: boolean) => {
        const { PROPS } = modelState.getCurrentModel;
        const { OPTIONS } = PROPS.CONFIG;

        const curOpt = OPTIONS.find(el => el.id == id);
        if (!curOpt) return;

        if (values && curOpt.close === "0") {
            OPTIONS.forEach(opt => {
                if (opt.group === curOpt.group && opt.close === "0" && opt.id !== curOpt.id) {
                    opt.active = false;
                }
            });
        }

        curOpt.active = values;
    };


    return { createOptionList, checkActive }
}
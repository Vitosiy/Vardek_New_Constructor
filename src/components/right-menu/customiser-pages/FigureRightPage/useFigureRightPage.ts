import { useAppData } from "@/store/appliction/useAppData";
import { useModelState } from "@/store/appliction/useModelState";
import { TFasadeProp } from "@/types/types";



export type TFigureLable = 'Цоколь' | 'Плинтус' | 'Ручки'
export type TFigureName = 'Base' | 'Plinth' | 'Handles'
export type THandlesItem = {
    ID: number,
    PREVIEW_PICTURE: string,
    models: number,
    NAME: string
}

export interface IFigureItems {
    label: TFigureLable,
    name: TFigureName,
    action?: Function;
}

export interface IFigureFasade {
    label: string,
    name: string,
    props: TFasadeProp
    action?: Function;
}

export const useFigureRightPage = () => {

    const appData = useAppData()
    const modelState = useModelState();

    const createHandlesList = () => {
        const { PROPS } = modelState.getCurrentModel
        const ptoductId = PROPS.PRODUCT

        const data = appData.getAppData
        const { PRODUCTS } = data.CATALOG
        const { HANDLES } = PRODUCTS[ptoductId]

        const handlesTempList = HANDLES[0] != null ? HANDLES : data.HANDLES
        // const handlesMap: Record<number, THandlesItem> = {};
        const handlesMap: THandlesItem[] = []

        for (const el in handlesTempList) {
            const product = PRODUCTS[el];
            const temp = {
                ID: product.ID,
                PREVIEW_PICTURE: product.PREVIEW_PICTURE,
                models: product.models[0],
                NAME: product.NAME
            }
            // handlesMap[el] = temp
            handlesMap.push(temp)
        }

        return handlesMap

    }

    const createSurfaceList = () => {
        const { PROPS } = modelState.getCurrentModel;
        const { FASADE_PROPS } = PROPS.CONFIG
        const tempList: IFigureFasade[] = []

        for (const el in FASADE_PROPS) {
            tempList.push({
                label: `Фасад ${parseInt(el) + 1}`,
                name: `fasade ${parseInt(el) + 1}`,
                props: FASADE_PROPS[el],
                action: () => createHandlesList()
            })
        }

        return tempList

    }

    const figureItems: IFigureItems[] = [
        {
            label: 'Ручки',
            name: 'Handles',
            // action: () => createSurfaceList()
        }
    ]

    return { figureItems, createSurfaceList, createHandlesList }

}
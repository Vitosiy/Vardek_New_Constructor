// @ts-nocheck

import * as THREETypes from "@/types/types"
import { GlobalsData } from "./Globals"
import { useAppData } from "@/store/appliction/useAppData"
import { useSceneState } from "@/store/appliction/useSceneState"
import { useModelState } from "@/store/appliction/useModelState"
import { unwatchFile } from "fs"

export class Filters extends GlobalsData {

    root: THREETypes.TApplication
    trafficManager: THREETypes.TTrafficManager | null = null

    private project = useSceneState().getCurrentProjectParams;
    private modelState = useModelState()

    constructor(root: THREETypes.TApplication) {
        super();
        this.root = root
    }

    filterProductFasade(items) {

        const groupedFasades = {};

        items.forEach(facadeId => {
            const facade = this._FASADE[facadeId];

            if (!facade) return;

            const section = this._FASADE_SECTION[facade.IBLOCK_SECTION_ID];
            if (!section || !section.UF_GROUP) return;

            const groupId = section.UF_GROUP;

            if (!groupedFasades[groupId]) {
                groupedFasades[groupId] = [];
            }


            groupedFasades[groupId].push(facadeId);

        });

        // Формирование итогового массива
        const result = Object.entries(this._FASADE_GROUPS).map(([groupId, group]) => ({
            NAME: group.NAME,
            FASADES: groupedFasades[groupId] || [],
        })).filter(group => group.FASADES.length > 0 && group.NAME !== 'Без фасада');

    }

    filteFasadeColor(items: THREETypes.TObject) {
        return items.filter((colorId: number) => this._FASADE[colorId]).sort((a, b) => a.SORT - b.SORT);
    }

    filterFasadePosition(params: THREETypes.TObject, product: THREETypes.TObject) {


        const { FASADE_PROPS } = params

        // params.FASADE_TYPE = [...this._FASADE_POSITION[product.FASADE_POSITION].fasade_type]


        const fasadePositionList = product.FASADE_POSITION
        const fasadeSorted = fasadePositionList.sort((a, b) => this._FASADE_POSITION[a].FASADE_NUMBER - this._FASADE_POSITION[b].FASADE_NUMBER);

        params.FASADE_TYPE = fasadeSorted.reduce((acc, index) =>
            acc.concat(this._FASADE_POSITION[index]?.fasade_type || []),
            []);

        const sizes = product.FASADE_SIZES

        let sortFasadePositionList = sizes.length > 0 && sizes[0] != null ? sizes : fasadeSorted

        sortFasadePositionList.forEach((fasade: number, key) => {

            const fasadePosition = this._FASADE_POSITION[fasade]

            const fasadeNumber = fasadePosition.FASADE_NUMBER - 1

            const fasad = typeof FASADE_PROPS[fasadeNumber] === 'object' && FASADE_PROPS[fasadeNumber].TYPE ?
                FASADE_PROPS[fasadeNumber].TYPE :
                this.project.default_fasade_up

            // console.log(params.FASADE_PROPS.length < fasadePositionList.length ? this.project.default_fasade_up : null, 'hhhhhh')


            const fasadeProps: {
                SHOW: boolean | null,
                POSITION: number | null,
                COLOR: number | null,
                TYPE: number | null,
                MILLING: number | null,
                PALETTE: number | null,
                WINDOW: number | null,
                ALUM: number | null,
                GLASS: number | null,
                PATINA: number | null,

            } = {
                /** --- FASADE_PROPS ---*/
                // COLOR: params.FASADE_PROPS.length < fasadePositionList.length ? null : this.project.default_fasade_up,
                COLOR: this.project.default_fasade_up,
                SHOW: false,
                POSITION: fasadePosition.ID,
                BODY: fasad,
                MILLING: null,
                PALETTE: null,
                WINDOW: null,
                ALUM: null,
                GLASS: null,
                PATINA: null,
                TYPE: null,
            }

            FASADE_PROPS.push(fasadeProps)
        })

    }

    filterFasadeSizer(items: THREETypes.TObject, number: boolean | number) {

        const fasadeSize = this._FASADESIZE;
        const fasadeNumberSize = this._FASADENUMBERSIZE;

        if (number === false) {

            const result: THREETypes.TObject = {};

            // Перебираем все элементы массива items
            Object.values(items).forEach(size => {

                if (size === null) return

                // Для каждого размера проходим по фасадным элементам
                Object.entries(fasadeNumberSize[size]).forEach(([key, fasadeSizeIds]: any[]) => {

                    // Фильтруем только те фасадные элементы, которые существуют в fasadeSize
                    const validFasadeIds = fasadeSizeIds.filter((fasadeSizeId: any) => fasadeSize[fasadeSizeId]);
                    if (!validFasadeIds.length > 0) return

                    // Если ключ уже существует, используем существующий массив, иначе создаем новый
                    result[key] = result[key] || [];
                    // Добавляем отфильтрованные фасады в массив
                    result[key].push(...validFasadeIds);
                    // Сортируем массив по полю SORT
                    result[key].sort((a: any, b: any) => fasadeSize[a].SORT - fasadeSize[b].SORT);

                });
            });


            return result;
        }

        const result = Object.values(items)
            // Преобразуем объект в массив и разворачиваем его, получая плоский массив значений
            .flatMap(size => {
                // Получаем массив фасадов для данного размера, если он существует
                return fasadeNumberSize[size]?.[number as number] || [];
            })
            // Фильтруем элементы, оставляя только те, у которых существует ID фасада
            .filter(fasadeSizeId => fasadeSize[fasadeSizeId])
            // Сортируем фасады по их значению сортировки (SORT)
            .sort((a, b) => fasadeSize[a].SORT - fasadeSize[b].SORT);

        return result;
    }

    // filterColor(items: THREETypes.TObject, criteria: THREETypes.TObject) {

    //     this.trafficManager = this.root._trafficManager

    //     const selected = this.trafficManager!._currentObject

    //     const product = criteria ?? selected

    //     return product.COLOR.map((item: number) => items[item]).filter(Boolean);
    // }

    filterModuleColor(items: THREETypes.TObject) {
        return items.filter((colorId: number) => this._FASADE[colorId]);
    }

    // filterModuleColorID(items: THREETypes.TObject, criteria: THREETypes.TObject) {
    //     const tmp = {};
    //     const ids = criteria?.IDS || false;
    //     const s = criteria?.filter?.toLowerCase() || false;

    //     items.forEach((itemId: any) => {
    //         const item = this._FASADE[itemId] || itemId;

    //         if (!item?.ID && (!s || item.NAME?.toLowerCase().includes(s)) && item.ELEMENT_TYPE !== "plinth") return


    //         const section = this._FASADE_SECTION[item.IBLOCK_SECTION_ID];
    //         const groupId = section?.UF_GROUP_CONSTRUCTOR;

    //         if (!groupId && (ids || !ids.includes(item.ID))) return


    //         if (!tmp[groupId]) tmp[groupId] = [];

    //         if (
    //             self.scope.app.optionsTabName !== "defaultModuleColor" ||
    //             (item.ID !== 1042113 && item.ID !== 2307265 && item.ID !== 2307267)
    //         ) {
    //             tmp[groupId].push(item.ID);
    //         }


    //     });

    // }

} 
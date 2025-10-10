 //@ts-nocheck

import * as THREETypes from "@/types/types"
import { GlobalsData } from "./Globals"
import { useAppData } from "@/store/appliction/useAppData"
import { useSceneState } from "@/store/appliction/useSceneState"
import { useModelState } from "@/store/appliction/useModelState"
import { unwatchFile } from "fs"

import { TFasadeProp, IProductFull } from "@/types/types"

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


        const { FASADE_PROPS, ELEMENT_TYPE } = params

        // params.FASADE_TYPE = [...this._FASADE_POSITION[product.FASADE_POSITION].fasade_type]


        const fasadePositionList = product.FASADE_POSITION
        const fasadeSorted = fasadePositionList.sort((a, b) => this._FASADE_POSITION[a].FASADE_NUMBER - this._FASADE_POSITION[b].FASADE_NUMBER);
        const fasadeTypeSorted = fasadeSorted.reduce((acc, index) =>
            acc.concat(this._FASADE_POSITION[index]?.fasade_type || []),
            []);
        params.FASADE_TYPE = fasadeTypeSorted

        const sizes = product.FASADE_SIZES

        let sortFasadePositionList = sizes.length > 0 && sizes[0] != null ? sizes : fasadeSorted

        sortFasadePositionList.forEach((fasade: number, key: number) => {

            const fasadePosition = this._FASADE_POSITION[fasade]

            const hendleDirection = key % 2
            const handleInDorPosition = () => {
                if (!ELEMENT_TYPE || sortFasadePositionList.length < 2) return 0
                if (hendleDirection && ELEMENT_TYPE.includes('up')) { return 6 }
                if (!hendleDirection && ELEMENT_TYPE.includes('up')) { return 8 }
                if (hendleDirection && ELEMENT_TYPE.includes('down')) { return 0 }
                if (!hendleDirection && ELEMENT_TYPE.includes('down')) { return 2 }
            }
            const handlerPosition = fasadePosition.drawer ? 4 : handleInDorPosition()

            // console.log(fasadePosition.drawer
            //     , 'FASADE_POSITION')

            const fasadeNumber = fasadePosition.FASADE_NUMBER - 1

            const fasad = FASADE_PROPS[fasadeNumber]?.TYPE ?? this.project.default_fasade_color ?? 7397;
            const handles = this.project.default_handles

            const fasadeProps: TFasadeProp = {
                /** --- FASADE_PROPS ---*/
                // COLOR: params.FASADE_PROPS.length < fasadePositionList.length ? null : this.project.default_fasade_up,
                COLOR: this.project.default_fasade_color!,
                SHOW: false,
                POSITION: fasadePosition.ID,
                BODY: fasad,
                MILLING: null,
                PALETTE: null,
                SHOWCASE: null,
                ALUM: null,
                GLASS: null,
                PATINA: null,
                TYPE: null,
                HANDLES: {
                    id: handles!,
                    position: handlerPosition,
                    drawer: fasadePosition.drawer
                },
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

    filterModuleColor(items: THREETypes.TObject) {
        return items.filter((colorId: number) => this._FASADE[colorId]);
    }

    filterUslugi(product_uslugi: number[]) {

        const filtered = product_uslugi.filter(el => this._USLUGI[el])
        const filteredData = filtered.reduce((acc, el) => {
            acc.push(this._USLUGI[el])
            return acc

        }, [])


        return filteredData

    }

    filterOption(option: number[]) {
        let curOptionsList = option
            .map(el => this._OPTION[el])
            .filter(Boolean);

        const result = curOptionsList.map(el => {
            return { id: el.ID, active: false, group: el.GROUP, close: el.CLOSE_OTHER_OPTIONS }
        })

        return result
    }

} 
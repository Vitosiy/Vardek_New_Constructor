import * as THREETypes from "@/types/types"
import { useAppData } from "@/store/appliction/useAppData"
import { useSceneState } from "@/store/appliction/useSceneState"

export class Filters {

    root: THREETypes.TApplication
    trafficManager: THREETypes.TTrafficManager | null = null
    project = useSceneState().getCurrentProjectParams;


    _APP: THREETypes.TObject = useAppData().getAppData;
    _COLOR: THREETypes.TObject = this._APP.COLOR;
    _FASADE: THREETypes.TObject = this._APP.FASADE;
    _FASADESIZE: THREETypes.TObject = this._APP.FASADESIZE;
    _FASADENUMBERSIZE: THREETypes.TObject = this._APP.FASADENUMBERSIZE;
    _FASADE_SECTION: THREETypes.TObject = this._APP.FASADE_SECTION
    _FASADE_POSITION: THREETypes.TObject = this._APP.FASADE_POSITION

    constructor(root: THREETypes.TApplication) {
        this.root = root
    }

    filterProductFasade() {

    }

    filteFasadeColor(items: THREETypes.TObject) {
        return items.filter((colorId: number) => this._FASADE[colorId]);
    }

    filterFasadePosition(items: THREETypes.TObject, product: THREETypes.TObject) {

        let fasadeList = product.FASADE_POSITION

        fasadeList.forEach((fasade: number) => {
            let fasadePosition = this._FASADE_POSITION[fasade]
            let fasadeNumber = fasadePosition.FASADE_NUMBER

            console.log(fasadePosition, 'fasadePosition')

            // console.log(fasadeList)

            let fasad = !items.FASADE_TYPE['FASADE' + fasadeNumber] ? { 0: this.project.default_fasade_up } : items.FASADE_TYPE['FASADE' + fasadeNumber]

            Object.entries(fasad).forEach(([key, value]) => {

                let fasadeId = items.FASADE_TYPE[`FASADE${fasadePosition.FASADE_NUMBER}`]?.[key] ?? this.project.default_fasade_up

                items.FASADE_TYPE[`FASADE${fasadePosition.FASADE_NUMBER}`] = {}

                /** ---FASADELIST--- */
                items.FASADE_TYPE['FASADE' + fasadePosition.FASADE_NUMBER][key] = value;
                items.FASADE_LIST[fasadeNumber] = fasadePosition.ID
                /** ---FASADECOLOR--- */

                if (items.FASADE_COLOR == null) {
                    items.FASADE_COLOR = this.project.default_fasade_up
                }

            })

        })

    }

    filterFasadeSizer(items: THREETypes.TObject, number: boolean | number) {

        console.log(items, 'HH')

        const fasadeSize = this._FASADESIZE;
        const fasadeNumberSize = this._FASADENUMBERSIZE;

        if (number === false) {

            const result: THREETypes.TObject = {};

            // Перебираем все элементы массива items
            Object.values(items).forEach(size => {

                // Для каждого размера проходим по фасадным элементам
                Object.entries(fasadeNumberSize[size]).forEach(([key, fasadeSizeIds]: any[]) => {

                    // Фильтруем только те фасадные элементы, которые существуют в fasadeSize
                    const validFasadeIds = fasadeSizeIds.filter((fasadeSizeId: any) => fasadeSize[fasadeSizeId]);

                    if (validFasadeIds.length > 0) {
                        // Если ключ уже существует, используем существующий массив, иначе создаем новый
                        result[key] = result[key] || [];
                        // Добавляем отфильтрованные фасады в массив
                        result[key].push(...validFasadeIds);
                        // Сортируем массив по полю SORT
                        result[key].sort((a: any, b: any) => fasadeSize[a].SORT - fasadeSize[b].SORT);
                    }
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

    filterColor(items: THREETypes.TObject, criteria: THREETypes.TObject) {

        this.trafficManager = this.root._trafficManager

        const selected = this.trafficManager!._currentObject

        const product = criteria ?? selected

        return product.COLOR.map((item: number) => items[item]).filter(Boolean);
    }

    filterModuleColor(items: THREETypes.TObject) {
        return items.filter((colorId: number) => this._FASADE[colorId]);
    }

    filterModuleColorID(items: THREETypes.TObject, criteria: THREETypes.TObject) {
        const tmp = {};
        const ids = criteria?.IDS || false;
        const s = criteria?.filter?.toLowerCase() || false;

        items.forEach((itemId: any) => {
            const item = this._FASADE[itemId] || itemId;

            if (
                item?.ID &&
                (!s || item.NAME?.toLowerCase().includes(s)) &&
                item.ELEMENT_TYPE !== "plinth"
            ) {
                const section = this._FASADE_SECTION[item.IBLOCK_SECTION_ID];
                const groupId = section?.UF_GROUP_CONSTRUCTOR;

                if (groupId && (!ids || ids.includes(item.ID))) {
                    if (!tmp[groupId]) tmp[groupId] = [];

                    if (
                        self.scope.app.optionsTabName !== "defaultModuleColor" ||
                        (item.ID !== 1042113 && item.ID !== 2307265 && item.ID !== 2307267)
                    ) {
                        tmp[groupId].push(item.ID);
                    }
                }
            }
        });

        // const tmpl = {};

        // Object.keys(tmp).forEach((i) => {
        //     if (
        //         self.scope.app.optionsTabName !== "defaultModuleColor" ||
        //         (i !== "1294117" && i !== "953073")
        //     ) {
        //         tmpl[i] = {
        //             ...self.scope.app.FASADE_GROUPS[i],
        //             FASADES: tmp[i],
        //         };
        //     }
        // });

        // return tmpl;
    }
} 
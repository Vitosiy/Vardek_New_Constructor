//@ts-nocheck
import * as THREE from "three"
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAppData } from './useAppData';
import { TFasadeItem } from "@/types/types";
import { userData } from "three/webgpu";



interface IProductFasades {
    NAME: string,
    FASADES: number[],
}

interface IFasadeGroups {
    ID: number,
    NAME: string,
    SORT: number
}

interface IPalette {
    ID: number,
    NAME: string,
    TYPE: string,
    UNAME: string,
    HTML: string,
    PREVIEW_PICTURE: string | null,
    DETAIL_PICTURE: string | null
}

interface IMilling {
    ID: number,
    NAME: string,
    IBLOCK_SECTION_ID: number,
    DETAIL_PICTURE: string,
    PREVIEW_PICTURE: string,
    SORT: number,
    FACADEALIGNSELECT: number,
    PATINAOFF: number,
    MODEL: null,
    INCITY: null | string | number[],
    CITY: null | string | number[],
    delay_date: null | number,
    date_shipment: null | string | number,
    date_build: null | string | number,
    type_showcase: null | string | number[],
    fasade_type: null | string | number[],
    DENSITY: null
}

export const useModelState = defineStore('ModelState', () => {

    const _APP = useAppData().getAppData;
    const _COLOR = _APP.COLOR;
    const _FASADE = _APP.FASADE;
    const _FASADESIZE = _APP.FASADESIZE;
    const _FASADENUMBERSIZE = _APP.FASADENUMBERSIZE;
    const _FASADE_SECTION = _APP.FASADE_SECTION;
    const _FASADE_POSITION = _APP.FASADE_POSITION;
    const _FASADE_GROUPS: IFasadeGroups = _APP.FASADE_GROUPS
    const _PRODUCTS = _APP.CATALOG?.PRODUCTS
    const _PALETTE = _APP.PALETTE
    const _PLINTH = _APP.PLINTH
    const _MILLING = _APP.MILLING
    const _SHOWCASE = _APP.SHOWCASE
    const _GLASS = _APP.GLASS
    const _PATINA = _APP.PATINA
    const _HANDLES = _APP.HANDLES


    const models = ref<{ [key: string]: {} }>(_PRODUCTS)

    const currentModel = ref<THREE.Object3D | null>(null)

    const currentModulData = ref<any>(null)

    const currentBackwallData = ref<any>(null)

    const currentSidewallData = ref<any>(null)

    const currentTopfasadeData = ref<any>(null)

    const currentModelFasadesData = ref<IProductFasades[]>([])

    const currentPaletteData = ref<{ [key: string]: IPalette }>({})

    const currentMillingData = ref<IMilling[]>([])

    const currentWindowsData = ref<number[]>([])

    const currentFasadeTypesData = ref<number[]>([])

    const currentGlassData = ref<number[]>([])

    const currentPatinaData = ref<number[]>([])

    const transformControls = ref<boolean>(false)

    const setCurrentModel = (object: THREE.Object3D | any) => {
        console.log(object, 'SETED')
        currentModel.value = object
    }

    const getCurrentModel = computed(() => {
        // return currentModel.value?.userData || currentModel.value
        return currentModel.value
        //return currentModel.value?.userData
    })
    const getModels = computed(() => {
        return models.value
    })

    /** ------- Работа с Модулем -------- */

    const createCurrentModuleData = (value: number[]) => {

        const colorMap = new Set();
        const colorsList = value.filter((colorId: number) => _FASADE[colorId]);

        colorsList.forEach(color => {
            if (_FASADE[color] !== undefined) {
                colorMap.add(_FASADE[color]);
            }
        });
        currentModulData.value = Array.from(colorMap)
    }

    const getCurrentModuleData = computed(() => {
        return currentModulData.value
    })

    /** ------- Задняя стенка -------- */

    const createCurrentBackwallData = (productId: number) => {
        const productInfo = _PRODUCTS[productId]

        if(productInfo.BACKWALL?.length && productInfo.BACKWALL[0]) {
            const colorMap = new Set();
            const colorsList = productInfo.BACKWALL.filter((colorId: number) => _FASADE[colorId]);

            colorsList.forEach(color => {
                if (_FASADE[color] !== undefined) {
                    colorMap.add(_FASADE[color]);
                }
            });
            currentBackwallData.value = Array.from(colorMap)
        }
    }

    const getCurrentBackwallData = computed(() => {
        return currentBackwallData.value
    })

    /** ------- Боковые стенки -------- */

    const createCurrentSidewallData = (productId: number) => {

        const productInfo = _PRODUCTS[productId]

        if(productInfo.SIDEWALL?.length && productInfo.SIDEWALL[0]) {
            const colorMap = new Set();
            const colorsList = productInfo.SIDEWALL.filter((colorId: number) => _FASADE[colorId]);

            colorsList.forEach(color => {
                if (_FASADE[color] !== undefined) {
                    colorMap.add(_FASADE[color]);
                }
            });
            currentSidewallData.value = Array.from(colorMap)
        }
    }

    const getCurrentSidewallData = computed(() => {
        return currentSidewallData.value
    })

    /** ------- Накладка на крышку -------- */

    /*const createCurrentTopfasadeData = (value: number[]) => {

        const colorMap = new Set();
        const colorsList = value.filter((colorId: number) => _FASADE[colorId]);

        colorsList.forEach(color => {
            if (_FASADE[color] !== undefined) {
                colorMap.add(_FASADE[color]);
            }
        });
        currentTopfasadeData.value = Array.from(colorMap)
    }

    const getCurrentTopfasadeData = computed(() => {
        return currentTopfasadeData.value
    })*/



    /** ------- Работа с Цоколем -------- */

    const createTotalPlinthData = () => {
        let percept = {}
        const result = Object.entries(_PLINTH).map(([key, el]) => {
            return percept[key] = _PRODUCTS[el]
        })

        // console.log(percept)

        // const filtered = Object.values(_PLINTH).map(el => {
        //     return _PRODUCTS[el]
        // })


        return percept
    }

    const createTotalPlinthColorData = (plinthId) => {
        if (!_PLINTH[plinthId]) return []

        const { FACADE } = _PRODUCTS[plinthId]
        const filter = FACADE.map(el => {
            return _FASADE[el] ?? null
        })

        return filter


    }

    /** ------- Работа с фасадами -------- */

    const createCurrentModelFasadesData = (value: number[], def: boolean = false) => {

        const groupedFasades: { [key: string]: number[] } = {};
        let exception = !def ? 'Без фасада' : ''


        value.forEach(facadeId => {
            const facade = _FASADE[facadeId];
            if (!facade) return;

            const section = _FASADE_SECTION[facade.IBLOCK_SECTION_ID];
            if (!section || !section.UF_GROUP) return;

            const groupId: string = section.UF_GROUP;

            if (!groupedFasades[groupId]) {
                groupedFasades[groupId] = [];
            }

            groupedFasades[groupId].push(facadeId);
        });

        // Формирование итогового массива
        const result = Object.entries(_FASADE_GROUPS).map(([groupId, group]) => ({
            NAME: group.NAME,
            FASADES: groupedFasades[groupId] || [],
        })).filter(group => group.FASADES.length > 0 && group.NAME !== exception);

        if (def) {
            return result
        }

        currentModelFasadesData.value = result
    }

    const clearCurrentModelFasadesData = () => {
        currentModelFasadesData.value = []
    }

    const getCurrentModelFasadesData = computed(() => {
        return currentModelFasadesData.value
    })

    /** Палитра */
    const createCurrentPaletteData = (value: number | string) => {

        let result = {}
        if (!_FASADE[value]) return result
        if (_FASADE[value].PALETTE.length && _FASADE[value].PALETTE[0] != null) {
            result = Object.keys(_PALETTE)
                .filter(
                    (key) =>
                        _PALETTE[key].TYPE ===
                        _FASADE[value].PALETTE[0]
                )
                .reduce((obj, key) => {
                    obj[key] = _PALETTE[key];
                    return obj;
                }, {});

            currentPaletteData.value = result

            return result
        }

        currentPaletteData.value = result
        return result
    }

    const getCurrentPaletteData = computed(() => {
        return currentPaletteData.value
    })

    /** Фрезеровки */
    const createCurrentMillingData = ({ fasadeId, productId }) => {

        console.log(fasadeId, productId, 'IN_MILL')
        let result = []

        if (_FASADE[fasadeId].ATTACH_MILLINGS.length && _FASADE[fasadeId].ATTACH_MILLINGS[0] != null && _PRODUCTS[productId].type_showcase.length && _PRODUCTS[productId].type_showcase[0] === null) {

            currentMillingData.value = _FASADE[fasadeId].ATTACH_MILLINGS;
            let millings: IMilling[] = []
            let fasadeMilling: number[] = _FASADE[fasadeId].ATTACH_MILLINGS
            let percept = {}
            let prodMilling: number[] = _PRODUCTS[productId].MILLING

            fasadeMilling.filter(mill => _MILLING[mill] != undefined).map((mill) => {
                percept[mill] = _MILLING[mill]
            })

            prodMilling.filter(mill => percept[mill] != undefined).map((mill) => { millings.push(percept[mill]) })

            millings.sort((a, b) => a.SORT - b.SORT)

            result = millings.sort((a, b) => a.SORT - b.SORT)

            currentMillingData.value = result

            return result
        }


        currentMillingData.value = result
        return result
    }

    const createTotalMillingList = (fasadeId) => {

        if (!_FASADE[fasadeId]) return []

        if (_FASADE[fasadeId].ATTACH_MILLINGS.length && _FASADE[fasadeId].ATTACH_MILLINGS[0] != null) {
            let millings: IMilling[] = []
            let fasadeMilling: number[] = _FASADE[fasadeId].ATTACH_MILLINGS
            let percept = {}
            const result = fasadeMilling.filter(mill => _MILLING[mill] != undefined).map((mill) => {
                return percept[mill] = _MILLING[mill]
            })

            result.sort((a, b) => a.SORT - b.SORT)

            return result
        }
        return []

    }

    const getCurrentMillingData = computed(() => {
        return currentMillingData.value
    })

    const setMillingId = (fasadeId, id) => {

        const { FASADE_PROPS } = currentModel.value?.userData.PROPS.CONFIG
        FASADE_PROPS[fasadeId].MILLING = id
        console.log(id)
    }

    /** Витрины */
    const createCurrentWindowsData = ({ fasadeId, productId }) => {

        // console.log(_PRODUCTS[productId].type_showcase)


        if (_FASADE[fasadeId].ATTACH_MILLINGS.length && _FASADE[fasadeId].ATTACH_MILLINGS[0] != null && _PRODUCTS[productId].type_showcase.length && _PRODUCTS[productId].type_showcase[0] != null) {
            currentWindowsData.value = [..._PRODUCTS[productId].type_showcase]
        }

        if (_FASADE[fasadeId].ATTACH_MILLINGS.length && _FASADE[fasadeId].ATTACH_MILLINGS[0] == null) {
            currentWindowsData.value = []
            currentWindowsData.value.push(_PRODUCTS[productId].type_showcase[0])
        }
    }

    const getCurrentWindowsData = computed(() => {
        return currentWindowsData.value
    })

    /** Типы фасада (интегрированная ручка) */
    const createCurrentFasadeTypesData = ({ fasadeId, productId }) => {
        const incomeTypes = _FASADE[fasadeId].fasade_type
        const productPositions = _PRODUCTS[productId].FASADE_POSITION
        const defaultTypes = productPositions.reduce((acc, index) =>
            acc.concat(_FASADE_POSITION[index]?.fasade_type || []),
            []);

        currentFasadeTypesData.value = incomeTypes.filter(item => defaultTypes.includes(item))

    }

    const getCurrentFasadeTypesData = computed(() => {
        return currentFasadeTypesData.value
    })

    /** Стёкла */
    const createCurrentGlassData = ({ fasadeId, productId }) => {
        const incomeGlass = _FASADE[fasadeId].ATTACH_GLASS
        const productGlass = _PRODUCTS[productId].GLASS
        const glassArray = incomeGlass.filter(item => productGlass.includes(item)).sort((a, b) => a.SORT - b.SORT)
        const currentClass = glassArray.reduce((acc, index) =>
            acc.concat(_GLASS[index] || []),
            []);

        currentGlassData.value = currentClass;
        return currentClass
    }

    const getCurrentGlassData = computed(() => {
        return currentGlassData.value
    })

    /** Патина */

    const createCurrentPatinaData = ({ fasadeId, productId }) => {
        if (_PRODUCTS[productId].type_showcase.length && _PRODUCTS[productId].type_showcase[0] !== null) {
            return
        }

        const incomePatina = _FASADE[fasadeId].PATINA
        const currentPataina = incomePatina.filter(key => _PATINA.hasOwnProperty(key)).map(key => _PATINA[key])

        currentPatinaData.value = currentPataina
    }

    const getCurrentPatinaData = computed(() => {
        return currentPatinaData.value
    })

    /** @Опции */

    const getOptions = (option: number[]) => {
        let filtered = []
        const curOptionsList = option
            .map(el => this._OPTION[el])
            .filter(Boolean);

        for (const el in this._OPTIONS_GROUP) {

            filtered.push({
                NAME: this._OPTIONS_GROUP[el].NAME,
                CONTANT: curOptionsList.filter(opt => opt.GROUP == el)
            })
        }

        filtered = filtered.filter(item => {
            if (item.CONTANT.length > 0) return item

        })

        return filtered

    }

    /** @Контроллер */
    const setTransformControlsValue = (value) => {
        transformControls.value = value
    }

    const getTransformControlsValue = computed(() => {
        return transformControls.value
    })

    return {
        getModels,

        setCurrentModel,
        getCurrentModel,
        createCurrentModelFasadesData,
        clearCurrentModelFasadesData,
        getCurrentModelFasadesData,

        createCurrentPaletteData,
        getCurrentPaletteData,

        createCurrentMillingData,
        createTotalMillingList,
        getCurrentMillingData,
        setMillingId,

        createCurrentWindowsData,
        getCurrentWindowsData,

        createCurrentFasadeTypesData,
        getCurrentFasadeTypesData,

        createCurrentGlassData,
        getCurrentGlassData,

        createCurrentPatinaData,
        getCurrentPatinaData,

        createCurrentModuleData,
        getCurrentModuleData,

        createCurrentBackwallData,
        getCurrentBackwallData,

        createCurrentSidewallData,
        getCurrentSidewallData,

        /*createCurrentTopfasadeData,
        getCurrentTopfasadeData,*/

        createCurrentBackwallData,
        getCurrentBackwallData,

        createCurrentSidewallData,
        getCurrentSidewallData,

        /*createCurrentTopfasadeData,
        getCurrentTopfasadeData,*/

        createTotalPlinthData,
        createTotalPlinthColorData,

        getOptions,

        setTransformControlsValue,
        getTransformControlsValue
    }

});
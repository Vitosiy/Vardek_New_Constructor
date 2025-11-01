//@ts-nocheck
import * as THREE from "three"
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAppData } from './useAppData';
import { TFasadeItem } from "@/types/types";


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

    const appStore = useAppData()
    const _APP = computed(() => appStore.getAppData || {})

    const _COLOR = computed(() => _APP.value.COLOR || [])
    const _FASADE = computed(() => _APP.value.FASADE || [])
    const _FASADESIZE = computed(() => _APP.value.FASADESIZE || [])
    const _FASADENUMBERSIZE = computed(() => _APP.value.FASADENUMBERSIZE || [])
    const _FASADE_SECTION = computed(() => _APP.value.FASADE_SECTION || [])
    const _FASADE_POSITION = computed(() => _APP.value.FASADE_POSITION || [])
    const _FASADE_GROUPS = computed<IFasadeGroups>(() => _APP.value.FASADE_GROUPS || {})
    const _PRODUCTS = computed(() => _APP.value.CATALOG?.PRODUCTS || [])
    const _PALETTE = computed(() => _APP.value.PALETTE || [])
    const _PLINTH = computed(() => _APP.value.PLINTH || [])
    const _MILLING = computed(() => _APP.value.MILLING || [])
    const _SHOWCASE = computed(() => _APP.value.SHOWCASE || [])
    const _GLASS = computed(() => _APP.value.GLASS || [])
    const _PATINA = computed(() => _APP.value.PATINA || [])
    const _HANDLES = computed(() => _APP.value.HANDLES || [])
    const _HEM = computed(() => _APP.value.HEM  || [])


    const currentModel = ref<THREE.Object3D | null>(null)
    const currentRaspilParent = ref<THREE.Object3D | null>(null)

    const currentModulData = ref<any>(null)

    const currentBackwallData = ref<any>(null)

    const currentSidewallData = ref<any>(null)

    const currentTopfasadeData = ref<any>(null)

    const currentModelFasadesData = ref<IProductFasades[]>([])

    const currentPaletteData = ref<{ [key: string]: IPalette }>({})

    const currentMillingData = ref<IMilling[]>([])

    const currentShowcaseData = ref<number[]>([])

    const currentFasadeTypesData = ref<number[]>([])

    const currentGlassData = ref<number[]>([])

    const currentPatinaData = ref<number[]>([])

    const transformControls = ref<boolean>(false)

    const setCurrentModel = (object: THREE.Object3D | any) => {

        currentModel.value = object
        if (!object) {
            currentRaspilParent.value = null
        }
    }

    const getCurrentModel = computed(() => {
        // return currentModel.value?.userData || currentModel.value
        return currentModel.value
        //return currentModel.value?.userData
    })

    const setCurrentRaspilParent = (object: THREE.Object3D | any) => {
        currentRaspilParent.value = object
    }

    const getCurrentRaspilParent = computed(()=>{
        return currentRaspilParent.value
    })

    const getModels = computed(() => _APP.value.CATALOG?.PRODUCTS || [])

    // const getModels = computed(() => {
    //     return models.value
    // })

    /** ------- Работа с Модулем -------- */

    const createCurrentModuleData = (value: number[]) => {

        const colorMap = new Set();
        const colorsList = value.filter((colorId: number) => {
            return _FASADE.value[colorId]
        });

        colorsList.forEach(color => {
            if (_FASADE.value[color] !== undefined) {
                colorMap.add(_FASADE.value[color]);
            }
        });

        currentModulData.value = Array.from(colorMap)
    }

    const getCurrentModuleData = computed(() => {
        return currentModulData.value
    })

    /** ------- Задняя стенка -------- */

    const createCurrentBackwallData = (productId: number) => {
        const productInfo = _PRODUCTS.value[productId]

        if (productInfo.BACKWALL?.length && productInfo.BACKWALL[0]) {
            const colorMap = new Set();
            const colorsList = productInfo.BACKWALL.filter((colorId: number) => _FASADE.value[colorId]);

            colorsList.forEach(color => {
                if (_FASADE.value[color] !== undefined) {
                    colorMap.add(_FASADE.value[color]);
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

        const productInfo = _PRODUCTS.value[productId]

        if (productInfo.SIDEWALL?.length && productInfo.SIDEWALL[0]) {
            const colorMap = new Set();
            const colorsList = productInfo.SIDEWALL.filter((colorId: number) => _FASADE.value[colorId]);

            colorsList.forEach(color => {
                if (_FASADE.value[color] !== undefined) {
                    colorMap.add(_FASADE.value[color]);
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
        const colorsList = value.filter((colorId: number) => _FASADE.value[colorId]);

        colorsList.forEach(color => {
            if (_FASADE.value[color] !== undefined) {
                colorMap.add(_FASADE.value[color]);
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
        const result = Object.entries(_PLINTH.value).map(([key, el]) => {
            return percept[key] = _PRODUCTS.value[el]
        })

        // console.log(percept)

        // const filtered = Object.values(_PLINTH).map(el => {
        //     return _PRODUCTS.value[el]
        // })


        return percept
    }

    const createTotalPlinthColorData = (plinthId) => {
        if (!_PLINTH.value[plinthId]) return []

        const { FACADE } = _PRODUCTS.value[plinthId]
        const filter = FACADE.map(el => {
            return _FASADE.value[el] ?? null
        })

        return filter


    }

    /** ------- Работа с фасадами -------- */

    const createCurrentModelFasadesData = ({ data, def, fasadeNdx, productId }: { data: number[], def?: boolean, fasadeNdx?: number, productId?: number }) => {
        const defaultFasade = def ?? false

        const groupedFasades: Record<string, number> = {};
        let exception = !defaultFasade ? 'Без фасада' : ''
        let haveShowCase = null

        // console.log(fasadeNdx && productId, 'fasadeNdx, productId')

        if (fasadeNdx !== undefined && productId !== undefined) {

            let fasadePosData = null
            const product = _PRODUCTS.value[productId]
            const positionId = product.FASADE_POSITION[fasadeNdx]

            if (positionId) {
                fasadePosData = _FASADE_POSITION.value[positionId]
                haveShowCase = fasadePosData.glass == 1
            }

        }

        data.forEach(facadeId => {
            const facade = _FASADE.value[facadeId];

            if (!facade) return;
            const hasGlass = _FASADE.value[facadeId].GLASS_ONLY == 1

            const section = _FASADE_SECTION.value[facade.IBLOCK_SECTION_ID];
            if (!section || !section.UF_GROUP) return;

            const groupId: string = section.UF_GROUP;

            if (!groupedFasades[groupId]) {
                groupedFasades[groupId] = [];
            }

            if (!haveShowCase && hasGlass) return

            groupedFasades[groupId].push(facadeId);
        });


        // Формирование итогового массива
        const result = Object.entries(_FASADE_GROUPS.value).map(([groupId, group]) => ({
            NAME: group.NAME,
            FASADES: groupedFasades[groupId] || [],
            SORT: group.SORT
        })).filter(group => group.FASADES.length > 0 && group.NAME !== exception).sort((a, b) => a.SORT - b.SORT);


        if (defaultFasade) {
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
        if (!_FASADE.value[value]) return result
        if (_FASADE.value[value].PALETTE.length && _FASADE.value[value].PALETTE[0] != null) {
            result = Object.keys(_PALETTE.value)
                .filter(
                    (key) =>
                        _PALETTE.value[key].TYPE ===
                        _FASADE.value[value].PALETTE[0]
                )
                .reduce((obj, key) => {
                    obj[key] = _PALETTE.value[key];
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
    const createCurrentMillingData = ({ fasadeId, productId, fasadeNdx }) => {

        let result = []
        if (fasadeId == 7397) {
            currentMillingData.value = []
            return []
        }

        const product = _PRODUCTS.value[productId]
        const positionId = product.FASADE_POSITION[fasadeNdx]

        const fasadePosData = _FASADE_POSITION.value[positionId]

        const haveShowCase = fasadePosData?.glass == 1


        if (_FASADE.value[fasadeId].ATTACH_MILLINGS.length && _FASADE.value[fasadeId].ATTACH_MILLINGS[0] != null && !haveShowCase) {

            // currentMillingData.value = _FASADE.value[fasadeId].ATTACH_MILLINGS;



            let millings: IMilling[] = []
            let fasadeMilling: number[] = _FASADE.value[fasadeId].ATTACH_MILLINGS
            let percept = {}
            let prodMilling: number[] = _PRODUCTS.value[productId].MILLING

            fasadeMilling.filter(mill => _MILLING.value[mill] != undefined).map((mill) => {
                percept[mill] = _MILLING.value[mill]
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

        if (!_FASADE.value[fasadeId]) return []

        if (_FASADE.value[fasadeId].ATTACH_MILLINGS.length && _FASADE.value[fasadeId].ATTACH_MILLINGS[0] != null) {
            let millings: IMilling[] = []
            let fasadeMilling: number[] = _FASADE.value[fasadeId].ATTACH_MILLINGS
            let percept = {}
            const result = fasadeMilling.filter(mill => _MILLING.value[mill] != undefined).map((mill) => {
                return percept[mill] = _MILLING.value[mill]
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
        const modulePart = currentModel.value?.userData.PROPS.CONFIG[fasadeId]
        if(modulePart)
            modulePart.MILLING = id
        else
            FASADE_PROPS[fasadeId].MILLING = id
    }

    /** Витрины */
    const createCurrentShowcaseData = ({ fasadeId, productId, fasadeNdx }) => {

        const product = _PRODUCTS.value[productId]
        const prodShowcases = product.type_showcase
        const positionId = product.FASADE_POSITION[fasadeNdx]
        const fasadePosData = _FASADE_POSITION.value[positionId]
        const haveShowCase = fasadePosData?.glass == 1

        if (!haveShowCase) {
            currentShowcaseData.value = []
            return
        }

        const defaultShowcase = prodShowcases[0]


        if (_FASADE.value[fasadeId].ATTACH_MILLINGS.length && _FASADE.value[fasadeId].ATTACH_MILLINGS[0] != null && defaultShowcase) {

            const prepare = [..._PRODUCTS.value[productId].type_showcase].map(el => {
                return _SHOWCASE.value[el]
            }).filter(Boolean)

            currentShowcaseData.value = prepare
            return
        }

        if (_FASADE.value[fasadeId].ATTACH_MILLINGS.length && _FASADE.value[fasadeId].ATTACH_MILLINGS[0] == null) {

            const prepare = prodShowcases.map(el => {
                return _SHOWCASE.value[el]
            }).filter(Boolean)

            currentShowcaseData.value = prepare
            return
        }
    }

    const getCurrentShowcaseData = computed(() => {
        return currentShowcaseData.value
    })

    /** Типы фасада (интегрированная ручка) */
    const createCurrentFasadeTypesData = ({ fasadeId, productId }) => {
        const incomeTypes = _FASADE.value[fasadeId].fasade_type
        const productPositions = _PRODUCTS.value[productId].FASADE_POSITION
        const defaultTypes = productPositions.reduce((acc, index) =>
            acc.concat(_FASADE_POSITION.value[index]?.fasade_type || []),
            []);

        currentFasadeTypesData.value = incomeTypes.filter(item => defaultTypes.includes(item))

    }

    const getCurrentFasadeTypesData = computed(() => {
        return currentFasadeTypesData.value
    })

    /** Стёкла */
    const createCurrentGlassData = ({ fasadeId, productId }) => {

        const incomeGlass = _FASADE.value[fasadeId].ATTACH_GLASS
        const productGlass = _PRODUCTS.value[productId].GLASS
        let glassArray = incomeGlass.filter(item => productGlass.includes(item)).sort((a, b) => a.SORT - b.SORT)

        const currentClass = glassArray.reduce((acc, index) =>
            acc.concat(_GLASS.value[index] || []),
            []);

        currentGlassData.value = currentClass;
        return []
    }

    const getCurrentGlassData = computed(() => {
        return currentGlassData.value
    })

    /** Патина */

    const createCurrentPatinaData = ({ fasadeId, productId }) => {

        if (_PRODUCTS.value[productId].type_showcase.length && _PRODUCTS.value[productId].type_showcase[0] !== null) {
            return
        }

        const incomePatina = _FASADE.value[fasadeId].PATINA
        const currentPataina = incomePatina.filter(key => _PATINA.value.hasOwnProperty(key)).map(key => _PATINA.value[key])

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

    const turnOffTransformControlsValue = () => {
        transformControls.value = false
    }

    const getTransformControlsValue = computed(() => {
        return transformControls.value
    })

    return {
        _APP,
        _FASADE,
        _PRODUCTS,
        _HEM,
        getModels,

        setCurrentModel,
        getCurrentModel,
        createCurrentModelFasadesData,
        clearCurrentModelFasadesData,
        getCurrentModelFasadesData,
        setCurrentRaspilParent,
        getCurrentRaspilParent,

        createCurrentPaletteData,
        getCurrentPaletteData,

        createCurrentMillingData,
        createTotalMillingList,
        getCurrentMillingData,
        setMillingId,

        createCurrentShowcaseData,
        getCurrentShowcaseData,

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

        createTotalPlinthData,
        createTotalPlinthColorData,

        getOptions,

        setTransformControlsValue,
        getTransformControlsValue,
    }

});
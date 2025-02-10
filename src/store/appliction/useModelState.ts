//@ts-nocheck
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAppData } from './useAppData';

import * as THREE from "three"

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
    const _PRODUCTS = _APP.CATALOG.PRODUCTS
    const _PALETTE = _APP.PALETTE
    const _MILLING = _APP.MILLING
    const _SHOWCASE = _APP.SHOWCASE


    const models = ref<{ [key: string]: {} }>(_PRODUCTS)

    const currentModel = ref<THREE.Object3D | null>(null)

    const currentModelFasadesData = ref<IProductFasades[]>([])

    const currentPaletteData = ref<{ [key: string]: IPalette }>({})

    const currentMillingData = ref<IMilling[]>([])

    const currentWindowsData = ref<number[]>([])

    const setCurrentModel = (object: THREE.Object3D | null) => {
        console.log('CURRENT MODEL', object);
        
        currentModel.value = object
    }

    const getCurrentModel = computed(() => {
        return currentModel.value
    })

    const getModels = computed(() => {
        return models.value
    })

    /** Работа с фасадами */

    const createCurrentModelFasadesData = (value: number[]) => {

        const groupedFasades: { [key: string]: number[] } = {};

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
        })).filter(group => group.FASADES.length > 0);

        currentModelFasadesData.value = result
    }

    const clearCurrentModelFasadesData = () => {
        currentModelFasadesData.value = []
    }

    const getCurrentModelFasadesData = computed(() => {
        return currentModelFasadesData.value
    })

    const createCurrentPaletteData = (value: number) => {

        if (_FASADE[value].PALETTE.length && _FASADE[value].PALETTE[0] != null) {
            currentPaletteData.value = Object.keys(_PALETTE)
                .filter(
                    (key) =>
                        _PALETTE[key].TYPE ===
                        _FASADE[value].PALETTE[0]
                )
                .reduce((obj, key) => {
                    obj[key] = _PALETTE[key];
                    return obj;
                }, {});
            return
        }

        currentPaletteData.value = {}
    }

    const getCurrentPaletteData = computed(() => {
        return currentPaletteData.value
    })

    const createCurrentMillingData = ({ fasadeId, productId }) => {
        console.log(fasadeId)


        if (_FASADE[fasadeId].ATTACH_MILLINGS.length && _FASADE[fasadeId].ATTACH_MILLINGS[0] != null) {

            currentMillingData.value = _FASADE[fasadeId].ATTACH_MILLINGS;
            let millings: IMilling[] = []
            let fasadeMilling: number[] = _FASADE[fasadeId].ATTACH_MILLINGS
            let percept = {}

            let millings_2: IMilling[] = []
            let prodMilling: number[] = _PRODUCTS[productId].MILLING

            fasadeMilling.filter(mill => _MILLING[mill] != undefined).map((mill) => {
                percept[mill] = _MILLING[mill]
            })

            prodMilling.filter(mill => percept[mill] != undefined).map((mill) => { millings.push(percept[mill]) })

            currentMillingData.value = millings

            return
        }


        currentMillingData.value = []
    }

    const getCurrentMillingData = computed(() => {
        return currentMillingData.value
    })

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
        getCurrentMillingData,

        createCurrentWindowsData,
        getCurrentWindowsData
    }

});
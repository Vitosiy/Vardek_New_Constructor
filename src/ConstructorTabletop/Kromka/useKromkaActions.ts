import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { useModelState } from "@/store/appliction/useModelState";
import { useEventBus } from "@/store/appliction/useEventBus";
import { TTabelTopServiceItem, TKromkaMaterialItem } from "@/types/types";
import { _URL } from "@/types/constants";


const modelState = useModelState()

const useKromkaActions = defineStore('KromkaActions', () => {

    const PRODUCTS = modelState._PRODUCTS
    const HEMLIST: TKromkaMaterialItem[] = modelState._HEM

    const tempKromkaList = ref<TKromkaMaterialItem[] | []>([])
    const cromkaActive = ref<boolean>(false);
    const cardData = ref<Record<string, any> | null>(null)
    const kromkaListVisible = ref<boolean>(false);
    const tempGridData = ref<any[]>([])


    const getKromkaList = computed(() => {
        return tempKromkaList
    })

    const getKromkaActive = computed(() => {
        return cromkaActive
    })

    const getKromkaCardData = computed(() => {
        return cardData
    })

    const getKromkaCardSelect = computed(() => {
        return kromkaListVisible
    })

    const setCromkaActive = (value: boolean) => {
        cromkaActive.value = value
    }

    const setGridData = (value: any[]) => {
        tempGridData.value = value
    }

    const checkKromkaActive = () => {

        const grid = tempGridData.value
        const hasActiveKromka = grid.some((inner: any[]) =>
            inner.some((item) =>
                item.serviseData?.some(
                    (servise) => servise.POSITION.includes("kromka") && servise.value === true
                )
            )
        );


        const parent = modelState.getCurrentRaspilParent || modelState.getCurrentModel
        const { PROPS } = parent!.userData;
        const { KROMKA, PROFILE } = PROPS.CONFIG;

        if (KROMKA) {
            cromkaActive.value = true
            return
        }

        const curProfile = PROFILE.find(el => el.value)
        const check = curProfile.ID == 251701 || hasActiveKromka

        if (check) {
            cromkaActive.value = true
        } else {
            cromkaActive.value = false
        }
    }

    const kromkaSelect = (value) => {
        kromkaListVisible.value = false

        const parent = modelState.getCurrentRaspilParent || modelState.getCurrentModel;
        const { CONFIG } = parent?.userData.PROPS

        let data: Record<string, any> = {}
        data.NAME = value.NAME
        data.PREVIEW_PICTURE = _URL + value.PREVIEW_PICTURE
        cardData.value = data

        CONFIG.KROMKA = value.ID
        CONFIG.KROMKA
    }

    const kromkaCardSelect = () => {
        kromkaListVisible.value = !kromkaListVisible.value
    }

    const hideKromkaList = () => {
        kromkaListVisible.value = false
    }

    const createKromkaCardData = () => {
        if (!cromkaActive.value) return

        const parent = modelState.getCurrentRaspilParent || modelState.getCurrentModel;
        const { CONFIG } = parent?.userData.PROPS

        const kromkaId = CONFIG?.KROMKA;
        const defaultId = 211247;

        const target = tempKromkaList.value.find(
            el => el.ID === (kromkaId || defaultId)
        ) as TKromkaMaterialItem | undefined;

        if (!target) return;

        const { NAME, PREVIEW_PICTURE } = target;

        cardData.value = {
            NAME,
            PREVIEW_PICTURE: _URL + PREVIEW_PICTURE,
        };
    };

    const getCurretKromkaList = () => {

        if (!cromkaActive.value) return

        const parent = modelState.getCurrentRaspilParent || modelState.getCurrentModel
        const { PROPS } = parent!.userData;
        const { PRODUCT } = PROPS

        const { HEM } = PRODUCTS[PRODUCT]
        const hemList = HEM.map((el: number) => {
            return HEMLIST[el]
        }).filter(Boolean)

        tempKromkaList.value = hemList
        createKromkaCardData()
    }

    const clearKromkaData = () => {
        tempKromkaList.value = []
        cromkaActive.value = false
        cardData.value = null
        kromkaListVisible.value = false
        tempGridData.value = []
    }

    return {
        getCurretKromkaList,
        getKromkaList,
        checkKromkaActive,
        getKromkaActive,
        kromkaSelect,
        kromkaCardSelect,
        getKromkaCardData,
        getKromkaCardSelect,
        hideKromkaList,
        setCromkaActive,
        setGridData, 
        clearKromkaData
    }
})

export { useKromkaActions }
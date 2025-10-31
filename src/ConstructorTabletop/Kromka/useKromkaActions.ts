import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { useModelState } from "@/store/appliction/useModelState";
import { useEventBus } from "@/store/appliction/useEventBus";
import { TTabelTopServiceItem, TKromkaMaterialItem } from "@/types/types";
import { _URL } from "@/types/constants";


const modelState = useModelState()
const kromkaMap = [
    "kromka_tri_storony",
    "kromka_perimetr",
    "kromka_torec",
    "kromka_torec_right",
    "kromka_torec_left",
];


const useKromkaActions = defineStore('KromkaActions', () => {

    const PRODUCTS = modelState._PRODUCTS
    const HEMLIST: TKromkaMaterialItem[] = modelState._HEM

    const parent = modelState.getCurrentRaspilParent || modelState.getCurrentModel
    const { PROPS } = parent!.userData;
    const { PRODUCT } = PROPS
    const { PROFILE, USLUGI, KROMKA } = PROPS.CONFIG;

    const tempKromkaList = ref<TKromkaMaterialItem[] | []>([])
    const cromkaActive = ref<boolean>(false);
    const cardData = ref<Record<string, any> | null>(null)
    const kromkaListVisible = ref<boolean>(false);


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

    const checkKromkaActive = () => {
        const prepare = USLUGI.filter((usluga: TTabelTopServiceItem) => {
            return usluga.POSITION.includes('kromka') && usluga.value
        })

        cromkaActive.value = prepare.length > 0

        console.log( cromkaActive.value, USLUGI)
        return prepare.length > 0
    }

    const kromkaSelect = (value) => {
        kromkaListVisible.value = false

        let data: Record<string, any> = {}
        data.NAME = value.NAME
        data.PREVIEW_PICTURE = _URL + value.PREVIEW_PICTURE
        cardData.value = data

        PROPS.CONFIG.KROMKA = value.ID
        console.log(value.ID, 'value')
        PROPS.CONFIG.KROMKA
    }

    const kromkaCardSelect = () => {
        kromkaListVisible.value = !kromkaListVisible.value
    }

    const hideKromkaList = () => {
        kromkaListVisible.value = false
    }

    const deliteCromka = () => {
        PROPS.CONFIG.KROMKA = null
    }

    // const activeProfile = PROFILE.find((prof) => prof.value);

    const createKromkaCardData = () => { //211247
        if (!cromkaActive.value) return
        const parent = modelState.getCurrentRaspilParent || modelState.getCurrentModel
        const { PROPS } = parent!.userData;
        const { KROMKA } = PROPS.CONFIG;

        console.log(parent, '--parent')

        let data: Record<string, any> = {}
        console.log(KROMKA)

        if (!KROMKA) {
            const { NAME, PREVIEW_PICTURE } = tempKromkaList.value.find(el => el.ID === 211247) as TKromkaMaterialItem
            data.NAME = NAME
            data.PREVIEW_PICTURE = _URL + PREVIEW_PICTURE
            cardData.value = data
            return
        }

        const tempKromka = tempKromkaList.value.find(el => el.ID === KROMKA) as TKromkaMaterialItem
        const { NAME, PREVIEW_PICTURE } = tempKromka
        data.NAME = NAME
        data.PREVIEW_PICTURE = _URL + PREVIEW_PICTURE
        cardData.value = data
    }

    const getCurretKromkaList = () => {
        const checkKromka = checkKromkaActive()
        if (!checkKromka) { deliteCromka(); return }
        const { HEM } = PRODUCTS[PRODUCT]
        const hemList = HEM.map((el: number) => {
            return HEMLIST[el]
        }).filter(Boolean)

        tempKromkaList.value = hemList
        createKromkaCardData()
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
        hideKromkaList
    }
})

export { useKromkaActions }
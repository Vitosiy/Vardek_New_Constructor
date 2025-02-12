import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAppData = defineStore('AppData', () => {

    const appData = ref<{ [key: string]: any }>({})

    const setAppData = (value: any) => {
        appData.value = value
        console.log(appData.value, 'Данные с бэка в сторе');
    }

    const getAppData = computed(() => {
        return appData.value
    })

    return {
        getAppData,
        setAppData
    };

})

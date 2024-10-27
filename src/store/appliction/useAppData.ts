import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { APP } from '@/Application/F-sources';

export const useAppData = defineStore('AppData', () => {

    const appData = ref<{ [key: string]: any }>(APP)

    const setAppData = (value: any) => {
        appData.value = value
        console.log(appData.value);
    }

    const getAppData = computed(() => {
        return appData.value
    })

    return {
        getAppData,
        setAppData
    };

})

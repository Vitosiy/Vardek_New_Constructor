import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { APP } from '@/Application/F-sources';

export const useAppData = defineStore('AppData', () => {

    const appData = ref<{ [key: string]: any }>(APP)

    const getAppData = computed(() => {
        return appData.value
    })

    return {
        getAppData
    };

})

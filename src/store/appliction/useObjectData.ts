import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { APP } from '@/Application/F-sources';

export const useObjectData = defineStore('ObjectData', () => {

    const objectData = ref<{ [key: string]: any }>(APP)

    const setObjectData = (value: any) => {
        objectData.value = value
    }

    const getObjectData = computed(() => {
        return objectData.value
    })

    return {
        getObjectData,
        setObjectData
    };

})

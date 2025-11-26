import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useObjectData = defineStore('ObjectData', () => {

    const objectData = ref<{ [key: string]: any }>({})

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

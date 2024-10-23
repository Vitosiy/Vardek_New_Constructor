import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { APP } from '@/Application/F-sources';

import * as THREEInterfases from "../../types/interfases"
import * as THREE from "three"

export const useModelState = defineStore('ModelState', () => {

    const models = ref<{ [key: string]: {} }>(APP.CATALOG.PRODUCTS)
    const currentModel = ref<THREE.Object3D | null>(null)


    const setCurrentModel = (object: THREE.Object3D | null) => {
        currentModel.value = object
    }

    const getCurrentModel = computed(() => {
        return currentModel.value
    })

    const getModels = computed(() => {
        return models.value
    })

    return {
        getModels,

        setCurrentModel,
        getCurrentModel
    }

});
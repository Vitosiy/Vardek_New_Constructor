/**// @ts-nocheck */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as THREEInterfases from "../../types/interfases"
import { TLightRange } from '@/types/types';

import { START_PROJECT_PARAMS } from '@/Application/F-startData';

export const useSceneState = defineStore('SceneState', () => {

    const startProjectParams = ref(START_PROJECT_PARAMS)

    const startRoomData = ref<THREEInterfases.IWallSizes>(START_PROJECT_PARAMS.rooms[0] as THREEInterfases.IWallSizes);

    const startCameraData = ref<THREEInterfases.ICameraData>(START_PROJECT_PARAMS.camera as THREEInterfases.ICameraData);

    const startLightsDat = ref<THREEInterfases.ILightsObjects>(START_PROJECT_PARAMS.lights);

    const startHeightClamp = ref<number>(START_PROJECT_PARAMS.height_clamp)

    const currentProjectParams = ref(START_PROJECT_PARAMS) as THREEInterfases.IProjectParams

    const shadowValue = ref<boolean>(false)
    const refractionValue = ref<boolean>(false)

    const lightRange = ref<TLightRange>({
        pointLight: 1,
        ambientLight: 1
    })

    const updateProjectParams = ({
        rooms,
        camera,
        lights,
        height_clamp,
        table,
        table_params,
        table_color,
        table_top_type_auto,
        default_fasade_up,
        default_fasade_down,
        default_floor,
        default_wall

    }: THREEInterfases.IProjectParams) => {
        currentProjectParams.value = {
            rooms: rooms ?? currentProjectParams.value.rooms,
            camera: camera ?? startProjectParams.value.camera as THREEInterfases.ICameraData,
            lights: lights ?? startProjectParams.value.lights,
            height_clamp: height_clamp ?? startProjectParams.value.height_clamp,
            table: table ?? startProjectParams.value.table,
            table_params: table_params ?? startProjectParams.value.table_params,
            table_color: table_color ?? startProjectParams.value.table_color,
            table_top_type_auto: table_top_type_auto ?? startProjectParams.value.table_top_type_auto,
            default_fasade_up: default_fasade_up ?? startProjectParams.value.default_fasade_up,
            default_fasade_down: default_fasade_down ?? startProjectParams.value.default_fasade_down,
            default_floor: default_floor ?? startProjectParams.value.default_floor,
            default_wall: default_wall ?? startProjectParams.value.default_wall
        };

        console.log(currentProjectParams.value, 'VALU')
    };

    const setShadowValue = (value: boolean) => {
        shadowValue.value = value
    }

    const setRefractionValue = (value: boolean) => {
        refractionValue.value = value
    }

    const setLightRange = (type: keyof TLightRange, value:number | string) => {
        lightRange.value[type] = value

    }

    const getStartProgectParams = computed(() => {
        return startProjectParams.value
    })

    const getStartRoomData = computed(() => {
        return startRoomData.value
    })

    const getStartCameraData = computed(() => {
        return startCameraData.value
    })

    const getStartLightsData = computed(() => {
        return startLightsDat.value
    })

    const getStartHeightClamp = computed(() => {
        return startHeightClamp.value
    })

    const getCurrentProjectParams = computed(() => {
        return currentProjectParams.value
    })

    const getShadowValue = computed(() => {
        return shadowValue.value
    })

    const getRefractionValue = computed(() => {
        return refractionValue.value
    })

    const getLightRange=computed(()=>{
        return lightRange.value
    })

    return {
        getStartProgectParams,
        getStartRoomData,
        getStartCameraData,
        getStartLightsData,
        getStartHeightClamp,
        getCurrentProjectParams,
        getRefractionValue,
        getShadowValue,
        getLightRange,

        updateProjectParams,
        setRefractionValue,
        setShadowValue,
        setLightRange
    };

});
// @ts-nocheck

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as THREEInterfases from "../../types/interfases"

import { START_PROJECT_PARAMS } from '@/Application/F-startData';

export const useSceneState = defineStore('SceneState', () => {

    const startProjectParams = ref(START_PROJECT_PARAMS)

    const startRoomData = ref<THREEInterfases.IWallSizes>(START_PROJECT_PARAMS.room as THREEInterfases.IWallSizes);

    const startCameraData = ref<THREEInterfases.ICameraData>(START_PROJECT_PARAMS.camera as THREEInterfases.ICameraData);

    const startOrtoCameraData = ref<THREEInterfases.IOrtoCameraData>(START_PROJECT_PARAMS.orto_camera as THREEInterfases.IOrtoCameraData);

    const startLightsDat = ref<THREEInterfases.ILightsObjects>(START_PROJECT_PARAMS.lights);

    const startHeightClamp = ref<number>(START_PROJECT_PARAMS.height_clamp)

    const currentProjectParams = ref(START_PROJECT_PARAMS as THREEInterfases.IProjectParams)

    const shadowValue = ref<boolean>(false)
    const refractionValue = ref<boolean>(false)

    const updateProjectParams = ({
        rooms,
        camera,
        orto_camera,
        lights,
        height_clamp,
        table,
        table_params,
        table_color,
        table_top_type_auto,
        default_fasade_up,
        default_fasade_down
    }: THREEInterfases.IProjectParams) => {
        currentProjectParams.value = {
            rooms: rooms ?? currentProjectParams.value.rooms,
            camera: camera ?? startProjectParams.value.camera as THREEInterfases.ICameraData,
            orto_camera: orto_camera ?? startProjectParams.value.orto_camera as THREEInterfases.IOrtoCameraData,
            lights: lights ?? startProjectParams.value.lights,
            height_clamp: height_clamp ?? startProjectParams.value.height_clamp,
            table: table ?? startProjectParams.value.table,
            table_params: table_params ?? startProjectParams.value.table_params,
            table_color: table_color ?? startProjectParams.value.table_color,
            table_top_type_auto: table_top_type_auto ?? startProjectParams.value.table_top_type_auto,
            default_fasade_up: default_fasade_up ?? startProjectParams.value.default_fasade_up,
            default_fasade_down: default_fasade_down ?? startProjectParams.value.default_fasade_down
        };
    };

    const setShadowValue = (value: boolean) => {
        shadowValue.value = value
    }

    const setRefractionValue = (value: boolean) => {
        refractionValue.value = value
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

    const getStartOrtoCameraData = computed(() => {
        return startOrtoCameraData.value
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

    return {
        getStartProgectParams,
        getStartRoomData,
        getStartCameraData,
        getStartOrtoCameraData,
        getStartLightsData,
        getStartHeightClamp,
        getCurrentProjectParams,
        getRefractionValue,
        getShadowValue,

        updateProjectParams,
        setRefractionValue,
        setShadowValue
    };

});
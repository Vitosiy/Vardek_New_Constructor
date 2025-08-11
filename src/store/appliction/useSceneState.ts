//@ts-nocheck 

import { defineStore } from 'pinia';
import { useSchemeTransition } from '../canvasMerge/schemeTransition';
import { computed, ref } from 'vue';
import * as THREEInterfases from "../../types/interfases"
import { TLightRange, TQuality, TOptionsMap } from '@/types/types';
import { IWallSizes, ICameraData, ILightsObjects, IProjectParams } from '@/types/interfases';

import { START_PROJECT_PARAMS } from '@/Application/F-startData';

export const useSceneState = defineStore('SceneState', () => {

    const schemeTransition = useSchemeTransition()

    const startParamsClone = JSON.parse(JSON.stringify(START_PROJECT_PARAMS))

    const startProjectParams = ref(JSON.parse(JSON.stringify(START_PROJECT_PARAMS)))

    const startRoomData = ref<IWallSizes>(startParamsClone.rooms[0].params);

    const startCameraData = ref<ICameraData>(startParamsClone.camera);

    const startLightsDat = ref<ILightsObjects>(startParamsClone.lights);

    const startHeightClamp = ref<number>(startParamsClone.height_clamp)

    const currentProjectParams = ref<IProjectParams>(startParamsClone)

    const keys: Partial<Record<keyof TOptionsMap, keyof IProjectParams>> = {
        moduleTop: 'default_module_color_up',
        moduleBottom: 'default_module_color_down'
    };

    const shadowValue = ref<boolean>(false)
    const refractionValue = ref<boolean>(false)

    const quality = ref<TQuality[]>([{
        lable: "Низкое",
        value: "low",
    },
    {
        lable: "Среднее",
        value: "medium",
    },
    {
        lable: "Высокое",
        value: "hight",
    }

    ],)

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
        default_table_color,
        table_top_type_auto,
        default_fasade_up,
        default_fasade_down,
        default_fasade_color,
        default_floor,
        default_wall,
        default_module_color_down,
        default_module_color_up,
        default_module_color

    }: IProjectParams) => {
        currentProjectParams.value = {
            rooms: rooms ?? currentProjectParams.value.rooms,
            camera: camera ?? startProjectParams.value.camera as THREEInterfases.ICameraData,
            lights: lights ?? startProjectParams.value.lights,
            height_clamp: height_clamp ?? startProjectParams.value.height_clamp,
            table: table ?? startProjectParams.value.table,
            table_params: table_params ?? startProjectParams.value.table_params,
            table_top_type_auto: table_top_type_auto ?? startProjectParams.value.table_top_type_auto,
            default_table_color: default_table_color ?? startProjectParams.value.default_table_color,
            default_fasade_up: default_fasade_up ?? startProjectParams.value.default_fasade_up,
            default_fasade_down: default_fasade_down ?? startProjectParams.value.default_fasade_down,
            default_fasade_color: default_fasade_color ?? startProjectParams.value.default_fasade_color,
            default_floor: default_floor ?? startProjectParams.value.default_floor,
            default_wall: default_wall ?? startProjectParams.value.default_wall,
            default_module_color_down: default_module_color_down ?? startProjectParams.value.default_module_color_down,
            default_module_color_up: default_module_color_up ?? startProjectParams.value.default_module_color_up,
            default_module_color: default_module_color ?? startProjectParams.value.default_module_color,
        } as IProjectParams;

        schemeTransition.setAppData(currentProjectParams.value.rooms)

        console.log(currentProjectParams.value, 'VALU')
    };

    const setShadowValue = (value: boolean) => {
        shadowValue.value = value
    }

    const setRefractionValue = (value: boolean) => {
        refractionValue.value = value
    }

    const setLightRange = (type: keyof TLightRange, value: number | string) => {
        lightRange.value[type] = value
    }

    const updateStartRoomData = (type: keyof IWallSizes & ("floor" | "wall"), value: string | number) => {
        startRoomData.value[type] = value
    }

    const updateDefaultData = <T extends keyof typeof keys>(type: T, value: string | number | null
    ) => {
        const curOption = keys[type];
        if (curOption) {
            startProjectParams.value[curOption] = value;
            currentProjectParams.value[curOption] = value;
        }
    };

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

    const getLightRange = computed(() => {
        return lightRange.value
    })

    const getQuality = computed(() => {
        return quality.value
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
        getQuality,

        updateProjectParams,
        updateStartRoomData,
        updateDefaultData,
        setRefractionValue,
        setShadowValue,
        setLightRange
    };

});
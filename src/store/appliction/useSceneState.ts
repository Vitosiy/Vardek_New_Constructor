/**//@ts-nocheck  */

import { defineStore } from 'pinia';
import { useSchemeTransition } from '../canvasMerge/schemeTransition';
import { computed, ref } from 'vue';
import * as THREEInterfases from "../../types/interfases"
import { TLightRange, TQuality, TOptionsMap } from '@/types/types';
import { IWallSizes, ICameraData, ILightsObjects, IProjectParams } from '@/types/interfases';

import { START_PROJECT_PARAMS } from '@/Application/F-startData';
import { useRoomState } from './useRoomState';

export const useSceneState = defineStore('SceneState', () => {


    const schemeTransition = useSchemeTransition()
    const roomState = useRoomState()

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
        pointLight: startParamsClone.lights.pointLight.intensity,
        ambientLight: startParamsClone.lights.ambientLight.intensity
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
        default_module_color,
        default_milling_down,
        default_milling_up,
        default_palit_down,
        default_palit_up,
        project_name

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
            default_milling_down: default_milling_down ?? startProjectParams.value.default_milling_down,
            default_milling_up: default_milling_up ?? startProjectParams.value.default_milling_up,
            default_palit_down: default_palit_down ?? startProjectParams.value.default_palit_down,
            default_palit_up: default_palit_up ?? startProjectParams.value.default_palit_up,
            project_name: project_name ?? startProjectParams.value.project_name

        } as IProjectParams;

        const clone = JSON.parse(JSON.stringify(currentProjectParams.value.rooms))
        // console.log(clone)
        const parseData = clone.map(elem => {
            return {
                ...elem,
                content: elem.content.map((el) => {
                    if (typeof el == 'string') {
                        return JSON.parse(el)
                    }
                    return el
                })
            }
        })

        schemeTransition.setAppData(parseData)
        roomState.mergeRoomsData();

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

    const createNewProject = () => {
        const clone = JSON.parse(JSON.stringify(START_PROJECT_PARAMS))

        startProjectParams.value = JSON.parse(JSON.stringify(START_PROJECT_PARAMS))

        startParamsClone.value = clone

        startRoomData.value = clone.rooms[0].params

        startCameraData.value = clone.camera

        startLightsDat.value = clone.lights

        startHeightClamp.value = clone.height_clamp

        currentProjectParams.value = clone

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
        setLightRange,
        createNewProject
    };

});
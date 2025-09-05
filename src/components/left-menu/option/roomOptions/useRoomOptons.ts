
/**// @ts-nocheck */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TOptionsMap, TLightRange, TQuality, TQualityValue, TFasadeItem } from '@/types/types';
import { IRoom } from '@/types/interfases';

import { useAppData } from "@/store/appliction/useAppData";
import { useModelState } from '@/store/appliction/useModelState';
import { useSceneState } from '@/store/appliction/useSceneState';
import { useRoomState } from '@/store/appliction/useRoomState';



export const useRoomOptions = defineStore('RoomOptions', () => {

    const APP = useAppData();
    const sceneState = useSceneState();
    const modelState = useModelState()
    const roomState = useRoomState();
    const startParams = sceneState.getStartProgectParams

    const shadowValue = ref<boolean>(false)
    const refractionValue = ref<boolean>(false)
    const startHeightClamp = ref<number | string>(startParams.height_clamp)

    const lightRange = ref<TLightRange>({
        pointLight: startParams.lights.pointLight.intensity,
        ambientLight: startParams.lights.ambientLight.intensity
    })

    const quality = ref<TQuality[]>([{
        lable: "Низкое",
        value: "low",
        active: true,
    },
    {
        lable: "Среднее",
        value: "medium",
        active: false,
    },
    {
        lable: "Высокое",
        value: "hight",
        active: false,
    }

    ],)

    const defaultIds: Record<keyof TOptionsMap, string> = {
        moduleTop: 'default_module_color',
        moduleBottom: 'default_module_color',
        fasadsTop: 'default_fasade_color',
        fasadsBottom: 'default_fasade_color',
        wall: 'default_wall',
        floor: 'default_floor',
        tableTop: 'default_table_model'
    }

    const {
        default_wall: defaultWall,
        default_floor: defaultFloor,
        default_module_color: defaultModuleTop,
        default_module_color: defaultModuleBottom,
        default_fasade_color: defaultFasadeTop,
        default_fasade_color: defaultFasadeBottom,
        default_table_model: defaulttableTop
    } = startParams;

    const globalOptions = ref<TOptionsMap>({
        wall: { id: defaultWall, global: false, title: "Оформление стен", label: 'Для всех комнат' },
        floor: { id: defaultFloor, global: false, title: "Оформление пола", label: 'Для всех комнат' },
        moduleTop: { id: defaultModuleTop, global: false, title: "Цвет корпуса (верхний)", label: 'Для всех комнат' },
        moduleBottom: { id: defaultModuleBottom, global: false, title: "Цвет корпуса (нижний)", label: 'Для всех комнат' },
        fasadsTop: { id: defaultFasadeTop, global: false, title: "Тип фасада (верхний)", label: 'Для всех комнат' },
        fasadsBottom: { id: defaultFasadeBottom, global: false, title: "Тип фасада (нижний)", label: 'Для всех комнат' },
        tableTop: { id: defaulttableTop, global: false, title: "Тип столешницы", label: 'Для всех комнат' },
    });

    //------------------------------------------------------------------------------------------

    const apllyProjectWall = (value: number) => {
        const rooms: IRoom[] = roomState.rooms

        rooms.forEach((room: IRoom) => {
            room.params.wall = value;
        });
    }

    const apllyProjectFloor = (value: number) => {
        const rooms = roomState.rooms

        rooms.forEach((room) => {
            room.params.floor = value;
        });
    }

    const getWallsTextures = () => {
        return APP.getAppData.WALL
    }

    const getFloorTextures = () => {
        return APP.getAppData.FLOOR
    }

    const getDefaultModuleData = () => {
        const colorMap: Record<number, TFasadeItem> = {};
        const PRODUCTS = APP.getAppData.CATALOG.PRODUCTS
        const FASADE = APP.getAppData.FASADE;

        for (const el in PRODUCTS) {
            const product = PRODUCTS[el];

            if (Array.isArray(product.MODULECOLOR) && product.MODULECOLOR[0] != null) {
                product.MODULECOLOR.forEach((color: number) => {
                    if (FASADE[color] !== undefined && colorMap[color] === undefined) {
                        colorMap[color] = FASADE[color] as TFasadeItem;
                    }
                });
            }
        }

        return colorMap
    }

    const getDefaultFasadeData = () => {
        const PRODUCTS = APP.getAppData.CATALOG.PRODUCTS
        const [key, value] = Object.entries(PRODUCTS)[0]
        const fasade = value.FACADE
        const defaultFasadData = modelState.createCurrentModelFasadesData(fasade, true)
        return defaultFasadData

    }

    const getDefaultTableTopData = () => {
        const tableTopIds = ['7292933', '7358837', '7358946', '7360269', '4066731'];
        const { CATALOG: { SECTIONS, PRODUCTS } } = APP.getAppData;

        const relevantSections = Object.entries(SECTIONS).filter(([key]) => tableTopIds.includes(key));

        const allProducts = relevantSections.flatMap(([, { PRODUCTS: prods }]) =>
            Array.isArray(prods) ? prods : []
        );

        const uniqueProductIds = [...new Set([...allProducts, '69919'])];

        const defaultTableTopData = Object.fromEntries(
            uniqueProductIds.map(id => [id, PRODUCTS[id]])
        );

        return defaultTableTopData
    }

    //--------------------------------------------------
    /** @Работа_с_настройками_освещения */
    //--------------------------------------------------

    const setShadowValue = (value: boolean) => {
        shadowValue.value = value
    }

    const getShadowValue = computed(() => {
        return shadowValue.value
    })

    const setLightRange = (type: keyof TLightRange, value: number | string) => {
        lightRange.value[type] = value
    }

    const getAmbientLightRange = computed(() => {
        return lightRange.value.ambientLight
    })

    const getPointLightRange = computed(() => {
        return lightRange.value.pointLight
    })

    //--------------------------------------------------
    /** @Высота_примагничивания_по_высоте */
    //--------------------------------------------------

    const setHeightClamp = (value: number | string) => {
        startHeightClamp.value = value
    }

    const getHeightClamp = computed(() => {
        return startHeightClamp.value
    })

    //--------------------------------------------------
    /** @Работа_с_отраженниями */
    //--------------------------------------------------

    const setRefractionValue = (value: boolean) => {
        refractionValue.value = value
    }

    const getRefractionValue = computed(() => {
        return refractionValue.value
    })

    //--------------------------------------------------
    /** @Качество_теней */
    //--------------------------------------------------

    const setQuality = (type: TQualityValue) => {
        quality.value.forEach((el: TQuality) => {
            el.active = el.value === type;
        })
    }

    const getQuality = computed(() => {
        return quality.value
    })

    //--------------------------------------------------
    /** @Работа_с_опциями */
    //--------------------------------------------------

    const updateOption = (type: keyof TOptionsMap, value: string | number | { data: string | number, type: string }) => {

        globalOptions.value[type].id = typeof value === 'object' && 'data' in value ? value.data : value;

        switch (type) {
            case "wall":
                if (globalOptions.value[type].global) {
                    apllyProjectWall(value as number)
                }
                break

            case "floor":
                if (globalOptions.value[type].global) {
                    apllyProjectFloor(value as number)
                }
                break

        }

    }

    const resetGlobalOptions = () => {
        const startParams = sceneState.getStartProgectParams
        for (const key in globalOptions.value) {
            const optionKey = key as keyof TOptionsMap
            if (globalOptions.value[optionKey].global === false) {
                globalOptions.value[optionKey].id = startParams[defaultIds[optionKey]]
            }
        }
    }

    const updateOptionGlobal = (type: keyof TOptionsMap, value: boolean) => {
        globalOptions.value[type].global = value
    }

    const getGlobalOptions = computed(() => {
        return globalOptions.value
    })

    return {
        getWallsTextures,
        getFloorTextures,

        apllyProjectWall,
        apllyProjectFloor,

        getDefaultModuleData,
        getDefaultFasadeData,
        getDefaultTableTopData,

        getGlobalOptions,
        updateOption,
        updateOptionGlobal,
        resetGlobalOptions,

        setShadowValue,
        setRefractionValue,
        setLightRange,
        setHeightClamp,
        setQuality,

        getShadowValue,
        getRefractionValue,
        getAmbientLightRange,
        getPointLightRange,
        getHeightClamp,
        getQuality,

    };
});
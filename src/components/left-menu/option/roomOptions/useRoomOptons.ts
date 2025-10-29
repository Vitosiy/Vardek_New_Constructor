
//@ts-nocheck

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TOptionsMap, TLightRange, TQuality, TQualityValue, TFasadeItem, TPalitte, TOptionItem, TTextureActionMap } from '@/types/types';
import { IRoom } from '@/types/interfases';

import { useAppData } from "@/store/appliction/useAppData";
import { useModelState } from '@/store/appliction/useModelState';
import { useSceneState } from '@/store/appliction/useSceneState';
import { useRoomState } from '@/store/appliction/useRoomState';



export const useRoomOptions = defineStore('RoomOptions', () => {

    // const APP = useAppData();

    const appStore = useAppData()
    const APP = computed(() => appStore.getAppData || {})

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

    const palittKey: Record<keyof TOptionsMap, string> = {
        fasadsTop: 'default_palit_top',
        fasadsBottom: 'default_palit_bottom'
    }

    const mllingKeys: Record<keyof TOptionsMap, string> = {
        fasadsTop: 'default_milling_top',
        fasadsBottom: 'default_milling_bottom'
    }

    const plinthKey: Record<keyof TOptionsMap, string> = {
        plinth: 'default_plinth_color'
    }

    const defaultIds: Record<keyof TOptionsMap, string> = {
        moduleTop: 'default_module_color',
        moduleBottom: 'default_module_color',
        fasadsTop: 'default_fasade_color',
        fasadsBottom: 'default_fasade_color',
        wall: 'default_wall',
        floor: 'default_floor',
        tableTop: 'default_table_model',
        plinth: 'default_plinth_body'
    }

    const {
        default_wall: defaultWall,
        default_floor: defaultFloor,
        default_module_color: defaultModuleTop,
        default_module_color: defaultModuleBottom,
        default_fasade_color: defaultFasadeTop,
        default_fasade_color: defaultFasadeBottom,
        default_table_model: defaulttableTop,
        default_palit_top: defaultPalitTop,
        default_palit_bottom: defaultPalitBottom,
        default_milling_bottom: defaultMillingBottom,
        default_milling_top: defaultMillingTop,
        default_plinth_body: defaultPlinthBody,
        default_plinth_color: defaultPlinthColor
    } = startParams;

    const globalOptions = ref<TOptionsMap>({
        wall: {
            id: defaultWall,
            global: false,
            title: "Оформление стен",
            label: 'Для всех комнат'
        },
        floor: {
            id: defaultFloor,
            global: false,
            title: "Оформление пола",
            label: 'Для всех комнат'
        },
        moduleTop: {
            id: defaultModuleTop,
            global: false,
            title: "Цвет корпуса (верхний)",
            label: 'Для всех комнат'
        },
        moduleBottom: {
            id: defaultModuleBottom,
            global: false,
            title: "Цвет корпуса (нижний)",
            label: 'Для всех комнат'
        },
        fasadsTop: {
            id: defaultFasadeTop,
            palitte: defaultPalitTop,
            milling: defaultMillingTop,
            global: false,
            title: "Тип фасада (верхний)",
            label: 'Для всех комнат',
            prefix: 'Top',
            palitteTitle: 'Цвет Палитры',
            millingTitle: 'Тип Фрезеровки'
        },
        fasadsBottom: {
            id: defaultFasadeBottom,
            palitte: defaultPalitBottom,
            milling: defaultMillingBottom,
            global: false,
            title: "Тип фасада (нижний)",
            label: 'Для всех комнат',
            prefix: 'Bottom',
            palitteTitle: 'Цвет Палитры',
            millingTitle: 'Тип Фрезеровки'
        },
        // tableTop: {
        //     id: defaulttableTop,
        //     global: false,
        //     title: "Тип столешницы",
        //     label: 'Для всех комнат'
        // },
        plinth: {
            id: defaultPlinthBody,
            plinthSurfase: defaultPlinthColor,
            global: false,
            title: 'Тип цокольных планок',
            label: 'Для всех комнат',
            plinthTitle: 'Тип фасада цокольных планок'
        }

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
        return APP.value.WALL
    }

    const getFloorTextures = () => {
        return APP.value.FLOOR
    }

    const getDefaultModuleData = () => {
        const colorMap: Record<number, TFasadeItem> = {};
        const PRODUCTS = APP.value.CATALOG.PRODUCTS
        const FASADE = APP.value.FASADE;

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
        const PRODUCTS = APP.value.CATALOG.PRODUCTS
        const [key, value] = Object.entries(PRODUCTS)[0]
        const fasade = value.FACADE
        const defaultFasadData = modelState.createCurrentModelFasadesData({ data:fasade, def: true })
        return defaultFasadData
    }

    const getDefaultTotalPlinthData = () => {
        return modelState.createTotalPlinthData()
    }

    const getTotalPlinthColorData = (id: number | string) => {
        return modelState.createTotalPlinthColorData(id)
    }

    const getDefaultPalitData = (id: number | string): TPalitte[] => {
        return Object.values(modelState.createCurrentPaletteData(id))
    }

    const getDefaultMillingData = (fasadeId: number | string) => {
        return modelState.createTotalMillingList(fasadeId)
    }

    const getDefaultTableTopData = () => {
        const tableTopIds = ['7292933', '7358837', '7358946', '7360269', '4066731'];
        const { CATALOG: { SECTIONS, PRODUCTS } } = APP.value;

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
    /** @Высота_примагничивания */
    //--------------------------------------------------

    const setHeightClamp = (value: number | string | null) => {
        const curValue = value ?? 3000
        startHeightClamp.value = curValue
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

    const updateOption = (
        type: keyof TOptionsMap,
        value: string | number | { data: string | number, type: string },
    ) => {
        globalOptions.value[type]!.id =
            typeof value === 'object' && 'data' in value ? value.data : value;

        switch (type) {
            case "wall":
                if (globalOptions.value[type].global) {
                    apllyProjectWall(value as number);
                }
                break;

            case "floor":
                if (globalOptions.value[type].global) {
                    apllyProjectFloor(value as number);
                }
                break;
        }
    };

    const resetGlobalOptions = () => {
        const startParams = sceneState.getStartProgectParams
        for (const key in globalOptions.value) {
            const optionKey = key as keyof TOptionsMap
            const palitt = palittKey[optionKey]
            const milling = mllingKeys[optionKey]
            const plinth = plinthKey[optionKey]

            try {
                if (globalOptions.value[optionKey]) {
                    if (globalOptions.value[optionKey].global === false) {
                        globalOptions.value[optionKey].id = startParams[defaultIds[optionKey]]
                        if (palitt) {
                            globalOptions.value[optionKey].palitte = startParams[palitt]
                        }
                        if (milling) {
                            globalOptions.value[optionKey].milling = startParams[milling]
                        }
                        if (plinth) {
                            globalOptions.value[optionKey].plinthSurfase = startParams[plinth]
                        }
                    }
                }


            } catch (error) {
                console.warn('Стартовые параметры не найдены', error);
            }


        }
    }

    const updateOptionGlobal = (type: keyof TOptionsMap, value: boolean) => {
        if (globalOptions.value[type]) {
            globalOptions.value[type].global = value
        }

    }

    const getGlobalOptions = computed(() => {
        return globalOptions.value
    })

    const setGlobalPalitte = (id: number | string | null, type: keyof TTextureActionMap) => {
        const option = globalOptions.value[type];
        if (option) {
            option.palitte = id;
        }
    };

    const setGlobalMilling = (id: number | string | null, type: keyof TTextureActionMap) => {
        const option = globalOptions.value[type];

        if (option) {
            option.milling = id;
        }
    };

    const setGlobalPlinth = (id: number | string | null, type: keyof TTextureActionMap) => {
        const option = globalOptions.value[type];

        if (option) {
            option.plinthSurfase = id;
        }
    };

    return {
        getWallsTextures,
        getFloorTextures,

        apllyProjectWall,
        apllyProjectFloor,

        getDefaultModuleData,
        getDefaultFasadeData,
        getDefaultTableTopData,
        getDefaultPalitData,
        getDefaultMillingData,
        getDefaultTotalPlinthData,
        getTotalPlinthColorData,

        getGlobalOptions,
        updateOption,
        updateOptionGlobal,
        resetGlobalOptions,

        setShadowValue,
        setRefractionValue,
        setLightRange,
        setHeightClamp,
        setQuality,
        setGlobalPalitte,
        setGlobalMilling,
        setGlobalPlinth,

        getShadowValue,
        getRefractionValue,
        getAmbientLightRange,
        getPointLightRange,
        getHeightClamp,
        getQuality,

    };
});
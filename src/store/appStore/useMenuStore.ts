// src/stores/useMenuStore.ts
/**//@ts-nocheck */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MenuType, TOptionsMap, TLightRange, TQuality, TQualityValue } from '@/types/types';
import { useRoomState } from "@/store/appliction/useRoomState";
import { useSceneState } from '@/store/appliction/useSceneState';


export const useMenuStore = defineStore('menu', () => {

  const catalogFilterProductsId = ref([])
  const openMenus = ref<MenuType[]>([]);
  const menuContentsByID = ref<string>('');
  const roomState = useRoomState();
  const sceneState = useSceneState();
  const startParams = sceneState.getStartProgectParams

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

  const shadowValue = ref<boolean>(false)
  const refractionValue = ref<boolean>(false)
  const startHeightClamp = ref<number | string>(startParams.height_clamp)
  const drowMode = ref<boolean>(false)
  const rulerVisibility = ref<boolean>(true);

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

  async function openMenu(type: MenuType, content: string, products: []) {

    console.log(type, content, products, '--MenuType')

    openMenus.value = [];
    catalogFilterProductsId.value = [];

    if (!openMenus.value.includes(type)) {

      openMenus.value.push(type);

      menuContentsByID.value = content;

      catalogFilterProductsId.value = products;
    }
  }

  function closeMenu(type: MenuType) {
    openMenus.value = openMenus.value.filter(menu => menu !== type);
    menuContentsByID.value = '';
  }

  function closeAllMenus() {
    openMenus.value = [];
    menuContentsByID.value = '';
  }

  //-------------------------
  /** @Работа_с_настройками_освещения */
  //-------------------------

  const setShadowValue = (value: boolean) => {
    shadowValue.value = value
  }

  const setRefractionValue = (value: boolean) => {
    refractionValue.value = value
  }

  const setLightRange = (type: keyof TLightRange, value: number | string) => {
    lightRange.value[type] = value
  }

  const setHeightClamp = (value: number | string) => {
    startHeightClamp.value = value
  }

  const setQuality = (type: TQualityValue) => {
    quality.value.forEach((el: TQuality) => {
      el.active = el.value === type;
    })

  }

  const getShadowValue = computed(() => {
    return shadowValue.value
  })

  const getRefractionValue = computed(() => {
    return refractionValue.value
  })

  const getAmbientLightRange = computed(() => {
    return lightRange.value.ambientLight
  })

  const getPointLightRange = computed(() => {
    return lightRange.value.pointLight
  })

  const getHeightClamp = computed(() => {
    return startHeightClamp.value
  })

  const getQuality = computed(() => {
    return quality.value
  })

  //-------------------------
  /** @Работа_с_опциями */
  //-------------------------

  const updateOption = (type: keyof TOptionsMap, value: string | number | { data: string | number, type: string }) => {

    globalOptions.value[type].id = typeof value === 'object' && 'data' in value ? value.data : value;

    switch (type) {
      case "wall":
        if (globalOptions.value[type].global) {
          roomState.apllyProjectWall(value)
        }
        break

      case "floor":
        if (globalOptions.value[type].global) {
          roomState.apllyProjectFloor(value)
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

  //-------------------------
  /** @Режим_чертежа */
  //-------------------------

  const setDrowModeValue = (value: boolean) => {
    drowMode.value = value
  }

  const toggleDrowModeValue = async () => {
    drowMode.value = !drowMode.value
    // console.log(drowMode.value, 'drowMode.value')
  }

  const getDrowModeValue = computed(() => {
    return drowMode.value
  })

  //-------------------------
  /** @Видимость_размеров */
  //-------------------------

  const setRulerVisibility = (value: boolean) => {
    rulerVisibility.value = value
  }

  const toggleRulerVisibility = () => {
    rulerVisibility.value = !rulerVisibility.value
  }

  const getRulerVisibility = computed(() => {
    return rulerVisibility.value
  })


  return {
    openMenus,
    menuContentsByID,
    catalogFilterProductsId,

    openMenu,
    closeMenu,
    closeAllMenus,

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

    toggleDrowModeValue,
    setDrowModeValue,
    getDrowModeValue,

    toggleRulerVisibility,
    setRulerVisibility,
    getRulerVisibility,

  };
});

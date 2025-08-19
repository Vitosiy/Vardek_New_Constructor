// src/stores/useMenuStore.ts
/**//@ts-nocheck */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MenuType, TOptionsMap } from '@/types/types';
import { useRoomState } from "@/store/appliction/useRoomState";
import { useSceneState } from '@/store/appliction/useSceneState';


export const useMenuStore = defineStore('menu', () => {

  const catalogFilterProductsId = ref([])
  const openMenus = ref<MenuType[]>([]);
  const menuContentsByID = ref<string>('');
  const roomState = useRoomState();
  const sceneState = useSceneState();

  const defaultIds: Record<keyof TOptionsMap, string> = {
    moduleTop: 'default_module_color',
    moduleBottom: 'default_module_color',
    fasadsTop: 'default_fasade_color',
    fasadsBottom: 'default_fasade_color',
    wall: 'default_wall',
    floor: 'default_floor'
  }

  const {
    default_wall: defaultWall,
    default_floor: defaultFloor,
    default_module_color: defaultModuleTop,
    default_module_color: defaultModuleBottom,
    default_fasade_color: defaultFasadeTop,
    default_fasade_color: defaultFasadeBottom
  } = sceneState.getStartProgectParams;

  const globalOptions = ref<TOptionsMap>({
    wall: { id: defaultWall, global: false, title: "Оформление стен", label: 'Для всех комнат' },
    floor: { id: defaultFloor, global: false, title: "Оформление пола", label: 'Для всех комнат' },
    moduleTop: { id: defaultModuleTop, global: false, title: "Цвет корпуса (верхний)", label: 'Для всех комнат' },
    moduleBottom: { id: defaultModuleBottom, global: false, title: "Цвет корпуса (нижний)", label: 'Для всех комнат' },
    fasadsTop: { id: defaultFasadeTop, global: false, title: "Тип фасада (верхний)", label: 'Для всех комнат' },
    fasadsBottom: { id: defaultFasadeBottom, global: false, title: "Тип фасада (нижний)", label: 'Для всех комнат' },
  });

  async function openMenu(type: MenuType, content: string, products: []) {

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

  /** @Работа_с_опциями */

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
    resetGlobalOptions
  };
});

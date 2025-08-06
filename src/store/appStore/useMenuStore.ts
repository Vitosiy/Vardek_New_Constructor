// src/stores/useMenuStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MenuType, TOptionsMap } from '@/types/types';





export const useMenuStore = defineStore('menu', () => {

  const catalogFilterProductsId = ref([])
  const openMenus = ref<MenuType[]>([]);
  const menuContentsByID = ref<string>('');

  const globalOptions = ref<TOptionsMap>({
    wall: { id: 44128, global: false, title: "Оформление стен", label: 'Для всех комнат' },
    floor: { id: 44013, global: false, title: "Оформление пола", label: 'Для всех комнат' },
    // bodyTop: { id: 7397, global: false, title: "Цвет корпуса (верхний)", label: 'Для всех комнат' },
    // bodyBottom: { id: 7397, global: false, title: "Цвет корпуса (нижний)", label: 'Для всех комнат' },
    // fasadsTop: { id: 7397, global: false, title: "Тип фасада (верхний)", label: 'Для всех комнат' },
    // fasadsBottom: { id: 7397, global: false, title: "Тип фасада (нижний)", label: 'Для всех комнат' },
  });

  function openMenu(type: MenuType, content: string, products: []) {

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

  const updateOption = (type: string, value: string | number) => {
    console.log(type, 'TT')

    globalOptions.value[type].id = value



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
  };
});

// src/stores/useMenuStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

type MenuType = 'tech' | 'roomPar' | 'customiser';

export const useMenuStore = defineStore('menu', () => {

  const catalogFilterProductsId = ref([])
  const openMenus = ref<MenuType[]>([]);
  const menuContentsByID = ref<string>('');

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

  return {
    openMenus,
    menuContentsByID,
    catalogFilterProductsId,

    openMenu,
    closeMenu,
    closeAllMenus
  };
});

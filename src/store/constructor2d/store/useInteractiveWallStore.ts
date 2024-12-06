import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useC2DInteractiveWallStore = defineStore('useC2DInteractiveWallStore', () => {

  // Состояния
  const statusRightDownMouse = ref<boolean>(false);

  // Методы
  const setStatusRightDownMouse = (value: boolean) => {
    statusRightDownMouse.value = value;
  };

  return {
    statusRightDownMouse,

    setStatusRightDownMouse
  };

});
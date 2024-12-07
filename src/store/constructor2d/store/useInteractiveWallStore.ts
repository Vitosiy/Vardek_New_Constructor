import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useC2DInteractiveWallStore = defineStore('useC2DInteractiveWallStore', () => {

  // Состояния
  const activeObjectID = ref<string | number>(0);
  const statusRightDownMouse = ref<boolean>(false);

  // Методы
  const setStatusRightDownMouse = (value: boolean) => {
    statusRightDownMouse.value = value;
  };

  const setActiveObjectID = (value: string | number) => {
    activeObjectID.value = value;
  }

  return {
    activeObjectID,
    statusRightDownMouse,

    setActiveObjectID,
    setStatusRightDownMouse
  };

});
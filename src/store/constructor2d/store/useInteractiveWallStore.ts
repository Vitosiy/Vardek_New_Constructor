import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useC2DInteractiveWallStore = defineStore('useC2DInteractiveWallStore', () => {

  // Состояния
  const activeObjectID = ref<string | number>(0);
  const statusLeftDownMouse = ref<boolean>(false);
  const activePoint = ref<number | null>(null);

  // Методы
  const setStatusLeftDownMouse = (value: boolean) => {
    statusLeftDownMouse.value = value;
  };

  const setActiveObjectID = (value: string | number) => {
    activeObjectID.value = value;
    // console.log("\n\r\n\rsetActiveObjectID:", activeObjectID.value);
  }

  const setActivePoint = (value: number | null) => {
    activePoint.value = value;
  }

  return {
    activeObjectID,
    statusLeftDownMouse,
    activePoint,

    setActiveObjectID,
    setStatusLeftDownMouse,
    setActivePoint
  };

});
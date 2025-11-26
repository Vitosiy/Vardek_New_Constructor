import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useC2DLeftMenuStore = defineStore('C2DLeftMenu', () => {
  // Состояния
  const interactionMode = ref('');
  const goodActive = ref('');

  // Методы
  const setInteractionMode = (mode: string) => {
    interactionMode.value = mode;
  };

  const setGoodActive = (mode: string) => {
    goodActive.value = mode;
  };

  return {
    interactionMode,
    goodActive,
    setInteractionMode,
    setGoodActive,
  };
});

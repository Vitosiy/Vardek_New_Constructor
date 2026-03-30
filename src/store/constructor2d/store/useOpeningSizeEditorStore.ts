import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * id объекта двери/окна в слое DoorsAndWindows при открытии попапа размеров.
 */
export const useOpeningSizeEditorStore = defineStore('openingSizeEditor', () => {
  const objectId = ref<string | number | null>(null);

  const setObjectId = (id: string | number | null) => {
    objectId.value = id;
  };

  const clear = () => {
    objectId.value = null;
  };

  return {
    objectId,
    setObjectId,
    clear,
  };
});

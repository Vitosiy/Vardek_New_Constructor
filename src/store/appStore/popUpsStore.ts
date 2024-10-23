import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePopupStore = defineStore('popup', () => {
  const popups = ref({
    basket: false,
    error: false,
    info: false,
    project: false,
    study: false,
  });

  const openPopup = (popupName: keyof typeof popups.value) => {
    popups.value[popupName] = true;
    
  };

  const closePopup = (popupName: keyof typeof popups.value) => {
    popups.value[popupName] = false;
  };

  const isAnyPopupOpen = computed(() => {
    return Object.values(popups.value).some(isOpen => isOpen);
  });
  return {
    popups,
    openPopup,
    closePopup,
    isAnyPopupOpen
  };
});

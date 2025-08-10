import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePopupStore = defineStore('popup', () => {
  const popups = ref({
    basket: false,
    error: false,
    project: false,
    study: false,
    catalog: false,
  });

  const isInfoPopupOpen = ref<boolean> (false)

  const openPopup = (popupName: keyof typeof popups.value) => {
    popups.value[popupName] = true;
    
  };

  const closePopup = (popupName: keyof typeof popups.value) => {
    popups.value[popupName] = false;
  };

  const toggleInfoPopup = () => {
    isInfoPopupOpen.value = !isInfoPopupOpen.value
  }

  const isAnyPopupOpen = computed(() => {
    return Object.values(popups.value).some(isOpen => isOpen);
  });

  return {
    popups,
    isInfoPopupOpen,
    
    openPopup,
    closePopup,
    toggleInfoPopup,
    isAnyPopupOpen
  };
});

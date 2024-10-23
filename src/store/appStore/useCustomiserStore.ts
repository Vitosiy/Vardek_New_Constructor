import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface Customisers {
  ruler: boolean,
  color: boolean,
  moving: boolean,
  figure: boolean,
  hammer: boolean
}

type CustomiserType = 'ruler' | 'color' | 'moving' | 'figure' | 'hammer';

export const useCustomiserStore = defineStore('customiser', () => {
  const isCustomiserOpen = ref(false);

  const customisers = ref<CustomiserType[]>(['ruler'])

  const toggleCustomiserPopup = () => {
    isCustomiserOpen.value = !isCustomiserOpen.value;
  }

  function switchCustomiser(type: CustomiserType) {
    customisers.value = [];
    if (!customisers.value.includes(type)) {
      customisers.value.push(type);
    }
  }
  return {
    isCustomiserOpen,
    customisers,
    toggleCustomiserPopup,
    switchCustomiser,
  };
})

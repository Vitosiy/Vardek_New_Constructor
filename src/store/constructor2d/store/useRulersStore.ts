import { defineStore } from 'pinia';

export const useRulers2DStore = defineStore('rulers2DStore', {
  state: () => ({
    rulerSpace: 30,      // Пробел линейки
  }),
  actions: {
    setRulerSpace(space: number) {
      this.rulerSpace = space;
    }
  },
});

import { defineStore } from 'pinia';

export const useGridStore = defineStore('grid2DStore', {
  state: () => ({
    gridSize: 20,        // Размер ячейки сетки
    colorGrid: 0xefefef, // Цвет сетки
  }),
  actions: {
    setGridSize(size: number) {
      this.gridSize = size;
    },
    setColorGrid(color: number) {
      this.colorGrid = color;
    },
  },
});

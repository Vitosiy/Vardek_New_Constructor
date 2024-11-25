import { defineStore } from 'pinia';

interface State {
  rulerSpace: number;
  segmentSize: number;
  edgeColor: number | string;
}

export const useRulers2DStore = defineStore('rulers2DStore', {
  
  state: (): State  => ({
    
    rulerSpace: 30, // высота линейки

    segmentSize: 100, // длина сегмента линейки
    
    edgeColor: 0x5D6069,

  }),
  
  actions: {
    
    setRulerSpace(value: number) {
      this.rulerSpace = value;
    },

    setEdgeColor(value: number | string) {
      this.edgeColor = value;
    },

    setSegmentSize(value: number) {
      this.segmentSize = value;
    }
    
  },

});

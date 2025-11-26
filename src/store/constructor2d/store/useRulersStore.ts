import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useRulers2DStore = defineStore('rulers2DStore', () => {
  // State
  const rulerSpace = ref(30); // высота линейки
  const segmentSize = ref(100); // длина сегмента линейки
  const edgeColor = ref<number | string>(0x5D6069);
  const textSegment = ref(100);

  // Getters
  const getRulerSpace = computed(() => rulerSpace.value);
  const getSegmentSize = computed(() => segmentSize.value);
  const getEdgeColor = computed(() => edgeColor.value);
  const getTextSegment = computed(() => textSegment.value);

  // Actions
  const setRulerSpace = (value: number) => {
    rulerSpace.value = value;
  };

  const setEdgeColor = (value: number | string) => {
    edgeColor.value = value;
  };

  const setSegmentSize = (value: number) => {
    segmentSize.value = value;
  };

  const setTextSegment = (value: number) => {
    textSegment.value = value;
  };

  return {
    // State
    rulerSpace,
    segmentSize,
    edgeColor,
    textSegment,

    // Getters
    getRulerSpace,
    getSegmentSize,
    getEdgeColor,
    getTextSegment,

    // Actions
    setRulerSpace,
    setEdgeColor,
    setSegmentSize,
    setTextSegment,
  };
});

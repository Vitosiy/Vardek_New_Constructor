import { ref, reactive, computed } from "vue";
import { defineStore } from "pinia";

import { Vector2 } from "@/types/constructor2d/interfaсes";

export const useConstructor2DStore = defineStore("constructor2DStore", () => {
  // Состояния
  const mouse = reactive({
    rightBtn: false,
    rightClickPosition: reactive<Vector2>({ x: 0, y: 0 }),
    prevOriginOfCoordinates: reactive<Vector2>({ x: 0, y: 0 }),
    positionPoint: reactive<Vector2>({ x: 0, y: 0 }),
  });

  const originOfCoordinates = reactive<Vector2>({ x: 0, y: 0 });

  const segment = reactive({
    indent: 5,
    width: 5,
  });

  const colorAxisLine = ref<number | string>(0xDA444C);

  const scale = ref<number | 0.01>(1); // это для размера холста планировщика
  const scale1 = ref<number>(1); // противоположное значение от переменной scale

  // Действия
  const toggleRightBtn = () => {
    mouse.rightBtn = !mouse.rightBtn;
  };

  const updatePositionPoint = (x: number, y: number) => {
    mouse.positionPoint.x = x;
    mouse.positionPoint.y = y;
  };

  const updateOriginOfCoordinates = (x: number, y: number) => {
    originOfCoordinates.x = x;
    originOfCoordinates.y = y;
  };

  const updataRightClickPosition = (x: number, y: number) => {
    mouse.rightClickPosition.x = x;
    mouse.rightClickPosition.y = y;
  };

  const updatePrevOriginOfCoordinates = (x: number, y: number) => {
    mouse.prevOriginOfCoordinates.x = x;
    mouse.prevOriginOfCoordinates.y = y;
  };

  const setColorAxisLine = (color: number | string) => {
    colorAxisLine.value = color;
  };

  const setScale = (newScale: number) => {
    const ns = Math.max(newScale, 0.01);
    scale.value = ns;
    scale1.value = 1 / ns; // Обновляем противоположное значение
  };

  const setSegment = (indent: number, width: number) => {
    segment.indent = indent;
    segment.width = width;
  };

  // Геттеры
  const getOriginOfCoordinates = computed(() => originOfCoordinates);
  const getColorAxisLine = computed(() => colorAxisLine.value);
  const getScale = computed(() => scale.value);
  const getScale1 = computed(() => scale1.value);
  const getSegment = computed(() => segment);

  // Экспортируем состояние, действия, геттеры и сеттеры
  return {
    mouse,
    originOfCoordinates,
    segment,
    colorAxisLine,
    scale,
    scale1,

    toggleRightBtn,
    updatePositionPoint,
    updateOriginOfCoordinates,
    updataRightClickPosition,
    updatePrevOriginOfCoordinates,

    setColorAxisLine,
    setScale,
    setSegment,

    getOriginOfCoordinates,
    getColorAxisLine,
    getScale,
    getScale1,
    getSegment,
  };
});

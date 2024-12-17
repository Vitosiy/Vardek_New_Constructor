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

  const scale = ref<number>(1); // это для размера холста планировщика
  const inverseScale = ref<number>(1); // противоположное значение от переменной scale
  const scaleMin = ref<number>(0.3);
  const scaleMax = ref<number>(2);
  const scaleSpeed = ref<number>(0.01);

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

    // Ограничиваем значение scale в диапазоне [0.01, 3]
    const ns = Math.min(
      Math.max(newScale, scaleMin.value),
      scaleMax.value
    );

    scale.value = ns;

    // Если scale меньше 1, inverseScale становится больше 1, и наоборот
    if (ns < 1) {
      inverseScale.value = 1 / ns;
    } else {
      inverseScale.value = ns === 1 ? 1 : 1 / ns;
    }

    // Лог для проверки
    console.log(`Scale: ${scale.value}, inverseScale: ${inverseScale.value}`);
  };

  const setScaleSpeed = (value: number) => {

    scaleSpeed.value = value;
    
  };

  const setScaleRange = (type: "min" | "max", value: number) => {

    if (type === "min") {
      scaleMin.value = value;
    }else if (type === "max") {
      scaleMax.value = value;
    }
    
  }

  const setSegment = (indent: number, width: number) => {
    segment.indent = indent;
    segment.width = width;
  };

  // Геттеры
  const getOriginOfCoordinates = computed(() => originOfCoordinates);
  const getColorAxisLine = computed(() => colorAxisLine.value);
  const getScale = computed(() => scale.value);
  const getInverseScale = computed(() => inverseScale.value);
  const getScaleMin = computed(() => scaleMin.value);
  const getScaleMax = computed(() => scaleMax.value);
  const getScaleSpeed = computed(() => scaleSpeed.value);
  const getSegment = computed(() => segment);

  // Экспортируем состояние, действия, геттеры и сеттеры
  return {
    mouse,
    originOfCoordinates,
    segment,
    colorAxisLine,
    scale,
    inverseScale,
    scaleSpeed,

    toggleRightBtn,
    updatePositionPoint,
    updateOriginOfCoordinates,
    updataRightClickPosition,
    updatePrevOriginOfCoordinates,

    setColorAxisLine,
    setScale,
    setScaleSpeed,
    setScaleRange,
    setSegment,

    getOriginOfCoordinates,
    getColorAxisLine,
    getScale,
    getInverseScale,
    getScaleMin,
    getScaleMax,
    getScaleSpeed,
    getSegment,
  };
});

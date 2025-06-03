<script setup lang="ts">
// @ts-nocheck
import { useEventBus } from "@/store/appliction/useEventBus";
import {
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
  reactive,
  computed,
  ref,
  toRaw,
  watch,
  defineExpose,
  nextTick,
} from "vue";

import MainInput from "@/components/ui/inputs/MainInput.vue";
import InteractiveSpace from "./InteractiveSpace.vue";
import { ShapeAdjuster } from "./utils/Methods";
import { UI_PARAMS} from "./utils/UMConstructorConst.ts";
import ProductOptions from "./utils/ProductOptions.vue";
import {useMenuStore} from "@/store/appStore/useMenuStore";
import * as THREETypes from "@/types/types";
import {GridModule, FillingObject, GridCell, GridSection, GridCellsRow} from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";

const eventBus = useEventBus();

const emit = defineEmits(["save-table-data"]);

const {
  MAX_AREA_WIDTH,
  TOTAL_LENGTH,
  TOTAL_HEIGHT,
  BACKGROUND_COLOR,
  MIN_SECTION_WIDTH,
  MIN_SECTION_HEIGHT,
} = UI_PARAMS;

let shapeAdjuster = null;
const menuStore = useMenuStore();
const productData = ref(false)
const builder = THREETypes.TUniversalGeometryBuilder

const props = defineProps({
  canvasHeight: {
    type: Number,
    default: 720,
  },
  canvasWidth: {
    type: Number,
    default: 600,
  },
});

const isMounted = ref(false);
const visualizationRef = ref(null);
const serviseData = ref([]);
const module = computed(() => {

  if (productData.value) {
    const PROPS = productData.value.userData.PROPS;
    if(!PROPS.CONFIG.MODULEGRID) {
      let section: GridSection = {
        number: 1,
        width: totalWidth.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2,
        height: totalHeight.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2 - PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"],
        cells: [],
        type: "section",
      }

      let _module: GridModule = {
        width: totalWidth.value,
        height: totalHeight.value,
        moduleThickness: PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] || 18,
        horizont: PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"] || 0,
        sections: [section],
        type: "module",
      }

      PROPS.CONFIG.MODULEGRID = _module
    }

    //props.canvasHeight = totalHeight.value = PROPS.CONFIG.MODULEGRID.height;
    //props.canvasWidth = totalWidth.value = PROPS.CONFIG.MODULEGRID.width;

    return PROPS.CONFIG.MODULEGRID
  }
});
const totalHeight = ref(0);
const totalWidth = ref(0);

const getMinHeight = computed(() => {
  return productData.value.userData.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_HEIGHT_MIN
})
const getMaxHeight = computed(() => {
  return productData.value.userData.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_HEIGHT_MAX
})
const getMinWidth = computed((dimension, minmax) => {
  return productData.value.userData.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_WIDTH_MIN
})
const getMaxWidth = computed((dimension, minmax) => {
  return productData.value.userData.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_WIDTH_MAX
})

const tempHole = ref({});

const selectedCell = ref({ sec: 0, cell: 0 , cell: 0});
const correct = ref({ change: false });
const holeOptions = ref({ show: false, section: { sec: 0, cell: 0 } });
const cutServise = ref({ show: false, section: { sec: 0, cell: 0 } });
const constructor2dContainer = ref(null);
const step = ref(1);

// Получаем текущую секцию
const getCurrentSection = computed(() => {
  if (!isMounted.value) return;
  const cellIndex = selectedCell.value.cell ?? 0;
  const secIndex = selectedCell.value.sec ?? 0;

  const currentColl = module.value[secIndex];
  const currentRow = currentColl[cellIndex];
  return { currentRow, currentColl };
});
// Получаем данные услуг секции
const getCurrentSectionServiseData = computed(() => {
  if (!isMounted.value) return;
  return getCurrentSection.value.currentRow.serviseData ?? [];
});

const getRoundSectionValidation = computed(() => {
  return (sec, cell) => {
    if (!isMounted.value) return;
    try {
      const currentColl = module.value[sec];
      const currentRow = currentColl[cell];

      if ("radius" in currentRow.roundCut) return true;
      return false;
    } catch (e) {
      console.error(e);
    }
  };
});

const checkRounded = computed(() => {
  if (!isMounted.value) return;
  const cell = getCurrentSection.value.currentRow;
  if ("radius" in cell.roundCut) return true;
  return false;
});

const updateTotalHeight = (value) => {
  totalHeight.value = parseInt(value);

  visualizationRef.value.updateTotalHeight(value);
  // visualizationRef.value.renderGrid();
  reset();
  visualizationRef.value.selectCell(0, 0);
};

const updateTotalWidth = (value) => {
  totalWidth.value = parseInt(value);

  visualizationRef.value.updateTotalWidth(value);
  // visualizationRef.value.renderGrid();
  reset();
  visualizationRef.value.selectCell(0, 0);
};

const getMaxAreaHeight = (value) => {
  return (value * MAX_AREA_WIDTH) / TOTAL_LENGTH;
};

// const getMaxAreaHeight = computed(() => {
//   return (totalHeight.value * MAX_AREA_WIDTH) / TOTAL_LENGTH;
// });

const showCurrentCol = (secIndex) => {
  selectedCell.value = { sec: secIndex, cell: 0 };
  visualizationRef.value.selectCell(secIndex, 0);
  holeOptions.value.show = false;
  cutServise.value.show = false;
};

const addSection = (secIndex) => {
  const section = module.value.sections[secIndex];
  const halfWidth = section.width / 2;

  if (halfWidth < 150 /*|| !((section.width / 2) % step.value == 0)*/)
    return;

  // Обновляем ширину текущей колонки
  section.cells.forEach((cell) => {
    cell.width = halfWidth;
  });

  section.width = halfWidth;

  // Создаем новую колонку с такими же параметрами

  const newColumn: GridSection = {
    ...section,
    number: section.number + 1,
    width: halfWidth,
    cells: [],
  }
  module.value.sections.splice(secIndex + 1, 0, newColumn);

  // Обновляем рендер
  visualizationRef.value.renderGrid();
  console.log(module.value.sections, "55555");
};

const addCell = (secIndex, cellIndex = 0) => {
  selectedCell.value.sec = secIndex;
  selectedCell.value.cell = cellIndex;
  visualizationRef.value.selectCell(secIndex, cellIndex, true);

  let cell;
  if(module.value.sections[secIndex].cells.length > 0) {
    cell = module.value.sections[secIndex].cells[cellIndex]
  }
  else {
    cell = <GridCell>{
      number: 1,
      width: module.value.sections[secIndex].width,
      height: module.value.sections[secIndex].height,
      type: "cell",
    };
    module.value.sections[secIndex].cells.push(cell);
  }

  cell.cellsRows?.forEach((cell) => {
    cell.fillings = [];
  });

  const lastCell = module.value.sections[secIndex].cells[module.value.sections[secIndex].cells.length - 1];

  const halfHeight = Math.floor((cell.height - module.value.moduleThickness) / 2);

  if (halfHeight < 150 /*|| !(cell.height % step.value == 0)*/) return;

  // Обновляем высоту последней строки
  cell.height = halfHeight;

  // Добавляем новую строку в эту колонку
  module.value.sections[secIndex].cells.splice(cellIndex, 0, {
    ...cell,
    number: cell.number + 1,
  });

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const addRowCell = (secIndex, cellIndex, rowIndex = 0) => {
  selectedCell.value.sec = secIndex;
  selectedCell.value.cell = cellIndex;
  selectedCell.value.row = rowIndex;
  visualizationRef.value.selectCell(secIndex, cellIndex, true, rowIndex);

  let row;
  if(module.value.sections[secIndex].cells[cellIndex].cellsRows?.length > 0) {
    row = module.value.sections[secIndex].cells[cellIndex].cellsRows[rowIndex];
  }
  else {
    module.value.sections[secIndex].cells[cellIndex].cellsRows = []
    row = <GridCellsRow>{
      number: 1,
      width: module.value.sections[secIndex].cells[cellIndex].width,
      height: module.value.sections[secIndex].cells[cellIndex].height,
      type: "rowCell",
      fillings: [],
    }
    module.value.sections[secIndex].cells[cellIndex].cellsRows.push(row);
  }

  const lastRow = module.value.sections[secIndex].cells[cellIndex].cellsRows[module.value.sections[secIndex].cells[cellIndex].cellsRows.length - 1];

  const halfWidth = Math.floor((row.width - module.value.moduleThickness) / 2);

  if (halfWidth < 150 /*|| !(cell.height % step.value == 0)*/) return;

  // Обновляем высоту последней строки
  row.width = halfWidth;

  // Добавляем новую строку в эту колонку
  module.value.sections[secIndex].cells[cellIndex].cellsRows.splice(rowIndex, 0, {
    ...row,
    number: row.number + 1,
  });

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const createHoleDataToCheck = (type, cell, sec) => {
  let width, height, radius, tempHole;

  let extremum = cell.width < cell.height ? cell.width * 0.5 : cell.height * 0.5;

  if (extremum > 600) extremum = 300;

  width = extremum;
  height = extremum;
  radius = extremum;

  switch (type) {
    case "rect":
      tempHole = {
        type: "rect",
        width,
        height,
      };
      break;

    case "circle":
      tempHole = {
        type: "circle",
        radius,
      };
      break;
  }

  return visualizationRef.value.checkPositionHoleToCreate(tempHole);
};

const addHole = (type) => {
  const sec = module.value[selectedCell.value.sec];
  const cell = sec[selectedCell.value.cell];

  const startHoleData = createHoleDataToCheck(type, cell, sec);

  if (!startHoleData) {
    alert("Позиция не найдена");
    return;
  }

  if (selectedCell.value.sec === null || selectedCell.value.cell === null) {
    alert("Пожалуйста, выберите секцию для добавления прямоугольного выреза");
    return;
  }

  let preperedData;

  switch (type) {
    case "rect":
      preperedData = {
        ...startHoleData,
        lable: "Прямоугольный разрез",
        holeId: cell.holes.length,
        Mwidth: 600,
        Mheight: 600,
      };
      break;
    case "circle":
      preperedData = {
        ...startHoleData,
        lable: "Круглый разрез",
        holeId: cell.holes.length,
        Mradius: 600,
      };
      break;
  }

  cell.holes.push(preperedData);

  // // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const showCutServises = (secIndex, cellIndex) => {
  visualizationRef.value.selectCell(secIndex, cellIndex);
  holeOptions.value.show = false;
  cutServise.value.show = true;
  cutServise.value.section.sec = secIndex;
  cutServise.value.section.cell = cellIndex;
};

const toggleHoleOptions = (secIndex, cellIndex) => {
  cutServise.value.show = false;
  holeOptions.value.show = !holeOptions.value.show;
};


const getCutServiseActive = computed(() => {
  return (sec, cell) => {
    if (!isMounted.value) return;
    const { section, show } = cutServise.value;
    return { active: sec === section.sec && cell === section.cell && show };
  };
});

const updateSectionWidth = (value, secIndex, cellIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;

  // Обновляем выбранную секцию для визуального отображения
  selectedCell.value = { sec: secIndex, cell: cellIndex };
  visualizationRef.value.selectCell(secIndex, cellIndex);

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "width",
      value: newValue,
      sec: secIndex,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = module.value.map((item) => item);
  if (adjustedValue) {
    clone[secIndex].forEach((cell) => (cell.width = adjustedValue));
  }
  module.value = clone;
};

const updateSectionHeight = (value, secIndex, cellIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;
  // Обновляем выбранную секцию для визуального отображения
  selectedCell.value = { sec: secIndex, cell: cellIndex };
  visualizationRef.value.selectCell(secIndex, cellIndex);

  if (!isNaN(newValue) && visualizationRef.value) {
    const adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "height",
      value: newValue,
      sec: secIndex,
      cell: cellIndex,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = module.value.map((item) => item);
  if (adjustedValue) {
    module.value[secIndex][cellIndex].height = adjustedValue;
  }
  module.value = clone;
};

const updateHole = (event, key, type, holeType) => {
  console.log("ww");

  const cellIndex = selectedCell.value.cell;
  const secIndex = selectedCell.value.sec;

  const gridCopy = module.value.map((item) => item);
  // const gridCopy = module.value
  const currentColl = gridCopy[secIndex];
  const currentRow = currentColl[cellIndex];

  const currenthole = currentRow.holes[key];

  const prevValue = currentRow.holes[key][type]; //Предыдущее значение

  // let newValue = parseInt(event.target.value);
  let newValue = parseInt(event);
  newValue = newValue > 600 ? 600 : newValue < 150 ? 150 : newValue;

  const holeData = JSON.parse(JSON.stringify(currenthole));
  holeData[type] = newValue;

  console.log(holeData, "0");

  const pixiSector = currentRow.sector;

  currenthole[`M${type}`] = 600;

  const check = shapeAdjuster.checkToCollision(pixiSector, holeType, holeData);

  if (check) {
    currenthole[type] = newValue;
    console.log("1");
  } else {
    console.log("2");
    currenthole[type] = prevValue;
    currenthole[`M${type}`] = prevValue;
  }

  module.value = gridCopy;

  visualizationRef.value.renderGrid();
};

const changeHolePositionX = (event, key, type, holeType, value) => {
  const cellIndex = selectedCell.value.cell;
  const secIndex = selectedCell.value.sec;

  const gridCopy = module.value.map((item) => item);
  const currentColl = gridCopy[secIndex];
  const currentRow = currentColl[cellIndex];

  const currenthole = currentRow.holes[key];

  const prevValue = currentRow.holes[key].x; //Предыдущее значение

  const newValue = prevValue + value;

  const holeData = JSON.parse(JSON.stringify(currenthole));
  holeData.x = newValue;

  const pixiSector = currentRow.sector;

  const check = shapeAdjuster.checkToCollision(pixiSector, holeType, holeData);

  if (check) {
    currenthole.x = newValue;
  } else {
    currenthole.x = prevValue;
  }

  module.value = gridCopy;

  visualizationRef.value.renderGrid();
};

const changeHolePositionY = (event, key, type, holeType, value) => {
  const cellIndex = selectedCell.value.cell;
  const secIndex = selectedCell.value.sec;

  const gridCopy = module.value.map((item) => item);
  const currentColl = gridCopy[secIndex];
  const currentRow = currentColl[cellIndex];

  const currenthole = currentRow.holes[key];

  const prevValue = currentRow.holes[key].y; //Предыдущее значение

  const newValue = prevValue + value;

  const holeData = JSON.parse(JSON.stringify(currenthole));
  holeData.y = newValue;

  const pixiSector = currentRow.sector;

  // Проверяем коллизию
  const check = shapeAdjuster.checkToCollision(pixiSector, holeType, holeData);

  if (check) {
    currenthole.y = newValue;
  } else {
    currenthole.y = prevValue;
  }

  module.value = gridCopy;

  visualizationRef.value.renderGrid();
};

const deleteSection = (secIndex) => {
  const current = module.value.sections[secIndex];
  const next = module.value.sections[secIndex + 1];
  const prev = module.value.sections[secIndex - 1];

  const combinedWidth = next
      ? current.width + next.width
      : current.width + prev.width;

  if (next) {
    next.width = combinedWidth;
    next.cells?.forEach((elem) => {
      elem.width = combinedWidth;
    });
  } else {
    prev.width = combinedWidth;
    prev.cells?.forEach((elem) => {
      elem.width = combinedWidth;
    });
  }

  if (module.value.sections.length > 1) {
    module.value.sections.splice(secIndex, 1);
  }

  selectedCell.value.cell = 0;
  selectedCell.value.sec = 0;

  visualizationRef.value.renderGrid();
};

const deleteCell = (cellIndex, secIndex) => {
  const clone = Object.assign({},module.value);
  const currentSection = clone.sections[secIndex];
  const currentCell = currentSection.cells[cellIndex];

  const next = currentSection.cells[cellIndex + 1];
  const prev = currentSection.cells[cellIndex - 1];

  const combinedWidth = next
      ? currentCell.height + next.height
      : currentCell.height + prev.height;

  next ? (next.height = combinedWidth) : (prev.height = combinedWidth);

  if (currentSection.cells.length > 1) {
    currentSection.cells.splice(cellIndex, 1);
  }

  if (currentSection.cells.length <= 1)
    currentSection.cells.length = 0

  module.value = clone;

  // Обновляем текущий сектор
  selectedCell.value.cell = 0;
  selectedCell.value.sec = secIndex;

  visualizationRef.value.renderGrid();
};

const deleteRowCell = (cellIndex, secIndex, rowIndex) => {
  const clone = Object.assign({},module.value);
  const currentSection = clone.sections[secIndex];
  const currentCell = currentSection.cells[cellIndex];
  const currentRow = currentCell.cellsRows[rowIndex];

  const next = currentCell.cellsRows[rowIndex + 1];
  const prev = currentCell.cellsRows[rowIndex - 1];

  const combinedWidth = next
      ? currentCell.width + next.width
      : currentCell.width + prev.width;

  next ? (next.width = combinedWidth) : (prev.width = combinedWidth);

  if (currentCell.cellsRows.length > 1) {
    currentCell.cellsRows.splice(cellIndex, 1);
  }

  if (currentCell.cellsRows.length <= 1)
    delete currentCell.cellsRows

  module.value = clone;

  // Обновляем текущий сектор
  selectedCell.value.cell = cellIndex;
  selectedCell.value.sec = secIndex;
  selectedCell.value.row = null;

  visualizationRef.value.renderGrid();
};

const deleteHole = (ndx) => {
  const secIndex = selectedCell.value.sec;
  const cellIndex = selectedCell.value.cell;
  const curRow = module.value[secIndex][cellIndex];

  curRow.holes = curRow.holes.filter((el, index) => {
    return index !== ndx;
  });

  visualizationRef.value.renderGrid();
};

const handleCellSelect = (secIndex, cellIndex, type) => {
  selectedCell.value = { sec: secIndex, cell: cellIndex };

  holeOptions.value.section.sec = secIndex;
  holeOptions.value.section.cell = cellIndex;
  cutServise.value.section.sec = secIndex;
  cutServise.value.section.cell = cellIndex;
};

const createServiseData = () => {
  const convertParams = UI_PARAMS.CUT_SERVISES.reduce((acc, el) => {
    const param = {
      ID: el.ID,
      NAME: el.NAME,
      value: false,
      pos: el.pos,
      radius: el.radius,
      width: el.width,
      corner: el.corner,
    };
    acc.push(param);
    return acc;
  }, []);

  console.log(convertParams);

  return convertParams;
};

const clearServiseData = (cell) => {
  cell.serviseData.forEach((el) => {
    el.value = false;
  });
};

const reset = (reset = false) => {
  const PROPS = productData.value.userData.PROPS;

  let section: GridSection = {
    ...module.value.sections[0],
    width: totalWidth.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2,
    height: totalHeight.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2 - PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"],
    cells: [],
  }

  let _module: GridModule = {
    ...module.value,
    width: totalWidth.value,
    height: totalHeight.value,
    sections: [section]
  }

  PROPS.CONFIG.MODULEGRID = module.value = _module

  visualizationRef.value.renderGrid();
  if (reset) {
    visualizationRef.value.selectCell(0, 0);
  }
};

const saveGrid = () => {
  const garbage = ["sector", "shapesBond", "maxX", "maxY", "minX", "minY"];
  const clone = module.value.reduce((acc, el) => {
    const correct = el.reduce((acc, el) => {
      let clone = {};
      for (let value in el) {
        if (!garbage.includes(value)) {
          if (value === "roundCut") {
            if ("graphic" in el[value]) {
              delete el[value].graphic;
            }
          }
          clone[value] = el[value];
        }
      }
      acc.push(clone);
      return acc;
    }, []);
    acc.push(correct);
    return acc;
  }, []);

  const data = {
    canvasHeight: totalHeight.value,
    canvasWidth: totalWidth.value,
    data: clone,
  };

  // emit("save-table-data", data);
  return data;
};

defineExpose({
  saveGrid,
});

onBeforeMount(() => {
  totalHeight.value = props.canvasHeight;
  totalWidth.value = props.canvasWidth;
  // Делаем клон для реактивности
});

onMounted(() => {
  shapeAdjuster = new ShapeAdjuster();
  createServiseData();
  nextTick().then(() => {
    isMounted.value = true;
  });
});

onBeforeUnmount(() => {
  console.log("close");
  shapeAdjuster = null;
  module.value = null;
});

watch(menuStore, () => {
  if(menuStore.openMenus == '2dModuleConstructor' && menuStore.catalogFilterProductsId[0]) {
    productData.value = menuStore.catalogFilterProductsId[0]
   // totalHeight.value = productData.value.userData.PROPS.CONFIG.SIZE.height
    //totalWidth.value = productData.value.userData.PROPS.CONFIG.SIZE.width
  }
})
</script>

<template>
  <div class="constructor2d-wrapper" v-if="menuStore.openMenus == '2dModuleConstructor'">
    <div
        class="constructor2d-container"
    >
      <div
          class="constructor2d-container constructor2d-container--left"
          ref="constructor2dContainer"
      >
        <div class="constructor2d-header">
          <div class="constructor2d-header--title"><h1>Редактор модуля</h1></div>

          <div
              class="constructor2d-container"
          >
            <div class="actions-inputs">
              <p class="actions-title">Высота модуля</p>
              <div class="actions-input--container">
                <MainInput
                    @update:modelValue="updateTotalHeight"
                    :inputClass="'actions-input'"
                    v-model="totalHeight"
                    :min="getMinHeight"
                    :max="getMaxHeight"
                    :type="'number'"
                />
              </div>
            </div>
            <div class="actions-inputs">
              <p class="actions-title">Ширина модуля</p>
              <div class="actions-input--container">
                <MainInput
                    @update:modelValue="updateTotalWidth"
                    :inputClass="'actions-input'"
                    v-model="totalWidth"
                    :min="getMinWidth"
                    :max="getMaxWidth"
                    :type="'number'"
                />
              </div>
            </div>
          </div>

        </div>

        <div class="constructor2d-content">
          <InteractiveSpace
              ref="visualizationRef"
              :step="step"
              :module="module"
              :correct="correct"
              :container="constructor2dContainer"
              :max-area-height="props.canvasHeight"
              :max-area-width="props.canvasWidth"
              :tempHole="tempHole"
              @cell-selected="handleCellSelect"
          />
        </div>

        <section class="actions-wrapper">
          <div class="actions-header">
            <div
                :class="[
              'actions-header--container',
              { active: secIndex === selectedCell.sec },
            ]"
                v-for="(section, secIndex) in module.sections"
                :key="secIndex"
            >
              <button
                  v-if="module.sections.length > 1"
                  class="actions-btn actions-icon"
                  @click="deleteSection(secIndex)"
              >
                <img
                    class="actions-icon--delete"
                    src="/icons/delite.svg"
                    alt=""
                />
              </button>
              <p
                  class="actions-title actions-title--part"
                  @click="showCurrentCol(secIndex)"
              >
                {{ secIndex + 1 }} секция
              </p>
            </div>
          </div>

          <div
              class="actions-container"
              v-for="(section, secIndex) in module.sections"
              :key="secIndex"
          >
            <div
                class="actions-items--wrapper"
                v-if="selectedCell.sec === secIndex"
            >
              <div class="actions-items--width">
                <div class="actions-inputs">
                  <p class="actions-title">Ширина</p>
                  <div
                      :class="['actions-input--container']"
                  >
                    <input
                        type="number"
                        :step="step"
                        min="150"
                        class="actions-input"
                        :value="section.width"
                        @input="
                            updateSectionWidth(
                              $event.target.value,
                              secIndex
                            )
                          "
                    />
                  </div>
                </div>
              </div>

              <div class="actions-items--height">
                <div class="actions-inputs">
                  <p class="actions-title">
                    Высота {{ secIndex + 1 }}
                  </p>
                  <div
                      :class="['actions-input--container']"
                  >
                    <input
                        type="number"
                        :step="step"
                        min="150"
                        class="actions-input"
                        :value="section.height"
                        @input="
                            updateSectionHeight(
                              $event.target.value,
                              secIndex
                            )
                          "
                    />
                  </div>
                </div>
              </div>
              <div
                  v-for="(cell, cellIndex) in section.cells"
                  :key="cellIndex"
                  :class="[
                'actions-items--container',
                {
                  active:
                    cellIndex === selectedCell.cell &&
                    secIndex === selectedCell.sec,
                },
              ]"
              >
                <article class="actions-items actions-items--left">
                  <div class="actions-items--left-wrapper">
                    <div class="actions-items--title">
                      <button
                          v-if="section.cells.length > 1"
                          class="actions-btn actions-icon"
                          @click="deleteCell(cellIndex, secIndex)"
                      >
                        <img
                            class="actions-icon--delete"
                            src="/icons/delite.svg"
                            alt=""
                        />
                      </button>
                      <p class="actions-title actions-title--part">
                        {{ secIndex + 1 }}.{{ cellIndex + 1 }} часть
                      </p>
                    </div>

                    <div class="actions-items--width">
                      <div class="actions-inputs">
                        <p class="actions-title">Ширина</p>
                        <div
                            :class="['actions-input--container']"
                        >
                          <input
                              type="number"
                              :step="step"
                              min="150"
                              class="actions-input"
                              :value="section.width"
                              disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div class="actions-items--height">
                      <div class="actions-inputs">
                        <p class="actions-title">
                          Высота
                        </p>
                        <div
                            :class="['actions-input--container']"
                        >
                          <input
                              type="number"
                              :step="step"
                              min="150"
                              class="actions-input"
                              :value="cell.height"
                              @input="
                            updateSectionHeight(
                              $event.target.value,
                              secIndex,
                              cellIndex
                            )
                          "
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </article>

                <article class="actions-items actions-items--right">
                  <div class="actions-items--right-items">
                    <button
                        :class="[
                      'actions-btn actions-btn--default',
                      getCutServiseActive(secIndex, cellIndex),
                    ]"
                        @click="showCutServises(secIndex, cellIndex)"
                    >
                      Услуги
                    </button>
                    <button
                        :class="[
                      'actions-btn actions-btn--default'
                    ]"
                        @click="addCell(secIndex, cellIndex)"
                    >
                      Добавить ячейку
                    </button>

                    <button
                        v-if="!cell.cellsRows?.length"
                        :class="[
                      'actions-btn actions-btn--default'
                    ]"
                        @click="addRowCell(secIndex, cellIndex, 0)"
                    >
                      Верт. разделитель
                    </button>
                  </div>
                </article>

                <div
                    v-for="(row, rowIndex) in cell.cellsRows"
                    :key="rowIndex"
                    :class="[
                'actions-items--container',
                {
                  active:
                    cellIndex === selectedCell.cell &&
                    secIndex === selectedCell.sec && rowIndex === selectedCell.row,
                },
              ]"
                >
                  <article class="actions-items actions-items--left">
                    <div class="actions-items--left-wrapper">
                      <div class="actions-items--title">
                        <button
                            v-if="cell.cellsRows.length > 1"
                            class="actions-btn actions-icon"
                            @click="deleteRowCell(cellIndex, secIndex, rowIndex)"
                        >
                          <img
                              class="actions-icon--delete"
                              src="/icons/delite.svg"
                              alt=""
                          />
                        </button>
                        <p class="actions-title actions-title--part">
                          {{ secIndex + 1 }}.{{ cellIndex + 1 }}.{{ rowIndex + 1 }} часть
                        </p>
                      </div>

                      <div class="actions-items--width">
                        <div class="actions-inputs">
                          <p class="actions-title">Ширина</p>
                          <div
                              :class="['actions-input--container']"
                          >
                            <input
                                type="number"
                                :step="step"
                                min="150"
                                class="actions-input"
                                :value="row.width"
                                @input="
                            updateSectionWidth(
                              $event.target.value,
                              secIndex,
                              cellIndex,
                              rowIndex
                            )
                          "
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </article>

                  <article class="actions-items actions-items--right">
                    <div class="actions-items--right-items">
                      <button
                          :class="[
                      'actions-btn actions-btn--default'
                    ]"
                          @click="addRowCell(secIndex, cellIndex, rowIndex)"
                      >
                        Верт. разделитель
                      </button>
                    </div>
                  </article>

                </div>

              </div>
            </div>

            <article class="actions-items actions-items--right">
              <div class="actions-items--right-items">
                <button
                    :class="[
                      'actions-btn actions-btn--default'
                    ]"
                    @click="addSection(secIndex)"
                >
                  Добавить секцию
                </button>

                <button
                    v-if="!section.cells.length"
                    :class="[
                      'actions-btn actions-btn--default'
                    ]"
                    @click="addCell(secIndex, 0)"
                >
                  Добавить ячейку
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div
          class="constructor2d-container constructor2d-container--right"
      >
        <h1>Опции</h1>

        <ProductOptions
            v-if="holeOptions.show"
            :holes="getHole"
            :step="step"
            @cut-addHole="addHole"
            @cut-deleteHole="deleteHole"
            @cut-updateHole="updateHole"
            @cut-toggleHoleOptions="toggleHoleOptions"
            @cut-changePositionX="changeHolePositionX"
            @cut-changePositionY="changeHolePositionY"
        />
      </div>
    </div>

    <button
        class="actions-btn add-divider-btn save-btn"
        @click="save"
    >
      Сохранить
    </button>

    <button
        class="actions-btn add-divider-btn clos-btn"
        @click="menuStore.closeMenu('2dModuleConstructor')"
    >
      Отмена
    </button>

  </div>
</template>

<style lang="scss" scoped>
.constructor2d {
  &-wrapper {
    display: flex;
    gap: 1rem;
    justify-content: center;
    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
    sans-serif;
    position: absolute;
    top: 95px;
    right: 10px;
    width: 100%;
    height: 90%;
    max-height: 100vh;
    max-width: 1715px;
  }

  &-container {
    display: flex;
    flex-direction: cell;
    gap: 1rem;

    width: 100%;

    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;

    &--left {
      flex-direction: column;
      max-width: 70vw;
    }

    &--right {
      flex-direction: column;
      max-width: 15vw;
      max-height: 80vh;
      overflow: hidden;
    }
  }

  &-content {
    display: flex;
    justify-content: center;
  }

  &-title {
    font-weight: 400;
    color: #131313;
  }
}

.actions {
  &-wrapper {
    display: flex;
    flex-direction: column;
    max-height: 450px;
    overflow-y: scroll;
    padding-right: 0.5rem;

    &::-webkit-scrollbar {
      width: 5px;
      /* Ширина скроллбара */
    }

    &::-webkit-scrollbar-button {
      display: none;
      /* Убираем стрелки */
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      /* Цвет ползунка */
      border-radius: 4px;
    }
  }

  &-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    // border-bottom: 1px solid #ecebf1;

    &:first-child {
      // border-top: 1px solid #ecebf1;
    }

    // transform: scale(0.7);
  }

  &-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    width: 100%;
    padding: 1rem 0;
    border-bottom: 1px solid #ecebf1;
    border-top: 1px solid #ecebf1;
  }

  &-items {
    display: flex;
    flex-wrap: wrap;
    // gap: 1rem;
    align-items: center;

    &--wrapper {
      display: flex;
      width: 100%;
      padding: 1rem 0;
    }

    &--left,
    &--right {
      width: 100%;
      // max-width: 50%;
    }

    &--left {
      align-items: start;
      max-width: 75%;
    }

    &--right {
      display: block;
      max-width: calc(25% - 1rem);
      margin-left: 1rem;

      &-items {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }

    &--height {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      &-wrapper {
        max-width: calc(50% - 1rem);
      }

      &-item {
        display: flex;
        align-items: flex-start;
        height: fit-content;
        // gap: 0.5rem;
      }
    }

    &--diametr {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      &-wrapper {
        max-width: 25%;
      }

      &-item {
        display: flex;
        align-items: flex-start;
        width: 100%;
        height: fit-content;
        // gap: 0.5rem;
      }
    }

    &--width {
      display: flex;
      gap: 1rem;
      align-items: start;
      flex-wrap: wrap;
      width: 100%;
      max-width: 20%;
      height: 100%;
      border-right: 1px solid #ecebf1;
    }

    &--diametr,
    &--height {
      &-wrapper {
        height: 100%;
        width: 100%;
        margin-left: 1rem;
        border-right: 1px solid #ecebf1;
      }
    }
  }

  &-title {
    font-size: 1rem;
    color: #a3a9b5;

    // &--part {
    //   margin-bottom: 0.5rem;
    // }
  }

  &-inputs {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  &-input {
    padding: 0.5rem 1rem;
    width: 100%;
    max-width: 110px;
    border: none;
    border-radius: 15px;
    background-color: #ecebf1;
    color: #6d6e73;
    font-size: 1rem;
    font-weight: 600;

    &:focus {
      outline: none;
    }

    &--container {
      position: relative;

      &::before {
        content: "mm";
        display: block;
        position: absolute;
        top: 50%;
        left: 60px;
        transform: translate(0, -50%);

        font-size: 0.75rem;
        font-weight: 600;
        color: #6d6e73;
      }
    }
  }

  &-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ecebf1;
    border-radius: 15px;
    background-color: #ffffff;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: bold;
    color: #5d6069;
    outline: none;

    &:focus {
      outline: none;
    }

    &.active {
      border-color: red;
      color: #181818;
    }
  }

  &-icon {
    border: none;
    background-color: transparent;
    padding: 0 5px;

    &--delete,
    &--close,
    &--help {
      width: 18px;
      height: 18px;
    }

    &--add {
      width: 12px;
      height: 12px;
    }

    &--delete {
      &-center {
        margin-bottom: 0.5rem;
      }
    }

    &--bottom {
      align-self: flex-end;
      padding: 5px;
    }

    &--position {
      width: 25px;
      height: 25px;
    }
  }
}

.disable {
  pointer-events: none;
  cursor: auto;
}

.clos-btn {
  width: 150px;
  position: absolute;
  bottom: 15px;
  right: 15px;
  color: white;
  background: #fc1a1a;
  font-size: 1rem;
}

.save-btn {
  width: 150px;
  position: absolute;
  bottom: 15px;
  right: 175px;
  color: white;
  background: #33de0c;
  font-size: 1rem;
}
</style>

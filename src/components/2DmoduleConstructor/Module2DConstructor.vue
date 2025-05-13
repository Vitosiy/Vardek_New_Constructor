<script setup>
import { reactive, computed, ref, toRaw } from "vue";
import InteractiveSpace from "./InteractiveSpace.vue";
import { UI_PARAMS, EN_RU_NAME} from "./UMConstructorConst.ts";
import {useMenuStore} from "@/store/appStore/useMenuStore";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import * as THREE from "three";
import * as THREETypes from "@/types/types";
import {useModelState} from "@/store/appliction/useModelState";
// import SettingsPanel from './components/SettingsPanel.vue';
// import SettingsTable from './components/SettingsTable.vue';
// import ControlButtons from './components/ControlButtons.vue';

const {
  MAX_AREA_WIDTH,
  TOTAL_LENGTH,
  TOTAL_HEIGHT,
  BACKGROUND_COLOR,
  MIN_SECTION_WIDTH,
  MIN_SECTION_HEIGHT,
} = UI_PARAMS;

const menuStore = useMenuStore();

const builder = THREETypes.TUniversalGeometryBuilder

const grid = ref([
  // Каждая колонка — это массив строк (горизонтальных секций)
  [
    {
      width: 3000,
      height: 1200,
      roundCut: {},
      holes: [],
      type: "row",
      xOffset: 0,
      yOffset: 0,
      colide: null,
    },
  ],
]);

const sections = ref([
  // Каждая колонка — это массив строк (горизонтальных секций)
  [
    {
      width: 3000,
      height: 1200,
      roundCut: {},
      holes: [],
      type: "row",
      xOffset: 0,
      yOffset: 0,
      colide: null,
    },
  ],
]);

const selectedCell = ref({ col: 0, row: 0 });
const correct = ref({ change: false });
const splitterContainer = ref(null);

const getMaxAreaHeight = computed(() => {
  return (TOTAL_HEIGHT * MAX_AREA_WIDTH) / TOTAL_LENGTH;
});

// console.log(getMaxAreaHeight.value)

const addVerticalCut = (colIndex) => {
  correct.value.change = true;

  const column = grid.value[colIndex];
  const halfWidth = column[0].width / 2;

  if (halfWidth < 150 || !((column[0].width / 2) % 10 == 0)) return;

  // Обновляем ширину текущей колонки
  column.forEach((row) => {
    row.width = halfWidth;
  });

  // Создаем новую колонку с такими же параметрами
  const newColumn = column.map((row) => ({
    ...row,
    roundCut: {},
    holes: [],
    width: halfWidth,
  }));

  grid.value.splice(colIndex + 1, 0, newColumn);
  ensureTotalWidth();

  column.forEach((row) => {
    adjustObjectPosition(row);
  });

  // correct.value.change = false;
};

const addHorizontalCut = (colIndex) => {
  correct.value.change = true;
  const column = grid.value[colIndex];
  const lastRow = column[column.length - 1];
  const halfHeight = Math.floor(lastRow.height / 2);

  if (halfHeight < 150 || !(lastRow.height % 10 == 0)) return;

  // Обновляем высоту последней строки
  lastRow.height = halfHeight;

  // Добавляем новую строку в эту колонку
  column.push({
    width: lastRow.width,
    height: lastRow.height, // Оставшаяся высота
    roundCut: {},
    holes: [],
    type: "hrz",
  });
  correct.value.change = false;

  column.forEach((row) => {
    adjustObjectPosition(row);
  });
};

const showServices = () => {
  console.log("showServices");
};

const updateSectionWidth = (colIndex, newWidthCol) => {
  correct.value.change = true;

  const gridCopy = toRaw(grid.value).map((item) => item);
  const curCol = gridCopy[colIndex];
  const nextCol = gridCopy[colIndex + 1];
  const prevCol = gridCopy[colIndex - 1];
  const minSize = getMinSize(curCol);

  let curMinSize, nextMinSize, prevMinSize;

  curMinSize = getMinSize(curCol);

  if (nextCol) {
    nextMinSize = getMinSize(nextCol);
  }
  if (prevCol) {
    prevMinSize = getMinSize(prevCol);
  }

  if (parseInt(curCol[0].width) <= curMinSize) {
    // Обновляем длинну каждой строки в колонке
    curCol.forEach((elem) => {
      elem.width = curMinSize;
      adjustObjectPosition(elem);
    });
  }

  // Обновляем длинну каждой строки в колонке
  curCol.forEach((elem) => {
    elem.width = curCol[0].width;
    adjustObjectPosition(elem);
  });

  if (colIndex === gridCopy.length - 1) {
    // Если индекс последний, обновляем предпоследний элемент
    const sumBefore = calcSumBefore({
      array: gridCopy,
      ndx: colIndex,
      start: 0,
      type: "col",
    });

    let newWidth =
      prevCol[0].width + TOTAL_LENGTH - sumBefore - curCol[0].width;

    if (newWidth <= prevMinSize) {
      newWidth = prevMinSize;
      curCol.width =
        TOTAL_LENGTH -
        calcSumBefore({
          array: gridCopy,
          ndx: colIndex,
          start: 0,
          type: "col",
        });
    }

    prevCol.forEach((elem) => {
      elem.width = newWidth;
      adjustObjectPosition(elem);
    });
  } else {
    // В противном случае обновляем следующий элемент

    if (parseInt(curCol[0].width) <= MIN_SECTION_WIDTH) {
      curCol.forEach((elem) => {
        elem.width = MIN_SECTION_WIDTH;
      });
    }

    const sumBefore = calcSumBefore({
      array: gridCopy,
      ndx: colIndex,
      start: 0,
      type: "col",
    });

    const sumAfter = calcSumBefore({
      array: gridCopy,
      ndx: gridCopy.length,
      start: colIndex + 2,
      type: "col",
    });

    let newWidth = TOTAL_LENGTH - sumBefore - sumAfter - curCol[0].width;

    if (newWidth <= nextMinSize) {
      newWidth = nextMinSize;
    }

    nextCol.forEach((elem) => {
      elem.width = newWidth;
      adjustObjectPosition(elem);
    });
  }

  grid.value = gridCopy;

  ensureTotalWidth();
};

const updateSectionHeight = (colIndex, rowIndex, event) => {
  correct.value.change = true;

  const gridCopy = grid.value.map((item) => item);
  const currentColl = gridCopy[colIndex];

  const currentRow = currentColl[rowIndex];
  const nextRow = currentColl[rowIndex + 1];
  const prevRow = currentColl[rowIndex - 1];

  let currentRowSize, nextRowSize, prevRowSize;

  // Определяем минимальные размеры секции
  if ("diameter" in currentRow.roundCut) {
    currentRowSize = currentRow.roundCut.diameter;
  } else {
    currentRowSize = MIN_SECTION_WIDTH;
  }

  if (nextRow && "diameter" in nextRow.roundCut) {
    nextRowSize = nextRow.roundCut.diameter;
  } else {
    nextRowSize = MIN_SECTION_WIDTH;
  }

  if (prevRow && "diameter" in prevRow.roundCut) {
    prevRowSize = prevRow.roundCut.diameter;
  } else {
    prevRowSize = MIN_SECTION_WIDTH;
  }

  let newHeight;

  if (parseInt(currentRow.height) <= currentRowSize) {
    currentRow.height = currentRowSize;
  }

  adjustObjectPosition(currentRow);

  if (rowIndex === currentColl.length - 1) {
    const sumBefore = calcSumBefore({
      array: currentColl,
      ndx: rowIndex,
      start: 0,
      type: "row",
    });

    newHeight = prevRow.height + TOTAL_HEIGHT - sumBefore - currentRow.height;

    if (newHeight <= prevRowSize) {
      newHeight = prevRowSize;
      currentRow.height =
        TOTAL_HEIGHT -
        calcSumBefore({
          array: currentColl,
          ndx: rowIndex,
          start: 0,
          type: "row",
        });
    }
    prevRow.height = newHeight;
    adjustObjectPosition(prevRow);
  } else {
    const sumBefore = calcSumBefore({
      array: currentColl,
      ndx: rowIndex,
      start: 0,
      type: "row",
    });

    const sumAfter = calcSumBefore({
      array: currentColl,
      ndx: currentColl.length,
      start: rowIndex + 2,
      type: "row",
    });

    newHeight = TOTAL_HEIGHT - sumBefore - sumAfter - currentRow.height;

    if (newHeight <= nextRowSize) {
      newHeight = nextRowSize;
    }

    nextRow.height = newHeight;
    adjustObjectPosition(nextRow);
  }

  grid.value = gridCopy;

  ensureTotalHeight(colIndex);
};

const ensureTotalWidth = () => {
  const sum = grid.value.reduce((acc, column) => acc + column[0].width, 0);
  const diff = TOTAL_LENGTH - sum;

  if (diff !== 0) {
    const widestColIndex = grid.value.reduce(
      (maxIdx, column, idx) =>
        column[0].width > grid.value[maxIdx][0].width ? idx : maxIdx,
      0
    );
    grid.value[widestColIndex].forEach((row) => {
      row.width += diff;
    });
  }

  correct.value.change = false;
};

const ensureTotalHeight = (colIndex) => {
  const column = grid.value[colIndex];

  const totalHeight = column.reduce((acc, row) => acc + row.height, 0);
  const diff = TOTAL_HEIGHT - totalHeight;

  if (diff !== 0) {
    const tallestRowIndex = column.reduce(
      (maxIdx, row, idx) => (row.height > column[maxIdx].height ? idx : maxIdx),
      0
    );

    console.log(tallestRowIndex, "--tallestRowIndex");

    column[tallestRowIndex].height = Math.max(
      MIN_SECTION_HEIGHT,
      column[tallestRowIndex].height + diff
    );
  }

  correct.value.change = false;
};

const calcSumBefore = ({ array, ndx, start, type }) => {
  const copyArray = array.map((item) => item);
  switch (type) {
    case "col":
      return copyArray
        .slice(start, ndx)
        .reduce((acc, curr) => acc + curr[0].width, 0);
    case "row":
      return copyArray
        .slice(start, ndx)
        .reduce((acc, curr) => acc + curr.height, 0);
  }
};

const deliteVerticalCut = (colIndex) => {
  correct.value.change = true;

  const clone = grid.value.map((item) => item);

  const current = clone[colIndex];
  const next = clone[colIndex + 1];
  const prev = clone[colIndex - 1];

  console.log(next, prev, "next, prev");

  const combinedWidth = next
    ? current[0].width + next[0].width
    : current[0].width + prev[0].width;

  if (next) {
    next.forEach((elem) => {
      elem.width = combinedWidth;
    });
  } else {
    prev.forEach((elem) => {
      elem.width = combinedWidth;
    });
  }

  if (clone.length > 1) {
    clone.splice(colIndex, 1);
  }

  grid.value = clone;

  ensureTotalWidth();
};

const deliteHorizontalCut = (rowIndex, colIndex) => {
  correct.value.change = true;

  const clone = grid.value.map((item) => item);
  const currentCol = clone[colIndex];
  const currentRow = currentCol[rowIndex];

  const next = currentCol[rowIndex + 1];
  const prev = currentCol[rowIndex - 1];

  // console.log(next, prev, "next, prev");

  const combinedWidth = next
    ? currentRow.height + next.height
    : currentRow.height + prev.height;

  next ? (next.height = combinedWidth) : (prev.height = combinedWidth);

  // console.log(currentCol);

  if (currentCol.length > 1) {
    currentCol.splice(rowIndex, 1);
  }

  // console.log(currentCol);

  grid.value = clone;

  correct.value.change = false;
};

const handleCellSelect = (colIndex, rowIndex) => {
  selectedCell.value = { col: colIndex, row: rowIndex };
  console.log(selectedCell.value);
};

const adjustObjectPosition = (data) => {
  // Если в секции есть круглый вырез
  if (data.roundCut && "diameter" in data.roundCut) {
    const radius = data.roundCut.diameter / 2;

    // Ограничения по X
    const minX = -data.width / 2 + radius;
    const maxX = data.width / 2 - radius;

    // Ограничения по Y
    const minY = -data.height / 2 + radius;
    const maxY = data.height / 2 - radius;

    // Применяем ограничения
    data.roundCut.x = Math.max(minX, Math.min(maxX, data.roundCut.x));
    data.roundCut.y = Math.max(minY, Math.min(maxY, data.roundCut.y));
  }
};

const getMinSize = (col) => {
  let curRound = col
    .filter((elem) => elem.roundCut.diameter)
    .sort((a, b) => b.roundCut.diameter - a.roundCut.diameter)[0];

  let min = curRound ? curRound.roundCut.diameter : MIN_SECTION_WIDTH;
  return min;
};

const reset = () => {
  grid.value.length = 0;
  grid.value.push([{ width: 3000, height: 600, holes: [], type: "vrt" }]);
};

const save = (event) => {
  try {
    const productData = menuStore.catalogFilterProductsId[0]

    this.mouse.x = ((event.clientX - this.canvas.getBoundingClientRect().left) / this.canvas.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - this.canvas.getBoundingClientRect().top) / this.canvas.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects([...this.roomManager._roomWalls, this.roomManager._roomFloor]);

    const point = intersects[0].point;
    const surface = intersects[0].object;

    builder.createModel(productData, (object) => {

      object.userData.MOUSE_POSITION = {
        x: point.clone().project(this.camera).x * this.trafficManager._sizes.width * 0.5,
        y: point.clone().project(this.camera).y * this.trafficManager._sizes.height * -0.5,
      };

      let config = object.userData.PROPS.CONFIG;

      this.setObject.create({
        scene: this.scene,
        config,
        object,
        point,
        roomManager: this.roomManager,
        trafficManager: this.trafficManager,
        boxHelper: this.boxHelper,
        wall: surface
      });
    });

  } catch (error) {
    console.error('Error build:', error);
  }

  menuStore.closeMenu('2dModuleConstructor')
};

const close = () => {
  console.log("Закрытие окна");
};

const showData = () => {
  console.log("");
};

</script>

<template>
  <div class="constructor2d" v-if="menuStore.openMenus == '2dModuleConstructor'">
    <div class="constructor2d__container">
      <p class="constructor2d-title">Редактор модуля</p>
      <ClosePopUpButton class="menu__close" @close="menuStore.closeMenu('2dModuleConstructor')" />
      <div class="constructor2d-header">
        <div class="constructor2d-content">
          <InteractiveSpace
              :grid="grid"
              :correct="correct"
              :container="splitterContainer"
              :maxAreaHeight="getMaxAreaHeight"
              @cell-selected="handleCellSelect"
          />
        </div>

        <section class="actions-wrapper">

            <div
                class="actions-items--wrapper"
                v-for="(value, sizeIndex) in menuStore.catalogFilterProductsId[0].userData.PROPS.CONFIG.SIZE"
                :key="sizeIndex"
            >
              <div class="actions-items-item">
                <button
                    class="actions-btn actions-icon actions-icon--bottom"
                >
                </button>
                <div class="actions-inputs">
                  <p class="actions-title">
                    {{ EN_RU_NAME[sizeIndex] }}
                  </p>
                  <div
                  >
                    <input
                        type="number"
                        step="10"
                        min="150"
                        class="actions-input"
                        v-model="menuStore.catalogFilterProductsId[0].userData.PROPS.CONFIG.SIZE[sizeIndex]"
                    />
                  </div>
                </div>
              </div>
            </div>

          <div
              class="actions-container"
              v-for="(column, colIndex) in grid"
              :key="colIndex"
          >
            <div class="actions-header">
              <button
                  v-if="grid.length > 1"
                  class="actions-btn actions-icon"
                  @click="deliteVerticalCut(colIndex)"
              >
                <img
                    class="actions-icon--delite"
                    src="@/assets/svg/right-menu/musorka.svg"
                    alt=""
                />
              </button>
              <p class="actions-title actions-title--part">
                Секция №{{ colIndex + 1 }}
              </p>
            </div>

            <div class="actions-items--wrapper">
              <article class="actions-items actions-items--left">
                <div class="actions-items--width">
                  <div class="actions-inputs">
                    <p class="actions-title">Ширина</p>
                    <div
                        :class="[
                      'actions-input--container',
                      grid.length <= 1 ? 'disable' : '',
                    ]"
                    >
                      <input
                          type="number"
                          step="10"
                          min="150"
                          class="actions-input"
                          v-model="column[0].width"
                          @change="
                        updateSectionWidth(colIndex, $event.target.value)
                      "
                      />
                    </div>
                  </div>
                </div>

                <div class="actions-items--height">
                  <div
                      class="actions-items--height-item"
                      v-for="(row, rowIndex) in column"
                      :key="rowIndex"
                  >
                    <button
                        v-if="column.length > 1"
                        @click="deliteHorizontalCut(rowIndex, colIndex)"
                        class="actions-btn actions-icon actions-icon--bottom"
                    >
                      <img
                          class="actions-icon--delite actions-icon--delite-center"
                          src="@/assets/svg/right-menu/musorka.svg"
                          alt=""
                      />
                    </button>
                    <div class="actions-inputs">
                      <p class="actions-title">
                        Высота {{ colIndex + 1 }}.{{ rowIndex + 1 }}
                      </p>
                      <div
                          :class="[
                        'actions-input--container',
                        column.length <= 1 ? 'disable' : '',
                      ]"
                      >
                        <input
                            type="number"
                            step="10"
                            min="150"
                            class="actions-input"
                            v-model="row.height"
                            @change="
                          updateSectionHeight(
                            colIndex,
                            rowIndex,
                            $event.target.value
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
                      class="actions-btn add-divider-btn"
                      @click="showData"
                  >
                    Кнопка
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <button
            class="actions-btn add-divider-btn save-btn"
            @click="save"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.constructor2d {
  width: 100%;
  // height: 85%;
  max-height: 100vh;
  max-width: 1700px;
  position: absolute;
  top: 106px;
  right: 20px;
  padding: 15px;
  background: $white;
  box-shadow: 0px 0px 10px 0px #3030301a;
  z-index: 10;
  border-radius: 15px;
  transition: 0.5s ease-in-out;
  transform: translateZ(-10px);
  box-sizing: border-box;
  overflow: hidden;

  &__container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: 100vh;
    padding-bottom: 25px;

    .constructor2d-header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .constructor2d-links {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .close__button {
        cursor: pointer;
      }
    }
  }
  &-content {
    display: flex;
    justify-content: center;
  }
  &-title {
    margin-right: 50px;
    font-size: 18px;
    font-weight: 600;
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
      width: 5px; /* Ширина скроллбара */
    }
    &::-webkit-scrollbar-button {
      display: none; /* Убираем стрелки */
    }
    &::-webkit-scrollbar-thumb {
      background: #888; /* Цвет ползунка */
      border-radius: 4px;
    }
  }

  &-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 1px solid #ecebf1;
    &:first-child {
      border-top: 1px solid #ecebf1;
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
      max-width: 50%;
    }

    &--right {
      display: block;
      max-width: calc(50% - 1rem);
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
      width: 100%;
      height: 100%;
      max-width: calc(70% - 1rem);
      margin-left: 1rem;
      border-right: 1px solid #ecebf1;

      &-item {
        display: flex;
        align-items: flex-start;
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
      max-width: 30%;
      height: 100%;
      border-right: 1px solid #ecebf1;
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
  }

  &-icon {
    border: none;
    background-color: transparent;
    padding: 5px;

    &--delite,
    &--close {
      width: 18px;
      height: 18px;
    }
    &--add {
      width: 12px;
      height: 12px;
    }
    &--delite {
      &-center {
        margin-bottom: 0.5rem;
      }
    }

    &--bottom {
      align-self: flex-end;
    }
  }
}

.disable {
  pointer-events: none;
  cursor: auto;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.save-btn {
  position: absolute;
  bottom: 15px;
  right: 15px;
  color: white;
  background: #33de0c;
  font-size: 1rem;
}
</style>

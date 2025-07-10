<script setup lang="ts">
// @ts-nocheck
import {defineExpose, ref, toRefs} from "vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
import MainSelect from "@/components/ui/selects/MainSelect.vue";
import S2DAppartSVG from "@/components/ui/svg/left-menu/S2DAppartSVG.vue";
import {_URL} from "@/types/constants";
import {GridCell, GridCellsRow, GridSection} from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";
import {UI_PARAMS} from "@/components/2DmoduleConstructor/utils/UMConstructorConst.ts";

const {
  MIN_SECTION_WIDTH,
  MIN_SECTION_HEIGHT,
} = UI_PARAMS;

const props = defineProps({
  module: {
    type: Object,
    default: {},
    required: true,
  },
  step: {
    type: Number,
    default: 1,
  },
  visualizationRef: {
    type: ref,
  }
});

const {module, visualizationRef} = toRefs(props);
const selectedCell = ref({sec: 0, cell: null, row: null});

const emit = defineEmits([
  "product-updateFasades",
  "product-updateFilling",
]);

const timer = ref(false);
const debounce = (callback, wait) => {
  if (timer.value) {
    clearTimeout(timer.value)
  }

  timer.value = setTimeout(() => {
    callback();
    timer.value = false
  }, wait)
}

const selectCell = (sec, cell = null, row = null) => {
  selectedCell.value = {sec, cell, row};
  visualizationRef.value.selectCell("module", sec, cell, true, row);
};

const handleCellSelect = (secIndex, cellIndex = null, rowIndex = null) => {
  selectedCell.value = {sec: secIndex, cell: cellIndex, row: rowIndex};
};

const updateFasades = () => {
  emit("product-updateFasades");
}
const updateFilling = (value, key, type, fillingType) => {
  emit("product-updateFilling", value, key, type, fillingType);
}

const showCurrentCol = (secIndex) => {
  selectCell(secIndex)
};

const addSection = (secIndex) => {
  const section = module.value.sections[secIndex];
  const halfWidth = Math.floor((section.width - module.value.moduleThickness) / 2);

  if (halfWidth < MIN_SECTION_WIDTH)
    return;

  // Обновляем ширину текущей колонки
  section.cells.forEach((cell) => {
    cell.width = halfWidth;
    cell.cellsRows = []
    cell.fillings = []
  });

  section.position.x = section.position.x - (section.width / 2 - halfWidth / 2)
  section.width = halfWidth;
  section.fillings = []

  // Создаем новую колонку с такими же параметрами

  const newColumn: GridSection = {
    ...section,
    number: section.number + 1,
    width: halfWidth,
    cells: [],
    fasades: [],
    fillings: [],
    position: new THREE.Vector2(section.position.x + section.width / 2 + module.value.moduleThickness + halfWidth / 2, section.position.y),
  }
  module.value.sections.splice(secIndex + 1, 0, newColumn);
  updateFasades();

  // Обновляем рендер
  visualizationRef.value.renderGrid();
  console.log(module.value.sections, "55555");
};

const addCell = (secIndex, cellIndex = null) => {
  selectCell(secIndex, cellIndex);

  let section = module.value.sections[secIndex];

  let cell;
  if (section.cells.length > 0) {
    cell = section.cells[cellIndex]
  } else {
    cell = <GridCell>{
      number: 1,
      width: section.width,
      height: section.height,
      type: "cell",
      position: new THREE.Vector2(section.position.x, section.position.y),
    };

    if (section.fillings?.length) {
      cell.fillings = [...section.fillings];
      section.fillings.length = 0
    }

    section.cells.push(cell);
  }

  if (cell.cellsRows)
    delete cell.cellsRows

  const halfHeight = Math.floor((cell.height - module.value.moduleThickness) / 2);

  if (halfHeight < MIN_SECTION_HEIGHT)
    return;

  // Обновляем высоту последней строки
  cell.height = halfHeight;

  let newFillings = []
  cell.fillings?.filter((filling, index) => {
    if (filling.position.y >= cell.position.y + cell.height + module.value.moduleThickness) {
      newFillings.push(filling);
    } else {
      filling.cell += 1
    }
    return filling.position.y + filling.height <= cell.position.y + cell.height;
  })

  // Добавляем новую строку в эту колонку
  section.cells.splice(cellIndex || 0, 0, {
    ...cell,
    number: cell.number + 1,
    position: new THREE.Vector2(cell.position.x, cell.position.y + halfHeight + module.value.moduleThickness),
    fillings: newFillings,
  });

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const addRowCell = (secIndex, cellIndex, rowIndex = 0) => {
  selectCell(secIndex, cellIndex, rowIndex);

  const cell = module.value.sections[secIndex].cells[cellIndex]

  let row;
  if (cell.cellsRows?.length > 0) {
    row = cell.cellsRows[rowIndex];
  } else {
    cell.cellsRows = []
    row = <GridCellsRow>{
      number: 1,
      width: cell.width,
      height: cell.height,
      type: "rowCell",
      fillings: [],
      position: new THREE.Vector2(cell.position.x, cell.position.y),
    }
    cell.cellsRows.push(row);
  }

  const halfWidth = Math.floor((row.width - module.value.moduleThickness) / 2);

  if (halfWidth < MIN_SECTION_WIDTH)
    return;

  if (row.fillings?.length)
    delete row.fillings

  // Обновляем высоту последней строки
  row.position.x = row.position.x - (row.width / 2 - halfWidth / 2)
  row.width = halfWidth;

  // Добавляем новую строку в эту колонку
  cell.cellsRows.splice(rowIndex + 1, 0, {
    ...row,
    number: row.number + 1,
    position: new THREE.Vector2(row.position.x + row.width / 2 + module.value.moduleThickness + halfWidth / 2, row.position.y),
  });

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const updateSectionWidth = (value, secIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;

  // Обновляем выбранную секцию для визуального отображения
  selectCell(secIndex, null);

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "width",
      value: newValue,
      sec: secIndex,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = Object.assign({}, module.value);
  if (adjustedValue) {
    let curSection = clone.sections[secIndex]
    let nextSection = clone.sections[secIndex + 1] || clone.sections[secIndex - 1]
    let delta = curSection.width - adjustedValue

    curSection.width = adjustedValue
    curSection.position.x += (-delta) / 2

    curSection.cells.forEach((cell, cellIndex) => {

      if (cell.cellsRows) {
        let lastRow = cell.cellsRows[cell.cellsRows.length - 1]
        lastRow.width += delta;
        lastRow.position.x += (-delta) / 2
      }
      cell.position.x = curSection.position.x
      cell.width = adjustedValue;
    })

    if (nextSection) {
      nextSection.width += delta
      nextSection.position.x += (-delta) / 2

      nextSection.cells.forEach((cell, cellIndex) => {

        if (cell.cellsRows) {
          let lastRow = cell.cellsRows[cell.cellsRows.length - 1]
          lastRow.width += delta;
          lastRow.position.x += (-delta) / 2
        }

        cell.position.x = nextSection.position.x
        cell.width = nextSection.width;
      })
    }
  }
  module.value = clone;
  updateFasades();
  visualizationRef.value.renderGrid();

};

const updateCellHeight = (value, secIndex, cellIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;
  // Обновляем выбранную секцию для визуального отображения
  selectCell(secIndex, cellIndex);

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "height",
      value: newValue,
      sec: secIndex,
      cell: cellIndex,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = Object.assign({}, module.value);
  if (adjustedValue) {
    let curCell = clone.sections[secIndex].cells[cellIndex]
    let nextIndex = clone.sections[secIndex].cells[cellIndex + 1] ? cellIndex + 1 : cellIndex - 1;
    let nextCell = clone.sections[secIndex].cells[nextIndex]
    let delta = curCell.height - adjustedValue

    curCell.height = adjustedValue

    if (nextCell?.position?.y < curCell.position.y)
      curCell.position.y += delta

    curCell.cellsRows?.forEach((row, rowIndex) => {
      row.height = adjustedValue;
      if (row.position.y < curCell.position.y)
        row.position.y += delta

      row.fillings?.filter((filling, index) => {
        return filling.position.y + filling.height <= row.position.y + row.height;
      })
    })

    if (nextCell) {
      nextCell.height += delta

      if (nextCell.position.y > curCell.position.y)
        nextCell.position.y -= delta

      nextCell.cellsRows?.forEach((row, rowIndex) => {
        row.height = adjustedValue;
        if (row.position.y > curCell.position.y)
          row.position.y += delta

        row.fillings?.filter((filling, index) => {
          return filling.position.y + filling.height <= row.position.y + row.height;
        })
      })

      nextCell.fillings?.filter((filling, index) => {
        if (filling.position.y + filling.height <= nextCell.position.y - module.value.moduleThickness) {
          filling.cell = cellIndex
          curCell.push(filling);
          return false
        } else if (filling.position.y >= nextCell.position.y + nextCell.height + module.value.moduleThickness) {
          filling.cell = cellIndex
          curCell.push(filling);
          return false
        } else
          return true
      })
    }

    curCell.fillings?.filter((filling, index) => {
      if (filling.position.y + filling.height <= curCell.position.y - module.value.moduleThickness) {
        if (nextCell) {
          filling.cell = nextIndex
          nextCell.push(filling);
        }
        return false
      } else if (filling.position.y >= curCell.position.y + curCell.height + module.value.moduleThickness) {
        if (nextCell) {
          filling.cell = nextIndex
          nextCell.push(filling);
        }
        return false
      } else
        return true
    })
  }
  module.value = clone;
  visualizationRef.value.renderGrid();

};

const updateCellRowWidth = (value, secIndex, cellIndex, rowIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;

  // Обновляем выбранную секцию для визуального отображения
  selectCell(secIndex, cellIndex, rowIndex);

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "width",
      value: newValue,
      sec: secIndex,
      cell: cellIndex,
      row: rowIndex,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = Object.assign({}, module.value);
  if (adjustedValue) {
    let curRow = clone.sections[secIndex].cells[cellIndex].cellsRows[rowIndex]
    let nextRow = clone.sections[secIndex].cells[cellIndex].cellsRows[rowIndex + 1] ||
        clone.sections[secIndex].cells[cellIndex].cellsRows[rowIndex - 1]
    let delta = curRow.width - adjustedValue

    curRow.width = adjustedValue
    curRow.position.x -= delta / 2

    if (nextRow) {
      nextRow.width += delta
      nextRow.position.x += delta / 2
    }
  }
  module.value = clone;
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
    next.position.x = next.position.x - next.width / 2 + combinedWidth / 2
    next.width = combinedWidth;
    next.cells?.forEach((elem) => {
      elem.position.x = next.position.x
      elem.width = combinedWidth;
      if (elem.cellsRows)
        delete elem.cellsRows
    });
  } else {
    prev.position.x = prev.position.x - prev.width / 2 + combinedWidth / 2
    prev.width = combinedWidth;
    prev.cells?.forEach((elem) => {
      elem.position.x = prev.position.x
      elem.width = combinedWidth;
      if (elem.cellsRows)
        delete elem.cellsRows
    });
  }

  if (module.value.sections.length > 1) {
    module.value.sections.splice(secIndex, 1);
  }

  selectedCell.value.cell = 0;
  selectedCell.value.sec = 0;
  updateFasades();

  visualizationRef.value.renderGrid();
};

const deleteCell = (cellIndex, secIndex) => {
  const clone = Object.assign({}, module.value);
  const currentSection = clone.sections[secIndex];
  const currentCell = currentSection.cells[cellIndex];

  const next = currentSection.cells[cellIndex + 1];
  const prev = currentSection.cells[cellIndex - 1];

  const combinedHeight = next
      ? currentCell.height + next.height
      : currentCell.height + prev.height;

  next ? (next.height = combinedHeight) : (prev.height = combinedHeight);

  if (currentCell.fillings?.length) {
    let newFillings = next || prev

    if (!newFillings.fillings)
      newFillings.fillings = []

    let startIndex = newFillings.fillings.length
    currentCell.fillings.forEach((filling) => {
      filling.id = startIndex
      filling.cell = next ? cellIndex + 1 : cellIndex - 1
      startIndex += 1
    })
    newFillings.push(...currentCell.fillings)
  }

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
  const clone = Object.assign({}, module.value);
  const currentSection = clone.sections[secIndex];
  const currentCell = currentSection.cells[cellIndex];
  const currentRow = currentCell.cellsRows[rowIndex];

  const next = currentCell.cellsRows[rowIndex + 1];
  const prev = currentCell.cellsRows[rowIndex - 1];

  const combinedWidth = next
      ? currentCell.width + next.width
      : currentCell.width + prev.width;


  next ? (next.position.x = next.position.x - next.width / 2 + combinedWidth / 2) : (prev.position.x = prev.position.x - prev.width / 2 + combinedWidth / 2);
  next ? (next.width = combinedWidth) : (prev.width = combinedWidth);

  if (currentCell.cellsRows.length > 1) {
    currentCell.cellsRows.splice(rowIndex, 1);
  }

  next ? (delete next.fillings) : (delete prev.fillings);

  if (currentCell.cellsRows.length <= 1)
    delete currentCell.cellsRows

  module.value = clone;

  // Обновляем текущий сектор
  selectedCell.value.cell = cellIndex;
  selectedCell.value.sec = secIndex;
  selectedCell.value.row = null;

  visualizationRef.value.renderGrid();
};

defineExpose({
  handleCellSelect,
});
</script>

<template>
  <div class="splitter-container--product">
    <div class="splitter-container--product-data" v-if="module">
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
              {{ secIndex + 1 }}
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

            <div
                :class="'actions-items--container'"
            >
              <article class="actions-items actions-items--left">
                <div class="actions-items--left-wrapper">

                  <div class="actions-items--width">
                    <div class="actions-inputs">
                      <p class="actions-title">Ширина</p>
                      <div
                          :class="['actions-input--container', module.sections.length <= 1 ? 'disable' : '']"
                      >
                        <input
                            type="number"
                            :step="step"
                            :min="MIN_SECTION_WIDTH"
                            class="actions-input"
                            :value="section.width"
                            @input="
                            debounce(() => updateSectionWidth(
                              $event.target.value,
                              secIndex
                            ), 1000)
                          "
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
                            :min="MIN_SECTION_HEIGHT"
                            class="actions-input"
                            :value="section.height"
                            disabled
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </article>

              <article class="actions-items actions-items--right">
                <div
                    class="actions-items--right-items"
                    v-if="secIndex == selectedCell.sec"
                >
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
                      @click="addCell(secIndex, null)"
                  >
                    Добавить ячейку
                  </button>
                </div>
              </article>
            </div>

            <div class="accordion" v-if="section.cells.length">

              <div class="actions-header">
                <p>Ячейки</p>
              </div>

              <div
                  v-for="(cell, cellIndex) in section.cells"
                  :key="cellIndex"
                  :class="'actions-items--container'"
              >
                <details class="item-group">

                  <summary>
                    <h3 class="item-group__title">
                      {{ secIndex + 1 }}.{{ cellIndex + 1 }}
                    </h3>
                  </summary>

                  <div
                      :class="'actions-items--container'"
                  >
                    <article class="actions-items actions-items--left">
                      <div class="actions-items--left-wrapper">
                        <div class="actions-items--width">
                          <div class="actions-inputs">
                            <p class="actions-title">Ширина</p>
                            <div
                                :class="['actions-input--container']"
                            >
                              <input
                                  type="number"
                                  :step="step"
                                  :min="MIN_SECTION_WIDTH"
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
                                  :min="MIN_SECTION_HEIGHT"
                                  class="actions-input"
                                  :value="cell.height"
                                  @input="
                            debounce(() => updateCellHeight(
                              $event.target.value,
                              secIndex,
                              cellIndex
                            ), 1000)
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

                        <button
                            v-if="section.cells.length > 1"
                            class="actions-btn actions-btn--default"
                            @click="deleteCell(cellIndex, secIndex)"
                        >
                          Удалить
                        </button>

                      </div>
                    </article>
                  </div>

                  <div class="accordion" v-if="cell.cellsRows?.length">
                    <div class="actions-header">
                      <p>Вертикальные ячейки</p>
                    </div>

                    <div
                        v-for="(row, rowIndex) in cell.cellsRows"
                        :key="rowIndex"
                        :class="'actions-items--container'"
                    >
                      <details class="item-group">
                        <summary>
                          <h3 class="item-group__title">
                            {{ secIndex + 1 }}.{{ cellIndex + 1 }}.{{ rowIndex + 1 }}
                          </h3>
                        </summary>

                        <div
                            :class="'actions-items--container'"
                        >
                          <article class="actions-items actions-items--left">
                            <div class="actions-items--left-wrapper">

                              <div class="actions-items--width">
                                <div class="actions-inputs">
                                  <p class="actions-title">Ширина</p>
                                  <div
                                      :class="['actions-input--container']"
                                  >
                                    <input
                                        type="number"
                                        :step="step"
                                        :min="MIN_SECTION_WIDTH"
                                        class="actions-input"
                                        :value="row.width"
                                        @input="
                              debounce(() => updateCellRowWidth(
                                $event.target.value,
                                secIndex,
                                cellIndex,
                                rowIndex
                              ), 1000)
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

                              <button
                                  v-if="cell.cellsRows.length > 1"
                                  class="actions-btn actions-btn--default"
                                  @click="deleteRowCell(cellIndex, secIndex, rowIndex)"
                              >
                                Удалить
                              </button>

                            </div>
                          </article>
                        </div>
                      </details>
                    </div>
                  </div>

                </details>
              </div>
            </div>

          </div>


        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss">
.splitter {
  &-container {
    &--product {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      color: #a3a9b5;

      &-icon {
        cursor: pointer;
      }

      &-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      &-data {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;

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

      &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      &-options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #ecebf1;

        &--add {
          display: flex;
          gap: 5px;
          align-items: center;
        }
      }

      &-actions {
        display: flex;
        gap: 1rem;
      }

      &-position {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .item-group {
        display: flex;
        flex-direction: column;
        color: #a3a9b5;
        margin-right: 10px;

        &__title {
          font-size: 18px;
          font-weight: 600;
        }

        &-color {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          margin: 10px 0;
          border-radius: 15px;
          background-color: $bg;
          cursor: pointer;

          .item-group-name {
            display: flex;
            align-items: center;
            gap: 10px;

            .name__bg {
              max-width: 60px;
              max-height: 60px;
              border-radius: 15px;
            }

            .name__text {
              font-weight: 500;
            }
          }

          @media (hover: hover) {
            /* when hover is supported */
            &:hover {
              color: white;
              background-color: #da444c;
              border: 1px solid transparent;
            }
          }
        }
      }


    }
  }
}

.actions {
  &-wrapper {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-right: 0.5rem;
  }

  &-footer {
    display: flex;
    justify-content: space-between;
    margin-top: auto;

    &--save {
      display: flex;
      gap: 1rem;
    }
  }

  &-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: scroll;
    padding-right: 0.5rem;
    max-height: 82vh;

    &::-webkit-scrollbar {
      width: 2px;
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

  &-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    width: 100%;
    padding: 1rem 0;
    border-bottom: 1px solid #ecebf1;
    border-top: 1px solid #ecebf1;

    &--container {
      display: flex;
      align-items: center;
      // gap: 0.5rem;
      padding-right: 0.5rem;
      border-right: 1px solid #ecebf1;
      border-bottom: 1px solid transparent;
      cursor: pointer;

      &.active {
        border-bottom: 1px solid #da444c;
      }
    }
  }

  &-items {
    display: flex;
    flex-wrap: wrap;
    // gap: 1rem;
    align-items: center;

    &--wrapper {
      display: flex;
      flex-direction: column;

      width: 100%;
      padding: 0 0 1rem 0;
    }

    &--container {
      display: flex;
      width: 100%;
      padding: 1rem 0;
      border-bottom: 1px solid #ecebf1;

      // &:first-child {
      //   padding-top: 0;
      // }

      &.active {
        background-color: #f1f1f5;
      }
    }

    &--left,
    &--right {
      width: 100%;
    }

    &--left {
      align-items: start;
      max-width: 50%;

      &-wrapper {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-left: 1rem;
        // max-width: calc(50% - 1rem);
      }
    }

    &--right {
      max-width: calc(50% - 1rem);
      margin-left: 1rem;

      &-items {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }

    &--height,
    &--diametr,
    &--width {
      display: flex;
      width: fit-content;

      &-item {
        display: flex;
        align-items: flex-start;
        height: fit-content;
        // gap: 0.5rem;
      }
    }

    &--title {
      display: flex;
      align-items: center;
      align-self: end;
      margin-bottom: 0.5rem;
    }
  }

  &-title {
    font-size: 1rem;
    color: #a3a9b5;
  }

  &-inputs {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    max-width: 100px;
  }

  &-input {
    padding: 0.5rem 1rem;
    width: 100%;
    max-width: 125px;
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
        pointer-events: none;
        z-index: 0;
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

    &--default,
    &--footer {
      transition-property: background-color, color, border;
      transition-timing-function: ease;
      transition-duration: 0.25s;
      @media (hover: hover) {
        /* when hover is supported */
        &:hover {
          color: white;
          background-color: #da444c;
          border: 1px solid transparent;
        }
      }
    }

    &--footer {
      background-color: #ecebf1;
    }

    &:focus {
      outline: none;
    }

    &.acthnive {
      border-color: #da444c;
      color: #181818;
      transition-property: background-color, color, border;
      transition-timing-function: ease;
      transition-duration: 0.25s;

      @media (hover: hover) {
        /* when hover is supported */
        &:hover {
          color: white;
          background-color: #da444c;
        }
      }
    }
  }

  &-icon {
    border: none;
    background-color: transparent;
    padding: 0 5px;

    &--delite,
    &--close,
    &--help {
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
      padding: 5px;
    }

    &--position {
      width: 25px;
      height: 25px;
    }
  }
}

.accordion {

  details {
    position: relative;
    margin: 16px 0;
    padding: 15px 50px 15px 15px;
    border: 1px solid #a3a9b5;
    border-radius: 15px;
    @media (hover: hover) {
      /* when hover is supported */
      &:hover {
        border-color: #da444c;
      }
    }
  }

  details summary {
    font-weight: bold;
    list-style: none;
    cursor: pointer;

  }

  details[open] {
    border-color: #da444c;

  }

  details summary::-webkit-details-marker {
    display: none;
  }

  details summary::before {
    content: "\276F";
    position: absolute;
    right: 1rem;
    top: 1rem;
    display: inline-block;
    transform: rotate(90deg);
    transition: transform 0.2s ease-in-out;
  }

  details[open] summary::before {
    transform: rotate(-90deg);
  }
}

.width {
  &-max {
    max-width: 100% !important;
  }
}

</style>

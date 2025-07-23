<script setup lang="ts">
// @ts-nocheck
import {defineExpose, ref, toRefs} from "vue";
import {_URL} from "@/types/constants";
import {
  DrawerFasadeObject,
  FasadeMaterial,
  FasadeObject,
  FillingObject,
  MANUFACTURER
} from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";

const props = defineProps({
  fillings: {
    type: Array,
    default: [],
    required: true,
  },
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

const emit = defineEmits([
  "product-updateFasades",
  "product-updateFilling",
  "product-calcDrawersFasades",

]);

const {module, fillings, visualizationRef} = toRefs(props);

const selectedFilling = ref({sec: 0, cell: null, row: null, item: 0});

type workMode = 'config' | 'add';
const mode = ref<workMode>('add');
const changeConstructorMode = (_mode: workMode) => {
  if (_mode) {
    mode.value = _mode;
  }
}

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

const selectCell = (sec, cell = null, row = null, item = 0) => {
  selectedFilling.value = {sec, cell, row, item};
  visualizationRef.value.selectCell("fillings", sec, cell, true, row, item);
};

const handleCellSelect = (secIndex, cellIndex = null, rowIndex = null, item = 0) => {
  selectedFilling.value = {sec: secIndex, cell: cellIndex, row: rowIndex, item: item};
};

const showCurrentCol = (secIndex) => {
  selectCell(secIndex)
};

const createFillingDataToCheck = (product, currentSpace) => {

  let width = product.width
  let height = product.height

  if (height > currentSpace.height || product.ACTUAL_DEPT > module.value.depth) {
    return false
  }

  if (width !== currentSpace.width)
    width = currentSpace.width;

  let tempFilling = {
    width,
    height,
    data: product,
  };

  return visualizationRef.value.checkPositionFillingToCreate(tempFilling);
};

const addFilling = (type, product, oldFillingObject = false) => {

  const {sec, cell, row} = selectedFilling.value

  if (row === null && cell === null && sec === null) {
    alert("Пожалуйста, выберите секцию для добавления наполнения");
    return;
  }

  const currentSection = module.value.sections[sec];
  const currentCell = currentSection.cells?.[cell];
  const currentRow = currentCell?.cellsRows?.[row];

  let currentFillingsArray = currentRow || currentCell || currentSection

  const startFillingData = createFillingDataToCheck(product, currentFillingsArray);

  if (!startFillingData) {
    alert("Позиция не найдена");
    return;
  }

  if (!currentFillingsArray.fillings)
    currentFillingsArray.fillings = []
  currentFillingsArray = currentFillingsArray.fillings

  let fillingObject = <FillingObject>{
    product: product.ID,
    id: currentFillingsArray.length + 1,
    name: product.NAME,
    image: product.PREVIEW_PICTURE,
    type: "any",
    position: new THREE.Vector2(startFillingData.x, startFillingData.y),
    size: new THREE.Vector3(startFillingData.width, startFillingData.height, product.depth),
    width: startFillingData.width,
    height: startFillingData.height,
    color: module.value.moduleColor,
    sec,
    cell,
    row,
  };

  currentFillingsArray.push(fillingObject);

  if (product.MIN_FASADE_SIZE) {
    if(!currentSection.fasadesDrawers)
      currentSection.fasadesDrawers = []

    let baseFasade = module.value.sections[sec].fasades[0][0] || module.value.sections[0].fasades[0][0]
    let manufacturer_name = product.EN_NAME?.toLowerCase().split(/\s|,/).shift() || product.NAME?.toLowerCase().split(/\s|,/).shift();
    let manufacturerOffset = MANUFACTURER[manufacturer_name]

    fillingObject.type = "drawer"
    fillingObject.fasade = <DrawerFasadeObject>{
      id: currentSection.fasadesDrawers.length + 1,
      width: baseFasade.width,
      height: product.MIN_FASADE_SIZE,
      minY: product.MIN_FASADE_SIZE,
      maxY: product.MAX_FASADE_SIZE,
      loopsSide: false,
      position: new THREE.Vector2(baseFasade.position.x, module.value.height - (startFillingData.y + startFillingData.height + manufacturerOffset)),
      material: <FasadeMaterial>{
        ...baseFasade.material,
      },
      type: "fasade",
      manufacturerOffset,
      item: currentFillingsArray.length - 1,
      sec,
      cell,
      row,
    }


    currentSection.fasadesDrawers.push(fillingObject.fasade);
    calcDrawersFasades(sec )
  }

  selectCell(sec, cell, row, currentFillingsArray.length - 1);

  // // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const deleteFilling = (secIndex, itemIndex, cellIndex = null, rowIndex = null) => {
  const sec = module.value.sections[secIndex];
  const cell = sec.cells?.[cellIndex];
  const row = cell?.cellsRows?.[rowIndex];

  const curRow = row || cell || sec;
  let needFasadesUpdate = false
  let curItem = curRow.fillings[itemIndex];

  curRow.fillings = curRow.fillings.filter((el, index) => {
    if (index === itemIndex && el.fasades)
      needFasadesUpdate = true

    return index !== itemIndex;
  });

  if (needFasadesUpdate) {
    if(sec.fasadesDrawers?.length) {

      sec.fasadesDrawers = sec.fasadesDrawers.filter((el, index) => {
        return el.id !== curItem.fasade.id;
      });

      calcDrawersFasades(secIndex)
    }
    else
      updateFasades()
  }

  visualizationRef.value.renderGrid();
};

const updateFasades = () => {
  emit("product-updateFasades");
}
const calcDrawersFasades = (sec, fillingData = false) => {
  emit("product-calcDrawersFasades", sec, fillingData);
}
const updateFilling = (value, filling, type, render = false) => {
  emit("product-updateFilling", value, filling, type, render);
};

const changeFillingPositionY = (event, value, key, secIndex, cellIndex = null, rowIndex = null) => {
  selectCell(secIndex, cellIndex, rowIndex, key);

  const gridCopy = Object.assign({}, module.value);

  const sec = gridCopy.sections[secIndex];
  const currentColl = sec.cells?.[cellIndex];
  const currentRow = currentColl?.cellsRows?.[rowIndex] || currentColl || sec;

  const currentfilling = currentRow.fillings[key];
  const prevValue = currentfilling.position.y; //Предыдущее значение

  let delta = +value - currentfilling.distances.bottom
  const newValue = prevValue - delta


  let tmpSector = currentfilling.sector
  delete currentfilling.sector

  const fillingData = JSON.parse(JSON.stringify(currentfilling));
  fillingData.position.y = newValue;
  fillingData.sector = tmpSector;

  const pixiSector = currentRow.sector;

  // Проверяем коллизию
  const check = shapeAdjuster.checkToCollision(pixiSector, false, fillingData);

  if (check) {
    currentfilling.position.y = fillingData.position.y;
  } else {
    currentfilling.position.y = prevValue;
  }

  currentfilling.sector = tmpSector;
  module.value = gridCopy;

  if (currentfilling.fasade)
    calcDrawersFasades(secIndex)

  visualizationRef.value.renderGrid();
};

defineExpose({
  handleCellSelect,
});

</script>

<template>
  <div class="splitter-container--product">

    <div
        class="constructor2d-container constructor2d-header"
    >
      <article class="constructor2d-header--mode-selector">
        <div class="work-mode-selector">
          <button
              :class="[
                      'actions-btn actions-btn--default', {
                      active:
                        mode === 'add'
                      }
                    ]"
              @click="changeConstructorMode('add')"
          >
            Вставка
          </button>
          <button
              :class="[
                      'actions-btn actions-btn--default', {
                      active:
                        mode === 'config'
                      }
                    ]"
              @click="changeConstructorMode('config')"
          >
            Конфигурация
          </button>
        </div>
      </article>
    </div>

    <div class="splitter-container--product-data" v-if="mode === 'add'">

      <div class="accordion" v-if="fillings">
        <div
            class="splitter-container--product-items"
            v-for="(fillingGroup, key) in fillings"
            :key="key + fillingGroup.groupName"
        >
          <details class="item-group">
            <summary>
              <h3 class="item-group__title">
                {{ fillingGroup.groupName }}
              </h3>
            </summary>

            <div
                :class="[
                          'item-group-color'
                        ]"
                style
                v-for="(filling, key) in fillingGroup.items"
                :key="key + filling.NAME"
                @click="addFilling(fillingGroup.groupName, filling)"
            >
              <div class="item-group-name">
                <img
                    class="name__bg"
                    :src="_URL + filling.PREVIEW_PICTURE"
                    :alt="filling.NAME"
                />
                <p class="name__text">
                  {{ filling.NAME }}
                </p>
              </div>
            </div>
          </details>
        </div>
      </div>

    </div>

    <div class="splitter-container--product-data" v-if="mode === 'config'">
      <section class="actions-wrapper">
        <div class="actions-header">
          <p
              class="actions-title actions-title--part"
          >
            Секции
          </p>
        </div>

        <div class="actions-header">
          <div
              :class="[
              'actions-header--container',
              { active: secIndex === selectedFilling.sec },
            ]"
              v-for="(section, secIndex) in module.sections"
              :key="secIndex"
          >
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
              v-if="selectedFilling.sec === secIndex"
          >

            <div
                v-for="(filling, fillingIndex) in section.fillings"
                :key="fillingIndex"
                :class="[
                'actions-items--container',
                {
                  active:
                    secIndex === selectedFilling.sec &&
                    fillingIndex === selectedFilling.item
                },
              ]"
            >
              <article class="actions-items actions-items--left">
                <div class="actions-items--left-wrapper">

                  <div class="actions-items--title">
                    <button
                        class="actions-btn actions-icon"
                        @click="deleteFilling(secIndex, fillingIndex)"
                    >
                      <img
                          class="actions-icon--delete"
                          src="/icons/delite.svg"
                          alt=""
                      />
                    </button>
                    <p class="actions-title actions-title--part">
                      {{ filling.name }} №{{ filling.id }}
                    </p>
                  </div>
                </div>
              </article>

              <article class="actions-items actions-items--right">
                <div class="actions-items--right-items">

                  <div class="actions-items--width">
                    <div class="actions-inputs">
                      <p class="actions-title">Позиция</p>
                      <div
                          :class="['actions-input--container']"
                      >
                        <input
                            type="number"
                            :step="1"
                            :max="section.height - filling.height"
                            min="0"
                            class="actions-input"
                            :value="filling.distances?.bottom"
                            @input="debounce((event) => {
                                changeFillingPositionY(
                                    $event,
                                    $event.target.value,
                                    fillingIndex,
                                    secIndex,
                                    )
                                }, 1000)"
                        />
                      </div>
                    </div>
                  </div>

                  <div
                      v-if="filling.fasade"
                      class="actions-items--height">
                    <div class="actions-inputs">
                      <p class="actions-title">
                        Высота фасада
                      </p>
                      <div
                          :class="['actions-input--container']"
                      >
                        <input
                            type="number"
                            :step="step"
                            min="150"
                            class="actions-input"
                            :value="filling.fasade.height"
                            disabled
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </article>

            </div>

            <div class="accordion" v-if="section.cells.length">
              <div
                  v-for="(cell, cellIndex) in section.cells"
                  :key="cellIndex"
              >
                <details class="item-group" v-if="cell.fillings?.length">

                  <summary>
                    <h3 class="item-group__title">
                      {{ secIndex + 1 }}.{{ cellIndex + 1 }}
                    </h3>
                  </summary>

                  <div
                      v-for="(filling, fillingIndex) in cell.fillings"
                      :key="fillingIndex"
                      :class="'actions-items--container'"
                  >
                    <article class="actions-items actions-items--left">
                      <div class="actions-items--left-wrapper">

                        <div class="actions-items--title">
                          <button
                              class="actions-btn actions-icon"
                              @click="deleteFilling(secIndex, fillingIndex, cellIndex)"
                          >
                            <img
                                class="actions-icon--delete"
                                src="/icons/delite.svg"
                                alt=""
                            />
                          </button>
                          <p class="actions-title actions-title--part">
                            {{ filling.name }} №{{ filling.id }}
                          </p>
                        </div>

                      </div>
                    </article>

                    <article class="actions-items actions-items--right">
                      <div class="actions-items--right-items">

                        <div class="actions-items--width">
                          <div class="actions-inputs">
                            <p class="actions-title">Позиция</p>
                            <div
                                :class="['actions-input--container']"
                            >
                              <input
                                  type="number"
                                  :step="1"
                                  :max="section.height - filling.height"
                                  min="0"
                                  class="actions-input"
                                  :value="filling.distances?.bottom"
                                  @input="debounce((event) => {
                                changeFillingPositionY(
                                    $event,
                                    $event.target.value,
                                    fillingIndex,
                                    secIndex,
                                    cellIndex
                                    )
                                }, 1000)"
                              />
                            </div>
                          </div>
                        </div>

                        <div
                            v-if="filling.fasade"
                            class="actions-items--height">
                          <div class="actions-inputs">
                            <p class="actions-title">
                              Высота фасада
                            </p>
                            <div
                                :class="['actions-input--container']"
                            >
                              <input
                                  type="number"
                                  :step="step"
                                  min="150"
                                  class="actions-input"
                                  :value="filling.fasade.height"
                                  disabled
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </article>

                  </div>

                  <div class="accordion" v-if="cell.cellsRows?.length">
                    <div
                        v-for="(row, rowIndex) in cell.cellsRows"
                        :key="rowIndex"
                        :class="'actions-items--container'"
                    >
                      <details class="item-group" v-if="row.fillings?.length">

                        <summary>
                          <h3 class="item-group__title">
                            {{ secIndex + 1 }}.{{ cellIndex + 1 }}.{{ rowIndex + 1 }}
                          </h3>
                        </summary>

                        <div
                            v-for="(filling, fillingIndex) in row.fillings"
                            :key="fillingIndex"
                            :class="[
                              'actions-items--container',
                              {
                                active:
                                  secIndex === selectedFilling.sec &&
                                  cellIndex === selectedFilling.cell &&
                                  rowIndex === selectedFilling.row &&
                                  fillingIndex === selectedFilling.item
                              },
                            ]"
                        >

                          <article class="actions-items actions-items--left">
                            <div class="actions-items--left-wrapper">

                              <div class="actions-items--title">
                                <button
                                    class="actions-btn actions-icon"
                                    @click="deleteFilling(secIndex, fillingIndex, cellIndex, rowIndex)"
                                >
                                  <img
                                      class="actions-icon--delete"
                                      src="/icons/delite.svg"
                                      alt=""
                                  />
                                </button>
                                <p class="actions-title actions-title--part">
                                  {{ filling.name }} №{{ filling.id }}
                                </p>
                              </div>

                            </div>
                          </article>

                          <article class="actions-items actions-items--right">
                            <div class="actions-items--right-items">

                              <div class="actions-items--width">
                                <div class="actions-inputs">
                                  <p class="actions-title">Позиция</p>
                                  <div
                                      :class="['actions-input--container']"
                                  >
                                    <input
                                        type="number"
                                        :step="1"
                                        :max="section.height - filling.height"
                                        min="0"
                                        class="actions-input"
                                        :value="filling.distances?.bottom"
                                        @input="debounce((event) => {
                                changeFillingPositionY(
                                    $event,
                                    $event.target.value,
                                    fillingIndex,
                                    secIndex,
                                    cellIndex,
                                    rowIndex
                                    )
                                }, 1000)"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div
                                  v-if="filling.fasade"
                                  class="actions-items--height">
                                <div class="actions-inputs">
                                  <p class="actions-title">
                                    Высота фасада
                                  </p>
                                  <div
                                      :class="['actions-input--container']"
                                  >
                                    <input
                                        type="number"
                                        :step="step"
                                        min="150"
                                        class="actions-input"
                                        :value="filling.fasade.height"
                                        disabled
                                    />
                                  </div>
                                </div>
                              </div>

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
    max-height: 70vh;
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
      max-width: calc(50%);
      margin-left: 3rem;

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

      &.active {
        border-color: #da444c;
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

.work-mode-selector {
  display: flex;
  flex-direction: row;
  gap: 1rem;
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

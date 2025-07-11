<script setup lang="ts">
// @ts-nocheck
import {defineExpose, ref, toRefs} from "vue";
import {FasadeMaterial, FasadeObject} from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";

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
  },
  moduleProps: {
    type: ref,
    required: true,
  }
});

const {module, visualizationRef, moduleProps} = toRefs(props);
const selectedFasade = ref({sec: 0, cell: null, row: null});

const emit = defineEmits([
  "product-selectCell",
  "product-updateFasades",
  "product-getFasadePositionMinMax",
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
  selectedFasade.value = {sec, cell, row};
  visualizationRef.value.selectCell("fasades", sec, cell, true, row);
};
const handleCellSelect = (secIndex, cellIndex = null, rowIndex = null) => {
  selectedFasade.value = {sec: secIndex, cell: cellIndex, row: rowIndex};
};

const updateFasades = () => {
  emit("product-updateFasades");
}

const showCurrentCol = (secIndex) => {
  selectCell(secIndex)
};

const getFasadePositionMinMax = (fasade) => {
  return emit("product-getFasadePositionMinMax", fasade);
}

const addDoor = (secIndex) => {

  const section = module.value.sections[secIndex];
  const width = section.fasades[0]?.[0] ? Math.floor((section.fasades[0][0].width) / 2 - 2) :
      secIndex > 0 && secIndex < module.value.sections.length - 1 ? section.width + module.value.moduleThickness - 4 :
          section.width + (module.value.moduleThickness - 2) + (module.value.moduleThickness / 2 - 2);

  let firstFasade, newDoorPosition;
  if (section.fasades[0]) {
    section.fasades[0].map(item => {
      item.width = width
    })

    firstFasade = section.fasades[0][0];
    newDoorPosition = new THREE.Vector2(firstFasade.position.x + width + 4, firstFasade.position.y)
  } else {
    const PROPS = moduleProps.value;
    const FASADE = PROPS.CONFIG.FASADE_POSITIONS[0]
    const FASADE_PROPS = PROPS.CONFIG.FASADE_PROPS[0]
    let startX = section.position.x - section.width / 2 - module.value.moduleThickness / 2 + 2;
    newDoorPosition = new THREE.Vector2(startX, FASADE.POSITION_Y)
    firstFasade = <FasadeObject>{
      id: 0,
      width,
      height: module.value.height - module.value.horizont - 4,
      position: newDoorPosition,
      type: "fasade",
      material: <FasadeMaterial>{
        ...FASADE_PROPS
      }
    }
    let fasadeMinMax = getFasadePositionMinMax(firstFasade)
    firstFasade = Object.assign(firstFasade, fasadeMinMax)
  }

  if (width < firstFasade.minX)
    firstFasade.error = true
  else
    delete firstFasade.error

  // Создаем новую колонку с такими же параметрами
  const newDoor: FasadeObject = {
    ...firstFasade,
    number: firstFasade.number + 1,
    position: newDoorPosition,
  }
  newDoor.height = module.value.height - module.value.horizont - 4; //TODO: костыль из-за прописанной в БД позиции фасада

  section.fasades.push([newDoor]);

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const splitFasade = (secIndex, doorIndex = 0, segmentIndex = 0) => {
  selectedFasade.value.sec = secIndex;
  selectedFasade.value.cell = doorIndex;
  selectedFasade.value.row = segmentIndex;

  visualizationRef.value.selectCell("fasades", secIndex, doorIndex, true, segmentIndex);

  let segment = module.value.sections[secIndex].fasades[doorIndex][segmentIndex];
  const halfHeight = Math.floor((segment.height - 4) / 2);
  // Обновляем высоту последней строки

  if (halfHeight < segment.minY || segment.width < segment.minX)
    segment.error = true
  else
    delete segment.error;

  segment.height = halfHeight;

  // Добавляем новую строку в эту колонку
  module.value.sections[secIndex].fasades[doorIndex].splice(segmentIndex, 0, <FasadeObject>{
    ...segment,
    position: new THREE.Vector2(segment.position.x, segment.position.y + 4 + segment.height),
  });

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const deleteDoor = (secIndex, doorIndex) => {
  const current = module.value.sections[secIndex].fasades[doorIndex];
  const prev = module.value.sections[secIndex].fasades[doorIndex - 1];

  const combinedWidth = prev
      ? current[0].width + prev[0].width + 4
      : current.width;

  if (prev) {
    prev.forEach((segment, index) => {
      segment.width = combinedWidth;

      if (segment.width < segment.minX || segment.height < segment.minY)
        segment.error = true
      else
        delete segment.error;
    })
  }

  module.value.sections[secIndex].fasades.splice(doorIndex, 1);

  selectedFasade.value.cell = 0;
  selectedFasade.value.sec = 0;

  visualizationRef.value.renderGrid();
};

const removeFasadeSegment = (secIndex, doorIndex, segmentIndex) => {
  const clone = Object.assign({}, module.value);
  const currentSection = clone.sections[secIndex].fasades[doorIndex];
  const currentSegment = currentSection[segmentIndex];

  const next = currentSection[segmentIndex + 1];
  const prev = currentSection[segmentIndex - 1];

  const combinedHeight = next
      ? currentSegment.height + next.height + 4
      : currentSegment.height + prev.height + 4;

  next ? (next.height = combinedHeight) : (prev.height = combinedHeight);

  let tmpSegment = next || prev
  if (tmpSegment.width < tmpSegment.minX || tmpSegment.height < tmpSegment.minY)
    tmpSegment.error = true
  else
    delete tmpSegment.error;


  if (currentSection.length > 1) {
    currentSection.splice(segmentIndex, 1);
  }

  module.value = clone;

  // Обновляем текущий сектор
  selectedFasade.value.row = 0;
  selectedFasade.value.cell = 0;
  selectedFasade.value.sec = secIndex;

  visualizationRef.value.renderGrid();
};

const updateFasadeHeight = (value, secIndex, doorIndex, segmentIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;
  // Обновляем выбранную секцию для визуального отображения
  selectedFasade.value = {sec: secIndex, cell: doorIndex, row: segmentIndex};
  visualizationRef.value.selectCell("fasades", secIndex, doorIndex, segmentIndex);

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "height",
      value: newValue,
      sec: secIndex,
      cell: doorIndex,
      row: segmentIndex,
      type: 'fasades',
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = Object.assign({}, module.value);
  if (adjustedValue) {
    let curCell = clone.sections[secIndex].fasades[doorIndex][segmentIndex];
    let prevCell = clone.sections[secIndex].fasades[doorIndex][segmentIndex - 1];
    let nextCell = clone.sections[secIndex].fasades[doorIndex][segmentIndex + 1];
    let delta = curCell.height - adjustedValue

    curCell.height = adjustedValue

    if (curCell.width < curCell.minX || curCell.height < curCell.minY)
      curCell.error = true
    else
      delete curCell.error;

    if (prevCell) {
      prevCell.height += delta;
      prevCell.position.y += (-delta);
    } else if (nextCell) {
      nextCell.height += delta
      curCell.position.y += delta;
    }

    let tmpSegment = prevCell || nextCell || {}
    if (tmpSegment.width < tmpSegment.minX || tmpSegment.height < tmpSegment.minY)
      tmpSegment.error = true
    else
      delete tmpSegment.error;

  }
  module.value = clone;

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
              { active: secIndex === selectedFasade.sec },
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
            v-for="(section, secIndex) in module.sections"
            :key="secIndex"
        >
          <div
              class="actions-items--wrapper"
              v-if="selectedFasade.sec === secIndex"
          >

            <div
                v-if="section.fasades.length < 2"
                :class="'actions-items--container'"
            >
              <article class="actions-items actions-items--right">
                <div class="actions-items--right-items">
                  <button
                      :class="[
                        'actions-btn actions-btn--default'
                      ]"
                      @click="addDoor(secIndex)"
                  >
                    Добавить дверь
                  </button>
                </div>
              </article>
            </div>

            <div
              v-for="(door, doorIndex) in section.fasades"
              :key="doorIndex"
              :class="'actions-container'"
            >
              <div class="actions-header">
                <button
                    class="actions-btn actions-icon"
                    @click="deleteDoor(secIndex, doorIndex)"
                >
                  <img
                      class="actions-icon--delete"
                      src="/icons/delite.svg"
                      alt=""
                  />
                </button>
                <p>Дверь №{{doorIndex + 1}}</p>
              </div>

              <div class="accordion">
                <div
                    v-for="(segment, segmentIndex) in door"
                    :key="segmentIndex"
                    :class="'actions-items--container'"
                >
                  <details class="item-group">
                    <summary>
                      <h3 class="item-group__title">
                        Сегмент №{{segmentIndex + 1}}.{{doorIndex + 1}}.{{ segmentIndex + 1 }}
                      </h3>
                    </summary>

                    <div
                        :class="'actions-items--container'"
                    >
                      <article class="actions-items actions-items--left">
                        <div class="actions-items--left-wrapper">
                          <div class="actions-items--width">
                            <div class="actions-inputs">
                              <p class="actions-title">
                                Ширина
                              </p>
                              <div
                                  :class="['actions-input--container']"
                              >
                                <input
                                    type="number"
                                    :step="step"
                                    min="150"
                                    class="actions-input"
                                    :value="segment.width"
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
                                    :value="segment.height"
                                    @input="
                            debounce(() => updateFasadeHeight(
                              $event.target.value,
                              secIndex,
                              doorIndex,
                              segmentIndex
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
                              @click="splitFasade(secIndex, doorIndex, segmentIndex)"
                          >
                            Разделить фасад
                          </button>

                          <button
                              v-if="door.length > 1"
                              class="actions-btn actions-btn--default"
                              @click="removeFasadeSegment(secIndex, doorIndex, segmentIndex)"
                          >
                            Удалить
                          </button>

                        </div>
                      </article>
                    </div>
                  </details>
                </div>
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

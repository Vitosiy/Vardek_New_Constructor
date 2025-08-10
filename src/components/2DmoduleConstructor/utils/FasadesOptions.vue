<script setup lang="ts">
// @ts-nocheck
import {defineExpose, ref, toRefs} from "vue";
import {FasadeMaterial, FasadeObject, LOOPSIDE} from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";
import {_URL} from "@/types/constants.ts";
import {useAppData} from "@/store/appliction/useAppData.ts";

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
const APP = useAppData().getAppData;

const emit = defineEmits([
  "product-selectCell",
  "product-updateFasades",
  "product-getFasadePositionMinMax",
    "product-calcDrawersFasades",
  "product-calcLoops",
  "product-calcSlideDoor",
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

const calcSlideDoor = (positionId, doorIndex, callback) => {
  emit("product-calcSlideDoor", positionId, doorIndex, callback);
}

const calcLoops = (secIndex) => {
  emit("product-calcLoops", secIndex);
}

const calcDrawersFasades = () => {
  emit("calcDrawersFasades");
}

const showCurrentCol = (secIndex, cellIndex = null) => {
  selectCell(secIndex, cellIndex)
};

const getFasadePositionMinMax = (fasade) => {
  return emit("product-getFasadePositionMinMax", fasade);
}

const addSlideDoor = (doorIndex) => {

  const fasades = module.value.fasades

  let newDoor;
  switch (doorIndex) {
    case 4:
      fasades[doorIndex - 2].forEach(item => item.material.POSITION = fasades[1][0].material.POSITION)
      newDoor = fasades[0][0]
      break;
    default:
      if (doorIndex % 2 === 0)
        newDoor = fasades[1][0]
      else
        newDoor = fasades[0][0]
      break;
  }

  let newFasade = <FasadeObject>{
    ...newDoor,
    id: doorIndex,
    material: <FasadeMaterial>{...newDoor.material},
  }

  fasades.push([newFasade])

  const callback = (fasadePosition) => {

    newFasade.width = fasadePosition.FASADE_WIDTH
    newFasade.height = fasadePosition.FASADE_HEIGHT
    newFasade.position = new THREE.Vector3(fasadePosition.POSITION_X, fasadePosition.POSITION_Y, fasadePosition.POSITION_Z)

    if (newFasade.width < newFasade.minX || newFasade.height < newFasade.minY)
      newFasade.error = true
    else
      delete newFasade.error;

    //Пересчитываем параметры старых дверей
    fasades.forEach((door, index) => {
      if(index + 1 !== doorIndex) {
        calcSlideDoor(door[0].material.POSITION, index + 1, (tmp_fasadePosition) => {
          door.forEach((segment, segmentIndex) => {
            segment.width = tmp_fasadePosition.FASADE_WIDTH
            segment.position.x = tmp_fasadePosition.POSITION_X
            segment.position.z = tmp_fasadePosition.POSITION_Z

            if (segment.width < segment.minX || segment.height < segment.minY)
              segment.error = true
            else
              delete segment.error;
          })
        });
      }
    })

    // Обновляем рендер
    visualizationRef.value.renderGrid();
  }

  calcSlideDoor(newDoor.material.POSITION, doorIndex, callback)
};

const deleteSlideDoor = (doorIndex) => {
  const fasades = module.value.fasades

  if(doorIndex === 4)
    fasades[doorIndex - 2].forEach(item => item.material.POSITION = fasades[0][0].material.POSITION)

  fasades.pop();

  //Пересчитываем параметры старых дверей
  fasades.forEach((door, index) => {
    calcSlideDoor(door[0].material.POSITION, index + 1, (tmp_fasadePosition) => {
      door.forEach((segment, segmentIndex) => {
        segment.width = tmp_fasadePosition.FASADE_WIDTH
        segment.position.x = tmp_fasadePosition.POSITION_X
        segment.position.z = tmp_fasadePosition.POSITION_Z

        if (segment.width < segment.minX || segment.height < segment.minY)
          segment.error = true
        else
          delete segment.error;
      })
    });
  })

  selectedFasade.value.cell = 0;
  selectedFasade.value.sec = null;

  visualizationRef.value.renderGrid();
};

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
      number: 0,
      width,
      height: module.value.height - module.value.horizont - 4,
      position: newDoorPosition,
      type: "fasade",
      material: <FasadeMaterial>{
        ...FASADE_PROPS
      },
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

  let loopsidesList = getLoopsideList(secIndex, section.fasades.length)
  newDoor.loopsSide = loopsidesList.pop().ID

  section.fasades.push([newDoor]);

  if(!module.value.isSlidingDoors)
    calcLoops(secIndex)

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const splitFasade = (secIndex, doorIndex = 0, segmentIndex = 0) => {
  selectedFasade.value.sec = secIndex;
  selectedFasade.value.cell = doorIndex;
  selectedFasade.value.row = segmentIndex;

  visualizationRef.value.selectCell("fasades", secIndex, doorIndex, true, segmentIndex);

  let fasades = secIndex === null ? module.value.fasades : module.value.sections[secIndex].fasades
  let segment = fasades[doorIndex][segmentIndex];
  const halfHeight = Math.floor((segment.height - (module.value.isSlidingDoors ? 0 : 4)) / 2);
  // Обновляем высоту последней строки

  if (halfHeight < segment.minY || segment.width < segment.minX)
    segment.error = true
  else
    delete segment.error;

  segment.height = halfHeight;

  // Добавляем новую строку в эту колонку
  fasades[doorIndex].splice(segmentIndex, 0, <FasadeObject>{
    ...segment,
    position: module.value.isSlidingDoors ? new THREE.Vector3(segment.position.x, segment.position.y + segment.height, segment.position.z) :
        new THREE.Vector2(segment.position.x, segment.position.y + 4 + segment.height),
  });

  if(!module.value.isSlidingDoors)
    calcLoops(secIndex)

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
  module.value.sections[secIndex].loops.splice(doorIndex, 1);

  selectedFasade.value.cell = 0;
  selectedFasade.value.sec = 0;

  if(!module.value.isSlidingDoors)
    calcLoops(secIndex)

  visualizationRef.value.renderGrid();
};

const removeFasadeSegment = (secIndex, doorIndex, segmentIndex) => {
  const clone = Object.assign({}, module.value);
  const fasades = secIndex === null ? clone.fasades : clone.sections[secIndex].fasades
  const currentSection = fasades[doorIndex];
  const currentSegment = currentSection[segmentIndex];

  const next = currentSection[segmentIndex + 1];
  const prev = currentSection[segmentIndex - 1];

  const combinedHeight = next
      ? currentSegment.height + next.height + (module.value.isSlidingDoors ? 0 : 4)
      : currentSegment.height + prev.height + (module.value.isSlidingDoors ? 0 : 4);

  next ? (next.height = combinedHeight) : (prev.height = combinedHeight);

  let tmpSegment = next || prev
  if (tmpSegment.width < tmpSegment.minX || tmpSegment.height < tmpSegment.minY)
    tmpSegment.error = true
  else
    delete tmpSegment.error;

  if(prev)
    prev.position.y = currentSegment.position.y;

  if (currentSection.length > 1) {
    currentSection.splice(segmentIndex, 1);
  }

  module.value = clone;

  // Обновляем текущий сектор
  selectedFasade.value.row = 0;
  selectedFasade.value.cell = 0;
  selectedFasade.value.sec = secIndex;

  if(!module.value.isSlidingDoors)
    calcLoops(secIndex)

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

  if(!module.value.isSlidingDoors)
    calcLoops(secIndex)

  visualizationRef.value.renderGrid();

};

const changeLoopside = (secIndex, fasade, newSide) => {
  fasade.loopsSide = parseInt(newSide);
  calcLoops(secIndex)
  visualizationRef.value.renderGrid();
}

const getLoopsideList = (secIndex, doorIndex) => {
  const productInfo = APP.CATALOG.PRODUCTS[module.value.productID]

  let list = []
  let tmp = {}
  productInfo.LOOPSIDE.forEach((type) => {
    if (APP.LOOPSIDE[type] != undefined) {
      tmp[type] = APP.LOOPSIDE[type];
    }
  });

  switch (doorIndex) {
    case 0:
      if (module.value.sections[secIndex].fasades[1]) {
        tmp = {}
      }
      else {
        const sectionLeft = module.value.sections[secIndex - 1] || false
        const sectionRight = module.value.sections[secIndex + 1] || false

        if (sectionLeft) {
          const sectionLeftLoops = sectionLeft.loops || {}
          if (sectionLeftLoops[1] || [LOOPSIDE["right"], LOOPSIDE["right_on_partition"]].includes(sectionLeftLoops[1])) {
            delete tmp[LOOPSIDE["left_on_partition"]]
          } else {
            tmp[LOOPSIDE["left_on_partition"]] = APP.LOOPSIDE[LOOPSIDE["left_on_partition"]]
          }

          delete tmp[LOOPSIDE["left"]]
        }
        if (sectionRight) {
          const sectionRightLoops = sectionRight.loops || {}
          if ([LOOPSIDE["left"], LOOPSIDE["left_on_partition"]].includes(sectionRightLoops[1])) {
            delete tmp[LOOPSIDE["right_on_partition"]]
          } else {
            tmp[LOOPSIDE["right_on_partition"]] = APP.LOOPSIDE[LOOPSIDE["right_on_partition"]]
          }

          delete tmp[LOOPSIDE["right"]]
        }
      }
      break;
    case 1:
      tmp = {}
      break;
  }

  list = Object.values(tmp)
  return list
}

defineExpose({
  handleCellSelect,
});

</script>

<template>
  <div class="splitter-container--product">
    <div class="splitter-container--product-data" v-if="module">

      <section class="actions-wrapper">

        <div v-if="module.fasades">
          <div
              :class="'actions-items--container'"
          >
            <article class="actions-items actions-items--right">
              <div class="actions-items--right-items">
                <button
                    v-if="module.fasades.length < 4"
                    :class="[
                        'actions-btn actions-btn--default'
                      ]"
                    @click="addSlideDoor(module.fasades.length + 1)"
                >
                  Добавить дверь
                </button>

                <button
                    v-if="module.fasades.length > 2"
                    :class="[
                        'actions-btn actions-btn--default'
                      ]"
                    @click="deleteSlideDoor(module.fasades.length)"
                >
                  Удалить дверь
                </button>
              </div>
            </article>
          </div>

          <div class="actions-header">
            <div
                :class="[
              'actions-header--container',
              { active: doorIndex === selectedFasade.cell},
            ]"
                v-for="(door, doorIndex) in module.fasades"
                :key="doorIndex"
            >
              <p
                  class="actions-title actions-title--part"
                  @click="showCurrentCol(null, doorIndex)"
              >
                Дверь №{{ doorIndex + 1 }}
              </p>
            </div>
          </div>

          <div
              v-for="(door, doorIndex) in module.fasades"
              :key="doorIndex"
              :class="'actions-container'"
          >
            <div
                class="actions-items--wrapper"
                v-if="selectedFasade.cell === doorIndex"
            >
                <div class="accordion">
                  <div
                      v-for="(segment, segmentIndex) in door"
                      :key="segmentIndex"
                      :class="'actions-items--container'"
                  >
                    <details class="item-group">
                      <summary>
                        <h3 class="item-group__title">
                          Сегмент №{{ doorIndex + 1 }}{{ door.length > 1 ? `.${segmentIndex + 1}` : '' }}
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
                                      disabled
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
                                @click="splitFasade(null, doorIndex, segmentIndex)"
                            >
                              Разделить фасад
                            </button>

                            <button
                                v-if="door.length > 1"
                                class="actions-btn actions-btn--default"
                                @click="removeFasadeSegment(null, doorIndex, segmentIndex)"
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

        <div v-else>
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
                          Сегмент №{{secIndex + 1}}.{{doorIndex + 1}}.{{ segmentIndex + 1 }}
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

                            <div class="actions-items--selector">
                              <div class="actions-inputs">
                                <p class="actions-title">
                                  Сторона открывания
                                </p>
                                <div
                                >
                                  <select
                                      style
                                      id="loopsSide"
                                      :value="segment.loopsSide"
                                      name="loopsSide"
                                      class="actions-input"
                                      @change="changeLoopside(secIndex, segment, $event.target.value)"
                                  >
                                    <option
                                        v-for="(side, key) in getLoopsideList(secIndex, doorIndex)"
                                        :key="key"
                                        :value="side.ID"
                                    >
                                      <div class="item-group-name">
                                        <p class="name__text">
                                          {{ side.NAME }}
                                        </p>
                                      </div>
                                    </option>
                                  </select>
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

    &--selector,
    &--height,
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

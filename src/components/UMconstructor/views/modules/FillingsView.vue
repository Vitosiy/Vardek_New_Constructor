<script setup lang="ts">
import "@/components/UMconstructor/styles/UM.scss"

import {_URL} from "@/types/constants.ts";
import AdvanceCorpusMaterialRedactor from "@/components/ui/color/AdvanceCorpusMaterialRedactor.vue";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import ConfigurationOption from "@/components/right-menu/customiser-pages/ColorRightPage/ConfigurationOption.vue";
import Handles from "@/components/right-menu/customiser-pages/FigureRightPage/Handles/Handles.vue";
import {useModelState} from "@/store/appliction/useModelState.ts";
import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import {ref, toRefs} from "vue";
import {useFigureRightPage} from "@/components/right-menu/customiser-pages/FigureRightPage/useFigureRightPage.ts";
import {GridModule} from "@/components/UMconstructor/types/UMtypes.ts";

const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
  fillings: {
    type: Array,
    default: [],
    required: true,
  },
  UMconstructor: {
    type: UMconstructorClass,
    required: true,
  },
});

type workMode = 'config' | 'add';
const mode = ref<workMode>('add');
const changeConstructorMode = (_mode: workMode) => {
  if (_mode) {
    mode.value = _mode;
  }
}

const isOpenMaterialSelector = ref<boolean>(false);
const currentFasadeMaterial = ref<Object | boolean>(false);
const isOpenHandleSelector = ref<boolean>(false);
const currentHandle = ref<Object | boolean>(false);

const {module, UMconstructor} = toRefs(props)
const modelState = useModelState();
const { createSurfaceList } =
    useFigureRightPage();

const createFacadeData = (fasadeIndex?: number) => {
  const productId = modelState.getCurrentModel.userData.PROPS.PRODUCT;
  const {FACADE} = modelState._PRODUCTS[productId];
  modelState.createCurrentModelFasadesData({
    data: FACADE,
    fasadeNdx: fasadeIndex,
    productId,
  });
};

const openFasadeSelector = (
    secIndex: number,
    cellIndex: number,
    rowIndex: number,
    itemIndex: number,
) => {
  isOpenMaterialSelector.value = false;

  /** @Создание_данных_для_выбранного_фасада */
  createFacadeData();

  if (
      currentFasadeMaterial.value &&
      (
          secIndex == currentFasadeMaterial.value.secIndex &&
          cellIndex == currentFasadeMaterial.value.cellIndex &&
          rowIndex == currentFasadeMaterial.value.rowIndex &&
          itemIndex == currentFasadeMaterial.value.itemIndex
      )
  ) {
    currentFasadeMaterial.value = false;
    return;
  }

  setTimeout(() => {
    const curSection = module.value.sections[secIndex]
    const curCell = curSection?.cells?.[cellIndex]
    const curRow = curCell?.cellsRows?.[rowIndex]

    const curModuleSegment = curRow || curCell || curSection

    let data = curModuleSegment.fillings[itemIndex].fasade.material
    currentFasadeMaterial.value = {
      secIndex,
      cellIndex,
      rowIndex,
      itemIndex,
      data,
      fasadeSize: {
        FASADE_WIDTH: curModuleSegment.fillings[itemIndex].fasade.width,
        FASADE_HEIGHT: curModuleSegment.fillings[itemIndex].fasade.height,
        isDrawer: true
      },
    }
    UMconstructor?.value?.FILLINGS.selectCell(secIndex, cellIndex, rowIndex, null, itemIndex)
    isOpenMaterialSelector.value = true
  }, 10)
}

const openHandleSelector = (secIndex, cellIndex, rowIndex, itemIndex) => {
  isOpenHandleSelector.value = false;
  isOpenMaterialSelector.value = false;

  if(isOpenMaterialSelector.value)
    closeMenu()

  if (
      currentHandle.value &&
      secIndex === currentHandle.value.secIndex &&
      cellIndex === currentHandle.value.cellIndex &&
      rowIndex === currentHandle.value.rowIndex &&
      itemIndex === currentHandle.value.itemIndex
  ) {
    closeMenu()
    return;
  }

  setTimeout(() => {
    const curSection = grid.sections[secIndex]
    const curCell = curSection?.cells?.[cellIndex]
    const curRow = curCell?.cellsRows?.[rowIndex]

    const curModuleSegment = curRow || curCell || curSection
    let data = curModuleSegment.fillings[itemIndex].fasade.material

    currentHandle.value = {
      secIndex,
      cellIndex,
      rowIndex,
      itemIndex,
      data,
    };
    selectCell(secIndex, cellIndex, rowIndex, itemIndex);
    isOpenHandleSelector.value = true;
  }, 10);
};

const selectHandle = (data, type) => {
  switch (type) {
    case "handle":
      currentHandle.value.data.HANDLES.id = data;
      break;
    case "position":
      currentHandle.value.data.HANDLES.position = data;
      break;
  }
}

const selectOption = (value: Object, type: string, palette: Object = false) => {

  currentFasadeMaterial.value.data[type] = value ? value.ID : null;
  if (palette)
    currentFasadeMaterial.value.data['PALETTE'] = palette

  let {secIndex, cellIndex, rowIndex, itemIndex} = currentFasadeMaterial.value;
  const curSection = grid.sections[secIndex]
  const curCell = curSection?.cells?.[cellIndex]
  const curRow = curCell?.cellsRows?.[rowIndex]

  const curModuleSegment = curRow || curCell || curSection
  curModuleSegment.fillings[itemIndex].fasade.material =
      Object.assign(curModuleSegment.fillings[itemIndex].fasade.material, currentFasadeMaterial.value.data)
};

const closeMenu = () => {
  isOpenMaterialSelector.value = false;
  isOpenHandleSelector.value = false;

  currentHandle.value = false;
  currentFasadeMaterial.value = false;
};

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
                      'no-select actions-btn actions-btn--default', {
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
                      'no-select actions-btn actions-btn--default', {
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

            <div class="item-group-wrapper">
              <div
                  :class="[
                          'item-group-color'
                        ]"
                  style
                  v-for="(filling, key) in fillingGroup.items"
                  :key="key + filling.NAME"
                  @click="addFilling(filling, fillingGroup.groupID)"
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
                v-if="section.fillings?.length"
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
                        class="no-select actions-btn actions-icon"
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
                            v-if="filling.isVerticalItem"
                            type="number"
                            :step="1"
                            :max="section.width - filling.width"
                            min="0"
                            class="actions-input"
                            :value="filling.distances?.left"
                            @input="debounce((event) => {
                                changeFillingPositionX(
                                    $event,
                                    $event.target.value,
                                    fillingIndex,
                                    secIndex,
                                    )
                                }, 1000)"
                        />
                        <input
                            v-else
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
                      class="actions-items--height"
                  >
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
                            :min="filling.fasade.minY"
                            :max="filling.fasade.maxY"
                            class="actions-input"
                            :value="filling.fasade.height"
                            @input="debounce((event) => {
                                changeDrawerFasade(
                                    $event,
                                    $event.target.value,
                                    fillingIndex,
                                    secIndex
                                    )
                                }, 1000)"
                        />
                      </div>
                    </div>
                  </div>

                  <ConfigurationOption
                      v-if="filling.fasade"
                      :type="filling.fasade.material.PALETTE ? 'palette' : 'surface'"
                      :data="filling.fasade.material.PALETTE ? {...APP.PALETTE[filling.fasade.material.PALETTE], hex: APP.PALETTE[filling.fasade.material.PALETTE].HTML} : APP.FASADE[filling.fasade.material.COLOR]"
                      @click="openFasadeSelector(secIndex, null, null, fillingIndex)"
                  />

                  <ConfigurationOption
                      v-if="filling.fasade"
                      :class="[
                                {
                                  active:
                                    currentHandle.secIndex ===
                                      secIndex &&
                                    currentHandle.doorIndex ===
                                      doorIndex &&
                                    currentHandle.segmentIndex ===
                                      segmentIndex,
                                },
                              ]"
                      :type="'Handles'"
                      :data="filling.fasade.material.HANDLES ? {...APP.CATALOG.PRODUCTS[filling.fasade.material.HANDLES.id]} : false"
                      @click="
                              openHandleSelector(secIndex, null, null, fillingIndex)
                            "
                  />

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
                              class="no-select actions-btn actions-icon"
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
                                  v-if="filling.isVerticalItem"
                                  type="number"
                                  :step="1"
                                  :max="cell.width - filling.width"
                                  min="0"
                                  class="actions-input"
                                  :value="filling.distances?.left"
                                  @input="debounce((event) => {
                                changeFillingPositionX(
                                    $event,
                                    $event.target.value,
                                    fillingIndex,
                                    secIndex,
                                    cellIndex
                                    )
                                }, 1000)"
                              />
                              <input
                                  v-else
                                  type="number"
                                  :step="1"
                                  :max="cell.height - filling.height"
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
                            class="actions-items--height"
                        >
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
                                  :min="filling.fasade.minY"
                                  :max="filling.fasade.maxY"
                                  class="actions-input"
                                  :value="filling.fasade.height"
                                  @input="debounce((event) => {
                                    changeDrawerFasade(
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

                        <ConfigurationOption
                            v-if="filling.fasade"
                            :class="[
                                {
                                  active:
                                    currentFasadeMaterial.secIndex ===
                                      secIndex &&
                                    currentFasadeMaterial.cellIndex ===
                                      cellIndex &&
                                    currentFasadeMaterial.rowIndex ===
                                      null &&
                                    currentFasadeMaterial.fillingIndex ===
                                      fillingIndex,
                                },
                            ]"
                            :type="filling.fasade.material.PALETTE ? 'palette' : 'surface'"
                            :data="filling.fasade.material.PALETTE ? {...APP.PALETTE[filling.fasade.material.PALETTE], hex: APP.PALETTE[filling.fasade.material.PALETTE].HTML} : APP.FASADE[filling.fasade.material.COLOR]"
                            @click="openFasadeSelector(secIndex, cellIndex, null, fillingIndex)"
                        />

                        <ConfigurationOption
                            v-if="filling.fasade"
                            :class="[
                                {
                                  active:
                                    currentHandle.secIndex ===
                                      secIndex &&
                                    currentHandle.cellIndex ===
                                      cellIndex &&
                                    currentHandle.rowIndex ===
                                      null &&
                                    currentHandle.fillingIndex ===
                                      fillingIndex,
                                },
                              ]"
                            :type="'Handles'"
                            :data="filling.fasade.material.HANDLES ? {...APP.CATALOG.PRODUCTS[filling.fasade.material.HANDLES.id]} : false"
                            @click="
                              openHandleSelector(secIndex, cellIndex, null, fillingIndex)
                            "
                        />
                      </div>
                    </article>

                  </div>

                </details>

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
                                  class="no-select actions-btn actions-icon"
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
                                      v-if="filling.isVerticalItem"
                                      type="number"
                                      :step="1"
                                      :max="row.width - filling.width"
                                      min="0"
                                      class="actions-input"
                                      :value="filling.distances?.left"
                                      @input="debounce((event) => {
                                        changeFillingPositionX(
                                            $event,
                                            $event.target.value,
                                            fillingIndex,
                                            secIndex,
                                            cellIndex,
                                            rowIndex
                                            )
                                        }, 1000)"
                                  />
                                  <input
                                      v-else
                                      type="number"
                                      :step="1"
                                      :max="row.height - filling.height"
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
                                class="actions-items--height"
                            >
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
                                      :min="filling.fasade.minY"
                                      :max="filling.fasade.maxY"
                                      class="actions-input"
                                      :value="filling.fasade.height"
                                      @input="debounce((event) => {
                                        changeDrawerFasade(
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

                            <ConfigurationOption
                                v-if="filling.fasade"
                                :class="[
                                {
                                  active:
                                    currentFasadeMaterial.secIndex ===
                                      secIndex &&
                                    currentFasadeMaterial.cellIndex ===
                                      cellIndex &&
                                    currentFasadeMaterial.rowIndex ===
                                      rowIndex &&
                                    currentFasadeMaterial.fillingIndex ===
                                      fillingIndex,
                                },
                                ]"
                                :type="filling.fasade.material.PALETTE ? 'palette' : 'surface'"
                                :data="filling.fasade.material.PALETTE ? {...APP.PALETTE[filling.fasade.material.PALETTE], hex: APP.PALETTE[filling.fasade.material.PALETTE].HTML} : APP.FASADE[filling.fasade.material.COLOR]"
                                @click="openFasadeSelector(secIndex, cellIndex, rowIndex, fillingIndex)"
                            />

                            <ConfigurationOption
                                v-if="filling.fasade"
                                :class="[
                                {
                                  active:
                                    currentHandle.secIndex ===
                                      secIndex &&
                                    currentHandle.cellIndex ===
                                      cellIndex &&
                                    currentHandle.rowIndex ===
                                      rowIndex &&
                                    currentHandle.fillingIndex ===
                                      fillingIndex,
                                },
                              ]"
                                :type="'Handles'"
                                :data="filling.fasade.material.HANDLES ? {...APP.CATALOG.PRODUCTS[filling.fasade.material.HANDLES.id]} : false"
                                @click="
                              openHandleSelector(secIndex, cellIndex, rowIndex, fillingIndex)
                            "
                            />

                          </div>
                        </article>

                      </div>
                    </details>

                    <div class="accordion" v-if="row.extras?.length">
                      <div
                          v-for="(extra, extraIndex) in row.extras"
                          :key="extraIndex"
                          :class="'actions-items--container'"
                      >
                        <details class="item-group" v-if="extra.fillings?.length">

                          <summary>
                            <h3 class="item-group__title">
                              {{ secIndex + 1 }}.{{ cellIndex + 1 }}.{{ rowIndex + 1 }}.{{ extraIndex + 1 }}
                            </h3>
                          </summary>

                          <div
                              v-for="(filling, fillingIndex) in extra.fillings"
                              :key="fillingIndex"
                              :class="[
                              'actions-items--container',
                              {
                                active:
                                  secIndex === selectedFilling.sec &&
                                  cellIndex === selectedFilling.cell &&
                                  rowIndex === selectedFilling.row &&
                                  extraIndex === selectedFilling.extra &&
                                  fillingIndex === selectedFilling.item
                              },
                            ]"
                          >

                            <article class="actions-items actions-items--left">
                              <div class="actions-items--left-wrapper">

                                <div class="actions-items--title">
                                  <button
                                      class="no-select actions-btn actions-icon"
                                      @click="deleteFilling(secIndex, fillingIndex, cellIndex, rowIndex, extraIndex)"
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
                                          v-if="filling.isVerticalItem"
                                          type="number"
                                          :step="1"
                                          :max="extra.width - filling.width"
                                          min="0"
                                          class="actions-input"
                                          :value="filling.distances?.left"
                                          @input="debounce((event) => {
                                        changeFillingPositionX(
                                            $event,
                                            $event.target.value,
                                            fillingIndex,
                                            secIndex,
                                            cellIndex,
                                            rowIndex,
                                            extraIndex
                                            )
                                        }, 1000)"
                                      />
                                      <input
                                          v-else
                                          type="number"
                                          :step="1"
                                          :max="extra.height - filling.height"
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
                                                rowIndex,
                                                extraIndex
                                                )
                                            }, 1000)"
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

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

    </div>

  </div>

  <transition name="slide--right" mode="out-in">
    <div class="color-select" v-if="isOpenMaterialSelector || isOpenHandleSelector" key="color-select">
      <ClosePopUpButton class="menu__close" @close="closeMenu()"/>

      <AdvanceCorpusMaterialRedactor
          v-if="isOpenMaterialSelector"
          :is-fasade="true"
          :elementData="currentFasadeMaterial.data"
          :fasade-size="currentFasadeMaterial.fasadeSize"
          @parent-callback="selectOption"
      />
      <Handles
          v-else
          :is2-dconstructor="true"
          :data="createSurfaceList(currentHandle)"
          :index="0"
          @parent-callback="selectHandle"
      />
    </div>
  </transition>
</template>

<style scoped lang="scss">

</style>
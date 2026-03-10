<script setup lang="ts">
//@ts-nocheck

import "@/components/UMconstructor/styles/UM.scss"

import ConfigurationOption from "@/components/right-menu/customiser-pages/ColorRightPage/ConfigurationOption.vue";
import AdvanceCorpusMaterialRedactor from "@/components/ui/color/AdvanceCorpusMaterialRedactor.vue";
import Handles from "@/components/right-menu/customiser-pages/FigureRightPage/Handles/Handles.vue";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import {ref, toRefs, onMounted, watch} from "vue";
import {TSelectedCell, GridModule} from "@/components/UMconstructor/types/UMtypes.ts";
import {TFasadeTrueSizes} from "@/types/types.ts";
import {useFigureRightPage} from "@/components/right-menu/customiser-pages/FigureRightPage/useFigureRightPage.ts";

const props = defineProps({
  module: {
    type: ref<GridModule>,
    required: true,
  },
  mode: {
    type: String,
    default: "module",
  },
  UMconstructor: {
    type: UMconstructorClass,
    required: true,
  }
});

const {module, mode, UMconstructor} = toRefs(props)
const selectedFasade = ref<TSelectedCell>(<TSelectedCell>{})
const selectedCell = ref<TSelectedCell>(<TSelectedCell>{})

const step = ref<number>(1)
const { createSurfaceList } =
    useFigureRightPage();
type selectedMaterial = {
  sec: number | null,
  cell?: number | null,
  row?: number | null,
  extra?: number | null,
  item?: number | null
  data: {},
  fasadeSize?: {},
}
const isOpenMaterialSelector = ref<boolean>(false);
const currentFasadeMaterial = ref<selectedMaterial | boolean>(false);
const currentFasadeSize = ref<TFasadeTrueSizes | boolean>(false);

const isOpenHandleSelector = ref<boolean>(false);
const currentHandle = ref<selectedMaterial | boolean>(false);

const showCurrentCol = (secIndex: number | null = 0, cellIndex: number|null = null, rowIndex: number|null = null) => {
  UMconstructor?.value?.selectCell("fasades", <TSelectedCell>{sec: secIndex, cell: cellIndex, row: rowIndex});
};

const handleCellSelect = () => {
  const {sec, cell, row} = selectedFasade.value;

  //Задержка нужна для того, чтоб рендер аккордионов обновился
  UMconstructor?.value?.debounce("handleCellSelectFasades", () => {
    let idTag = `fasade_${sec}`

    if(cell !== null)
      idTag += `_${cell}`;

    if(row !== null)
      idTag += `_${row}`

    let domElem = document.getElementById(idTag)
    if(domElem) {
      domElem.scrollIntoView();
    }
  }, 10)
};

const openFasadeSelector = (sec: number, cell: number|null = null, row: number|null = null) => {
  isOpenMaterialSelector.value = false;

  if(isOpenHandleSelector.value)
    closeMenu()

  /** @Создание_данных_для_выбранного_фасада */
  createFacadeData(row === null ? undefined : row);

  if (
      currentFasadeMaterial.value &&
      sec === currentFasadeMaterial.value.sec &&
      cell === currentFasadeMaterial.value.cell &&
      row === currentFasadeMaterial.value.row
  ) {
    closeMenu()
    return;
  }

  setTimeout(() => {
    let data =
        sec === null
            ? module.value.fasades[cell][row]
            : module.value.sections[sec].fasades[cell][row];
    currentFasadeMaterial.value = {
      sec,
      cell,
      row,
      data: data.material,
    };
    currentFasadeSize.value = <TFasadeTrueSizes>{FASADE_WIDTH: data.width, FASADE_HEIGHT: data.height}
    UMconstructor?.value?.FASADES.selectCell(sec, cell, row);
    isOpenMaterialSelector.value = true;
  }, 10);
};

const openHandleSelector = (sec: number|null, cell: number|null = null, row: number|null = null) => {
  isOpenHandleSelector.value = false;
  isOpenMaterialSelector.value = false;

  if(isOpenMaterialSelector.value)
    closeMenu()

  if (
      currentHandle.value &&
      sec === currentHandle.value.sec &&
      cell === currentHandle.value.cell &&
      row === currentHandle.value.row
  ) {
    closeMenu()
    return;
  }

  setTimeout(() => {
    let data =
        sec === null
            ? module.value.fasades[cell][row]
            : module.value.sections[sec].fasades[cell][row];
    currentHandle.value = {
      sec,
      cell,
      row,
      data: data.material,
    };
    UMconstructor?.value?.FASADES.selectCell(sec, cell, row);
    isOpenHandleSelector.value = true;
  }, 10);
};

const createFacadeData = (
    fasadeIndex: number|undefined,
) => {
  UMconstructor?.value?.FASADES.createFacadeData(fasadeIndex)
};

const selectHandle = (data: any, type: string) => {
  switch (type) {
    case "handle":
      currentHandle.value.data.HANDLES.id = data;
      break;
    case "position":
      currentHandle.value.data.HANDLES.position = data;
      break;
  }
  UMconstructor?.value?.RENDER_REF.renderGrid(module.value);
}

const selectOption = (value: Object, type: string, palette: Object = false) => {
  currentFasadeMaterial.value.data[type] = value ? value.ID || value : null;
  if (palette) currentFasadeMaterial.value.data["PALETTE"] = palette;

  let { sec, cell, row } = currentFasadeMaterial.value;
  if (sec === null) {
    module.value.fasades[cell][row].material = Object.assign(
        module.value.fasades[cell][row].material,
        currentFasadeMaterial.value.data
    );
  } else {
    module.value.sections[sec].fasades[cell][row].material =
        Object.assign(
            module.value.sections[sec].fasades[cell][row]
                .material,
            currentFasadeMaterial.value.data
        );
  }

  //UMconstructor?.value?.reset(module.value)
};

const closeMenu = () => {
  isOpenMaterialSelector.value = false;
  isOpenHandleSelector.value = false;

  currentHandle.value = false;
  currentFasadeMaterial.value = false;
  currentFasadeSize.value = false;
};

onMounted(() => {
  selectedFasade.value = UMconstructor?.value?.UM_STORE.getSelected('fasades')
})

watch(() => UMconstructor?.value?.UM_STORE.getSelected("fasades"), () => {
  selectedFasade.value = UMconstructor?.value?.UM_STORE.getSelected("fasades")
  selectedCell.value = UMconstructor?.value?.UM_STORE.getSelected("module")
  handleCellSelect()
})
</script>

<template>
  <div class="splitter-container--product">
    <div class="splitter-container--product-data" v-if="module">
      <section
          v-if="module.fasades"
          class="actions-wrapper"
      >
        <div :class="'actions-items--container'">
          <article class="actions-items actions-items--right">
            <div class="actions-items--right-items">
              <button
                  v-if="module.fasades.length < 4"
                  :class="['actions-btn actions-btn--default']"
                  @click="UMconstructor.FASADES.addSlideDoor(module.fasades.length + 1, module)"
              >
                Добавить дверь
              </button>

              <button
                  v-if="module.fasades.length > 2"
                  :class="['actions-btn actions-btn--default']"
                  @click="UMconstructor.FASADES.deleteSlideDoor(module.fasades.length, module)"
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
                { active: doorIndex === selectedFasade.cell },
              ]"
              v-for="(door, doorIndex) in module.fasades"
              :key="doorIndex"
              @click="showCurrentCol(null, doorIndex)"
          >
            <p
                class="actions-title actions-title--part"
            >
              Дверь №{{ doorIndex + 1 }}
            </p>
          </div>
        </div>

        <div
            v-for="(door, doorIndex) in module.fasades"
            :key="doorIndex"
            :class="'actions-container'"
            :id="`fasade_${doorIndex}_${doorIndex}`"
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
                  :id="`fasade_${doorIndex}_${segmentIndex}`"
              >
                <details
                    class="item-group"
                    :open="doorIndex === selectedFasade.cell && segmentIndex === selectedFasade.row"
                >
                  <summary>
                    <h3 class="item-group__title">
                      Сегмент №{{ doorIndex + 1
                      }}{{ door.length > 1 ? `.${segment.id/*segmentIndex + 1*/}` : "" }}
                    </h3>
                  </summary>

                  <div :class="'actions-items--container'">
                    <article class="actions-items actions-items--left">
                      <div class="actions-items--left-wrapper">
                        <div class="actions-items--width">
                          <div class="actions-inputs">
                            <p class="actions-title">Ширина</p>
                            <div :class="['actions-input--container']">
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
                            <p class="actions-title">Высота</p>
                            <div :class="['actions-input--container']">
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
                        <!--                        <button
                                                    v-if="!module.isRestrictedModule"
                                                    :class="['actions-btn actions-btn&#45;&#45;default']"
                                                    @click="UMconstructor.FASADES.splitFasade(null, doorIndex, segmentIndex)"
                                                >
                                                  Разделить фасад
                                                </button>-->

                        <button
                            v-if="door.length > 1 && UMconstructor.FASADES.checkRemoveFasadeSegment(null, doorIndex, segmentIndex, module)"
                            class="actions-btn actions-btn--default"
                            @click="
                              UMconstructor.FASADES.removeFasadeSegment(null, doorIndex, segmentIndex, module)
                            "
                        >
                          Удалить
                        </button>

                        <ConfigurationOption
                            v-if="!segment.error"
                            :disable-delete-choice="true"
                            :class="[
                                {
                                  active:
                                    currentFasadeMaterial.cell ===
                                      doorIndex &&
                                    currentFasadeMaterial.row ===
                                      segmentIndex,
                                },
                              ]"
                            :type="
                              segment.material.PALETTE ? 'palette' : 'surface'
                            "
                            :data="
                              segment.material.PALETTE
                                ? {
                                    ...UMconstructor.APP.PALETTE[segment.material.PALETTE],
                                    hex: UMconstructor.APP.PALETTE[segment.material.PALETTE]
                                      .HTML,
                                  }
                                : UMconstructor.APP.FASADE[segment.material.COLOR]
                            "
                            @click="
                              openFasadeSelector(null, doorIndex, segmentIndex)
                            "
                        />
                        <h class="splitter-container--product-error-message" v-else>Фасад некорректного размера!</h>

<!--                        <ConfigurationOption
                            v-if="!segment.error"
                            :disable-delete-choice="true"
                            :class="[
                                {
                                  active:
                                    currentHandle.cell ===
                                      doorIndex &&
                                    currentHandle.row ===
                                      segmentIndex,
                                },
                              ]"
                            :type="'Handles'"
                            :data="segment.material.HANDLES ? {...UMconstructor.APP.CATALOG.PRODUCTS[segment.material.HANDLES.id]} : false"
                            @click="
                              openHandleSelector(null, doorIndex, segmentIndex)
                            "
                        />-->

                      </div>
                    </article>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
          v-else
          class="actions-wrapper"
      >
        <div class="actions-header">
          <div
              :class="[
                'actions-header--container',
                { active: secIndex === selectedFasade.sec },
              ]"
              v-for="(section, secIndex) in module.sections"
              :key="secIndex"
              @click="showCurrentCol(secIndex)"
          >
            <p
                class="actions-title actions-title--part"
            >
              {{ secIndex + 1 }}
            </p>
          </div>
        </div>

        <div v-for="(section, secIndex) in module.sections" :key="secIndex" class="actions-items--wrapper">
          <div
              v-if="selectedFasade.sec === secIndex"
          >
            <div
                v-if="(!module.isHiTech || !module.profilesConfig?.sideProfile) && section.fasades.length < 2 && UMconstructor.FASADES.checkAddDoor(secIndex, section.fasades.length - 1, module)"
                :class="'actions-items--container'"
            >
              <article class="actions-items actions-items--right">
                <div class="actions-items--right-items">
                  <button
                      :class="['actions-btn actions-btn--default']"
                      @click="UMconstructor.FASADES.addDoor(secIndex, module)"
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
                :id="`fasade_${secIndex}_${doorIndex}`"
            >
              <div class="actions-header" v-if="door && Object.entries(door).length > 0">
                <div class="actions-header-column">
                  <div class="actions-header-row">
                    <button
                        v-if="!module.isRestrictedModule || (module.isRestrictedModule && section.fasades.length > 1)"
                        class="actions-btn actions-icon"
                        @click="UMconstructor.FASADES.deleteDoor(secIndex, doorIndex, module)"
                    >
                      <img
                          class="actions-icon--delete"
                          src="/icons/delite.svg"
                          alt=""
                      />
                    </button>
                    <p class="actions-title actions-title--part">Дверь №{{ doorIndex + 1 }}</p>
                  </div>
                  <p class="actions-title actions-title--part">Высота сегментов: {{UMconstructor.FASADES.calcSumHeightDoorSegmentes(secIndex, doorIndex, module)}}</p>
                  <p class="actions-title actions-title--part">Ширина: {{door?.[0]?.width}}</p>
                </div>
              </div>

              <div class="accordion">
                <div
                    v-for="(segment, segmentIndex) in door"
                    :key="segmentIndex"
                    :class="'actions-items--container'"
                    :id="`fasade_${secIndex}_${doorIndex}_${segmentIndex}`"
                >
                  <details
                      class="item-group"
                      :open="doorIndex === selectedFasade.cell && segmentIndex === selectedFasade.row"
                  >
                    <summary>
                      <h3 class="item-group__title">
                        Сегмент №{{ secIndex + 1 }}.{{ doorIndex + 1 }}.{{
                          segment.id/*segmentIndex + 1*/
                        }}
                      </h3>
                    </summary>

                    <div :class="'actions-items--container'">
                      <article class="actions-items actions-items--left">
                        <div class="actions-items--left-wrapper">
                          <div class="actions-items--width">
                            <div class="actions-inputs">
                              <p class="actions-title">Ширина</p>
                              <div :class="['actions-input--container']">
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
                              <p class="actions-title">Высота</p>
                              <div :class="['actions-input--container']">
                                <input
                                    type="number"
                                    :step="step"
                                    min="150"
                                    class="actions-input"
                                    :value="segment.height"
                                    :disabled="!UMconstructor.FASADES.checkRemoveFasadeSegment(secIndex,doorIndex,segmentIndex, module)"
                                    @input="
                                      UMconstructor.FASADES.updateFasadeHeight(
                                        $event.target.value,
                                        secIndex,
                                        doorIndex,
                                        segmentIndex,
                                        module
                                      )
                                    "
                                />
                              </div>
                            </div>
                          </div>

                          <div class="actions-items--selector" v-if="!module.isRestrictedModule">
                            <div class="actions-inputs">
                              <p class="actions-title">Сторона открывания</p>
                              <div>
                                <select
                                    style
                                    id="loopsSide"
                                    :value="segment.loopsSide"
                                    name="loopsSide"
                                    class="actions-input"
                                    @change="
                                      UMconstructor.FASADES.changeLoopside(
                                        secIndex,
                                        segment,
                                        $event.target.value,
                                        doorIndex,
                                        module
                                      )
                                    "
                                >
                                  <option
                                      v-for="(side, key) in UMconstructor.LOOPS.getLoopsideList(
                                        secIndex,
                                        doorIndex,
                                        module
                                      )"
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
                              v-if="!module.isRestrictedModule"
                              :class="['actions-btn actions-btn--default']"
                              @click="
                                UMconstructor.FASADES.splitFasade(secIndex, doorIndex, segmentIndex, module)
                              "
                          >
                            Разделить фасад
                          </button>

                          <button
                              v-if="door.length > 1 && UMconstructor.FASADES.checkRemoveFasadeSegment(secIndex, doorIndex, segmentIndex, module)"
                              class="actions-btn actions-btn--default"
                              @click="
                                UMconstructor.FASADES.removeFasadeSegment(
                                  secIndex,
                                  doorIndex,
                                  segmentIndex,
                                  module
                                )
                              "
                          >
                            Удалить
                          </button>

                          <ConfigurationOption
                              v-if="!segment.error"
                              :disable-delete-choice="true"
                              :class="[
                                {
                                  active:
                                    currentFasadeMaterial.sec ===
                                      secIndex &&
                                    currentFasadeMaterial.cell ===
                                      doorIndex &&
                                    currentFasadeMaterial.row ===
                                      segmentIndex,
                                },
                              ]"
                              :type="
                                segment.material.PALETTE ? 'palette' : 'surface'
                              "
                              :data="
                                segment.material.PALETTE
                                  ? {
                                      ...UMconstructor.APP.PALETTE[segment.material.PALETTE],
                                      hex: UMconstructor.APP.PALETTE[segment.material.PALETTE]
                                        .HTML,
                                    }
                                  : UMconstructor.APP.FASADE[segment.material.COLOR]
                              "
                              @click="
                                openFasadeSelector(
                                  secIndex,
                                  doorIndex,
                                  segmentIndex
                                )
                              "
                          />
                          <h class="splitter-container--product-error-message" v-else>Фасад некорректного размера!</h>

                          <ConfigurationOption
                              v-if="!segment.error"
                              :disable-delete-choice="true"
                              :class="[
                                {
                                  active:
                                    currentHandle.sec ===
                                      secIndex &&
                                    currentHandle.cell ===
                                      doorIndex &&
                                    currentHandle.row ===
                                      segmentIndex,
                                },
                              ]"
                              :type="'Handles'"
                              :data="segment.material.HANDLES ? {...UMconstructor.APP.CATALOG.PRODUCTS[segment.material.HANDLES.id]} : false"
                              @click="
                              openHandleSelector(secIndex, doorIndex, segmentIndex)
                            "
                          />
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

  <transition name="slide--right" mode="out-in">
    <div class="no-select color--right-select" v-if="isOpenMaterialSelector || isOpenHandleSelector" key="color--right-select">
      <ClosePopUpButton class="menu__close" @close="closeMenu()" />

      <AdvanceCorpusMaterialRedactor
          v-if="isOpenMaterialSelector"
          :is-fasade="true"
          :elementData="currentFasadeMaterial.data"
          :elementIndex="currentFasadeMaterial.row"
          :fasade-size="currentFasadeSize"
          @parent-callback="selectOption"
      />

      <Handles
          v-else
          :is2-dconstructor="true"
          :data="createSurfaceList(currentHandle)"
          :index="0"
          @parent-callback="selectHandle"
          :active-pos="currentHandle.data.HANDLES.position"
      />
    </div>
  </transition>
</template>

<style scoped lang="scss">
.accordion {
  border: unset;
}
</style>
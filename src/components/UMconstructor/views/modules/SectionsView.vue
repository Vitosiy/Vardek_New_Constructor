<script setup lang="ts">
//@ts-nocheck

import "@/components/UMconstructor/styles/UM.scss"

import CounterInput from "@/components/ui/inputs/CounterInput.vue";
import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import {onBeforeUnmount, onMounted, ref, toRefs, watch} from "vue";
import {TSelectedCell, GridModule, BacklightItem} from "@/components/UMconstructor/types/UMtypes.ts";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import Toggle from "@vueform/toggle";
import AdvanceCorpusMaterialRedactor from "@/components/ui/color/AdvanceCorpusMaterialRedactor.vue";
import HiTechSideprofile from "@/components/right-menu/customiser-pages/HiTechProfilePage/HiTechSideprofile.vue";
import CorpusMaterialRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/CorpusMaterialRedactor.vue";
import Handles from "@/components/right-menu/customiser-pages/FigureRightPage/Handles/Handles.vue";
import BacklightMenu from "@/components/UMconstructor/views/modules/BacklightMenu.vue";

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
const selectedCell = ref<TSelectedCell>(<TSelectedCell>{})
const step = ref<number>(1)

const isOpenBacklightMenu = ref<boolean>(false);
const currentBacklight = ref<BacklightItem | boolean>(false)

const showCurrentCol = (secIndex: number | null = 0, cellIndex: number | null = null, rowIndex: number | null = null, extraIndex: number | null = null) => {
  UMconstructor?.value?.SECTIONS.selectCell(secIndex, cellIndex, rowIndex, extraIndex);
};

const handleCellSelect = () => {
  const {sec, cell, row, extra} = selectedCell.value;

  //Задержка нужна для того, чтоб рендер аккордионов обновился
  UMconstructor?.value?.debounce("handleCellSelectSection", () => {
    let idTag = `module_${sec}`

    if (cell !== null)
      idTag += `_${cell}`;

    if (row !== null)
      idTag += `_${row}`

    if (extra !== null)
      idTag += `_${extra}`;

    let domElem = document.getElementById(idTag)
    if (domElem) {
      domElem.scrollIntoView();
    }
  }, 10)

};

const openBacklightMenu = (status: boolean, selectedCell: TSelectedCell) => {
  isOpenBacklightMenu.value = status;

  if (isOpenBacklightMenu.value && selectedCell) {
    let currentCell = UMconstructor?.value?.getCurrenGridData(module.value, selectedCell)

    if(currentCell) {
      if(currentCell.backlight)
        currentBacklight.value = currentCell.backlight
    }
  }
  else
    currentBacklight.value = false
}

const panelRef = ref<HTMLElement | null>(null);
const handleOutsideClick = (event: MouseEvent) => {
  // Закрываем только когда попап реально открыт
  if (!isOpenBacklightMenu.value) return;

  const panel = panelRef.value;
  if (!panel)
    return;

  const target = event.target;
  if (!(target instanceof Node)) return;

  // Клик внутри окна - ничего не делаем
  if (panel.contains(target)) return;

  closeMenu();
};

const closeMenu = () => {
  isOpenBacklightMenu.value = false;
};

watch(() => UMconstructor?.value?.UM_STORE.getSelected('module'), () => {
  selectedCell.value = UMconstructor?.value?.UM_STORE.getSelected('module')
  handleCellSelect()
})

onMounted(() => {
  selectedCell.value = UMconstructor?.value?.UM_STORE.getSelected('module')
  document.addEventListener("click", handleOutsideClick);
})
onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
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
              :id="`module_${secIndex}`"
              @click="showCurrentCol(secIndex)"
          >
            <button
                v-if="module.sections.length > 1"
                class="actions-btn actions-icon"
                @click="UMconstructor.SECTIONS.deleteSection(module, secIndex, true)"
            >
              <img
                  class="actions-icon--delete"
                  src="/icons/delite.svg"
                  alt=""
              />
            </button>
            <p
                class="actions-title actions-title--part"
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
            <div class="accordion" v-if="section.cells.length">

              <div
                  v-if="!module.isHiTech && (!module.isRestrictedModule || (module.isRestrictedModule && module.sections.length < 2))"
                  class="actions-items--right-items actions-header actions-items--right-items-input-block"
              >
                <CounterInput
                    button-text="Добавить секцию"
                    model-value="1"
                    max="10"
                    min="1"
                    input-class="actions-items--right-items-input-block-counter"
                    button-class="actions-btn actions-btn--default actions-items--right-items-input-block-button"
                    type="number"
                    @update:model-value="(count: number|string) => {
                        UMconstructor.SECTIONS.addSection({grid: module, secIndex, count: parseInt(count), reset: true})
                      }"
                />
              </div>

              <div class="actions-header">
                <p>Ячейки</p>
              </div>

              <div
                  v-for="(cell, cellIndex) in section.cells"
                  :key="cellIndex"
                  :class="'actions-items--container'"
                  :id="`module_${secIndex}_${cellIndex}`"
              >
                <details
                    class="item-group"
                    :open="cellIndex === selectedCell.cell"
                >

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
                                  :min="UMconstructor.CONST.MIN_SECTION_WIDTH"
                                  :max="UMconstructor.CONST.MAX_SECTION_WIDTH"
                                  class="actions-input"
                                  :value="section.width"
                                  :disabled="module.sections.length < 2"
                                  @input="UMconstructor.SECTIONS.updateSectionWidth({
                                    grid: module,
                                    secIndex,
                                    value: $event?.target?.value || UMconstructor.CONST.MIN_SECTION_WIDTH
                                  })"
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
                                  :min="UMconstructor.CONST.MIN_SECTION_HEIGHT"
                                  :max="section.height - UMconstructor.CONST.MIN_SECTION_HEIGHT"
                                  class="actions-input"
                                  :value="cell.height"
                                  @input="UMconstructor.SECTIONS.updateCellHeight({
                                    grid: module,
                                    secIndex,
                                    cellIndex,
                                    value: $event?.target?.value || UMconstructor.CONST.MIN_SECTION_HEIGHT
                                  })"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </article>

                    <article class="actions-items actions-items--right">
                      <div class="actions-items--right-items">

                        <div
                            v-if="!cell.cellsRows?.length"
                            class="actions-items--right-items-input-block"
                        >
                          <CounterInput
                              button-text="Добавить полку"
                              model-value="1"
                              max="10"
                              min="1"
                              input-class="actions-items--right-items-input-block-counter"
                              button-class="actions-btn actions-btn--default actions-items--right-items-input-block-button"
                              type="number"
                              @update:model-value="(count: number|string) => {
                                UMconstructor.SECTIONS.addCell({grid: module, secIndex, cellIndex, count: parseInt(count)})
                              }"
                          />
                        </div>

                        <div
                            v-if="!cell.cellsRows?.length && !module.isRestrictedModule"
                            class="actions-items--right-items-input-block"
                        >
                          <CounterInput
                              button-text="Верт. разделитель"
                              model-value="1"
                              max="10"
                              min="1"
                              input-class="actions-items--right-items-input-block-counter"
                              button-class="actions-btn actions-btn--default actions-items--right-items-input-block-button"
                              type="number"
                              @update:model-value="(count: number|string) => {
                                UMconstructor.SECTIONS.addRowCell({grid: module, secIndex, cellIndex, rowIndex: 0, count: parseInt(count)})
                              }"
                          />
                        </div>

                        <button
                            v-if="section.cells.length > 1"
                            class="actions-btn actions-btn--default"
                            @click="UMconstructor.SECTIONS.deleteCell(module, secIndex, cellIndex)"
                        >
                          Удалить
                        </button>

                      </div>
                    </article>
                  </div>

                  <button
                      class="actions-btn actions-btn--default backlight-btn"
                      @click.stop="() => {
                        let selected = <TSelectedCell>{sec: secIndex, cell: cellIndex}
                        UMconstructor.selectCell('module', selected)
                        openBacklightMenu(!isOpenBacklightMenu, selected)
                      }"
                  >
                    Подсветка
                  </button>

                  <div class="accordion" v-if="cell.cellsRows?.length">
                    <div class="actions-header">
                      <p>Вертикальные ячейки</p>
                    </div>

                    <div
                        v-for="(row, rowIndex) in cell.cellsRows"
                        :key="rowIndex"
                        :class="'actions-items--container'"
                        :id="`module_${secIndex}_${cellIndex}_${rowIndex}`"

                    >
                      <details
                          class="item-group"
                          :open="rowIndex === selectedCell.row"
                      >
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
                                        :min="UMconstructor.CONST.MIN_SECTION_WIDTH"
                                        :max="cell.width - UMconstructor.CONST.MIN_SECTION_WIDTH"
                                        class="actions-input"
                                        :value="row.width"
                                        @input="UMconstructor.SECTIONS.updateCellRowWidth({
                                          grid: module,
                                          secIndex,
                                          cellIndex,
                                          rowIndex,
                                          value: $event?.target?.value || UMconstructor.CONST.MIN_SECTION_WIDTH
                                        })"
                                    />
                                  </div>
                                </div>
                              </div>

                            </div>
                          </article>

                          <article
                              v-if="!module.isRestrictedModule"
                              class="actions-items actions-items--right"
                          >
                            <div class="actions-items--right-items">

                              <div
                                  class="actions-items--right-items-input-block"
                              >
                                <CounterInput
                                    button-text="Верт. разделитель"
                                    model-value="1"
                                    max="10"
                                    min="1"
                                    input-class="actions-items--right-items-input-block-counter"
                                    button-class="actions-btn actions-btn--default actions-items--right-items-input-block-button"
                                    type="number"
                                    @update:model-value="(count: number|string) => {
                                          UMconstructor.SECTIONS.addRowCell({grid: module, secIndex, cellIndex, rowIndex, count: parseInt(count)})
                                    }"
                                />
                              </div>

                              <div
                                  v-if="!row.extras?.length"
                                  class="actions-items--right-items-input-block"
                              >
                                <CounterInput
                                    button-text="Полка"
                                    model-value="1"
                                    max="10"
                                    min="1"
                                    input-class="actions-items--right-items-input-block-counter"
                                    button-class="actions-btn actions-btn--default actions-items--right-items-input-block-button"
                                    type="number"
                                    @update:model-value="(count: number|string) => {
                                          UMconstructor.SECTIONS.addRowExtra({grid: module, secIndex, cellIndex, rowIndex, extraIndex: 0, count: parseInt(count)})
                                    }"
                                />
                              </div>

                              <button
                                  v-if="cell.cellsRows.length > 1"
                                  class="actions-btn actions-btn--default"
                                  @click="UMconstructor.SECTIONS.deleteRowCell(module, secIndex, cellIndex, rowIndex)"
                              >
                                Удалить
                              </button>

                            </div>
                          </article>
                        </div>

                        <div class="accordion" v-if="row.extras?.length">
                          <div class="actions-header">
                            <p>Горизонтальные ячейки</p>
                          </div>

                          <div
                              v-for="(extra, extraIndex) in row.extras"
                              :key="extraIndex"
                              :class="'actions-items--container'"
                              :id="`module_${secIndex}_${cellIndex}_${rowIndex}_${extraIndex}`"

                          >
                            <details
                                class="item-group"
                                :open="extraIndex === selectedCell.extra"
                            >
                              <summary>
                                <h3 class="item-group__title">
                                  {{ secIndex + 1 }}.{{ cellIndex + 1 }}.{{ rowIndex + 1 }}.{{ extraIndex + 1 }}
                                </h3>
                              </summary>

                              <div
                                  :class="'actions-items--container'"
                              >
                                <article class="actions-items actions-items--left">
                                  <div class="actions-items--left-wrapper">

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
                                              :min="UMconstructor.CONST.MIN_SECTION_HEIGHT"
                                              :max="row.height - UMconstructor.CONST.MIN_SECTION_HEIGHT"
                                              class="actions-input"
                                              :value="extra.height"
                                              @input="UMconstructor.SECTIONS.updateExtraHeight({
                                                grid: module,
                                                secIndex,
                                                cellIndex,
                                                rowIndex,
                                                extraIndex,
                                                value: $event?.target?.value || UMconstructor.CONST.MIN_SECTION_HEIGHT
                                              })"
                                          />
                                        </div>
                                      </div>
                                    </div>

                                  </div>
                                </article>

                                <article
                                    v-if="!module.isRestrictedModule"
                                    class="actions-items actions-items--right"
                                >
                                  <div class="actions-items--right-items">

                                    <div
                                        class="actions-items--right-items-input-block"
                                    >
                                      <CounterInput
                                          button-text="Полка"
                                          model-value="1"
                                          max="10"
                                          min="1"
                                          input-class="actions-items--right-items-input-block-counter"
                                          button-class="actions-btn actions-btn--default actions-items--right-items-input-block-button"
                                          type="number"
                                          @update:model-value="(count: number|string) => {
                                            UMconstructor.SECTIONS.addRowExtra({grid: module, secIndex, cellIndex, rowIndex, extraIndex, count: parseInt(count)})
                                          }"
                                      />
                                    </div>

                                    <button
                                        v-if="cell.cellsRows.length > 1"
                                        class="actions-btn actions-btn--default"
                                        @click="UMconstructor.SECTIONS.deleteRowExtra(module, secIndex, cellIndex, rowIndex, extraIndex)"
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

                </details>
              </div>
            </div>
            <div
                v-else
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
                            :min="UMconstructor.CONST.MIN_SECTION_WIDTH"
                            :max="UMconstructor.CONST.MAX_SECTION_WIDTH"
                            class="actions-input"
                            :value="section.width"
                            :disabled="module.sections.length < 2"
                            @input="
                              UMconstructor.SECTIONS.updateSectionWidth({
                                grid: module,
                                secIndex,
                                value: $event?.target?.value || UMconstructor.CONST.MIN_SECTION_WIDTH
                              })
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
                            :min="UMconstructor.CONST.MIN_SECTION_HEIGHT"
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

                  <div
                      v-if="!module.isHiTech && (!module.isRestrictedModule || (module.isRestrictedModule && module.sections.length < 2))"
                      class="actions-items--right-items-input-block"
                  >
                    <CounterInput
                        button-text="Добавить секцию"
                        model-value="1"
                        max="10"
                        min="1"
                        input-class="actions-items--right-items-input-block-counter"
                        button-class="actions-btn actions-btn--default actions-items--right-items-input-block-button"
                        type="number"
                        @update:model-value="(count: number|string) => {
                            UMconstructor.SECTIONS.addSection({grid: module, secIndex, count: parseInt(count), reset: true})
                          }"
                    />
                  </div>

                  <div
                      v-if="!section.cells.length"
                      class="actions-items--right-items-input-block"
                  >
                    <CounterInput
                        button-text="Добавить полку"
                        model-value="1"
                        max="10"
                        min="1"
                        input-class="actions-items--right-items-input-block-counter"
                        button-class="actions-btn actions-btn--default actions-items--right-items-input-block-button"
                        type="number"
                        @update:model-value="(count: number|string) => {
                            UMconstructor.SECTIONS.addCell({grid: module, secIndex, cellIndex: null, count: parseInt(count)})
                          }"
                    />
                  </div>

                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <transition name="slide--right" mode="out-in">
    <div
        class="no-select color--right-select"
        v-if="isOpenBacklightMenu"
        key="color--right-select"
        ref="panelRef"
    >
      <ClosePopUpButton class="menu__close" @close="closeMenu"/>
      <h1 class="color__title">Подсветка</h1>

      <BacklightMenu
          :module="module"
          :current-backlight="currentBacklight"
          :UMconstructor="UMconstructor"
      />
    </div>
  </transition>

</template>

<style scoped lang="scss">
.backlight-btn{
  margin: 1rem;
}
</style>
<script setup lang="ts">
//@ts-nocheck

import "@/components/UMconstructor/styles/UM.scss"

import CounterInput from "@/components/ui/inputs/CounterInput.vue";
import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import {onMounted, ref, toRefs} from "vue";
import {TSelectedCell, GridModule} from "@/components/UMconstructor/types/UMtypes.ts";

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

const showCurrentCol = (secIndex: number | null = 0, cellIndex: number|null = null, rowIndex: number|null = null, extraIndex: number | null = null) => {
  UMconstructor?.value?.SECTIONS.selectCell(secIndex, cellIndex, rowIndex, extraIndex);
};

onMounted(() => {
  selectedCell.value = UMconstructor?.value?.UM_STORE.getSelected('module')
})
</script>

<template>
  <div class="splitter-sections-container--product">
    <div class="splitter-sections-container--product-data" v-if="module">
      <section class="actions-sections-wrapper">

        <div class="actions-sections-header">
          <div
              :class="[
              'actions-sections-header--container',
              { active: secIndex === selectedCell.sec },
            ]"
              v-for="(section, secIndex) in module.sections"
              :key="secIndex"
              :id="`module_${secIndex}`"
          >
            <button
                v-if="module.sections.length > 1"
                class="actions-sections-btn actions-sections-icon"
                @click="UMconstructor.SECTIONS.deleteSection(module, secIndex)"
            >
              <img
                  class="actions-sections-icon--delete"
                  src="/icons/delite.svg"
                  alt=""
              />
            </button>
            <p
                class="actions-sections-title actions-sections-title--part"
                @click="showCurrentCol(secIndex)"
            >
              {{ secIndex + 1 }}
            </p>
          </div>
        </div>

        <div
            class="actions-sections-container"
            v-for="(section, secIndex) in module.sections"
            :key="secIndex"
        >
          <div
              class="actions-sections-items--wrapper"
              v-if="selectedCell.sec === secIndex"
          >
            <div class="accordion-sections" v-if="section.cells.length">

              <div class="actions-sections-header">
                <p>Ячейки</p>
              </div>

              <div
                  v-for="(cell, cellIndex) in section.cells"
                  :key="cellIndex"
                  :class="'actions-sections-items--container'"
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
                      :class="'actions-sections-items--container'"
                  >
                    <article class="actions-sections-items actions-sections-items--left">
                      <div class="actions-sections-items--left-wrapper">

                        <div class="actions-sections-items--width">
                          <div class="actions-sections-inputs">
                            <p class="actions-sections-title">Ширина</p>
                            <div
                                :class="['actions-sections-input--container']"
                            >
                              <input
                                  type="number"
                                  :step="step"
                                  :min="UMconstructor.CONST.MIN_SECTION_WIDTH"
                                  :max="UMconstructor.CONST.MAX_SECTION_WIDTH"
                                  class="actions-sections-input"
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

                        <div class="actions-sections-items--height">
                          <div class="actions-sections-inputs">
                            <p class="actions-sections-title">
                              Высота
                            </p>
                            <div
                                :class="['actions-sections-input--container']"
                            >
                              <input
                                  type="number"
                                  :step="step"
                                  :min="UMconstructor.CONST.MIN_SECTION_HEIGHT"
                                  :max="section.height - UMconstructor.CONST.MIN_SECTION_HEIGHT"
                                  class="actions-sections-input"
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

                    <article class="actions-sections-items actions-sections-items--right">
                      <div class="actions-sections-items--right-items">

                        <div
                            v-if="!cell.cellsRows?.length"
                            class="actions-sections-items--right-items-input-block"
                        >
                          <CounterInput
                              button-text="Добавить полку"
                              model-value="1"
                              max="10"
                              min="1"
                              input-class="actions-sections-items--right-items-input-block-counter"
                              button-class="actions-sections-btn actions-sections-btn--default actions-sections-items--right-items-input-block-button"
                              type="number"
                              @update:model-value="(count: number|string) => {
                                UMconstructor.SECTIONS.addCell({grid: module, secIndex, cellIndex, count: parseInt(count)})
                              }"
                          />
                        </div>

                        <div
                            v-if="!cell.cellsRows?.length && !module.isRestrictedModule"
                            class="actions-sections-items--right-items-input-block"
                        >
                          <CounterInput
                              button-text="Верт. разделитель"
                              model-value="1"
                              max="10"
                              min="1"
                              input-class="actions-sections-items--right-items-input-block-counter"
                              button-class="actions-sections-btn actions-sections-btn--default actions-sections-items--right-items-input-block-button"
                              type="number"
                              @update:model-value="(count: number|string) => {
                                UMconstructor.SECTIONS.addRowCell({grid: module, secIndex, cellIndex, rowIndex: 0, count: parseInt(count)})
                              }"
                          />
                        </div>

                        <button
                            v-if="section.cells.length > 1"
                            class="actions-sections-btn actions-sections-btn--default"
                            @click="UMconstructor.SECTIONS.deleteCell(module, secIndex, cellIndex)"
                        >
                          Удалить
                        </button>

                      </div>
                    </article>
                  </div>

                  <div class="accordion-sections" v-if="cell.cellsRows?.length">
                    <div class="actions-sections-header">
                      <p>Вертикальные ячейки</p>
                    </div>

                    <div
                        v-for="(row, rowIndex) in cell.cellsRows"
                        :key="rowIndex"
                        :class="'actions-sections-items--container'"
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
                            :class="'actions-sections-items--container'"
                        >
                          <article class="actions-sections-items actions-sections-items--left">
                            <div class="actions-sections-items--left-wrapper">

                              <div class="actions-sections-items--width">
                                <div class="actions-sections-inputs">
                                  <p class="actions-sections-title">Ширина</p>
                                  <div
                                      :class="['actions-sections-input--container']"
                                  >
                                    <input
                                        type="number"
                                        :step="step"
                                        :min="UMconstructor.CONST.MIN_SECTION_WIDTH"
                                        :max="cell.width - UMconstructor.CONST.MIN_SECTION_WIDTH"
                                        class="actions-sections-input"
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
                              class="actions-sections-items actions-sections-items--right"
                          >
                            <div class="actions-sections-items--right-items">

                              <div
                                  class="actions-sections-items--right-items-input-block"
                              >
                                <CounterInput
                                    button-text="Верт. разделитель"
                                    model-value="1"
                                    max="10"
                                    min="1"
                                    input-class="actions-sections-items--right-items-input-block-counter"
                                    button-class="actions-sections-btn actions-sections-btn--default actions-sections-items--right-items-input-block-button"
                                    type="number"
                                    @update:model-value="(count: number|string) => {
                                          UMconstructor.SECTIONS.addRowCell({grid: module, secIndex, cellIndex, rowIndex, count: parseInt(count)})
                                    }"
                                />
                              </div>

                              <div
                                  v-if="!row.extras?.length"
                                  class="actions-sections-items--right-items-input-block"
                              >
                                <CounterInput
                                    button-text="Полка"
                                    model-value="1"
                                    max="10"
                                    min="1"
                                    input-class="actions-sections-items--right-items-input-block-counter"
                                    button-class="actions-sections-btn actions-sections-btn--default actions-sections-items--right-items-input-block-button"
                                    type="number"
                                    @update:model-value="(count: number|string) => {
                                          UMconstructor.SECTIONS.addRowExtra({grid: module, secIndex, cellIndex, rowIndex, extraIndex: 0, count: parseInt(count)})
                                    }"
                                />
                              </div>

                              <button
                                  v-if="cell.cellsRows.length > 1"
                                  class="actions-sections-btn actions-sections-btn--default"
                                  @click="UMconstructor.SECTIONS.deleteRowCell(module, secIndex, cellIndex, rowIndex)"
                              >
                                Удалить
                              </button>

                            </div>
                          </article>
                        </div>

                        <div class="accordion-sections" v-if="row.extras?.length">
                          <div class="actions-sections-header">
                            <p>Горизонтальные ячейки</p>
                          </div>

                          <div
                              v-for="(extra, extraIndex) in row.extras"
                              :key="extraIndex"
                              :class="'actions-sections-items--container'"
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
                                  :class="'actions-sections-items--container'"
                              >
                                <article class="actions-sections-items actions-sections-items--left">
                                  <div class="actions-sections-items--left-wrapper">

                                    <div class="actions-sections-items--height">
                                      <div class="actions-sections-inputs">
                                        <p class="actions-sections-title">
                                          Высота
                                        </p>
                                        <div
                                            :class="['actions-sections-input--container']"
                                        >
                                          <input
                                              type="number"
                                              :step="step"
                                              :min="UMconstructor.CONST.MIN_SECTION_HEIGHT"
                                              :max="row.height - UMconstructor.CONST.MIN_SECTION_HEIGHT"
                                              class="actions-sections-input"
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
                                    class="actions-sections-items actions-sections-items--right"
                                >
                                  <div class="actions-sections-items--right-items">

                                    <div
                                        class="actions-sections-items--right-items-input-block"
                                    >
                                      <CounterInput
                                          button-text="Полка"
                                          model-value="1"
                                          max="10"
                                          min="1"
                                          input-class="actions-sections-items--right-items-input-block-counter"
                                          button-class="actions-sections-btn actions-sections-btn--default actions-sections-items--right-items-input-block-button"
                                          type="number"
                                          @update:model-value="(count: number|string) => {
                                            UMconstructor.SECTIONS.addRowExtra({grid: module, secIndex, cellIndex, rowIndex, extraIndex, count: parseInt(count)})
                                          }"
                                      />
                                    </div>

                                    <button
                                        v-if="cell.cellsRows.length > 1"
                                        class="actions-sections-btn actions-sections-btn--default"
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
                :class="'actions-sections-items--container'"
            >
              <article class="actions-sections-items actions-sections-items--left">
                <div class="actions-sections-items--left-wrapper">

                  <div class="actions-sections-items--width">
                    <div class="actions-sections-inputs">
                      <p class="actions-sections-title">Ширина</p>
                      <div
                          :class="['actions-sections-input--container']"
                      >
                        <input
                            type="number"
                            :step="step"
                            :min="UMconstructor.CONST.MIN_SECTION_WIDTH"
                            :max="UMconstructor.CONST.MAX_SECTION_WIDTH"
                            class="actions-sections-input"
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

                  <div class="actions-sections-items--height">
                    <div class="actions-sections-inputs">
                      <p class="actions-sections-title">
                        Высота
                      </p>
                      <div
                          :class="['actions-sections-input--container']"
                      >
                        <input
                            type="number"
                            :step="step"
                            :min="UMconstructor.CONST.MIN_SECTION_HEIGHT"
                            class="actions-sections-input"
                            :value="section.height"
                            disabled
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </article>

              <article class="actions-sections-items actions-sections-items--right">
                <div
                    class="actions-sections-items--right-items"
                    v-if="secIndex == selectedCell.sec"
                >

                  <div
                      v-if="!module.isHiTech && (!module.isRestrictedModule || (module.isRestrictedModule && module.sections.length < 2))"
                      class="actions-sections-items--right-items-input-block"
                  >
                    <CounterInput
                        button-text="Добавить секцию"
                        model-value="1"
                        max="10"
                        min="1"
                        input-class="actions-sections-items--right-items-input-block-counter"
                        button-class="actions-sections-btn actions-sections-btn--default actions-sections-items--right-items-input-block-button"
                        type="number"
                        @update:model-value="(count: number|string) => {
                            UMconstructor.SECTIONS.addSection({grid: module, secIndex, count: parseInt(count)})
                          }"
                    />
                  </div>

                  <div
                      v-if="!section.cells.length"
                      class="actions-sections-items--right-items-input-block"
                  >
                    <CounterInput
                        button-text="Добавить полку"
                        model-value="1"
                        max="10"
                        min="1"
                        input-class="actions-sections-items--right-items-input-block-counter"
                        button-class="actions-sections-btn actions-sections-btn--default actions-sections-items--right-items-input-block-button"
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
</template>

<style scoped lang="scss">

</style>
<script setup lang="ts">

import ConfigurationOption from "@/components/right-menu/customiser-pages/ColorRightPage/ConfigurationOption.vue";
import AdvanceCorpusMaterialRedactor from "@/components/ui/color/AdvanceCorpusMaterialRedactor.vue";
import Handles from "@/components/right-menu/customiser-pages/FigureRightPage/Handles/Handles.vue";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import {ref, toRefs, onMounted} from "vue";
import {TSelectedCell} from "@/components/UMconstructor/types/UMtypes.ts";

const props = defineProps({
  module: {
    type: Object,
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
const step = ref<number>(1)

const showCurrentCol = (secIndex: number | null = 0, cellIndex: number|null = null, rowIndex: number|null = null) => {
  UMconstructor?.value?.FASADES.selectCell(secIndex, cellIndex, rowIndex);
};

onMounted(() => {
  selectedFasade.value = UMconstructor?.value?.UM_STORE.getSelected('fasades')
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
                  @click="UMconstructor.FASADES.addSlideDoor(module.fasades.length + 1)"
              >
                Добавить дверь
              </button>

              <button
                  v-if="module.fasades.length > 2"
                  :class="['actions-btn actions-btn--default']"
                  @click="UMconstructor.FASADES.deleteSlideDoor(module.fasades.length)"
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
                                                    @click="splitFasade(null, doorIndex, segmentIndex)"
                                                >
                                                  Разделить фасад
                                                </button>-->

                        <button
                            v-if="door.length > 1 && UMconstructor.FASADES.checkRemoveFasadeSegment(null, doorIndex, segmentIndex)"
                            class="actions-btn actions-btn--default"
                            @click="
                              UMconstructor.FASADES.removeFasadeSegment(null, doorIndex, segmentIndex)
                            "
                        >
                          Удалить
                        </button>

                        <ConfigurationOption
                            v-if="!segment.error"
                            :class="[
                                {
                                  active:
                                    currentFasadeMaterial.doorIndex ===
                                      doorIndex &&
                                    currentFasadeMaterial.segmentIndex ===
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

                        <ConfigurationOption
                            v-if="!segment.error"
                            :class="[
                                {
                                  active:
                                    currentHandle.doorIndex ===
                                      doorIndex &&
                                    currentHandle.segmentIndex ===
                                      segmentIndex,
                                },
                              ]"
                            :type="'Handles'"
                            :data="segment.material.HANDLES ? {...APP.CATALOG.PRODUCTS[segment.material.HANDLES.id]} : false"
                            @click="
                              openHandleSelector(null, doorIndex, segmentIndex)
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
          >
            <p
                class="actions-title actions-title--part"
                @click="showCurrentCol(secIndex)"
            >
              {{ secIndex + 1 }}
            </p>
          </div>
        </div>

        <div v-for="(section, secIndex) in module.sections" :key="secIndex">
          <div
              class="actions-items--wrapper"
              v-if="selectedFasade.sec === secIndex"
          >
            <div
                v-if="(!module.isHiTech || !module.profilesConfig?.sideProfile) && section.fasades.length < 2 && checkAddDoor(secIndex, section.fasades.length - 1)"
                :class="'actions-items--container'"
            >
              <article class="actions-items actions-items--right">
                <div class="actions-items--right-items">
                  <button
                      :class="['actions-btn actions-btn--default']"
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
                :id="`fasade_${secIndex}_${doorIndex}`"
            >
              <div class="actions-header">
                <button
                    v-if="!module.isRestrictedModule || (module.isRestrictedModule && section.fasades.length > 1)"
                    class="actions-btn actions-icon"
                    @click="deleteDoor(secIndex, doorIndex)"
                >
                  <img
                      class="actions-icon--delete"
                      src="/icons/delite.svg"
                      alt=""
                  />
                </button>
                <p class="actions-title actions-title--part">Дверь №{{ doorIndex + 1 }}</p>
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
                                    :disabled="!checkRemoveFasadeSegment(secIndex,doorIndex,segmentIndex)"
                                    @input="
                                      debounce(
                                        () =>
                                          updateFasadeHeight(
                                          $event.target.value,
                                          secIndex,
                                          doorIndex,
                                          segmentIndex
                                          ),
                                        1000
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
                                      changeLoopside(
                                        secIndex,
                                        segment,
                                        $event.target.value,
                                        doorIndex
                                      )
                                    "
                                >
                                  <option
                                      v-for="(side, key) in getLoopsideList(
                                        secIndex,
                                        doorIndex
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
                                splitFasade(secIndex, doorIndex, segmentIndex)
                              "
                          >
                            Разделить фасад
                          </button>

                          <button
                              v-if="door.length > 1 && checkRemoveFasadeSegment(secIndex, doorIndex, segmentIndex)"
                              class="actions-btn actions-btn--default"
                              @click="
                                removeFasadeSegment(
                                  secIndex,
                                  doorIndex,
                                  segmentIndex
                                )
                              "
                          >
                            Удалить
                          </button>

                          <ConfigurationOption
                              v-if="!segment.error"
                              :class="[
                                {
                                  active:
                                    currentFasadeMaterial.secIndex ===
                                      secIndex &&
                                    currentFasadeMaterial.doorIndex ===
                                      doorIndex &&
                                    currentFasadeMaterial.segmentIndex ===
                                      segmentIndex,
                                },
                              ]"
                              :type="
                                segment.material.PALETTE ? 'palette' : 'surface'
                              "
                              :data="
                                segment.material.PALETTE
                                  ? {
                                      ...APP.PALETTE[segment.material.PALETTE],
                                      hex: APP.PALETTE[segment.material.PALETTE]
                                        .HTML,
                                    }
                                  : APP.FASADE[segment.material.COLOR]
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
                              :data="segment.material.HANDLES ? {...APP.CATALOG.PRODUCTS[segment.material.HANDLES.id]} : false"
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
    <div class="no-select color-select" v-if="isOpenMaterialSelector || isOpenHandleSelector" key="color-select">
      <ClosePopUpButton class="menu__close" @close="closeMenu()" />

      <AdvanceCorpusMaterialRedactor
          v-if="isOpenMaterialSelector"
          :is-fasade="true"
          :elementData="currentFasadeMaterial.data"
          :elementIndex="currentFasadeMaterial.segmentIndex"
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

</style>
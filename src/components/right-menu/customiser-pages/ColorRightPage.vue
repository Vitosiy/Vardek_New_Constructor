<script lang="ts" setup>
/**/ / @ts-nocheck 31 */;

import { ref, watch, onMounted, computed } from "vue";
import { _URL } from "@/types/constants";

import MainButton from "@/components/ui/buttons/MainButton.vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
import defaultTab from "@/components/ui/tabs/defaultTab.vue";

import { useEventBus } from "@/store/appliction/useEventBus";
import { useObjectData } from "@/store/appliction/useObjectData";
import { useAppData } from "@/store/appliction/useAppData";

import { useModelState } from "@/store/appliction/useModelState";

const eventBus = useEventBus();
const objectData = useObjectData().getObjectData;
const _APP = useAppData().getAppData;
const _FASADE = _APP.FASADE;
const _MILLING = _APP.MILLING;

/** Состояния выбранной модели */
const modelState = useModelState();

const productColor = ref<{ [key: string]: any }>({});

const сolorPage = ref<string>("korp");

const currentFasade = ref<number>(0);

const showPalette = ref<boolean>(false);

const paletteColorsData = ref<{ [key: string]: any }>({});

/** Доступные модели фасадов для продукта */
const productFasades = ref<{ [key: string]: any }>({});
/**  Список типов FASADE для фасалдов модели */
const fasades = ref<{ [key: string]: any }>({});

/**------------------------------ */
/** Текущий фасад */
const currentFasadeId = ref<{ [key: string]: any }>({});
const selectedFasade = ref<number | null>(null);
const tabsList = ref<any[]>([]);

const selectPalette = ref<any>(null);
const selectGlass = ref<any>(null);
const selectMilling = ref<any>(null);

/**------------------------------ */

onMounted(() => {
  productColor.value = objectData.PROPS.CONFIG.MODULE_COLOR_LIST;

  productFasades.value = objectData?.PROPS.CONFIG.FASADE_PROPS;

  fasades.value = modelState.getCurrentModelFasadesData;

  createTabList(productFasades.value);
});

// Обработка события изменения таба
const handleTabChange = (newTab: string) => {
  console.log("Selected Tab:", newTab);
};
/* ------------------------------- */

const createTabList = (fasadsCount) => {
  let data = [
    {
      name: "Корпус",
      label: "Корпус",
      title: "Цвет корпуса",
      contant: productColor.value,
    },
  ];

  fasadsCount.forEach((item, key) => {
    data.push({
      name: `Фасад ${key + 1}`,
      label: `Фасад ${key + 1}`,
      title: "Цвет фасада",
      contant: fasades.value,
    });
  });

  console.log(data, fasadsCount.length, "--createTabList");

  tabsList.value = data;
};

watch(paletteColorsData, () => {
  showPalette.value =
    Object.keys(paletteColorsData.value).length > 0 ? true : false;
});

const changeColorPage = ({ type, key }) => {
  сolorPage.value = type;
  currentFasade.value = key;
};

const changeModuleTexture = (data: { [key: string]: any }) => {
  eventBus.emit("A:ChangeModuleTexture", data);
};

const changeFasadeTexture = (data: { [key: string]: any }, fasadeNdx) => {
  currentFasadeId.value = fasadeNdx;
  selectedFasade.value = data.ID;

  modelState.createCurrentPaletteData(data.ID);
  modelState.createCurrentMillingData(data.ID);

  eventBus.emit("A:ChangeFasadeTexture", { data, fasadeNdx });
};

/** Палитра */
const changePaletteColor = () => {
  eventBus.emit("A:ChangePaletteColor", {
    data: selectPalette.value,
    fasadeNdx: currentFasadeId.value,
  });
};

/** Фрезеровка */
const changeMilling = () => {
  eventBus.emit("A:ChangeMilling", {
    data: selectMilling.value,
    fasadeNdx: currentFasadeId.value,
  });
};

</script>

<template>
  <div class="color">
    <div
      v-if="
        Object.keys(modelState.getCurrentPaletteData).length > 0 &&
        selectedFasade
      "
    >
      <select
        style
        id="palette"
        v-model="selectPalette"
        name="palette"
        @change="changePaletteColor(tabIndex - 1)"
      >
        <option
          v-for="(palette, key) in modelState.getCurrentPaletteData"
          :key="key"
          :value="palette.ID"
        >
          {{ palette.NAME }} {{ palette.UNAME }}
        </option>
      </select>
    </div>

    <div
      v-if="
        Object.keys(modelState.getCurrentMillingData).length > 0 &&
        selectedFasade
      "
    >
      <select
        class="palette-textures--items"
        id="palette"
        v-model="selectMilling"
        name="millig"
        @change="changeMilling(fasad_ndx)"
      >
        <option
          v-for="(millig, key) in modelState.getCurrentMillingData"
          :key="millig + key"
          :value="millig.ID"
        >
          {{ millig.NAME }} {{ millig.ID }}
        </option>
      </select>
    </div>

    <defaultTab
      :tabs="tabsList"
      initialTab="Корпус"
      @tab-change="handleTabChange"
    >
      <template
        v-for="(tab, tabIndex) in tabsList"
        :key="tab.name"
        v-slot:[tab.name]
      >
        <!-- <div>{{ tab.contant }}</div> -->

        <div class="customiser-section">
          <p class="customiser-section__title">{{ tab.title }}</p>

          <div class="settings-color">
            <div class="color-item">
              <MainInput
                class="input__search"
                type="text"
                placeholder="Поиск..."
                modelValue=""
              />

              <!-- Текстура объекта -->

              <div class="item-group">
                <div v-if="tab.name == 'Корпус'">
                  <div
                    v-for="(fasade_data, key) in tab.contant"
                    :key="fasade_data.NAME + key"
                    class="item-group-color"
                    @click="changeModuleTexture(fasade_data)"
                  >
                    <div class="item-group-name">
                      <img
                        :src="_URL + fasade_data.DETAIL_PICTURE"
                        class="name__bg"
                      />
                      <p class="name__text">{{ fasade_data.NAME }}</p>
                    </div>
                  </div>
                </div>

                <div class="accordion" v-else>
                  <div
                    class=""
                    v-for="(fasade_type, key) in fasades"
                    :key="fasade_type.NAME + key"
                  >
                    <details name="faq" class="item-group">
                      <summary>
                        <h3 class="customiser__title">
                          {{ fasade_type.NAME }}
                        </h3>
                      </summary>

                      <div
                        :class="[
                          'item-group-color',
                          { active: selectedFasade === _FASADE[fasade].ID },
                        ]"
                        style
                        v-for="(fasade, ndx) in fasade_type.FASADES"
                        :key="key + fasade"
                        @click="
                          changeFasadeTexture(
                            _FASADE[fasade],
                            tabIndex - 1
                          ) /** -1 т.к. отсчёт идёт после корпуса */
                        "
                      >
                        <div class="item-group-name">
                          <img
                            class="name__bg"
                            :src="_URL + _FASADE[fasade].DETAIL_PICTURE"
                            alt=""
                          />
                          <p class="name__text">
                            {{ _FASADE[fasade].NAME }}
                          </p>

                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </defaultTab>
  </div>
</template>

<style lang="scss" scoped>
.color {
  height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: scroll;

  &__links {
    display: flex;
    gap: 5px;
  }

  .customiser-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    border: 1px solid $stroke;
    border-radius: 15px;

    &__title {
      font-size: 18px;
      font-weight: 600;
    }

    .settings-color {
      display: flex;
      flex-direction: column;
      gap: 5px;

      .color-item {
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding: 15px;
        box-sizing: border-box;
        border: 1px solid $dark-grey;
        border-radius: 15px;

        .item-header {
          display: flex;
          justify-content: space-between;

          .item__title {
            font-weight: 600;
          }
        }

        .item-group {
          display: flex;
          flex-direction: column;

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
          }
        }
      }
    }
  }
}

.accordion {
  details {
    position: relative;
    margin: 16px 0;
    padding: 15px;
    border: 1px solid #a3a9b5;
    border-radius: 15px;
  }

  details summary {
    font-weight: bold;
    cursor: pointer;
    list-style: none;
  }

  details[open] {
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
</style>

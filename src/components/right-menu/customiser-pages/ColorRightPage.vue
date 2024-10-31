<script lang="ts" setup>

import { ref, watch } from "vue";
import { _URL } from "@/types/constants";

import MainButton from "@/components/ui/buttons/MainButton.vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";

import { useEventBus } from "@/store/appliction/useEventBus";
import { useObjectData } from "@/store/appliction/useObjectData";
import { useAppData } from "@/store/appliction/useAppData";

const eventBus = useEventBus();
const objectData = useObjectData().getObjectData;
const _APP = useAppData().getAppData

const productColor = ref<{ [key: string]: any }>({});
const сolorPage = ref<string>('korp');
const showPalette = ref<boolean>(false);
const paletteColorsData = ref<{ [key: string]: any }>({});
const currentFasadeId = ref<{ [key: string]: any }>({});
const fasadeColor = ref<{ [key: string]: any }>({});



productColor.value = objectData.PROPS.CONFIG.MODULE_COLOR_LIST;
fasadeColor.value = objectData.PROPS.CONFIG.FASADE_COLOR_LIST;
currentFasadeId.color = objectData.PROPS.CONFIG.FASADE_COLOR;


watch(paletteColorsData, () => {
  showPalette.value =
    Object.keys(paletteColorsData.value).length > 0 ? true : false;
});

const changeColorPage = (value: string) => {
  сolorPage.value = value
}

const changeFasadeTexture = (value: { [key: string]: any }) => {
  currentFasadeId.value = value.ID;
  if (
    _APP.FASADE[currentFasadeId.value].PALETTE.length &&
    _APP.FASADE[currentFasadeId.value].PALETTE[0] != null
  ) {
    paletteColorsData.value = Object.keys(objectData.PALETTE)
      .filter(
        (key) =>
          _APP.PALETTE[key].TYPE ===
          _APP.FASADE[currentFasadeId.value].PALETTE[0]
      )
      .reduce((obj, key) => {
        obj[key] = _APP.PALETTE[key];
        return obj;
      }, {});

    return;
  }

  paletteColorsData.value = {};
  eventBus.emit("A:ChangeFasadeTexture", value);
};

const changeModuleTexture = (value: { [key: string]: any }) => {
  console.log(value);
  eventBus.emit("A:ChangeModuleTexture", value);
};
</script>

<template>
  <div class="color">
    <div class="color__links">
      <MainButton className="right-menu" :class="{ red__button: сolorPage === 'korp' }"
        @click="changeColorPage('korp')">
        Корпус</MainButton>
      <MainButton className="right-menu" :class="{ red__button: сolorPage === 'facade' }"
        @click="changeColorPage('facade')">Фасад</MainButton>
    </div>

    <!-- component -->
    <div v-if="сolorPage === 'korp'" class="customiser-section">
      <p class="customiser-section__title">Цвет корпуса</p>
      <!-- <div v-for="(fasade_data, key) in productColor" :key="fasade_data!.NAME + key" class="item-group-color"
        @click="changeModuleTexture(fasade_data)">
        <div class="item-group-name">
          <img :src="_URL + fasade_data.DETAIL_PICTURE" class="name__bg" />
          <p class="name__text">Антрацит металлик</p>
        </div>
        <img src="../../../assets/svg/right-menu/help.svg" class="item-group__question" />
      </div> -->
      <div class="settings-color">
        <div class="color-item">
          <div class="item-header">
            <p class="item__title">Эмаль RAL Classic</p>
            <img src="../../../assets/svg/right-menu/arrow.svg" class="item__arrow" />
          </div>

          <MainInput class="input__search" type="text" placeholder="Поиск..." />
          <div class="item-group">
            <p class="item-group__title text-grey">High gloss</p>
            <div v-for="(fasade_data, key) in productColor" :key="fasade_data!.NAME + key" class="item-group-color"
              @click="changeModuleTexture(fasade_data)">
              <div class="item-group-name">
                <img :src="_URL + fasade_data.DETAIL_PICTURE" class="name__bg" />
                <p class="name__text">{{ fasade_data.NAME }}</p>
              </div>
              <img src="../../../assets/svg/right-menu/help.svg" class="item-group__question" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="сolorPage === 'facade'" class="customiser-section">
      <p class="customiser-section__title">Цвет фасада</p>
      <!-- <div v-for="(fasade_data, key) in productColor" :key="fasade_data!.NAME + key" class="item-group-color"
        @click="changeModuleTexture(fasade_data)">
        <div class="item-group-name">
          <img :src="_URL + fasade_data.DETAIL_PICTURE" class="name__bg" />
          <p class="name__text">Антрацит металлик</p>
        </div>
        <img src="../../../assets/svg/right-menu/help.svg" class="item-group__question" />
      </div> -->
      <div class="settings-color">
        <div class="color-item">
          <div class="item-header">
            <p class="item__title">Эмаль RAL Classic</p>
            <img src="../../../assets/svg/right-menu/arrow.svg" class="item__arrow" />
          </div>

          <MainInput class="input__search" type="text" placeholder="Поиск..." />
          <div class="item-group">
            <p class="item-group__title text-grey">High gloss</p>
            <div v-for="(fasade_data, key) in fasadeColor" :key="fasade_data!.NAME + key" class="item-group-color"
              @click="changeFasadeTexture(fasade_data)">
              <div class="item-group-name">
                <img :src="_URL + fasade_data.DETAIL_PICTURE" class="name__bg" />
                <p class="name__text">{{ fasade_data.NAME }}</p>
              </div>
              <img src="../../../assets/svg/right-menu/help.svg" class="item-group__question" />
            </div>
          </div>
        </div>
      </div>
    </div>
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
          gap: 5px;

          &-color {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
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
                border-radius: 15px
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
</style>

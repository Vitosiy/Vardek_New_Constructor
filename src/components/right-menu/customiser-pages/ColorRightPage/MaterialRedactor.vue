<script setup lang="ts">
// @ts-nocheck 31
// Интерфейс для табов
interface Tab {
  name: string;
  label: string;
}

import { defineProps, watch, ref, onMounted, computed, reactive } from "vue";
import { useModelState } from "@/store/appliction/useModelState";
import { useAppData } from "@/store/appliction/useAppData";
import { useEventBus } from "@/store/appliction/useEventBus";

import ConfigurationOption from "./ConfigurationOption.vue";
import SurfaceRedactor from "./SurfaceRedactor.vue";
import MillingRedactor from "./MillingRedactor.vue";
import ColorRedactor from "./ColorRedactor.vue";
import PatinaRedactor from "./PatinaRedactor.vue";

const props = defineProps({
  tabIndex: Number /** Индекс выбранного фасада в defaultTab.vue */,
  fasadeData: Object,
});

const _APP = useAppData().getAppData;
const _FASADE = _APP.FASADE;

const eventBus = useEventBus();

const modelState = useModelState();
const materialList = modelState.getCurrentModelFasadesData;
const productData = modelState.getCurrentModel;
const productId = productData.PROPS.PRODUCT;

let currentEditableOption = ref<String>("surface");

const currentSurfaceData = ref<Object>({});
const currentMillingData = ref<Object>({});
const currentPaletteData = ref<Object>({});
const currentPatinaData = ref<Object>({});
const currentWindowsData = ref<Object>({});
const currentGlassData = ref<Object>({});

const isSurfaceSelected = ref<boolean>(false);

const millingList = ref<Array>([]);
const isMillingExist = ref<boolean>(false);

const paletteList = ref<Object>({});
const isPalleteExist = ref<boolean>(false);

const patinaList = ref<Array>([]);
const isPatinaExist = ref<boolean>(false);

const onSelectMaterial = (data) => {
  isSurfaceSelected.value = true;
  millingList.value = modelState.getCurrentMillingData;
  isMillingExist.value = millingList.value.length > 0;

  paletteList.value = modelState.getCurrentPaletteData;
  isPalleteExist.value = Object.keys(paletteList.value).length > 0;

  /** Патина */
  patinaList.value = modelState.getCurrentPatinaData;
  isPatinaExist.value = patinaList.value.length > 0;

  currentSurfaceData.value = data;
  if (isPalleteExist.value) {
    let { NAME, HTML, ID } =
      paletteList.value[Object.keys(paletteList.value)[0]];
    currentPaletteData.value = { name: NAME, hex: HTML };

    eventBus.emit("A:ChangePaletteColor", {
      data: ID,
      fasadeNdx: props.tabIndex - 1,
    });
  }
};

const onSelectMilling = (data) => {
  currentMillingData.value = data;
};

const onSelectPalette = (data) => {
  currentPaletteData.value = data;
};

const onSelectPatina = (data) => {
  currentPatinaData.value = data;
};

/** Удаление опций конфигурации */
const deleteSelectedOptions = (type: String) => {
  console.log("DELETE", type);

  if (type == "surface") {
    eventBus.emit("A:Delite-Fasad", props.tabIndex - 1);
    let { NAME, DETAIL_PICTURE } = _FASADE[7397];
    currentSurfaceData.value = { name: NAME, imgSrc: DETAIL_PICTURE };
    isMillingExist.value = false;
    isPalleteExist.value = false;
  }
  if (type === "milling") {
    eventBus.emit("A:DeliteMilling", props.tabIndex - 1);
    currentMillingData.value = { name: "", imgSrc: null };
    eventBus.emit("A:DelitePatina", props.tabIndex - 1);
    currentPatinaData.value = { name: "", imgSrc: null };
  }

  if (type === "palette") {
    let { ID, NAME, HTML } = Object.values(paletteList.value)[0];
    eventBus.emit("A:ChangePaletteColor", {
      data: ID,
      fasadeNdx: props.tabIndex - 1,
    });
    currentPaletteData.value = { name: NAME, hex: HTML };
  }

  if (type === "patina") {
    eventBus.emit("A:DelitePatina", props.tabIndex - 1);
    currentPatinaData.value = { name: "", imgSrc: null };
  }
};

const millingStatus = computed(() => {
  if (!currentMillingData.value) return "disabled";
});

/** Выбор панели редактирования фрезеровки или цвета, если такая опция существует */
const setCurrentEditableOption = (name: String) => {
  currentEditableOption.value = name;
};

onMounted(() => {
  const product = productData.PROPS.PRODUCT;

  const currentFasadeData =
    productData.PROPS.CONFIG.FASADE_PROPS[props.tabIndex - 1];

  const { MILLING, PALETTE, COLOR, SHOW, PATINA, GLASS, BODY } =
    productData.PROPS.CONFIG.FASADE_PROPS[props.tabIndex - 1];

  currentPaletteData.value = modelState.createCurrentPaletteData(COLOR);

  currentGlassData.value = modelState.createCurrentGlassData({
    fasadeId: COLOR,
    productId: product,
  });

  currentMillingData.value = modelState.createCurrentMillingData({
    fasadeId: COLOR,
    productId: product,
  });

  currentWindowsData.value = modelState.createCurrentWindowsData({
    fasadeId: COLOR,
    productId: product,
  });

  currentPatinaData.value = modelState.createCurrentPatinaData({
    fasadeId: COLOR,
    productId: product,
  });

  console.log(currentPatinaData.value, "PT");

  // Проверка есть ли у текущего фасада опции выбора фрезеровки и цвета
  let dataOfFasadeType = _FASADE[COLOR];

  if (dataOfFasadeType.ATTACH_MILLINGS[0]) {
    millingList.value = modelState.getCurrentMillingData;
    if (millingList.value.length > 0) isMillingExist.value = true;
  }

  if (dataOfFasadeType.PALETTE[0]) {
    paletteList.value = modelState.getCurrentPaletteData;
    isPalleteExist.value = true;
  }

  if (dataOfFasadeType.PATINA[0]) {
    patinaList.value = modelState.getCurrentPatinaData;
    if (patinaList.value.length > 0) isPatinaExist.value = true;
  }

  // проверка уже установленных значений фасада, фрезеровки и цвета
  if (COLOR) {
    const { NAME, DETAIL_PICTURE } = _FASADE[COLOR];
    currentSurfaceData.value = { name: NAME, imgSrc: DETAIL_PICTURE };
    isSurfaceSelected.value = true;
  }

  if (MILLING) {
    console.log("MILLING");
    const { NAME, DETAIL_PICTURE } = modelState.getCurrentMillingData.find(
      (milling) => milling.ID === MILLING
    );
    currentMillingData.value = { name: NAME, imgSrc: DETAIL_PICTURE };
    isMillingExist.value = true;
  }

  if (PALETTE) {
    const { NAME, HTML } = modelState.getCurrentPaletteData[PALETTE];
    currentPaletteData.value = { name: NAME, hex: HTML };
    isPalleteExist.value = true;
  }

  if (PATINA) {
    console.log("PATINA");

    const { NAME, DETAIL_PICTURE } = modelState.getCurrentPatinaData.find(
      (patina) => patina.ID === PATINA
    );
    currentPatinaData.value = { name: NAME, imgSrc: DETAIL_PICTURE };
    isPatinaExist.value = true;
  }
});
</script>

<template>
  <div class="container">
    <div class="container__title">Конфигурация фасада {{ props.tabIndex }}</div>
    <div class="configuration" v-if="isSurfaceSelected">
      <ConfigurationOption
        :type="'surface'"
        :data="currentSurfaceData"
        @choose-option="setCurrentEditableOption"
        @delete-choise="deleteSelectedOptions"
      />

      <ConfigurationOption
        v-if="isMillingExist"
        :type="'milling'"
        :data="currentMillingData"
        @choose-option="setCurrentEditableOption"
        @delete-choise="deleteSelectedOptions"
      />

      <ConfigurationOption
        v-if="isPalleteExist"
        :type="'palette'"
        :data="currentPaletteData"
        @choose-option="setCurrentEditableOption"
        @delete-choise="deleteSelectedOptions"
      />

      <ConfigurationOption
        v-if="isPatinaExist"
        :type="'patina'"
        :data="currentPatinaData"
        :additionalClass="millingStatus"
        @choose-option="setCurrentEditableOption"
        @delete-choise="deleteSelectedOptions"
      />
    </div>

    <div class="container__list">
      <SurfaceRedactor
        v-if="currentEditableOption === 'surface'"
        :materialList="materialList"
        :tabIndex="props.tabIndex - 1"
        @select_material="onSelectMaterial"
      />

      <MillingRedactor
        v-if="currentEditableOption === 'milling'"
        :millingList="millingList"
        :tabIndex="props.tabIndex - 1"
        @select_milling="onSelectMilling"
      />

      <ColorRedactor
        v-if="currentEditableOption === 'palette'"
        :paletteList="paletteList"
        :tabIndex="props.tabIndex - 1"
        @select_color="onSelectPalette"
      />

      <PatinaRedactor
        v-if="currentEditableOption === 'patina'"
        :patinaList="patinaList"
        :tabIndex="props.tabIndex - 1"
        @select_patina="onSelectPatina"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  border: 1px solid rgb(195, 195, 195);
  border-radius: 10px;
  padding: 15px;
  max-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;

  &__title {
    font-size: large;
    font-weight: 600;
  }

  &__list {
    position: relative;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 8px;
    border: 1px solid rgb(131, 131, 131);
    border-radius: 10px;
    padding: 10px 10px 0px 10px;
    height: 100%;
    overflow-y: scroll;
    box-sizing: border-box;
  }

  &__list::-webkit-scrollbar {
    width: 8px;
  }
}

.configuration {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 8px;

  &__item {
    height: 50px;
    border: 1px solid grey;
    border-radius: 5px;
  }

  @media (min-width: 1500px) {
    gap: 17px;
  }
}
</style>

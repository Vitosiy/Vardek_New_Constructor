<script setup lang="ts">
// @ts-nocheck 31
// Интерфейс для табов
interface Tab {
  name: string;
  label: string;
}

import {
  defineProps,
  watch,
  ref,
  onMounted,
  computed,
  reactive,
  onBeforeMount,
} from "vue";
import { useModelState } from "@/store/appliction/useModelState";
import { useAppData } from "@/store/appliction/useAppData";
import { useEventBus } from "@/store/appliction/useEventBus";

import ConfigurationOption from "./ConfigurationOption.vue";
import SurfaceRedactor from "./SurfaceRedactor.vue";
import MillingRedactor from "./MillingRedactor.vue";
import ColorRedactor from "./ColorRedactor.vue";
import PatinaRedactor from "./PatinaRedactor.vue";
import GlassRedactor from "./GlassRedactor.vue";

const props = defineProps({
  tabIndex: Number /** Индекс выбранного фасада в defaultTab.vue */,
  fasadeData: Object,
});

const _APP = useAppData().getAppData;
const _FASADE = _APP.FASADE;

const eventBus = useEventBus();

const modelState = useModelState();

const materialList = ref(null);
const productData = ref(null);
const productId = ref(null);

// const materialList = modelState.getCurrentModelFasadesData;
// const productData = modelState.getCurrentModel;
// const productId = productData.PROPS.PRODUCT;

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

const glassList = ref<Array>([]);
const isGlassExist = ref<boolean>(false);

const onSelectMaterial = (data) => {
  const product = _APP.CATALOG.PRODUCTS[productId.value];
  const { COLOR } =
    productData.value.PROPS.CONFIG.FASADE_PROPS[props.tabIndex - 1];
  const dataOfFasadeType = _FASADE[COLOR];

  isSurfaceSelected.value = true;

  millingList.value = modelState.getCurrentMillingData;
  isMillingExist.value = millingList.value.length > 0 && !product.GLASS[0];

  // console.log(millingList.value, "MILLING_0");

  paletteList.value = modelState.getCurrentPaletteData;
  isPalleteExist.value = Object.keys(paletteList.value).length > 0;

  glassList.value = modelState.getCurrentGlassData;
  isGlassExist.value = glassList.value.length > 0;

  /** Патина */
  patinaList.value = modelState.getCurrentPatinaData;
  isPatinaExist.value = patinaList.value.length > 0 && !product.GLASS[0];

  currentSurfaceData.value = data;
  currentMillingData.value = {};
  currentPatinaData.value = {};

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
  // currentPatinaData.value = {};
};

const onSelectPatina = (data) => {
  currentPatinaData.value = data;
};

const onSelectGlass = (data) => {
  currentGlassData.value = data;
};

/** Удаление опций конфигурации */
const deleteSelectedOptions = (type: String) => {
  if (type == "surface") {
    eventBus.emit("A:Delite-Fasad", props.tabIndex - 1);
    let { NAME, DETAIL_PICTURE } = _FASADE[7397];
    currentSurfaceData.value = { name: NAME, imgSrc: DETAIL_PICTURE };
    isMillingExist.value = false;
    isPalleteExist.value = false;
    isPatinaExist.value = false;
    isGlassExist.value = false;

    setCurrentEditableOption("surface");
    return;
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

  // if(type="glass"){

  // }
};

const millingStatus = computed(() => {
  if (!currentMillingData.value.imgSrc) {
    return "disabled";
  }
});

/** Выбор панели редактирования фрезеровки или цвета, если такая опция существует */
const setCurrentEditableOption = (name: String) => {
  // console.log(name, "NAME");
  currentEditableOption.value = name;
};

const update = () => {
  currentSurfaceData.value = {};
  currentMillingData.value = {};
  currentPaletteData.value = {};
  currentPatinaData.value = {};
  currentWindowsData.value = {};
  currentGlassData.value = {};

  isSurfaceSelected.value = false;

  millingList.value = [];
  isMillingExist.value = false;

  paletteList.value = {};
  isPalleteExist.value = false;

  patinaList.value = [];
  isPatinaExist.value = false;

  glassList.value = [];
  isGlassExist.value = false;
};

const prepareData = () => {
  const product = _APP.CATALOG.PRODUCTS[productId.value];

  const currentFasadeData =
    productData.value.PROPS.CONFIG.FASADE_PROPS[props.tabIndex - 1];

  const { MILLING, PALETTE, COLOR, SHOW, PATINA, GLASS } =
    productData.value.PROPS.CONFIG.FASADE_PROPS[props.tabIndex - 1];

  // Проверка есть ли у текущего фасада опции выбора фрезеровки и цвета
  const dataOfFasadeType = _FASADE[COLOR];

  modelState.createCurrentPaletteData(COLOR);
  modelState.createCurrentMillingData({
    fasadeId: COLOR,
    productId: productId.value,
  });
  modelState.createCurrentPatinaData({
    fasadeId: COLOR,
    productId: productId.value,
  });
  modelState.createCurrentGlassData({
    fasadeId: COLOR,
    productId: productId.value,
  });
  modelState.createCurrentWindowsData({
    fasadeId: COLOR,
    productId: productId.value,
  });

  if (dataOfFasadeType.ATTACH_MILLINGS[0] && !product.GLASS[0]) {
    millingList.value = modelState.getCurrentMillingData;
    if (millingList.value.length > 0) isMillingExist.value = true;
  }

  if (dataOfFasadeType.PALETTE[0]) {
    paletteList.value = modelState.getCurrentPaletteData;
    isPalleteExist.value = true;
  }

  if (dataOfFasadeType.PATINA[0] && dataOfFasadeType.ATTACH_MILLINGS[0]) {
    patinaList.value = modelState.getCurrentPatinaData;
    if (patinaList.value.length > 0) isPatinaExist.value = true;
  }
  // console.log(dataOfFasadeType.ATTACH_GLASS , 'ATTACH_GLASS', product.GLASS[0])

  if (dataOfFasadeType.ATTACH_GLASS[0] && product.GLASS[0]) {
    glassList.value = modelState.getCurrentGlassData;
    if (patinaList.value.length > 0) isGlassExist.value = true;
  }

  // проверка уже установленных значений фасада, фрезеровки и цвета
  if (COLOR) {
    const { NAME, DETAIL_PICTURE, PREVIEW_PICTURE } = _FASADE[COLOR];
    currentSurfaceData.value = { name: NAME, imgSrc: PREVIEW_PICTURE };
    isSurfaceSelected.value = true;
  }

  if (MILLING) {
    console.log("MILLING");
    const { NAME, DETAIL_PICTURE, PREVIEW_PICTURE } =
      modelState.getCurrentMillingData.find(
        (milling) => milling.ID === MILLING
      );
    currentMillingData.value = { name: NAME, imgSrc: PREVIEW_PICTURE };
    isMillingExist.value = true;
  }

  if (PALETTE) {
    const { NAME, HTML } = modelState.getCurrentPaletteData[PALETTE];
    currentPaletteData.value = { name: NAME, hex: HTML };
    isPalleteExist.value = true;
  }

  if (PATINA) {
    if (modelState.getCurrentPatinaData) {
      console.log(modelState.getCurrentPatinaData, "PATT", PATINA);
      const { NAME, DETAIL_PICTURE, PREVIEW_PICTURE } =
        modelState.getCurrentPatinaData.find((patina) => patina.ID === PATINA);
      currentPatinaData.value = { name: NAME, imgSrc: PREVIEW_PICTURE };
      isPatinaExist.value = true;
    }
  }

  if (GLASS) {
    console.log("GLASS");
    const { NAME, DETAIL_PICTURE } = modelState.getCurrentGlassData.find(
      (glass) => glass.ID === GLASS
    );
    currentGlassData.value = { name: NAME, imgSrc: DETAIL_PICTURE };
    isGlassExist.value = true;
  }
};

onBeforeMount(() => {
  materialList.value = modelState.getCurrentModelFasadesData;
  productData.value = modelState.getCurrentModel;
  productId.value = productData.value.PROPS.PRODUCT;
});

onMounted(() => {
  prepareData();
});

watch(
  () => modelState.getCurrentModel,
  () => {
    materialList.value = modelState.getCurrentModelFasadesData;
    productData.value = modelState.getCurrentModel;
    productId.value = productData.value.PROPS.PRODUCT;
    update();
    prepareData();
  },
  { flush: "post", immediate: true }
);
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

      <ConfigurationOption
        v-if="isGlassExist"
        :type="'glass'"
        :data="currentGlassData"
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

      <GlassRedactor
        v-if="currentEditableOption === 'glass'"
        :glassList="glassList"
        :tabIndex="props.tabIndex - 1"
        @select_glass="onSelectGlass"
      />
      <!-- {{ glassList }} -->
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
    border: 1px solid #c6c6c6;
    border-radius: 15px;
    padding: 10px 0px 0px 10px;
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

  @media (min-height: 1000px) {
    gap: 17px;
  }
}
</style>

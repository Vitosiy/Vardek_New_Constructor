<script setup lang="ts">
// @ts-nocheck 31
// Интерфейс для табов
import MaterialSelector from "@/components/right-menu/customiser-pages/ColorRightPage/MaterialSelector.vue";

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
  onBeforeUnmount,
} from "vue";
import { useModelState } from "@/store/appliction/useModelState";
import { useAppData } from "@/store/appliction/useAppData";
import { useEventBus } from "@/store/appliction/useEventBus";

import MillingRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/MillingRedactor.vue";
import PatinaRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/PatinaRedactor.vue";
import GlassRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/GlassRedactor.vue";
import ConfigurationOption from "@/components/right-menu/customiser-pages/ColorRightPage/ConfigurationOption.vue";
import SurfaceRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/SurfaceRedactor.vue";
import ColorRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/ColorRedactor.vue";

const props = defineProps({
  elementIndex: [Number, String] /** Индекс выбранного элемента */,
  elementData: Object,
  isFasade: {
    type: Boolean,
    default: false,
  },
  materialList: {
    type: Array,
    default: [],
  }
});

enum partsNames {
  PROFILECOLOR = 'Цвет профиля'
}

const emit = defineEmits(["parent-callback"]);

const callback = (material: Object, type: String, palette: Number) => {
  emit("parent-callback", material, type, palette);
};

const _APP = useAppData().getAppData;
const _FASADE = _APP.FASADE;
const _COLOR = _APP.COLOR;

const eventBus = useEventBus();

const modelState = useModelState();

const materialList = ref(null);
const productData = ref(null);
const productId = ref(null);
const currentElementData = ref(null);

let currentEditableOption = ref<String>("surface");

const currentSurfaceData = ref<Object>({});
const currentMillingData = ref<Object>({});
const currentPaletteData = ref<Object>({});
const currentPatinaData = ref<Object>({});
const currentWindowsData = ref<Object>({});
const currentGlassData = ref<Object>({});
const currentShowcaseData = ref<Object>({});

const isSurfaceSelected = ref<boolean>(false);

const millingList = ref<Array>([]);
const isMillingExist = ref<boolean>(false);

const paletteList = ref<Object>({});
const isPalleteExist = ref<boolean>(false);

const patinaList = ref<Array>([]);
const isPatinaExist = ref<boolean>(false);

const glassList = ref<Array>([]);
const isGlassExist = ref<boolean>(false);

const showcaseList = ref<Array>([]);
const isShowcaseExist = ref<boolean>(false);

const onSelectMaterial = (data) => {
  const {PROPS} = productData.value;
  const {CONFIG} = PROPS;
  const {FASADE_POSITIONS, FASADE_PROPS} = CONFIG;
  const product = _APP.CATALOG.PRODUCTS[productId.value];

  let haveShowcase
  let dataOfFasadeType;

  if(FASADE_PROPS[props.elementIndex]) {
    const {COLOR, RESET_COLOR, ALUM} = FASADE_PROPS[props.elementIndex];
    haveShowcase = FASADE_POSITIONS[props.elementIndex].SHOWCASE === 1;
    dataOfFasadeType = _FASADE[COLOR] || _COLOR[COLOR]
  }
  else {
    haveShowcase = false;
  }


  if (data.ATTACH_MILLINGS?.[0]) {
    modelState.createCurrentMillingData({
      fasadeId: data.ID,
      productId: productId.value,
    fasadeNdx: props.elementIndex,
    });

    modelState.createCurrentPatinaData({
      fasadeId: data.ID,
      productId: productId.value,
    });

    modelState.createCurrentShowcaseData({
      fasadeId: data.ID,
      productId: productId.value,
    });

    millingList.value = modelState.getCurrentMillingData;
    patinaList.value = modelState.getCurrentPatinaData;

    if(typeof props.elementIndex === "string" && props.elementIndex.toLowerCase().includes('sidecolor')) {
      millingList.value = millingList.value.filter(item => {
        if ([2462671, 2503106, 2839850, 1596264].includes(item.ID))
          return item
      })
      patinaList.value = []
    }

    isMillingExist.value = millingList.value.length > 0 && !haveShowcase;

    /** @Патина */
    isPatinaExist.value =
        patinaList.value.length > 0 && !product.type_showcase[0];
  }
  else {
    isMillingExist.value = false;
    isPalleteExist.value = false;
    isPatinaExist.value = false;
  }

  if (data.ATTACH_GLASS?.[0]) {
    modelState.createCurrentGlassData({
      fasadeId: data.ID,
      productId: productId.value,
    fasadeNdx: props.elementIndex,
    });
  }
  else {
    glassList.value = false
  }

  modelState.createCurrentPaletteData(data.ID);
  paletteList.value = modelState.getCurrentPaletteData;
  isPalleteExist.value = Object.keys(paletteList.value).length > 0;

  isSurfaceSelected.value = true;

  glassList.value = modelState.getCurrentGlassData;

  /** @Витрины */

  showcaseList.value = modelState.getCurrentShowcaseData;

  if(haveShowcase)
    isShowcaseExist.value =
      showcaseList.value.length > 0 &&
      haveShowcase &&
      ALUM == null &&
      COLOR !== RESET_COLOR;

  /** @Стёкла */

  isGlassExist.value = glassList.value.length > 0 && haveShowcase;

  currentSurfaceData.value = data;

  let palette;
  if (isPalleteExist.value) {
    let { NAME, HTML, ID } =
      paletteList.value[Object.keys(paletteList.value)[0]];
    currentPaletteData.value = { name: NAME, hex: HTML };
    callback(ID, "PALETTE");

    palette = ID;
  }
  else callback(false, "PALETTE");

  callback(data, "COLOR", palette);

  if (!isPatinaExist.value) {
    callback(false, "PATINA");
  }
  if (!isGlassExist.value) {
    callback(false, "GLASS");
  } else {
    const { NAME, PREVIEW_PICTURE, ID } = glassList.value[0];
    currentGlassData.value = { name: NAME, imgSrc: PREVIEW_PICTURE };
    callback(ID, "GLASS");
  }

  if (!isMillingExist.value) {
    callback(false, "MILLING");
  } else {
    const { NAME, PREVIEW_PICTURE, ID } = millingList.value[0];
    modelState.setMillingId(props.elementIndex, ID);
    currentMillingData.value = { name: NAME, imgSrc: PREVIEW_PICTURE };
    callback(ID, "MILLING");
  }

  if (isShowcaseExist.value) {
    const { NAME, PREVIEW_PICTURE, ID } = showcaseList.value[0];
    currentShowcaseData.value = { name: NAME, imgSrc: PREVIEW_PICTURE };
    callback(ID, "SHOWCASE");
  }
};

const onSelectMilling = (data) => {
  currentMillingData.value = data;
  callback(data, "MILLING");
};

const onSelectPalette = (data) => {
  currentPaletteData.value = data;
  callback(data, "PALETTE");
};

const onSelectPatina = (data) => {
  currentPatinaData.value = data;
  callback(data, "PATINA");
};

const onSelectGlass = (data) => {
  currentGlassData.value = data;
  callback(data, "GLASS");
};

/** Удаление опций конфигурации */
const deleteSelectedOptions = (type: String) => {
  if (type == "surface" && props.isFasade) {

    let { NAME, DETAIL_PICTURE } = _FASADE[7397];
    currentSurfaceData.value = { name: NAME, imgSrc: DETAIL_PICTURE };
    isMillingExist.value = false;
    isPalleteExist.value = false;
    isPatinaExist.value = false;
    isGlassExist.value = false;
    isShowcaseExist.value = false;

    callback(_FASADE[7397], "COLOR");
    callback(false, "MILLING");
    callback(false, "PALETTE");
    callback(false, "PATINA");
    callback(false, "GLASS");

    setCurrentEditableOption("surface");
    return;
  }

  if (type === "milling") {
    currentMillingData.value = { name: "", imgSrc: null };
    currentPatinaData.value = { name: "", imgSrc: null };
    callback(false, "MILLING");
    callback(false, "PATINA");
  }

  if (type === "palette") {
    let { ID, NAME, HTML } = Object.values(paletteList.value)[0];
    callback(Object.values(paletteList.value)[0], "PALETTE");
    currentPaletteData.value = { name: NAME, hex: HTML };
  }

  if (type === "patina") {
    callback(false, "PATINA");
    currentPatinaData.value = { name: "", imgSrc: null };
  }

  if (type === "glass") {
    callback(false, "GLASS");
    currentGlassData.value = { name: "", imgSrc: null };
  }
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
  currentElementData.value = null;

  isSurfaceSelected.value = false;

  millingList.value = [];
  isMillingExist.value = false;

  paletteList.value = {};
  isPalleteExist.value = false;

  patinaList.value = [];
  isPatinaExist.value = false;

  glassList.value = [];
  isGlassExist.value = false;

  showcaseList.value = [];
  isShowcaseExist.value = false;

};

const prepareData = () => {

  const { PROPS } = productData.value;
  const { CONFIG } = PROPS;
  const { FASADE_POSITIONS, FASADE_PROPS } = CONFIG;
  const fasadeProps = FASADE_PROPS[props.elementIndex];
  const product = _APP.CATALOG.PRODUCTS[productId.value];
  const haveShowcase = FASADE_POSITIONS[props.elementIndex]?.SHOWCASE === 1;

  currentElementData.value = props.elementData ? props.elementData
      : props.isFasade
          ? productData.value.PROPS.CONFIG.FASADE_PROPS[props.elementIndex]
          : productData.value.PROPS.CONFIG[props.elementIndex] || {COLOR: props};

  const currentFasadeData = currentElementData.value;

  let {
    MILLING,
    PALETTE,
    COLOR,
    RESET_COLOR,
    SHOW,
    PATINA,
    GLASS,
    SHOWCASE,
    ALUM,
  } = currentFasadeData;

  if (typeof currentFasadeData === "number") {
    COLOR = currentFasadeData
  }

  // Проверка есть ли у текущего фасада опции выбора фрезеровки и цвета
  const fasadeData = _FASADE[COLOR] || _COLOR[COLOR];

  const pid = productId.value;

  modelState.createCurrentPaletteData(COLOR);

  if (fasadeData.ATTACH_MILLINGS?.[0] /*&& !product.GLASS[0]*/) {
    modelState.createCurrentMillingData({
      fasadeId: COLOR,
      productId: pid,
      fasadeNdx: props.elementIndex,
    });

    modelState.createCurrentShowcaseData({
      fasadeId: COLOR,
      productId: pid,
      fasadeNdx: props.elementIndex,
    });

    modelState.createCurrentPatinaData({ fasadeId: COLOR, productId: pid });
  }

  if (fasadeData.ATTACH_GLASS?.[0] /*&& product.GLASS[0]*/)
    modelState.createCurrentGlassData({ fasadeId: COLOR, productId: pid });

  // Кэш для предотвращения лишних обращений
  const millingData = modelState.getCurrentMillingData;
  const paletteData = modelState.getCurrentPaletteData;
  const patinaData = modelState.getCurrentPatinaData;
  const glassData = modelState.getCurrentGlassData;
  const showcaseData = modelState.getCurrentShowcaseData;

  // Установка списков и флагов существования

  /** @Фрезеровка */
  if (fasadeData.ATTACH_MILLINGS?.[0] && !haveShowcase) {
    millingList.value = millingData;

    if(typeof props.elementIndex === "string" && props.elementIndex.toLowerCase().includes('sidecolor')) {
      millingList.value = millingData.filter(item => {
        if ([2462671, 2503106, 2839850, 1596264].includes(item.ID))
          return item
      })
    }

    isMillingExist.value = millingData.length > 0;
  }

  /** @Витрины */
  if (fasadeData.ATTACH_MILLINGS?.[0] && haveShowcase && ALUM == null) {
    showcaseList.value = showcaseData;
    isShowcaseExist.value = showcaseData.length > 0;
  }

  /** @Палитра */
  if (fasadeData.ATTACH_MILLINGS?.[0] && fasadeData.PALETTE?.[0]) {
    paletteList.value = paletteData;
    isPalleteExist.value = Object.keys(paletteList.value).length > 0;
  }

  /** @Патина */
  if (fasadeData.PATINA?.[0] && fasadeData.ATTACH_MILLINGS?.[0]) {
    if(typeof props.elementIndex === "string" && props.elementIndex.toLowerCase().includes('sidecolor')) {
      patinaList.value = [];
    }
    else
      patinaList.value = patinaData;

    isPatinaExist.value = patinaData.length > 0;
  }

  /** @Стёкла */
  if (haveShowcase && glassData.length > 0) {
    glassList.value = glassData;
    isGlassExist.value = glassData.length > 0;
  }

  // Текущие выбранные значения
  if (fasadeData) {
    const { NAME, PREVIEW_PICTURE } = fasadeData;
    currentSurfaceData.value = { name: NAME, imgSrc: PREVIEW_PICTURE };
    isSurfaceSelected.value = true;
  }

  const assignIfFound = (
      list: any[],
      id: string | number,
      target: any,
      key: string,
      imageKey = "PREVIEW_PICTURE"
  ) => {
    const item = list?.find((i) => i.ID == id);

    if (item) target.value = { name: item.NAME, imgSrc: item[imageKey] };
  };

  if (MILLING) {
    assignIfFound(
        millingData,
        MILLING,
        currentMillingData,
        "currentMillingData"
    );

    callback(MILLING, "MILLING");
  }

  if (PALETTE && paletteData[PALETTE]) {
    const { NAME, HTML } = paletteData[PALETTE];
    currentPaletteData.value = { name: NAME, hex: HTML };
  }

  if (PATINA && !product.type_showcase?.[0]) {
    assignIfFound(patinaData, PATINA, currentPatinaData, "currentPatinaData");
    callback(PATINA, "PATINA");
  }

  if (SHOWCASE) {
    assignIfFound(
        showcaseData,
        SHOWCASE,
        currentShowcaseData,
        "currentShowcaseData"
    );
    callback(SHOWCASE, "SWOCASE");
  }

  if (GLASS) {
    assignIfFound(glassData, GLASS, currentGlassData, "currentGlassData");
    callback(GLASS, "GLASS");
  }
};

onBeforeMount(() => {
  materialList.value = props.materialList?.length ? props.materialList : modelState.getCurrentModelFasadesData;
  productData.value = modelState.getCurrentModel?.userData;
  productId.value = productData.value.PROPS.PRODUCT;
});

onMounted(() => {
  prepareData();
});

onBeforeUnmount(() => {
  update();
});
</script>

<template>
  <div class="container">
    <div
      class="container__title"
      v-if="props.isFasade && props.elementIndex !== null"
    >
      Конфигурация фасада {{ props.elementIndex + 1 }}
    </div>
    <div
        class="container__title"
        v-else-if="props.elementIndex !== null && partsNames[props.elementIndex]"
    >
     {{ partsNames[props.elementIndex]}}
    </div>


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

    <SurfaceRedactor
        v-if="currentEditableOption === 'surface' && materialList[0]?.FASADES"
      :materialList="materialList"
      :elementIndex="props.elementIndex"
      :temp-work="true"
      @select_material="onSelectMaterial"
    />
    <MaterialSelector
        v-if="currentEditableOption === 'surface' && !materialList[0]?.FASADES"
        :materials="materialList"
        @select="onSelectMaterial"
    />

    <MillingRedactor
      v-if="currentEditableOption === 'milling'"
      :millingList="millingList"
      :elementIndex="props.elementIndex"
      :temp-work="true"
      @select_milling="onSelectMilling"
    />

    <ColorRedactor
      v-if="currentEditableOption === 'palette'"
      :paletteList="paletteList"
      :elementIndex="props.elementIndex"
      :temp-work="true"
      @select_color="onSelectPalette"
    />

    <PatinaRedactor
      v-if="currentEditableOption === 'patina'"
      :patinaList="patinaList"
      :elementIndex="props.elementIndex"
      :temp-work="true"
      @select_patina="onSelectPatina"
    />

    <GlassRedactor
      v-if="currentEditableOption === 'glass'"
      :glassList="glassList"
      :elementIndex="props.elementIndex"
      :temp-work="true"
      @select_glass="onSelectGlass"
    />
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  border: 1px solid $stroke;
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

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
  elementIndex: [Number , String] /** Индекс выбранного элемента */,
  elementData: Object,
  isFasade: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "parent-callback",
]);

const callback = (material: Object, type: String, palette: Number) => {
  emit("parent-callback", material, type, palette);
}

const _APP = useAppData().getAppData;
const _FASADE = _APP.FASADE;

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
  modelState.createCurrentPaletteData(data.ID);
  modelState.createCurrentMillingData({
    fasadeId: data.ID,
    productId: productId.value,
  });
  modelState.createCurrentPatinaData({
    fasadeId: data.ID,
    productId: productId.value,
  });
  modelState.createCurrentGlassData({
    fasadeId: data.ID,
    productId: productId.value,
  });
  modelState.createCurrentShowcaseData({
    fasadeId: data.ID,
    productId: productId.value,
  });

  isSurfaceSelected.value = true;

  millingList.value = modelState.getCurrentMillingData;
  isMillingExist.value = millingList.value.length > 0// && !product.GLASS[0];

  paletteList.value = modelState.getCurrentPaletteData;
  isPalleteExist.value = Object.keys(paletteList.value).length > 0;

  glassList.value = modelState.getCurrentGlassData;
  isGlassExist.value = glassList.value.length > 0;

  /** Патина */
  patinaList.value = modelState.getCurrentPatinaData;
  isPatinaExist.value = patinaList.value.length > 0// && !product.GLASS[0];

  let { NAME, PREVIEW_PICTURE } = data;
  currentSurfaceData.value = { name: NAME, imgSrc: PREVIEW_PICTURE };
  currentMillingData.value = {};
  currentPatinaData.value = {};

  let palette
  if (isPalleteExist.value) {
    let { NAME, HTML, ID } =
      paletteList.value[Object.keys(paletteList.value)[0]];
    currentPaletteData.value = { name: NAME, hex: HTML, ID};

    palette = ID
  }
  else
    callback(false, "PALETTE")

  callback(data, 'COLOR', palette)

  if(!isPatinaExist.value) {
    callback(false, "PATINA")
  }
  if(!isGlassExist.value) {
    callback(false, "GLASS")
  }
  if(!isMillingExist.value) {
    callback(false, "MILLING")
  }

};

const onSelectMilling = (data) => {
  currentMillingData.value = data;
  callback(data, "MILLING")
};

const onSelectPalette = (data) => {
  currentPaletteData.value = data;
  callback(data, "PALETTE")
};

const onSelectPatina = (data) => {
  currentPatinaData.value = data;
  callback(data, "PATINA")
};

const onSelectGlass = (data) => {
  currentGlassData.value = data;
  callback(data, "GLASS")
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

    callback(_FASADE[7397], 'COLOR')
    callback(false, "MILLING")
    callback(false, "PALETTE")
    callback(false, "PATINA")
    callback(false, "GLASS")

    setCurrentEditableOption("surface");
    return;
  }

  if (type === "milling") {
    currentMillingData.value = { name: "", imgSrc: null };
    currentPatinaData.value = { name: "", imgSrc: null };
    callback(false, "MILLING")
    callback(false, "PATINA")
  }

  if (type === "palette") {
    let { ID, NAME, HTML } = Object.values(paletteList.value)[0];
    callback(Object.values(paletteList.value)[0], "PALETTE")
    currentPaletteData.value = { name: NAME, hex: HTML };
  }

  if (type === "patina") {
    callback(false, "PATINA")
    currentPatinaData.value = { name: "", imgSrc: null };
  }

  if (type === "glass") {
    callback(false, "GLASS")
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
};

const prepareData = () => {
  const product = _APP.CATALOG.PRODUCTS[productId.value];
  currentElementData.value = props.elementData ? props.elementData :
                              props.isFasade ? productData.value.PROPS.CONFIG.FASADE_PROPS[props.elementIndex] :
                              productData.value.PROPS.CONFIG[props.elementIndex];

  const currentFasadeData = currentElementData.value;

  const { MILLING, PALETTE, COLOR, SHOW, PATINA, GLASS } = currentFasadeData

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
  modelState.createCurrentShowcaseData({
    fasadeId: COLOR,
    productId: productId.value,
  });

  if (dataOfFasadeType.ATTACH_MILLINGS[0] /*&& !product.GLASS[0]*/) {
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

  if (dataOfFasadeType.ATTACH_GLASS[0] /*&& product.GLASS[0]*/) {
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
      const { NAME, DETAIL_PICTURE, PREVIEW_PICTURE } =
          modelState.getCurrentPatinaData.find((patina) => patina.ID === PATINA);
      currentPatinaData.value = { name: NAME, imgSrc: PREVIEW_PICTURE };
      isPatinaExist.value = true;
    }
  }

  if (GLASS) {
    const { NAME, DETAIL_PICTURE } = modelState.getCurrentGlassData.find(
        (glass) => glass.ID == GLASS
    );
    currentGlassData.value = { name: NAME, imgSrc: DETAIL_PICTURE };
    isGlassExist.value = true;
  }
};

onBeforeMount(() => {
  materialList.value = modelState.getCurrentModelFasadesData;
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
    <div class="container__title" v-if="props.isFasade && props.elementIndex !== null">Конфигурация фасада {{ props.elementIndex + 1}}</div>
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
        v-if="currentEditableOption === 'surface'"
        :materialList="materialList"
        :elementIndex="props.elementIndex"
        :temp-work="true"
        @select_material="onSelectMaterial"
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

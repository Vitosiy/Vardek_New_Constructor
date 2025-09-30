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
  onBeforeMount, toRefs,
} from "vue";
import { useModelState } from "@/store/appliction/useModelState";
import { useAppData } from "@/store/appliction/useAppData";
import { useEventBus } from "@/store/appliction/useEventBus";

import ConfigurationOption from "@/components/right-menu/customiser-pages/ColorRightPage/ConfigurationOption.vue";
import SurfaceRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/SurfaceRedactor.vue";
import ColorRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/ColorRedactor.vue";

const props = defineProps({
  elementIndex: [Number , String] /** Индекс выбранного элемента */,
  elementData: Object,
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
const currentPaletteData = ref<Object>({});

const isSurfaceSelected = ref<boolean>(false);

const paletteList = ref<Object>({});
const isPalleteExist = ref<boolean>(false);

const onSelectMaterial = (data) => {
  isSurfaceSelected.value = true;

  modelState.createCurrentPaletteData(data.ID);

  paletteList.value = modelState.getCurrentPaletteData;
  isPalleteExist.value = Object.keys(paletteList.value).length > 0;

  let { NAME, PREVIEW_PICTURE } = data;
  currentSurfaceData.value = { name: NAME, imgSrc: PREVIEW_PICTURE };

  let palette
  if (isPalleteExist.value) {
    let { NAME, HTML, ID } =
      paletteList.value[Object.keys(paletteList.value)[0]];
    currentPaletteData.value = { name: NAME, hex: HTML, ID};

    palette = ID
  }

  callback(data, 'COLOR', palette)
};

const onSelectPalette = (data) => {
  currentPaletteData.value = data;
  callback(data, "PALETTE")

};

/** Выбор панели редактирования фрезеровки или цвета, если такая опция существует */
const setCurrentEditableOption = (name: String) => {
  // console.log(name, "NAME");
  currentEditableOption.value = name;
};

const update = () => {
  currentSurfaceData.value = {};
  currentPaletteData.value = {};
  currentElementData.value = null;

  isSurfaceSelected.value = false;

  paletteList.value = {};
  isPalleteExist.value = false;
};

const prepareData = () => {
  currentElementData.value = productData.value.PROPS.CONFIG[props.elementIndex];

  const { PALETTE, COLOR } =
      currentElementData.value;

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

  if (dataOfFasadeType.PALETTE[0]) {
    paletteList.value = modelState.getCurrentPaletteData;
    isPalleteExist.value = true;
  }

  // проверка уже установленных значений фасада, фрезеровки и цвета
  if (COLOR) {
    const { NAME, DETAIL_PICTURE, PREVIEW_PICTURE } = _FASADE[COLOR];
    currentSurfaceData.value = { name: NAME, imgSrc: PREVIEW_PICTURE };
    isSurfaceSelected.value = true;
  }

  if (PALETTE) {
    const { NAME, HTML } = modelState.getCurrentPaletteData[PALETTE];
    currentPaletteData.value = { name: NAME, hex: HTML };
    isPalleteExist.value = true;
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
    <div class="configuration" v-if="isSurfaceSelected">
      <ConfigurationOption
        :type="'surface'"
        :data="currentSurfaceData"
        @choose-option="setCurrentEditableOption"
      />

      <ConfigurationOption
        v-if="isPalleteExist"
        :type="'palette'"
        :data="currentPaletteData"
        @choose-option="setCurrentEditableOption"
      />
    </div>

    <SurfaceRedactor
      v-if="currentEditableOption === 'surface'"
      :materialList="materialList"
      :elementIndex="props.elementIndex"
      :temp-work="true"
      @select_material="onSelectMaterial"
    />

    <ColorRedactor
      v-if="currentEditableOption === 'palette'"
      :paletteList="paletteList"
      :elementIndex="props.elementIndex"
      :temp-work="true"
      @select_color="onSelectPalette"
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

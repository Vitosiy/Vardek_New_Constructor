<script setup lang="ts">
// @ts-nocheck 31
// Интерфейс для табов
interface Tab {
  name: string;
  label: string;
}

import { defineProps, watch, ref, onMounted, computed, reactive } from 'vue';
import { useModelState } from '@/store/appliction/useModelState';
import { useAppData } from "@/store/appliction/useAppData";

import ConfigurationOption from './ConfigurationOption.vue';
import SurfaceRedactor from './SurfaceRedactor.vue';
import MillingRedactor from './MillingRedactor.vue';
import ColorRedactor from './ColorRedactor.vue';

const props = defineProps({
  tabIndex: Number, /** Индекс выбранного фасада в defaultTab.vue */
  fasadeData: Object
  })

const _APP = useAppData().getAppData;
const _FASADE = _APP.FASADE;
  
const modelState = useModelState() // TODO работу со стором надо переносить в стор. Отделять бизнес-логику от визуализации
const materialList = modelState.getCurrentModelFasadesData
const productData = modelState.getCurrentModel;
const productId = productData.PROPS.PRODUCT;

let currentEditableOption = ref<String>('surface')

let currentSurfaceData = ref<Object>({})
let currentMillingData = ref<Object>({})
let currentPaletteData = ref<Object>({})

let isSurfaceSelected = ref<boolean>(false)

let millingList = ref<Array>([])
let isMillingExist = ref<boolean>(false)

let paletteList = ref<Object>({})
let isPalleteExist = ref<boolean>(false)


const onSelectMaterial = (data) => {
  isSurfaceSelected.value = true
  millingList.value = modelState.getCurrentMillingData
  isMillingExist.value = millingList.value.length > 0 
  
  paletteList.value = modelState.getCurrentPaletteData
  isPalleteExist.value = Object.keys(paletteList.value).length > 0

  currentSurfaceData.value = data
}

const onSelectMilling = (data) => {
  currentMillingData.value = data
}

const onSelectPalette = (data) => {
  currentPaletteData.value = data
}

const deleteSelectedOptions = (type: String) => { // TODO доделать после согласования
  console.log('DELETE', type);
}

/** Выбор панели редактирования фрезеровки или цвета, если такая опция существует */
const setCurrentEditableOption = (name: String) => {
  currentEditableOption.value = name
}

onMounted(() => {
  let currentFasadeData = productData.PROPS.CONFIG.FASADE_PROPS[props.tabIndex - 1]
  let { MILLING, PALETTE, COLOR, SHOW } = productData.PROPS.CONFIG.FASADE_PROPS[props.tabIndex - 1]
  
  // Проверка есть ли у текущего фасада опции выбора фрезеровки и цвета
  let dataOfFasadeType = _FASADE[COLOR]
  if(dataOfFasadeType.ATTACH_MILLINGS[0]) {
    millingList.value = modelState.getCurrentMillingData
    isMillingExist.value = true
  }
  if(dataOfFasadeType.PALETTE[0]) {
    paletteList.value = modelState.getCurrentPaletteData
    isPalleteExist.value = true
  } 
  
  // console.log(_FASADE[COLOR], '_FASADE');
  

  // проверка уже установленных значений фасада, фрезеровки и цвета
  if(COLOR) {
    let { NAME, DETAIL_PICTURE } = _FASADE[COLOR]
    currentSurfaceData.value = { name: NAME, imgSrc: DETAIL_PICTURE }
    isSurfaceSelected.value = true
  }
  if(MILLING) {
    let { NAME, DETAIL_PICTURE } = modelState.getCurrentMillingData.find(milling => milling.ID === MILLING)
    currentMillingData.value = { name: NAME, imgSrc: DETAIL_PICTURE }
    isMillingExist.value = true
  } 
  if(PALETTE) {
    let { NAME, HTML } = modelState.getCurrentPaletteData[PALETTE]
    currentPaletteData.value = { name: NAME, hex: HTML }
    isPalleteExist.value = true
  } 
  
})

</script>

<template>
  <div class="container">
    <div class="container__title">Конфигурация фасада {{ props.tabIndex }}</div>
      <div class="configuration" v-if="isSurfaceSelected">
        <ConfigurationOption
        :type="'surface'" 
        :data="currentSurfaceData" 
        @choose-option="setCurrentEditableOption" />

        <ConfigurationOption v-if="isMillingExist"
        :type="'milling'" 
        :data="currentMillingData" 
        @choose-option="setCurrentEditableOption" />

        <ConfigurationOption v-if="isPalleteExist"
        :type="'palette'" 
        :data="currentPaletteData" 
        @choose-option="setCurrentEditableOption" />
      </div>
      <div class="container__list">
        
        <SurfaceRedactor v-if="currentEditableOption === 'surface'" 
        :materialList="materialList" 
        :tabIndex="props.tabIndex - 1"  
        @select_material="onSelectMaterial" />


        <MillingRedactor v-if="currentEditableOption === 'milling'" 
        :millingList="millingList" 
        :tabIndex="props.tabIndex - 1" 
        @select_milling="onSelectMilling" />

        <ColorRedactor v-if="currentEditableOption === 'palette'" 
        :paletteList="paletteList" 
        :tabIndex="props.tabIndex - 1" 
        @select_color="onSelectPalette" />
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
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;

  &__title {
    font-size: large;
    font-weight: 600;
  }

  &__list {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border: 1px solid rgb(131, 131, 131);
    border-radius: 10px;
    padding: 10px;
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
  justify-content:flex-start;
  gap: 17px;

  &__item {
    height: 50px;
    border: 1px solid grey;
    border-radius: 5px;
  }
}
</style>


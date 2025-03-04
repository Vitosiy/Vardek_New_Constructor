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
  
const modelState = useModelState() 
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
// let isMillingExist = ref<null | Boolean>(props.fasadeData.MILLING)
// let isMillingExist = computed(() => {
//   console.log('computed', millingList.value);
  
//   return props.fasadeData.MILLING ? true :  millingList.value.length > 0
// })

let paletteList = ref<Object>({})
let isPalleteExist = ref<boolean>(false)
// let isPalleteExist = computed(() => {
//   return props.fasadeData.PALETTE ? props.fasadeData.PALETTE : paletteList.value.length > 0
// })


const onSelectMaterial = (data) => {
  console.log(data, 'DATA');
  
  // console.log(useModelState().getCurrentMillingData, 'MILLING');
  // console.log(useModelState().getCurrentPaletteData, 'PALETE');
  isSurfaceSelected.value = true
  millingList.value = modelState.getCurrentMillingData
  isMillingExist.value = millingList.value.length > 0
  // console.log(isMillingExist.value, 'is milling exist');
  
  
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

const deleteSelectedOptions = (type: String) => {
  console.log('DELETE', type);
}

/** Выбор панели редактирования фрезеровки или цвета, если такая опция существует */
const setCurrentEditableOption = (name: String) => {
  currentEditableOption.value = name
}

onMounted(() => {
  // console.log(modelState.getCurrentModel, 'MODEL STATE');
  let currentFasadeData = productData.PROPS.CONFIG.FASADE_PROPS[props.tabIndex - 1]
  let { MILLING, PALETTE, COLOR } = productData.PROPS.CONFIG.FASADE_PROPS[props.tabIndex - 1]
  console.log(currentFasadeData, 'FASADE DATA',COLOR, MILLING, PALETTE);
  
  // console.log(props.tabIndex - 1, 'TABINDEX');
  
  // modelState.createCurrentMillingData(_FASADE ,productId)
  // console.log(props.fasadeData, 'FASADE_DATA', isMillingExist.value);
  if(COLOR) isSurfaceSelected.value = true
  if(MILLING) isMillingExist.value = true
  if(PALETTE) isPalleteExist.value = true

  let milingData = modelState.getCurrentMillingData
  console.log(milingData, 'MILLING DATA');
  
})

</script>

<template>
  <div class="container">
    <div class="container__title">Конфигурация фасада {{ props.tabIndex }}</div>
      <div class="configuration" v-if="isSurfaceSelected">
        <ConfigurationOption
        :type="'surface'" 
        :data="currentSurfaceData" 
        @choose-option="setCurrentEditableOption"
        @delete-choise="" />

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
        @select_material="onSelectMaterial"/>

        <MillingRedactor v-if="currentEditableOption === 'milling'" 
        :millingList="millingList" 
        :tabIndex="props.tabIndex - 1" 
        @select_milling="onSelectMilling"/>

        <ColorRedactor v-if="currentEditableOption === 'palette'" 
        :paletteList="paletteList" 
        :tabIndex="props.tabIndex - 1" 
        @select_color="onSelectPalette"/>

      </div>
    </div>
  
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  // justify-content: space-between;
  gap: 10px;
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
    display: flex;
    flex-direction: column;
    gap: 8px;
    border: 1px solid rgb(131, 131, 131);
    border-radius: 10px;
    padding: 10px;
    height: 100%;
    box-sizing: border-box;
  }
}

.configuration {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  // margin-bottom: 10px;

  &__item {
    height: 50px;
    border: 1px solid grey;
    border-radius: 5px;
  }
}
</style>


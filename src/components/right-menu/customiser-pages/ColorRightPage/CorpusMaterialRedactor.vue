<script lang="ts" setup>
// @ts-nocheck 31

import { ref, onMounted, computed } from "vue";
import { _URL } from "@/types/constants";
import { useModelState } from "@/store/appliction/useModelState";
import { useEventBus } from "@/store/appliction/useEventBus";
import ConfigurationOption from "./ConfigurationOption.vue";


let selectedSurfaceID = useModelState().getCurrentModel.PROPS.CONFIG.MODULE_COLOR
const materialList = useModelState().getCurrentModel.PROPS.CONFIG.MODULE_COLOR_LIST
const filteredMaterialList = ref<Array>([]) // отфильтрованный массив поиска
  const isSearch = computed(() => {
  return filteredMaterialList.value.length > 0 ? true : false
})

const isMillingExist = ref<Boolean>(false);


const eventBus = useEventBus();

const currentSurfaceData = ref<Object>({});

onMounted(() => {
  console.log(materialList, 'LIST');
  if(selectedSurfaceID) {
    let { NAME, DETAIL_PICTURE } = materialList.find(material => material.ID === selectedSurfaceID)
    currentSurfaceData.value = { name: NAME, imgSrc: DETAIL_PICTURE }
  }
})

const changeModuleTexture = (data: { [key: string]: any }) => {
  let { NAME, DETAIL_PICTURE } = data
  currentSurfaceData.value = { name: NAME, imgSrc: DETAIL_PICTURE }
  eventBus.emit("A:ChangeModuleTexture", data);
};

const onSearchChange = (e) => {
  let reg = new RegExp(`${e.target.value.toLowerCase()}`, "gm");
  let filtered = materialList.filter(material => reg.test(material.NAME.toLowerCase()))
  filteredMaterialList.value = filtered

  if(e.target.value === '') filteredMaterialList.value = []
};

const deleteSelectedOptions = (type: String) => {
  let { NAME, DETAIL_PICTURE } = materialList[0]
  currentSurfaceData.value = { name: NAME, imgSrc: DETAIL_PICTURE }
  eventBus.emit("A:ChangeModuleTexture", materialList[0]);
};

</script>


<template>
  <div class="container">
    <h2 class="container__title">Конфигурация корпуса</h2>

    <div class="configuration">
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
    </div>
    <div class="relative__wrapper">
      <div class="redactor">
          <input
            class="search"
            type="text"
            placeholder="Поиск"
            @input="onSearchChange"
          />
        <ul class="redactor__list">
          <li class="item" v-if="!isSearch" v-for="material in materialList" @click="changeModuleTexture(material)">
            <img class="item__img" :src="_URL + material.DETAIL_PICTURE" alt="">
            <p class="item__name">{{ material.NAME }}</p>
          </li>
  
          <li class="item" v-else v-for="material in filteredMaterialList" @click="changeModuleTexture(material)">
            <img class="item__img" :src="_URL + material.DETAIL_PICTURE" alt="">
            <p class="item__name">{{ material.NAME }}</p>
          </li>
  
        </ul>
      </div>
    </div>
    <!--
    -->
  </div>
</template>


<style scoped lang="scss">

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
}

.redactor {
  overflow-y: scroll;
  // padding: 10px;
  box-sizing: border-box;

  &__title {
    margin-bottom: 20px;
    font-size: large;
    font-weight: 600;
  }

  &__list {
    margin-top: 50px;
    height: 100%;
    box-sizing: border-box;
  }

}

.redactor::-webkit-scrollbar {
  width: 8px;
  visibility: hidden;
}

.item {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  height: 60px;
  border-radius: 5px;
  background-color: #e7e7e7;
  margin-bottom: 8px;
  margin-right: 8px;

  &__img {
    height: 45px;
    border-radius: 5px;
    margin-left: 10px;
  }
  
  &__name {
    margin-left: 30px;
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

.search {
  position: absolute;
  top: 10px;
  height: 40px;
  width: 95%;
  border-radius: 5px;
  padding-left: 15px;
}

.relative__wrapper {
  display: flex;
  flex-direction: column;
  position: relative;
  max-height: 100vh;
  overflow: hidden;
  margin-right: 0px;
  border: 1px solid grey;
  border-radius: 15px;  
  padding: 10px 10px 0px 10px;
}
</style>
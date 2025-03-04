<script lang="ts" setup>
// @ts-nocheck 31
import { _URL } from "@/types/constants";
import { useModelState } from "@/store/appliction/useModelState";
import { useEventBus } from "@/store/appliction/useEventBus";

const materialList = useModelState().getCurrentModel.PROPS.CONFIG.MODULE_COLOR_LIST
const eventBus = useEventBus();

const changeModuleTexture = (data: { [key: string]: any }) => {
  eventBus.emit("A:ChangeModuleTexture", data);
};

</script>


<template>
  <div class="redactor">
    <div class="redactor__title">Конфигурация корпуса</div>
    <div class="item" v-for="material in materialList" @click="changeModuleTexture(material)">
      <img class="item__img" :src="_URL + material.DETAIL_PICTURE" alt="">
      <div class="item__name">{{ material.NAME }}</div>
    </div>
  </div>
</template>


<style scoped lang="scss">
.redactor {
  height: 100%;
  padding: 10px;
  border: 1px solid grey;
  border-radius: 15px;

  &__title {
    margin-bottom: 20px;
    font-size: large;
    font-weight: 600;
  }
}
.item {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  height: 60px;
  // border: 1px solid red;
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
</style>
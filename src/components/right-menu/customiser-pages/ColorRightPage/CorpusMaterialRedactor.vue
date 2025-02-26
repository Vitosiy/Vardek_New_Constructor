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
  <div>Конфигурация корпуса</div>
  <div class="item" v-for="material in materialList" @click="changeModuleTexture(material)">
    <img class="item__img" :src="_URL + material.DETAIL_PICTURE" alt="">
    <div class="item__name">{{ material.NAME }}</div>
  </div>
</template>


<style scoped lang="scss">
.item {
  display: flex;
  flex-direction: row;
  cursor: pointer;

  &__img {
    height: 20px;
  }
}
</style>
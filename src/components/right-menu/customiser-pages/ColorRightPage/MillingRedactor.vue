<script lang="ts" setup>
// @ts-nocheck 31
import { defineProps, ref } from 'vue';
import { _URL } from "@/types/constants";
import { useEventBus } from "@/store/appliction/useEventBus";

const props = defineProps({
  millingList: Array,
  tabIndex: Number
})

const eventBus = useEventBus();
const selectMilling = ref<any>(null);


const changeMilling = (milling) => {
  console.log('SELECTED MILLING', milling.ID, props.tabIndex);
  
  eventBus.emit("A:ChangeMilling", {
    data: milling.ID,
    fasadeNdx: props.tabIndex,
  });
};
</script>



<template>
  <div class="item" v-for="milling in props.millingList" @click="changeMilling( milling )">
    <img class="item__img" :src="_URL + milling.DETAIL_PICTURE" alt="">
    <div class="item__name">{{ milling.NAME }}</div>
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
<script lang="ts" setup>
// @ts-nocheck 31

import { defineProps, onMounted } from 'vue';
import { useEventBus } from "@/store/appliction/useEventBus";


const props = defineProps({
  paletteList: Object,
  tabIndex: Number
})

const eventBus = useEventBus();


const changePaletteColor = (color) => {
  eventBus.emit("A:ChangePaletteColor", {
    data: color.ID,
    fasadeNdx: props.tabIndex,
  });
};

</script>



<template>
  <div class="item" v-for="color in Object.values(props.paletteList)" @click="changePaletteColor(color)">
    <div class="item__color" :style="{ backgroundColor: `#${color.HTML}` }"></div>
    <div class="item__name">{{ color.NAME }}</div>
  </div>
</template>


<style lang="scss" scoped>
.item {
  display: flex;
  flex-direction: row;
  cursor: pointer;

  &__color {
    height: 20px;
    width: 20px;
  }
}
</style>
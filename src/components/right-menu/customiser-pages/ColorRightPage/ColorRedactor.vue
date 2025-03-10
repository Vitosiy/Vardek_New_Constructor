<script lang="ts" setup>
// @ts-nocheck 31

import { defineProps, defineEmits, onMounted, computed, ref } from 'vue';
import { useEventBus } from "@/store/appliction/useEventBus";

const eventBus = useEventBus();
const emit = defineEmits(['select_color'])

const props = defineProps({
  paletteList: Object,
  tabIndex: Number
})

const filteredPaletteList = ref<Array>([])
const isSearch = computed(() => {
  return filteredPaletteList.value.length > 0 ? true : false
})

const changePaletteColor = (color) => {
  eventBus.emit("A:ChangePaletteColor", {
    data: color.ID,
    fasadeNdx: props.tabIndex,
  });
  emit('select_color', { name: color.NAME, data: '', hex: color.HTML}) // отдает данные в родительский компонент для рендеринга в ConfiguraitonOption
};

const onSearchChange = (e) => {
  let reg = new RegExp(`${e.target.value.toLowerCase()}`, "gm");
  let filtered = Object.values(props.paletteList).filter(color => reg.test(color.NAME.toLowerCase()))
  filteredPaletteList.value = filtered;
  if(e.target.value === '') filteredPaletteList.value = [];
}

</script>



<template>
  <div>
    <input class="search" type="text" placeholder="Поиск" @input="onSearchChange">
  </div>
  <div class="list">
    <!-- Все виды цветов -->
    <div class="item" v-if="!isSearch" v-for="color in Object.values(props.paletteList)" @click="changePaletteColor(color)">
      <div class="item__color" :style="{ backgroundColor: `#${color.HTML}` }"></div>
      <div class="item__name">{{ color.NAME }}</div>
    </div>
    <!-- Отфильтрованные в поиске -->
    <div class="item" v-else v-for="color in filteredPaletteList" @click="changePaletteColor(color)">
      <div class="item__color" :style="{ backgroundColor: `#${color.HTML}` }"></div>
      <div class="item__name">{{ color.NAME }}</div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.search {
  position: absolute;
  top: 10px;
  height: 40px;
  width: 95%;
  border-radius: 5px;
  padding-left: 15px;
}

.list {
  overflow: scroll;
  height: 100%;
  margin-top: 40px;
}

.list::-webkit-scrollbar {
  width: 8px;
}

.item {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  height: 60px;
  border-radius: 5px;
  background-color: #e7e7e7;
  margin-bottom: 4px;
  margin-right: 4px;

  &__color {
    height: 45px;
    width: 45px;
    margin-left: 10px;
    border-radius: 5px;
  }

  &__name {
    margin-left: 15px;
  }
}
</style>
<script lang="ts" setup>
// @ts-nocheck 31
import { defineProps, ref, computed, defineEmits } from 'vue';
import { _URL } from "@/types/constants";
import { useEventBus } from "@/store/appliction/useEventBus";

const props = defineProps({
  millingList: Array,
  tabIndex: Number
})

const emit = defineEmits(['select_milling'])

const eventBus = useEventBus();
const selectMilling = ref<any>(null);

let filteredMillingList = ref<Array>([])
const isSearch = computed(() => {
  return filteredMillingList.value.length > 0 ? true : false
})


const changeMilling = (milling) => {
  eventBus.emit("A:ChangeMilling", {
    data: milling.ID,
    fasadeNdx: props.tabIndex,
  });
  emit('select_milling', { name: milling.NAME, imgSrc: milling.DETAIL_PICTURE }) // отдает данные в родительский компонент для рендеринга в ConfiguraitonOption
};

const onSearchChange = (e) => {
  let reg = new RegExp(`${e.target.value.toLowerCase()}`, "gm");
  let filtered = props.millingList.filter(milling => reg.test(milling.NAME.toLowerCase()))
  filteredMillingList.value = filtered
  if(e.target.value === '') filteredMillingList.value = []
}
</script>



<template>
  <div>
    <input class="search" type="text" placeholder="Поиск" @input="onSearchChange">
  </div>
  <ul class="list">
    <!-- Все виды фрезировок -->
    <li v-if="!isSearch" class="item" v-for="milling in props.millingList" @click="changeMilling( milling )">
      <img class="item__img" :src="_URL + milling.DETAIL_PICTURE" alt="">
      <div class="item__name">{{ milling.NAME }}</div>
    </li>
    <!-- Отфильтрованные в поиске -->
    <li v-else class="item" v-for="milling in filteredMillingList" @click="changeMilling( milling )">
      <img class="item__img" :src="_URL + milling.DETAIL_PICTURE" alt="">
      <div class="item__name">{{ milling.NAME }}</div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
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
  // border: 1px solid red;
  border-radius: 5px;
  background-color: #e7e7e7;
  margin-bottom: 4px;
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
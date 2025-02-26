<script lang="ts" setup>
// @ts-nocheck 31

import { defineProps, defineEmits, onMounted, computed, ref } from 'vue';
import { useModelState } from "@/store/appliction/useModelState";
import { useAppData } from "@/store/appliction/useAppData";
import { useEventBus } from "@/store/appliction/useEventBus";
import { _URL } from "@/types/constants";

const props = defineProps({
  tabIndex: Number,
  materialList: Array
})

const emit = defineEmits(["select_material"])
const modelState = useModelState();
const eventBus = useEventBus();


const productData = modelState.getCurrentModel;
const _APP = useAppData().getAppData;
const _FASADE = _APP.FASADE;

const totalMaterialList = computed(() => {
  let arr = []
  props.materialList.forEach(list => {
    arr.push(list.FASADES)
  });
  let result = arr.flat()
  return result
})

const filteredMaterialList = ref<Array>([])
const isSearch = computed(() => {
  return filteredMaterialList.value.length > 0 ? true : false
})

onMounted(() => {
  // console.log('MATERIAL LIST', props.materialList);
  
})


const changeFasadeTexture = (data: { [key: string]: any }, fasadeNdx) => {
  // currentFasadeId.value = fasadeNdx;
  // selectedFasade.value = data.ID;
  const productId = productData.PROPS.PRODUCT;

  modelState.createCurrentPaletteData(data.ID, productId);
  modelState.createCurrentMillingData({ fasadeId: data.ID, productId });
  modelState.createCurrentWindowsData({ fasadeId: data.ID, productId });

  eventBus.emit("A:ChangeFasadeTexture", { data, fasadeNdx });
  emit("select_material")
};

const onSearchChange = (e) => {
  let reg = new RegExp(`${e.target.value.toLowerCase()}`, "gm");
  let filtered = totalMaterialList.value.filter(id => reg.test(_FASADE[id].NAME.toLowerCase()))
  filteredMaterialList.value = filtered

  if(e.target.value === '') filteredMaterialList.value = []
}
</script>

<template>
  <div>
    <input class="search" type="text" placeholder="Поиск" @input="onSearchChange">
  </div>
  <!-- Все возможные материалы -->
  <div v-if="!isSearch" v-for="materials in props.materialList">
    <details>
      <summary>
        {{ materials.NAME }}
      </summary>
      <div v-for="id in materials.FASADES">
        <div class="item" @click="changeFasadeTexture(_FASADE[id], props.tabIndex)">
          <img class="item__img" :src="_URL + _FASADE[id].DETAIL_PICTURE" alt="">
          <div class="item__name">
            {{ _FASADE[id].NAME }}
          </div>
        </div>
      </div>
    </details>
  </div>
  <!-- отфильтрованные материалы-->
  <div v-else v-for="id in filteredMaterialList">
      <div class="item" @click="changeFasadeTexture(_FASADE[id], props.tabIndex)">
          <img class="item__img" :src="_URL + _FASADE[id].DETAIL_PICTURE" alt="">
          <div class="item__name">
            {{ _FASADE[id].NAME }}
          </div>
      </div>
  </div>
</template>

<style scoped lang="scss">
.search {
  height: 40px;
  width: 100%;
  border-radius: 5px;
}

.item {
  display: flex;
  flex-direction: row;
  cursor: pointer;

  &__img {
    height: 20px;
  }
}
</style>
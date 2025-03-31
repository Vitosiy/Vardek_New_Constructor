<script lang="ts" setup>
// @ts-nocheck 31

import { defineProps, defineEmits, computed, ref } from 'vue';
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

const totalMaterialList = computed(() => { // разворачивание основного двумерного массива для функции поиска
  let arr = []
  props.materialList.forEach(list => {
    arr.push(list.FASADES)
  });
  let result = arr.flat()
  return result
})

const filteredMaterialList = ref<Array>([]) // отфильтрованный массив поиска
const isSearch = computed(() => {
  return filteredMaterialList.value.length > 0 ? true : false
})

const changeFasadeTexture = (data: { [key: string]: any }, id, fasadeNdx) => {
  const productId = productData.PROPS.PRODUCT;
  let { ID, NAME, DETAIL_PICTURE } = data

  modelState.createCurrentFasadeTypesData({ fasadeId: data.ID, productId });
  modelState.createCurrentPaletteData(ID);
  modelState.createCurrentGlassData({ fasadeId: data.ID, productId });
  modelState.createCurrentMillingData({ fasadeId: ID, productId });
  modelState.createCurrentWindowsData({ fasadeId: ID, productId });
  modelState.createCurrentPatinaData({ fasadeId: data.ID, productId });
  
  eventBus.emit("A:ChangeFasade", { data, fasadeNdx });
  emit("select_material", { name: NAME, imgSrc: DETAIL_PICTURE })
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
      <input
        class="search"
        type="text"
        placeholder="Поиск"
        @input="onSearchChange"
      />
    </div>
    <ul class="list">
      <!-- Все возможные материалы -->
      <li
        v-if="!isSearch"
        v-for="materials in props.materialList"
        class="list__details"
      >
        <details>
          <summary>
            {{ materials.NAME }}
          </summary>
          <ul>
            <li v-for="id in materials.FASADES">
              <div class="item" @click="changeFasadeTexture(_FASADE[id], id, props.tabIndex)">
                <img
                  class="item__img"
                  :src="_URL + _FASADE[id].DETAIL_PICTURE"
                  alt=""
                />
                <div class="item__name">
                  <p>{{ _FASADE[id].NAME }}</p> 
                </div>
              </div>
            </li>
          </ul>
        </details>
      </li>
      <!--

      -->
      <!-- отфильтрованные материалы-->
      <ul v-else v-for="id in filteredMaterialList">
        <li class="item" @click="changeFasadeTexture(_FASADE[id], id, props.tabIndex)">
          <img
            class="item__img"
            :src="_URL + _FASADE[id].DETAIL_PICTURE"
            alt=""
          />
          <div class="item__name">
           <p>{{ _FASADE[id].NAME }}</p> 
          </div>
        </li>
      </ul>

      <!--
      
      -->
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

  details {
    position: relative;
    margin: 4px 4px 4px 0px;
    padding: 15px;
    border: 1px solid #a3a9b5;
    border-radius: 15px;
    font-family: Gilroy;
    color: rgba(93, 96, 105, 1);
  }

  details summary {
    font-weight: bold;
    cursor: pointer;
    list-style: none;
  }

  details[open] {
  }

  details summary::-webkit-details-marker {
    display: none;
  }

  details summary::before {
    content: "\276F";

    position: absolute;
    right: 1rem;
    top: 1rem;
    display: inline-block;
    transform: rotate(90deg);
    transition: transform 0.2s ease-in-out;
  }

  details[open] summary::before {
    transform: rotate(-90deg);
  }
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

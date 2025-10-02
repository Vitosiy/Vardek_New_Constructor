<script lang="ts" setup>
//@ts-nocheck
import { ref, computed, onBeforeMount } from "vue";
import { _URL } from "@/types/constants";

const props = defineProps<{
  materials: Array<any>;
  modelValue?: any;
}>();

onBeforeMount(() => {});

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "select", value: any): void;
}>();

const filteredMaterialList = ref<any[]>([]);
const searchQuery = ref("");

const isSearch = computed(() => filteredMaterialList.value.length > 0);

const onSearchChange = (e: Event) => {
  const val = (e.target as HTMLInputElement).value.toLowerCase();
  searchQuery.value = val;
  if (!val) {
    filteredMaterialList.value = [];
    return;
  }
  const regex = new RegExp(`${val}`, "gm");
  filteredMaterialList.value = props.materials.filter((material) =>
    regex.test(material.NAME.toLowerCase())
  );
};

const handleSelect = (material: any) => {
  emit("update:modelValue", material);
  emit("select", material);
};
</script>

<template>
  <div class="relative__wrapper">
    <div class="redactor">
      <input
        class="search"
        type="text"
        placeholder="Поиск"
        @input="onSearchChange"
      />
      <ul class="redactor__list">
        <li
          class="item"
          v-for="material in isSearch ? filteredMaterialList : materials"
          :key="material.ID"
          @click="handleSelect(material)"
        >
          <img
            class="item__img"
            :src="_URL + material.PREVIEW_PICTURE"
            alt=""
          />
          <p class="item__name">{{ material.NAME }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style  lang="scss">
.redactor {
  &__title {
    margin-bottom: 20px;
    font-size: large;
    font-weight: 600;
  }

  &__list {
    margin-top: 10px;
    height: 100%;
    max-height: calc(85vh - 110px);
    box-sizing: border-box;
    overflow-y: scroll;
    box-sizing: border-box;
  }

  &__list::-webkit-scrollbar {
    width: 8px;
  }

  &__list::-webkit-scrollbar-thumb {
    background-color: rgba(100, 100, 100, 0.6);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
}

.item {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  // height: 60px;
  border-radius: 15px;
  background-color: $bg;
  margin-bottom: 8px;
  margin-right: 8px;
  transition-property: background-color;
  transition-duration: 0.25s;
  transition-timing-function: ease;

  &__img {
    // width: 100%;
    // height: 100%;
    // max-height: 60px;
    // max-width: 60px;
    height: 60px;
    width: 60px;
    padding: 5px;
    border-radius: 15px;
    background-color: $white;
    // margin-left: 10px;
  }

  &__name {
    margin-left: 30px;
  }
  @media (hover: hover) {
    &:hover {
      background-color: $stroke;
    }
  }
}

.search {
  padding: 10px 15px;
  width: 95%;
  border-radius: 15px;
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

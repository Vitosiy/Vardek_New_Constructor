<script lang="ts" setup>
//@ts-nocheck

import { defineProps, computed, defineEmits } from "vue";
import default_url from "@/assets/svg/surface-redactor/default.svg";
import delete_url from "@/assets/svg/surface-redactor/delete.svg";
import { _URL } from "@/types/constants";

const props = defineProps({
  type: String,
  data: Object,
  additionalClass: String,
});

const emit = defineEmits(["choose-option", "delete-choise"]);

let title = computed(() => {
  if (props.type === "surface") return "Тип покрытия";
  if (props.type === "milling") return "Тип фрезеровки";
  if (props.type === "palette") return "Цвет покрытия";
  if (props.type === "patina") return "Цвет патины";
});

let name = computed(() => {
  return props.data?.name ? props.data.name : "";
});

let imgSrc = computed(() => {
  return props.data?.imgSrc ? _URL + props.data.imgSrc : default_url;
});

let isColorChosed = computed(() => {
  return props.data?.hex ? true : false;
});

let chooseOption = () => {
  emit("choose-option", props.type);
};

const deleteChoise = (event) => {
  event.stopPropagation()
  emit("delete-choise", props.type)
};
</script>

<template>
  <div :class="`config ${props.additionalClass}`" @click="chooseOption">
    <div class="config__top">
      <img v-if="props.type !== 'palette' " class="config__img" :src="imgSrc" alt="">
      <div v-else @click="chooseOption">
        <img v-if="!isColorChosed" class="config__img" :src="imgSrc" alt="" />
        <div
          v-else
          class="config__color"
          :style="{ backgroundColor: `#${props.data?.hex}` }"
        ></div>
      </div>
      <img
        class="config__delete"
        :src="delete_url"
        alt=""
        @click="deleteChoise"
      />
    </div>
    <div class="config__bottom">
      <div>
        <p class="config__title">{{ title }}</p>
      </div>
        <p class="config__name">{{ name }}</p>
        <!--
        
        -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.config {
  display: flex;
  flex-direction: column;
  height: 15vh;
  width: 15vh;
  padding: 0.8vh;
  border-radius: 1vh;
  box-shadow: 4px 4px 4px 4px rgba(34, 60, 80, 0.11);
  overflow: hidden;
  cursor: pointer;

  &__top {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 50%;
    width: 100%;
  }

  &__bottom {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 50%;
    overflow: hidden;
  }

  &__img {
    height: 50px;
    cursor: pointer;

    @media (min-height: 1000px) { 
      height: 60px;
    }
  }

  &__color {
    height: 50px;
    width: 50px;
    border-radius: 12px;
    cursor: pointer;

    @media (min-height: 1000px) { 
      height: 60px;
    }
  }

  &__delete {
    height: 20px;
    cursor: pointer;

    @media (min-height: 1000px) { 
      height: 25px;
    }
  }

  &__title {
    color: rgb(131, 133, 135);
    font-size: small;
    // flex: 2;

    @media (min-height: 1000px) { 
      font-size: medium;
    }
  }

  &__name {
    font-size: small;
    line-height: 14px;
    text-overflow: ellipsis;
    overflow: hidden;

    @media (min-height: 1000px) { 
      font-size: medium;
      line-height: 10px;
    }
  }

}

.disabled{
  pointer-events: none;
  background-color: rgba(228, 140, 140, 0.133);
}
</style>

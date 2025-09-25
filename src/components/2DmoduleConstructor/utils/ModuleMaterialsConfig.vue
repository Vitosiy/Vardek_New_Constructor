<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
// @ts-nocheck
import {defineExpose, ref, toRefs} from "vue";
import {_URL} from "@/types/constants";

import * as THREE from "three";
import {useAppData} from "@/store/appliction/useAppData.ts";
import MaterialRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/MaterialRedactor.vue";
import CorpusMaterialRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/CorpusMaterialRedactor.vue";
import CounterInput from "@/components/ui/inputs/CounterInput.vue";

const props = defineProps({
  module: {
    type: Object,
    default: {},
    required: true,
  },
  objectData: {
    type: Object,
    default: {},
    required: true,
  },
  visualizationRef: {
    type: [ref, Object],
  }
});

type CATALOG_TYPE = 'FASADE' | 'PALETTE' | 'MILLING';

const {module, objectData, visualizationRef} = toRefs(props);
const APP = useAppData().getAppData;

const emit = defineEmits([
  "product-reset",
]);

const reset = () => {
  emit("product-reset");
}

const getMaterialInfo = (type: CATALOG_TYPE, materialID: number) => {
  return APP[type][materialID]
}

</script>

<template>
  <div class="accordion-sections">
    <div
        :class="'actions-sections-items--container'"
    >
      <details class="item-group">

        <summary>
          <h3 class="item-group__title">
            Цвет корпуса
          </h3>
        </summary>

        <div
            :class="'actions-sections-items--container'"
        >
          <CorpusMaterialRedactor :is2-dconstructor="true"/>
        </div>
      </details>

      <details class="item-group">

        <summary>
          <h3 class="item-group__title">
            Цвет задней стенки
          </h3>
        </summary>

        <div
            :class="'actions-sections-items--container'"
        >
          <CorpusMaterialRedactor :is2-dconstructor="true"/>
        </div>
      </details>

      <details class="item-group">

        <summary>
          <h3 class="item-group__title">
            Цвет левой стенки
          </h3>
        </summary>

        <div
            :class="'actions-sections-items--container'"
        >
          <CorpusMaterialRedactor :is2-dconstructor="true"/>
        </div>
      </details>

      <details class="item-group">

        <summary>
          <h3 class="item-group__title">
            Цвет правой стенки
          </h3>
        </summary>

        <div
            :class="'actions-sections-items--container'"
        >
          <CorpusMaterialRedactor :is2-dconstructor="true"/>
        </div>
      </details>

      <details class="item-group">

        <summary>
          <h3 class="item-group__title">
            Накладка на крышку
          </h3>
        </summary>

        <div
            :class="'actions-sections-items--container'"
        >
          <CorpusMaterialRedactor :is2-dconstructor="true"/>
        </div>
      </details>

    </div>
  </div>
</template>

<style scoped lang="scss">
.item-group {
  display: flex;
  flex-direction: column;
  color: #a3a9b5;
  margin-right: 10px;

  &__title {
    font-size: 18px;
    font-weight: 600;
  }

  &-color {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    margin: 10px 0;
    border-radius: 15px;
    background-color: $bg;
    cursor: pointer;

    .item-group-name {
      display: flex;
      align-items: center;
      gap: 10px;

      .name__bg {
        max-width: 60px;
        max-height: 60px;
        border-radius: 15px;
      }

      .name__text {
        font-weight: 500;
      }
    }

    @media (hover: hover) {
      /* when hover is supported */
      &:hover {
        color: white;
        background-color: #da444c;
        border: 1px solid transparent;
      }
    }
  }
}

.actions-sections {
  &-wrapper {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-right: 0.5rem;
  }

  &-footer {
    display: flex;
    justify-content: space-between;
    margin-top: auto;

    &--save {
      display: flex;
      gap: 1rem;
    }
  }

  &-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: scroll;
    padding-right: 0.5rem;
    max-height: 82vh;

    &::-webkit-scrollbar {
      width: 2px;
      /* Ширина скроллбара */
    }

    &::-webkit-scrollbar-button {
      display: none;
      /* Убираем стрелки */
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      /* Цвет ползунка */
      border-radius: 4px;
    }
  }

  &-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    width: 100%;
    padding: 1rem 0;
    border-bottom: 1px solid #ecebf1;
    border-top: 1px solid #ecebf1;

    &--container {
      display: flex;
      align-items: center;
      // gap: 0.5rem;
      padding-right: 0.5rem;
      border-right: 1px solid #ecebf1;
      border-bottom: 1px solid transparent;
      cursor: pointer;

      &.active {
        border-bottom: 1px solid #da444c;
      }
    }
  }

  &-items {
    display: flex;
    flex-wrap: wrap;
    // gap: 1rem;
    align-items: center;

    &--wrapper {
      display: flex;
      flex-direction: column;

      width: 100%;
      padding: 0 0 1rem 0;
    }

    &--container {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 1rem 0;
      border-bottom: 1px solid #ecebf1;

      // &:first-child {
      //   padding-top: 0;
      // }

      &.active {
        background-color: #f1f1f5;
      }
    }

    &--left,
    &--right {
      width: 100%;
    }

    &--left {
      align-items: start;
      max-width: 50%;

      &-wrapper {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-left: 0rem;
        // max-width: calc(50% - 1rem);
      }
    }

    &--right {
      max-width: calc(62% - 1rem);
      margin-left: 1rem;

      &-items {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;

        &-input-block {
          display: flex;
          flex-direction: row;
          gap: 5px;

          &-counter,
          &-button {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
          }

          &-button {
            margin-left: 5px;
          }

          &-counter{
            width: 45px;
            padding-left: 10px;
          }

        }

      }
    }

    &--height,
    &--diametr,
    &--width {
      display: flex;
      width: fit-content;

      &-item {
        display: flex;
        align-items: flex-start;
        height: fit-content;
        // gap: 0.5rem;
      }
    }

    &--title {
      display: flex;
      align-items: center;
      align-self: end;
      margin-bottom: 0.5rem;
    }
  }

  &-title {
    font-size: 1rem;
    color: #a3a9b5;
  }

  &-inputs {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    max-width: 100px;
  }

  &-input {
    padding: 0.5rem 1rem;
    width: 100%;
    max-width: 125px;
    border: none;
    border-radius: 15px;
    background-color: #ecebf1;
    color: #6d6e73;
    font-size: 1rem;
    font-weight: 600;

    &:focus {
      outline: none;
    }

    &--container {
      position: relative;

      &::before {
        content: "mm";
        display: block;
        position: absolute;
        top: 50%;
        left: 60px;
        transform: translate(0, -50%);
        pointer-events: none;
        z-index: 0;
        font-size: 0.75rem;
        font-weight: 600;
        color: #6d6e73;
      }
    }
  }

  &-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ecebf1;
    border-radius: 15px;
    background-color: #ffffff;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: bold;
    color: #5d6069;
    outline: none;

    &--default,
    &--footer {
      transition-property: background-color, color, border;
      transition-timing-function: ease;
      transition-duration: 0.25s;
      @media (hover: hover) {
        /* when hover is supported */
        &:hover {
          color: white;
          background-color: #da444c;
          border: 1px solid transparent;
        }
      }
    }

    &--footer {
      background-color: #ecebf1;
    }

    &:focus {
      outline: none;
    }

    &.acthnive {
      border-color: #da444c;
      color: #181818;
      transition-property: background-color, color, border;
      transition-timing-function: ease;
      transition-duration: 0.25s;

      @media (hover: hover) {
        /* when hover is supported */
        &:hover {
          color: white;
          background-color: #da444c;
        }
      }
    }
  }

  &-icon {
    border: none;
    background-color: transparent;
    padding: 0 5px;

    &--delite,
    &--close,
    &--help {
      width: 18px;
      height: 18px;
    }

    &--add {
      width: 12px;
      height: 12px;
    }

    &--delite {
      &-center {
        margin-bottom: 0.5rem;
      }
    }

    &--bottom {
      align-self: flex-end;
      padding: 5px;
    }

    &--position {
      width: 25px;
      height: 25px;
    }
  }
}


</style>
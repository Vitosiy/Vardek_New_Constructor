<script setup lang="ts">
// @ts-nocheck
import { ref, toRefs } from "vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
import MainSelect from "@/components/ui/selects/MainSelect.vue";
import S2DAppartSVG from "@/components/ui/svg/left-menu/S2DAppartSVG.vue";
import { _URL } from "@/types/constants";

const props = defineProps({
  fillings: {
    type: Array,
    required: true,
  },
});

const optionsShow = ref(false);
const { fillings } = toRefs(props);

const emit = defineEmits([
  "product-addFilling",
  "product-deleteFilling",
  "product-updateFilling",
  "product-toggleFillingOptions",
  "product-changePositionY",
]);

const addFilling = (type: string) => {
  emit("product-addFilling", type);
};

const deliteFilling = (key: number) => {
  emit("product-deleteFilling", key);
};

const updateFilling = (
    event: Event,
    key: number,
    valueType: string,
    fillingType: string
) =>
{
  console.log(event);
  emit("product-updateFilling", event, key, valueType, fillingType);
};

const changeFillingPositionY = ({
                               event,
                               key,
                               valueType,
                               fillingType,
                               filling,
                               direction,
                             }: {
  event: Event;
  key: number;
  valueType: string;
  fillingType: string;
  filling: any;
  direction: string;
}) =>
{
  let dirrectionValue;

  switch (direction) {
    case "top":
      dirrectionValue =
          parseInt(event.target.value) - filling.distances[direction];
      break;

    case "bottom":
      dirrectionValue =
          (parseInt(event.target.value) - filling.distances[direction]) * -1;
      break;
  }

  console.log(dirrectionValue, "dirrectionValue");

  emit("product-changePositionY", event, key, valueType, fillingType, dirrectionValue);
};

const toggleFillingOptions = () => {
  optionsShow.value = !optionsShow.value;
  emit("product-toggleFillingOptions", optionsShow.value);
};
</script>

<template>
  <div class="splitter-container--product">

    <div class="splitter-container--product-data" v-if="props.fillings">
      <div
          v-for="(fillingGroup, key) in fillings"
          :key="key + fillingGroup.groupName"
          class="splitter-container--product-items"
      >
        <div class="splitter-container--product-header">
          <h3 class="splitter-title">{{ fillingGroup.groupName }}</h3>
        </div>

        <div
            v-for="(filling, key) in fillingGroup.items"
            :key="key + filling.NAME"
            class="splitter-container--product-items"
            @click="addFilling(filling)"
        >
          <div class="splitter-container--product-header">
            <h3 class="splitter-title">{{ filling.NAME }}</h3>
          </div>

<!--          <div class="product_element_head">{{filling.NAME}}<span
              v-if="filling.DATA_PETROVICH"> - артикул {{app.article[filling.DATA_PETROVICH].PROPERTIES.ARTICLE.VALUE}}</span>
          </div>-->

          <div class="product_element_img">
            <img
                :src="_URL + filling.PREVIEW_PICTURE"
                 alt="{{filling.NAME}}"/>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<style lang="scss">
.splitter {
  &-container {
    &--product {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      color: #a3a9b5;
      overflow-y: scroll;

      &-icon {
        cursor: pointer;
      }

      &-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      &-data {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        overflow-y: scroll;

        &::-webkit-scrollbar {
          width: 5px;
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
        justify-content: space-between;
        align-items: center;
      }

      &-options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #ecebf1;

        &--add {
          display: flex;
          gap: 5px;
          align-items: center;
        }
      }

      &-actions {
        display: flex;
        gap: 1rem;
      }

      &-position {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .product_element {
        cursor: pointer;
        float: left;
        height: 160px;
        width: 47%;
        margin: 0 3px 4px;
        border: 1px solid rgba(153, 153, 153, 0.8);
        border-radius: 2px;
        position: relative;
      }
      .product_element:hover {
        border: 1px solid rgba(114, 114, 114, 0.8);
      }
      .product_element .product_element_head {
        position: relative;
        z-index: 100;
        display: block;
        width: 100%;
        padding: 7px;
        line-height: 13px;
        font-size: 12px;
        background: rgba(114, 114, 114, 0.3);
      }
      .product_element .product_element_img {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        text-align: center;
      }


    }
  }
}

.width {
  &-max {
    max-width: 100% !important;
  }
}
</style>

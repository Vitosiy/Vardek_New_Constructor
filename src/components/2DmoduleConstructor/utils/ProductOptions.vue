<script setup lang="ts">
// @ts-nocheck
import {ref, toRefs} from "vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
import MainSelect from "@/components/ui/selects/MainSelect.vue";
import S2DAppartSVG from "@/components/ui/svg/left-menu/S2DAppartSVG.vue";
import {_URL} from "@/types/constants";

const props = defineProps({
  fillings: {
    type: Array,
    required: true,
  },
});

const optionsShow = ref(false);
const {fillings} = toRefs(props);

const emit = defineEmits([
  "product-addFilling",
  "product-deleteFilling",
  "product-updateFilling",
  "product-toggleFillingOptions",
  "product-changePositionY",
]);

const addFilling = (type: string, product: Object) => {
  emit("product-addFilling", type, Object.assign({}, product));
};

const deliteFilling = (key: number) => {
  emit("product-deleteFilling", key);
};

const updateFilling = (
    event: Event,
    key: number,
    valueType: string,
    fillingType: string
) => {
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
}) => {
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

      <div class="accordion">
        <div
            class="splitter-container--product-items"
            v-for="(fillingGroup, key) in fillings"
            :key="key + fillingGroup.groupName"
        >
          <details class="item-group">
            <summary>
              <h3 class="item-group__title">
                {{ fillingGroup.groupName }}
              </h3>
            </summary>

            <div
                :class="[
                          'item-group-color'
                        ]"
                style
                v-for="(filling, key) in fillingGroup.items"
                :key="key + filling.NAME"
                @click="addFilling(fillingGroup.groupName, filling)"
            >
              <div class="item-group-name">
                <img
                    class="name__bg"
                    :src="_URL + filling.PREVIEW_PICTURE"
                    :alt="filling.NAME"
                />
                <p class="name__text">
                  {{ filling.NAME }}
                </p>
              </div>
            </div>
          </details>
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


    }
  }
}

.accordion {

  details {
    position: relative;
    margin: 16px 0;
    padding: 15px;
    border: 1px solid #a3a9b5;
    border-radius: 15px;
    @media (hover: hover) {
      /* when hover is supported */
      &:hover {
        border-color: #da444c;
      }
    }
  }

  details summary {
    font-weight: bold;
    list-style: none;
    cursor: pointer;

  }

  details[open] {
    border-color: #da444c;

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

.width {
  &-max {
    max-width: 100% !important;
  }
}
</style>

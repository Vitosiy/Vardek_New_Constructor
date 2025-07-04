<script setup lang="ts">
const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
  selectedCell: {
    type: Object,
    required: true,
  },
  step: {
    type: Number,
    default: 1,
  },
});

</script>

<template>
  <div class="actions-header">
    <div
        :class="[
              'actions-header--container',
              { active: secIndex === selectedCell.sec },
            ]"
        v-for="(section, secIndex) in props.module.sections"
        :key="secIndex"
    >
      <p
          class="actions-title actions-title--part"
          @click="showCurrentCol(secIndex)"
      >
        {{ secIndex + 1 }} секция
      </p>
    </div>
  </div>

  <div
      class="actions-container"
      v-for="(section, secIndex) in props.module.sections"
      :key="secIndex"
  >
    <div
        class="actions-items--wrapper"
        v-if="selectedCell.sec === secIndex"
    >
      <div class="actions-items--width">
        <div class="actions-inputs">
          <p class="actions-title">Ширина</p>
          <div
              :class="['actions-input--container']"
          >
            <input
                type="number"
                :step="step"
                min="150"
                class="actions-input"
                :value="section.width"
                disabled
            />
          </div>
        </div>
      </div>

      <div class="actions-items--height">
        <div class="actions-inputs">
          <p class="actions-title">
            Высота
          </p>
          <div
              :class="['actions-input--container']"
          >
            <input
                type="number"
                :step="step"
                min="150"
                class="actions-input"
                :value="section.height"
                @input="
                            debounce(() => updateSectionWidth(
                              $event.target.value,
                              secIndex
                            ), 1000)
                          "
            />
          </div>
        </div>
      </div>

      <div
          v-for="(cell, cellIndex) in section.cells"
          :key="cellIndex"
          :class="[
                'actions-items--container',
                {
                  active:
                    cellIndex === selectedCell.cell &&
                    secIndex === selectedCell.sec,
                },
              ]"
      >
        <article class="actions-items actions-items--left">
          <div class="actions-items--left-wrapper">
            <div class="actions-items--title">
              <button
                  v-if="section.cells.length > 1"
                  class="actions-btn actions-icon"
                  @click="deleteCell(cellIndex, secIndex)"
              >
                <img
                    class="actions-icon--delete"
                    src="/icons/delite.svg"
                    alt=""
                />
              </button>
              <p class="actions-title actions-title--part">
                {{ secIndex + 1 }}.{{ cellIndex + 1 }} часть
              </p>
            </div>

            <div class="actions-items--width">
              <div class="actions-inputs">
                <p class="actions-title">Ширина</p>
                <div
                    :class="['actions-input--container']"
                >
                  <input
                      type="number"
                      :step="step"
                      min="150"
                      class="actions-input"
                      :value="section.width"
                      disabled
                  />
                </div>
              </div>
            </div>

            <div class="actions-items--height">
              <div class="actions-inputs">
                <p class="actions-title">
                  Высота
                </p>
                <div
                    :class="['actions-input--container']"
                >
                  <input
                      type="number"
                      :step="step"
                      min="150"
                      class="actions-input"
                      :value="cell.height"
                      @input="
                            debounce(() => updateCellHeight(
                              $event.target.value,
                              secIndex,
                              cellIndex
                            ), 1000)
                          "
                  />
                </div>
              </div>
            </div>

          </div>
        </article>

        <article class="actions-items actions-items--right">
          <div class="actions-items--right-items">
            <button
                :class="[
                      'actions-btn actions-btn--default'
                    ]"
                @click="addCell(secIndex, cellIndex)"
            >
              Разделить фасад
            </button>

          </div>
        </article>

      </div>

    </div>

    <article class="actions-items actions-items--right">
      <div
          class="actions-items--right-items"
          v-if="secIndex == selectedCell.sec"
      >
        <button
            v-if="section.fasades.length < 2"
            :class="[
                      'actions-btn actions-btn--default'
                    ]"
            @click="addSection(secIndex)"
        >
          Добавить дверь
        </button>

        <button
            v-if="!section.cells.length"
            :class="[
                      'actions-btn actions-btn--default'
                    ]"
            @click="addCell(secIndex, 0)"
        >
          Разделить фасад
        </button>
      </div>
    </article>
  </div>
</template>

<style scoped lang="scss">
.actions {
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
    max-height: 450px;
    overflow-y: scroll;
    padding-right: 0.5rem;

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
      max-width: 45%;

      &-wrapper {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-left: 1rem;
        // max-width: calc(50% - 1rem);
      }
    }

    &--right {
      max-width: calc(65% - 1rem);
      margin-left: 1rem;

      &-items {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
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
    &.active {
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
<script lang="ts" setup>
// @ts-nocheck 31
import { defineProps, ref, computed, defineEmits, onMounted } from "vue";
import { _URL } from "@/types/constants";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useModelState } from "@/store/appliction/useModelState";
import { useHandlesAction } from "../FigureRightPage/Handles/useHandlesAction";
import { INTEGRATE_HANDE_EXEPTIONS } from "@/Application/F-millings";
import { FasadeTextAlignAction } from "@/types/types";

const props = defineProps({
  millingList: Array,
  tabIndex: Number,
  tempWork: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select_milling"]);

const eventBus = useEventBus();
const modelState = useModelState();
const { getIntegratedHandleControllerData } = useHandlesAction();

const selectMilling = ref<any>(null);

let filteredMillingList = ref<Array>([]);
const isSearch = computed(() => {
  return filteredMillingList.value.length > 0 ? true : false;
});

const changeMilling = (milling) => {
  const { FASADE_POSITIONS } =
    modelState.getCurrentModel?.userData.PROPS.CONFIG;
  const isShowcase = FASADE_POSITIONS[props.tabIndex].SHOWCASE;
  console.log(isShowcase, "======= isShowcase ======");

  emit("select_milling", {
    name: milling.NAME,
    imgSrc: milling.PREVIEW_PICTURE,
    ID: milling.ID,
    fasade_type: milling.fasade_type,
    patina: milling.PATINAOFF,
  }); // отдает данные в родительский компонент для рендеринга в ConfiguraitonOption

  if (!props.tempWork) {
    let action = null;
    /** @Применение_типа_фасадов_с_инегрированной_ручкой */
    const prepare = getIntegratedHandleControllerData(milling, props.tabIndex);

    if (prepare.length > 0 && INTEGRATE_HANDE_EXEPTIONS.includes(milling.ID)) {
      action = modelState.getCurrentMillingActionMap(prepare[0].id, milling.ID);
    }

    if (isShowcase === 1) return; // Если витрина пропускаем отрисовку фрезеровки

    eventBus.emit("A:ChangeMilling", {
      data: milling.ID,
      fasadeNdx: props.tabIndex,
      action: action,
    });
  }
};

const onSearchChange = (e) => {
  let reg = new RegExp(`${e.target.value.toLowerCase()}`, "gm");
  let filtered = props.millingList.filter((milling) =>
    reg.test(milling.NAME.toLowerCase())
  );
  filteredMillingList.value = filtered;
  if (e.target.value === "") filteredMillingList.value = [];
};
</script>

<template>
  <div class="relative__wrapper">
    <input
      class="search"
      type="text"
      placeholder="Поиск"
      @input="onSearchChange"
    />

    <ul class="list">
      <!-- Все виды фрезировок -->
      <li
        v-if="!isSearch"
        class="item"
        v-for="milling in props.millingList"
        @click="changeMilling(milling)"
      >
        <img class="item__img" :src="_URL + milling.PREVIEW_PICTURE" alt="" />
        <div class="item__name">{{ milling.NAME }}</div>
      </li>
      <!-- Отфильтрованные в поиске -->
      <li
        v-else
        class="item"
        v-for="milling in filteredMillingList"
        @click="changeMilling(milling)"
      >
        <img class="item__img" :src="_URL + milling.PREVIEW_PICTURE" alt="" />
        <div class="item__name">{{ milling.NAME }}</div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.relative__wrapper {
  display: flex;
  flex-direction: column;
  position: relative;
  max-height: 100vh;
  overflow: hidden;
  margin-right: 0px;
  border: 1px solid $dark-grey;
  border-radius: 15px;
  padding: 10px 10px 0px 10px;
}
.search {
  width: 95%;
  border-radius: 15px;
  padding: 10px 15px;
}

.list {
  height: 100%;
  max-height: calc(85vh - 110px);
  margin-top: 10px;
  padding-right: 10px;
  box-sizing: border-box;
  overflow-y: scroll;
  box-sizing: border-box;
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
</style>

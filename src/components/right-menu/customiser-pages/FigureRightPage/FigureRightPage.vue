<script setup lang="ts">
import { ref, onBeforeMount, computed } from "vue";

import FigureFasade from "./FigureFasade/FigureFasade.vue";
import FigurePlinth from "./FigurePlinth/FigurePlinth.vue";

import defaultTab from "@/components/ui/tabs/defaultTab.vue";
import { Tab } from "@/components/ui/tabs/defaultTab.vue";
import { useFigureRightPage } from "./useFigureRightPage";

interface ITabChangeParams {
  index: number;
  tab: Tab;
}

const { figureItems, createSurfaceList, createPlinthData } =
  useFigureRightPage();

const currentFigure = ref<string>("Handles");
const optionsTabChange = ({ tab }: ITabChangeParams) => {
  currentFigure.value = tab.name;
};
const filteredFigure = computed(() => {
  const figureTypeMap: Record<string, Function> = {
    Handles: createSurfaceList,
    Plinth: createPlinthData,
  };

  return figureTypeMap[currentFigure.value]?.();
});
</script>

<template>
  <div class="figure">
    <defaultTab :tabs="figureItems" @tab-change="optionsTabChange" />
    <FigureFasade :data="filteredFigure" v-if="currentFigure == 'Handles'" />
    <FigurePlinth :data="filteredFigure"  v-if="currentFigure == 'Plinth'" />
  </div>
</template>

<style lang="scss" scoped>
.figure {
  height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
  gap: 10px;

  // .customiser-section-non {
  //   display: flex;
  //   flex-direction: column;
  //   gap: 15px;
  //   .settings-figure {
  //     display: flex;
  //     flex-direction: column;
  //     gap: 5px;
  //     .figure__links {
  //       display: flex;
  //       gap: 5px;
  //     }
  //     .figure-item {
  //       display: flex;
  //       flex-direction: column;
  //       gap: 5px;
  //       padding: 15px;
  //       box-sizing: border-box;
  //       border: 1px solid $dark-grey;
  //       border-radius: 15px;
  //       .item-header {
  //         display: flex;
  //         justify-content: space-between;
  //         .item__title {
  //           font-weight: 600;
  //         }
  //       }
  //       .item-group {
  //         display: flex;
  //         flex-direction: column;
  //         gap: 5px;
  //         &-figure {
  //           display: flex;
  //           align-items: center;
  //           justify-content: space-between;
  //           padding: 10px;
  //           border-radius: 15px;
  //           background-color: $bg;
  //           .item-group-name {
  //             display: flex;
  //             align-items: center;
  //             gap: 10px;
  //             .name__text {
  //               font-weight: 500;
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  //   .move-checkboxes {
  //     display: flex;
  //     flex-direction: column;
  //     gap: 5px;
  //     padding: 0 10px;
  //     .item__checkbox {
  //       display: flex;
  //       align-items: center;
  //       gap: 5px;
  //       label {
  //         font-size: 9px;
  //         font-weight: 500;
  //       }
  //     }
  //   }
  // }
}
</style>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from "vue";

import FigureFasade from "./FigureFasade/FigureFasade.vue";
import FigurePlinth from "./FigurePlinth/FigurePlinth.vue";

import defaultTab from "@/components/ui/tabs/defaultTab.vue";
import { Tab } from "@/components/ui/tabs/defaultTab.vue";
import { useFigureRightPage, IFigureItems } from "./useFigureRightPage";

interface ITabChangeParams {
  index: number;
  tab: Tab;
}

type TexistItem = {
  Handles: boolean;
  Plinth: boolean;
};

const plinthExist = ref<boolean>(false);
const handlesExist = ref<boolean>(false);
const prepareTabData = ref<IFigureItems[] | []>([]);

const currentFigure = ref<string>("");

const { figureItems, createSurfaceList, createPlinthData } =
  useFigureRightPage();

const optionsTabChange = ({ tab }: ITabChangeParams) => {
  currentFigure.value = tab.name;
};

onBeforeMount(() => {
  plinthExist.value = createPlinthData().length > 0;
  handlesExist.value = createSurfaceList().length > 0;

  const checkExist: TexistItem = {
    Handles: Object.values(createSurfaceList()).length > 0,
    Plinth: Object.values(createPlinthData()).length > 0,
  };

  prepareTabData.value = figureItems.filter((el) => {
    if (checkExist[el.name as keyof TexistItem]) {
      return el;
    }
  }) as IFigureItems[];



  currentFigure.value = prepareTabData.value[0].name;
});

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
    <defaultTab :tabs="prepareTabData" @tab-change="optionsTabChange" />
    <FigureFasade :data="filteredFigure" v-if="currentFigure == 'Handles'" />
    <FigurePlinth :data="filteredFigure" v-if="currentFigure == 'Plinth'" />
  </div>
</template>

<style lang="scss" scoped>
.figure {
  height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>

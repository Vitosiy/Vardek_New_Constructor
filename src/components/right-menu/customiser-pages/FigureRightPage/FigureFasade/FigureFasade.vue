<script setup lang="ts">
import { ref, onBeforeMount, computed } from "vue";
import { useEventBus } from "@/store/appliction/useEventBus";
import { Tab } from "@/components/ui/tabs/defaultTab.vue";
import { THandlesItem } from "../useFigureRightPage";
import { TFasadeProp } from "@/types/types";

import MaterialSelector from "@/components/right-menu/customiser-pages/ColorRightPage/MaterialSelector.vue";
import ConfigurationOption from "../../ColorRightPage/ConfigurationOption.vue";
import DirectionControl from "@/components/left-menu/option/direction/DirectionControl.vue";
import defaultTab from "@/components/ui/tabs/defaultTab.vue";

interface ITabChangeParams {
  index: number;
  tab: Tab;
}
type TFigureFasad = {
  ndx: number;
  data: Record<string, string>;
  props: TFasadeProp | Record<string, string>;
};

const eventBus = useEventBus();

const clearId = 69920;
const controllerVisible = ref<Boolean>(false);

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const figureFasad = ref<TFigureFasad>({
  ndx: 0,
  data: {},
  props: {},
});

onBeforeMount(() => {
  const startProp = props.data[0].props;
  const curHandleId = startProp.HANDLES.id;
  const drawer = startProp.HANDLES.drawer !== null;
  handleList.value = props.data[0].action();
  figureFasad.value.ndx = 0;
  figureFasad.value.props = startProp;
  controllerVisible.value = curHandleId !== clearId && !drawer;

  getCurrendHendleData(figureFasad.value.props);
});

const handleList = ref<THandlesItem[]>();

const handleTabChange = ({ index, tab }: ITabChangeParams) => {
  figureFasad.value.ndx = index;
  figureFasad.value.props = tab.props;
  getCurrendHendleData(tab.props);
};

const getCurrendHendleData = (prop) => {
  const curHandleId = prop.HANDLES.id;
  const curHandleData = handleList.value!.find((el) => el.ID === curHandleId);
  figureFasad.value.data = curHandleData;
};

const onHandleSelect = (data) => {
  figureFasad.value.data = data;

  controllerVisible.value =
    data.ID !== clearId && figureFasad.value.props.HANDLES.drawer === null;
  eventBus.emit("A:AddHandle", {
    data: { id: data.ID, model: data.models },
    fasadeNdx: figureFasad.value.ndx,
  });
};

const onChangeHandlePos = (pos) => {
  eventBus.emit("A:ChangeHandlePose", {
    data: pos,
    fasadeNdx: figureFasad.value.ndx,
  });
};

const onDeleteHandle = () => {
  const curHandleData = handleList.value!.find((el) => el.ID === clearId);

  figureFasad.value.data = curHandleData;
  controllerVisible.value = false;
  eventBus.emit("A:DeliteHandle", {
    data: curHandleData,
    fasadeNdx: figureFasad.value.ndx,
  });
};
</script>
<template>
  <div class="handles__wraper">
    <defaultTab :tabs="props.data" @tab-change="handleTabChange" />
    <div class="handles__container">
      <div class="handles__header">
        <ConfigurationOption
          @delete-choise="onDeleteHandle"
          :type="'Handles'"
          :data="figureFasad.data"
        />
        <DirectionControl
          v-if="controllerVisible"
          :type="'smallMap'"
          @changeDirectionPos="onChangeHandlePos"
          :container="'card'"
          :scale="1"
          :gap="2"
          :max-width="120"
          :size="20"
          :fontSize="10"
        />
      </div>
      <MaterialSelector @select="onHandleSelect" :materials="handleList" />
    </div>
  </div>
</template>
<style lang="scss">
.handles {
  &__wraper {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: 74vh;
    padding-bottom: 25px;
  }
  &__container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    border: 1px solid #ecebf1;
    border-radius: 10px;
    padding: 15px;
    max-height: 100vh;
    overflow: hidden;
    box-sizing: border-box;

    .redactor {
      &__list {
        max-height: calc(50vh - 110px);
      }
    }
  }
  &__header {
    display: flex;
    align-items: center;
    gap: 15px;
  }
}
</style>

<script setup lang="ts">
//@ts-nocheck
import { ref, onBeforeMount, computed, nextTick } from "vue";
import { useEventBus } from "@/store/appliction/useEventBus";
import { Tab } from "@/components/ui/tabs/defaultTab.vue";
import { THandlesItem } from "../useFigureRightPage";
import { TFasadeProp, FasadeTextAlignAction } from "@/types/types";
import { useModelState } from "@/store/appliction/useModelState";
import { useHandlesAction } from "./useHandlesAction";

import MaterialSelector from "@/components/right-menu/customiser-pages/ColorRightPage/MaterialSelector.vue";
import ConfigurationOption from "../../ColorRightPage/ConfigurationOption.vue";
import DirectionControl from "@/components/ui/direction/DirectionControl.vue";
import defaultTab from "@/components/ui/tabs/defaultTab.vue";

interface ITabChangeParams {
  index: number;
  tab: Tab;
}
type TFigureFasad = {
  ndx: number;
  name: string;
  data: Record<string, string>;
  props: TFasadeProp | Record<string, string>;
};

const eventBus = useEventBus();
const modelState = useModelState();
const handlesAction = useHandlesAction();

const { getControllerData } = handlesAction;

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

const handlePos = ref<number[] | []>([]);
const handleList = ref<THandlesItem[]>();

onBeforeMount(() => {
  const model = modelState.getCurrentModel;
  const { FASADE_TYPE, FASADE_POSITIONS } = model?.userData.PROPS.CONFIG;

  const filtered = FASADE_TYPE.filter((el) => el !== null);
  let index;

  if (
    FASADE_POSITIONS[0].FASADE_TYPE.findIndex((item) => item !== null) == -1
  ) {
    const tempIndex = FASADE_TYPE.findIndex((item) => item !== null);
    index = FASADE_TYPE.findIndex((item) => item !== null);

  } else {
    index = FASADE_POSITIONS[0].FASADE_TYPE.findIndex((item) => item !== null);
  }

  const startProp = props.data[index].props;
  const curHandleId = startProp.HANDLES.id;
  const drawer = startProp.HANDLES.drawer !== null;
  handleList.value = props.data[index].action();
  figureFasad.value.ndx = index;
  figureFasad.value.props = startProp;
  figureFasad.value.name = props.data[index].name;

  getCurrendHendleData(figureFasad.value.props);
  handlePos.value = getControllerData(index);

  controllerVisible.value = checkControllerVisible.value;
});

const handleTabChange = ({ index, tab }: ITabChangeParams) => {
  figureFasad.value.ndx = index;
  figureFasad.value.props = tab.props;

  controllerVisible.value = checkControllerVisible.value;

  getCurrendHendleData(tab.props);
  handlePos.value = getControllerData(index);
};

const getCurrendHendleData = (prop) => {
  const curHandleId = prop.HANDLES.id;
  const curHandleData = handleList.value!.find((el) => el.ID === curHandleId);
  figureFasad.value.data = curHandleData;
};

const onHandleSelect = (data) => {
  figureFasad.value.data = data;
  controllerVisible.value =
    figureFasad.value.props.HANDLES.drawer === null && data.ID !== clearId;
  // handlePos.value.length > 1;

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

const checkControllerVisible = computed(() => {
  return (
    figureFasad.value.props.HANDLES.id !== clearId &&
    figureFasad.value.props.HANDLES.drawer === null
    // handlePos.value.length > 1
  );
});
</script>
<template>
  <div class="handles__wraper">
    <defaultTab
      :tabs="props.data"
      :initialTab="figureFasad.name"
      @tab-change="handleTabChange"
    />
    <div class="handles__container">
      <div class="handles__header">
        <ConfigurationOption
          @delete-choise="onDeleteHandle"
          :type="'Handles'"
          :data="figureFasad.data"
        />
        <DirectionControl
          v-if="controllerVisible"
          :handle-pos="handlePos"
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

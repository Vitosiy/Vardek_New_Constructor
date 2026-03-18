<script lang="ts" setup>
//@ts-nocheck
import MaterialSelector from "@/components/right-menu/customiser-pages/ColorRightPage/MaterialSelector.vue";
import ConfigurationOption from "@/components/right-menu/customiser-pages/ColorRightPage/ConfigurationOption.vue";
import {
  ref,
  onMounted,
  onBeforeMount,
  toRefs,
} from "vue";
import { useModelState } from "@/store/appliction/useModelState.ts";
import { useEventBus } from "@/store/appliction/useEventBus.ts";
import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import SurfaceRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/SurfaceRedactor.vue";
import FillingsRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/FillingsRedactor.vue";

type TFilling = "TABLE" | "any";

const props = defineProps({
  module: {
    type: Object,
    default: {},
    required: true,
  },
  productList: {
    type: Array,
    default: [],
    required: true,
  },
  UMconstructor: {
    type: UMconstructorClass,
    required: true,
  },
  type: {
    type: <TFilling>String,
    required: true,
  }
});
const { module, productList, UMconstructor } = toRefs(props);

const materialList = ref([]);
const selectedTable = ref(null);

const currentSurfaceData = ref<any>({});

const emit = defineEmits(["parent-callback"]);


const callback = (data: any, type: TFilling) => {
  emit("parent-callback", data, type);
};
onBeforeMount(() => {
  const UM_data = UMconstructor?.value?.UM_STORE.getUMData()
  const TOPFASADECOLOR = UM_data?.CONFIG['TOPFASADECOLOR'];
  selectedTable.value = TOPFASADECOLOR || null;

  if(productList?.value?.length) {
    materialList.value = [...productList.value]
  }
  else
    materialList.value = []
});

onMounted(() => {
  const UM_data = UMconstructor?.value?.UM_STORE.getUMData()
  const TOPFASADECOLOR = UM_data?.CONFIG['TOPFASADECOLOR'];
  selectedTable.value = TOPFASADECOLOR || {};

  let current
  if (materialList.value[0]?.PRODUCTS){
    for (let item of materialList.value) {
      let PRODUCTS: Array = item.PRODUCTS

      current = PRODUCTS!.find(
          (m) => m.ID == selectedTable.value.TABLE
      );

      if(current)
        break;
    }
  }
  else
    current = materialList.value!.find(
        (m) => m.ID === selectedTable.value.TABLE
    );

  if (current) {
    currentSurfaceData.value = {
      name: current.NAME,
      imgSrc: current.DETAIL_PICTURE || current.PREVIEW_PICTURE,
    };
  }
});

const changeTable = (data: any) => {
  currentSurfaceData.value = {
    name: data.NAME,
    imgSrc: data.DETAIL_PICTURE || data.PREVIEW_PICTURE,
  };

  callback(data, props.type)
};

const clearTable = () => {
  changeTable({})
};

</script>

<template>
  <div class="container container">
    <h1 class="color__title">Столешница: </h1>

    <div class="configuration">
      <ConfigurationOption
          :type="'toptable'"
          :data="currentSurfaceData"
          @delete-choise="clearTable"
      />
    </div>
    <FillingsRedactor
        :product-list="materialList"
        :temp-work="true"
        @parent-callback="changeTable"
    />
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  border: 1px solid $stroke;
  border-radius: 10px;
  padding: 15px;
  max-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;

  &__title {
    font-size: large;
    font-weight: 600;
  }
}

.configuration {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 8px;

  &__item {
    height: 50px;
    border: 1px solid grey;
    border-radius: 5px;
  }

  @media (min-height: 1000px) {
    gap: 17px;
  }
}
</style>

<script setup lang="ts">
// @ts-nocheck
import Modal from "@/components/ui/modals/Modal.vue";
import { defineExpose, ref } from "vue";
import Module2DConstructor2 from "@/components/2DmoduleConstructor/Module2DConstructor2.vue";
import { useEventBus } from "@/store/appliction/useEventBus.ts";

const props = defineProps({
  product: {
    type: Object || null,
    // required: true,
  },
});

const eventBus = useEventBus();

const universalModule2DConstructor = ref();
const universalModuleData = ref({});
const isUMModalOpen = ref(false);
const gridUMSaved = ref(false);
const universalModuleCash = ref({});

const selectUMData = (data) => {
  universalModuleData.value = data;
};

const saveUMData = ({ data, canvasHeight }) => {
  if (!props.product) return;
  if (!props.product.userData) return;

  console.log(props.product);

  universalModuleCash.value = props.product.userData.PROPS.CONFIG.MODULEGRID =
    universalModule2DConstructor.value.saveGrid();

  gridUMSaved.value = true;
  eventBus.emit("A:UM-update", universalModuleCash.value);
};

const openUMRedactor = () => {
  isUMModalOpen.value = true;
  /*const menuStore = useMenuStore();
  menuStore.openMenu('2dModuleConstructor', universalModuleData.value.object.globalData, [universalModuleData.value.object])*/
};

const closeUMRedactor = () => {
  if (!gridUMSaved.value)
    props.product.userData.PROPS.CONFIG.MODULEGRID = universalModuleCash.value;

  universalModuleData.value = false;
  isUMModalOpen.value = false;
  gridUMSaved.value = false;
};

defineExpose({
  selectUMData,
});
</script>

<template>
  <Modal
    v-if="universalModuleData && props.product"
    :container="`modal--tableTop`"
    @open-modal="openUMRedactor"
    @close-modal="closeUMRedactor"
  >
    <template #modalBody="{ onModalClose }" class="modal--tableTop">
      <Module2DConstructor2
        v-if="isUMModalOpen"
        ref="universalModule2DConstructor"
        :productData="universalModuleData.PROPS"
        :canvasHeight="universalModuleData.canvasHeight"
        :canvasWidth="universalModuleData.canvasWidth"
      >
        <template #save>
          <button class="actions-btn actions-btn--footer" @click="saveUMData">
            Сохранить
          </button>
        </template>

        <template #close>
          <button
            @click="
              () => {
                onModalClose();
              }
            "
            class="actions-btn actions-btn--footer"
          >
            Закрыть
          </button>
        </template>
      </Module2DConstructor2>
    </template>
    <template #modalOpen="{ onModalOpen }">
      <button class="cut-btn" @click="onModalOpen">
        <img class="cut-icon" src="/icons/cut.svg" alt="" />
      </button>
    </template>
  </Modal>
</template>

<style  lang="scss">
.modal {
  &--tableTop {
    border: none;
    max-height: 95vh;
    max-width: 95vw;
    display: none;
    border-radius: 8px;
    overflow: hidden;
  }
}

.cut {
  &-btn {
    width: 50px;
    height: 50px;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    background-color: #ecebf1;
    border: 2px solid #ffffff;
    border-radius: 360px;
    cursor: pointer;
    transition: 0.05s;
    pointer-events: auto;
    transform: translate(65px, -30px);
  }

  &-icon {
    width: 25px;
    height: 25px;
    svg {
      g {
        path {
          fill: black;
        }
      }
    }
  }
}
</style>

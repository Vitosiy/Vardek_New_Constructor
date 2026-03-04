<script setup lang="ts">
// @ts-nocheck
import Modal from "@/components/ui/modals/Modal.vue";
import {defineExpose, onBeforeMount, onBeforeUnmount, ref} from "vue";
import { useEventBus } from "@/store/appliction/useEventBus.ts";
import {saveUMGrid} from "@/components/2DmoduleConstructor/utils/Methods.ts";
import MainView from "@/components/UMconstructor/views/MainView.vue"
import {useUMStorage} from "@/store/appStore/UniversalModule/useUMStorage.ts";
import GenericLoader from "@/components/ui/loader/GenericLoader.vue";

const props = defineProps({
  product: {
    type: Object || null,
    // required: true,
  },
});

const eventBus = useEventBus();
const UMstore = useUMStorage()

const universalModule2DConstructor = ref();
const universalModuleData = ref({});
const isUMModalOpen = ref(false);
const gridUMSaved = ref(false);

const selectUMData = (data) => {
  universalModuleData.value = data;
  UMstore.setUMData(data.PROPS.PROPS);
};

const saveUMData = ({ data, canvasHeight }) => {
  if (!props.product) return;
  if (!props.product.userData) return;

  let saveData = universalModule2DConstructor.value.saveGrid()

  if(!saveData)
    return;

  let tmp_result = saveUMGrid(saveData)

  props.product.userData.PROPS.CONFIG.MODULEGRID = tmp_result;
  UMstore.setUMCashGrid(tmp_result)

  gridUMSaved.value = true;
  eventBus.emit("A:UM-update", UMstore.getUMCashGrid());
};

const openUMRedactor = () => {
  const {PROPS} = props.product.userData
  const {CONFIG} = PROPS
  const {
    MODULEGRID,
    BACKWALL,
    RIGHTSIDECOLOR,
    LEFTSIDECOLOR,
    HORIZONT,
    MODULE_COLOR,
    TSARGA,
    TOPFASADECOLOR,
    OPTIONS,
    EXPRESSIONS
  } = CONFIG

  if(MODULEGRID)
    UMstore.setUMCashGrid(MODULEGRID)

  let universalModuleConfigCash = {
    HORIZONT,
    MODULE_COLOR,
    EXPRESSIONS : {...EXPRESSIONS}
  };

  if(BACKWALL)
    universalModuleConfigCash.BACKWALL = {...CONFIG.BACKWALL};

  if(RIGHTSIDECOLOR)
    universalModuleConfigCash.RIGHTSIDECOLOR = {...CONFIG.RIGHTSIDECOLOR};

  if(LEFTSIDECOLOR)
    universalModuleConfigCash.LEFTSIDECOLOR = {...CONFIG.LEFTSIDECOLOR};

  if(TSARGA)
    universalModuleConfigCash.TSARGA = {...CONFIG.TSARGA};

  if(TOPFASADECOLOR)
    universalModuleConfigCash.TOPFASADECOLOR = {...CONFIG.TOPFASADECOLOR};

  if(OPTIONS?.length) {
    universalModuleConfigCash.OPTIONS = [...CONFIG.OPTIONS.map(opt => {
      return {...opt}
    })];
  }

  UMstore.setUMCashConfig(universalModuleConfigCash)
  isUMModalOpen.value = true;
};

const closeUMRedactor = () => {
  if (!gridUMSaved.value) {
    props.product.userData.PROPS.CONFIG.MODULEGRID = saveUMGrid(UMstore.getUMCashGrid());
    props.product.userData.PROPS.CONFIG = Object.assign(props.product.userData.PROPS.CONFIG, UMstore.getUMCashConfig());
  }

  universalModuleData.value = false;
  isUMModalOpen.value = false;
  gridUMSaved.value = false;

  UMstore.setUMCashConfig()
  UMstore.setUMCashGrid()
  UMstore.setUMData()
  UMstore.setUMGrid()
  UMstore.setSelected("module")
  UMstore.setSelected("fasades")
  UMstore.setSelected("fillings")
};

onBeforeUnmount(()=>{
  universalModuleData.value = false;
  isUMModalOpen.value = false;
  gridUMSaved.value = false;

  UMstore.setUMCashConfig()
  UMstore.setUMCashGrid()
  UMstore.setUMData()
  UMstore.setUMGrid()
  UMstore.setSelected("module")
  UMstore.setSelected("fasades")
  UMstore.setSelected("fillings")
})

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
      <div class="um-modal-body-wrapper">
        <MainView
          v-if="isUMModalOpen"
          ref="universalModule2DConstructor"
          :productData="universalModuleData.PROPS"
          :canvasHeight="universalModuleData.canvasHeight"
          :canvasWidth="universalModuleData.canvasWidth"
        >
          <template #save>
            <button class="no-select actions-btn actions-btn--footer" @click="saveUMData">
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
              class="no-select actions-btn actions-btn--footer"
            >
              Закрыть
            </button>
          </template>
        </MainView>

        <div v-if="UMstore.getLoad" class="um-modal-loader-overlay">
          <GenericLoader />
        </div>
      </div>
    </template>
    <template #modalOpen="{ onModalOpen }">
      <button class="no-select cut-btn" @click="onModalOpen">
        <img class="cut-icon" src="/icons/cut.svg" alt="" />
      </button>
    </template>
  </Modal>
</template>

<style  lang="scss">
.um-modal-body-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.um-modal-loader-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.4);
  pointer-events: all;
}

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

.no-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none;     /* IE 10+ и Edge */
  user-select: none;         /* Стандарт: Chrome, Firefox, Opera, Edge */
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

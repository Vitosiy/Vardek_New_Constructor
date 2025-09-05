<script setup lang="ts">
//@ts-nocheck
import {
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  ref,
  computed,
} from "vue";
import { useRoute } from "vue-router";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useSceneState } from "@/store/appliction/useSceneState";
import { useMenuStore } from "@/store/appStore/useMenuStore";
import { useRoomState } from "@/store/appliction/useRoomState";
import { useModelState } from "@/store/appliction/useModelState";
import { useCustomiserStore } from "@/store/appStore/useCustomiserStore";
import { useRoomOptions } from "../left-menu/option/roomOptions/useRoomOptons";
import { TApplication } from "@/types/types";

import {
  postRequest,
  _POST_URL,
  _GET_URL,
  _GET_PROJECT,
  _UPDATE_PROJECT,
} from "@/types/constants";

import Modal from "../ui/modals/Modal.vue";
import InputDialog from "../ui/inputs/InputDialog.vue";
import MainButton from "../ui/buttons/MainButton.vue";

import LeftLightHeaderButton from "@/components/ui/buttons/header/LeftLightHeaderButton.vue";
import RightLightHeaderButton from "@/components/ui/buttons/header/RightLightHeaderButton.vue";
import S2DLightHeaderButton from "@/components/ui/buttons/header/S2DLightHeaderButton.vue";
import S3DLightHeaderButton from "@/components/ui/buttons/header/S3DLightHeaderButton.vue";

import AddLightHeaderButton from "@/components/ui/buttons/header/AddLightHeaderButton.vue";
import BuyBasketButton from "@/components/ui/buttons/header/BuyBasketButton.vue";

import { QuickActionsToolbar } from "@/features/quickActions";
import AddPhotoHelperButton from "@/components/ui/buttons/header/helpers/AddPhotoHelperButton.vue";
import GetAppHelperButton from "@/components/ui/buttons/header/helpers/GetAppHelperButton.vue";
import VisibilityHelperButton from "@/components/ui/buttons/header/helpers/VisibilityHelperButton.vue";

const props = defineProps(["pageComponent"]);
const route = useRoute();
import Avatar from "@/components/header/Avatar.vue";

const historyActions = ref<boolean>(false);
const verdekConstructor = ref<TApplication | null>(null);
const inputDialogRef = ref<InstanceType<typeof Modal> | null>(null);
const restorLength = ref<number>(0);
const curActionCount = ref<number>(0);
const contentLoaded = ref<boolean>(true);
const drowModeValue = ref<boolean>(false);
const rulerVisibility = ref<boolean>(true);

const eventBus = useEventBus();
const sceneState = useSceneState();
const menuStore = useMenuStore();
const roomState = useRoomState();
const modelState = useModelState();
const roomOptions = useRoomOptions()
const customiserStore = useCustomiserStore();

const _saveProject = async () => {
  eventBus.emit("A:Save");
  const project = sceneState.getCurrentProjectParams;
  const data = {
    user_hash: "08a57654db94bdcfe44a9ee10b2f0778",
    city: 17281,
    designer: "14240",
    page: 1,
    config: 43830,
    type: "user",
  };
  console.log(data);

  await postRequest(`${_GET_URL}`, data);

  // if (historyActions.value) eventBus.emit("A:Save");
};

const saveProject = async () => {
  eventBus.emit("A:Save");
  return;
  const project = sceneState.getCurrentProjectParams;
  const data = {
    data: {
      file: "data:image/jpeg;base64,",
      provider: "vardek",
      name: "test_new_constructor",
      user_hash: "08a57654db94bdcfe44a9ee10b2f0778",
      city: 17281,
      project: project,
      style: "689680",
      projectId: Date.now().toString(),
      user_id: "14240",
    },
  };
  console.log(data);

  await postRequest(`${_POST_URL}`, data);

  // if (historyActions.value) eventBus.emit("A:Save");
};

// const drowMode = async () => {
//   drowModeValue.value = !drowModeValue.value;
//   menuStore.setDrowModeValue(drowModeValue.value);
//   eventBus.emit("A:DrawingMode", drowModeValue.value);
// };

// const toggleRulerVisibility = async () => {
//   rulerVisibility.value = !rulerVisibility.value;
//   menuStore.setRulerVisibility(rulerVisibility.value);
//   eventBus.emit("A:ToggleRulerVisibility", rulerVisibility.value);
// };

const loadProject = async () => {
  // return;
  const data = {
    id: "11487677",
  };
  await postRequest(`${_GET_PROJECT}`, data);
};

const updateProject = async () => {
  const project = sceneState.getCurrentProjectParams;
  const data = {
    id: "11323197",
    project: project,
  };

  const resp = await postRequest(`${_UPDATE_PROJECT}`, data);

  console.log(JSON.parse(resp.DATA.DETAIL_TEXT), "RESP");
};

const createNewRoom = (value: string) => {
  if (!verdekConstructor.value) return;
  props.pageComponent.selected();
  roomOptions.resetGlobalOptions();
  
  menuStore.setRulerVisibility(true);
  menuStore.setDrowModeValue(false);

  eventBus.emit("A:Create", value);
  restorLength.value = 0;
  curActionCount.value = 0;
  menuStore.closeAllMenus();
};

const checkContantLoad = (state: boolean) => {
  contentLoaded.value = state;
};

const moreThenActions = computed(() => {
  return (
    curActionCount.value + 1 > restorLength.value || restorLength.value == 0
  );
});

const lessThenActions = computed(() => {
  return curActionCount.value - 1 < 0;
});

const prevAction = () => {
  if (historyActions.value) {
    /** Активируем preloader */
    contentLoaded.value = false;
    props.pageComponent.activePreloader = false;
    eventBus.emit("A:PrevAction");
    curActionCount.value = verdekConstructor.value!.userHistory._currentIndex;
    props.pageComponent.selected();
    customiserStore.hideCustomiserPopup();
  }
};

const nextAction = () => {
  if (historyActions.value) {
    /** Активируем preloader */
    contentLoaded.value = false;
    props.pageComponent.activePreloader = false;
    eventBus.emit("A:NextAction");
    curActionCount.value = verdekConstructor.value.userHistory._currentIndex;
    props.pageComponent.selected();
    customiserStore.hideCustomiserPopup();
  }
};

const addEvents3D = () => {
  eventBus.on("A:Load", () => {
    props.pageComponent.selected();

    restorLength.value = 0;
    curActionCount.value = 0;
  });

  eventBus.on("A:ChangeCameraPos", () => {
    props.pageComponent.selected();
  });

  eventBus.onEmitCalled(async (event, payload) => {
    if (!historyActions.value) return;
    if (!verdekConstructor.value) return;
    await nextTick();
    if (verdekConstructor.value.userHistory.checkEvent(event)) {
      const total = verdekConstructor.value.userHistory.getHistory().length - 1;
      restorLength.value = total;
      curActionCount.value = total;
    }
  });
  eventBus.on("A:ContantLoaded", checkContantLoad);
};

const getHistoruBtnsState = computed(() => {
  return {
    disabled: !contentLoaded.value,
  };
});

/** @Проверка загрузки Application доп функция */
const waitForConstructor = async (timeout = 2000, interval = 50) => {
  const start = Date.now();

  return new Promise<TApplication | null>((resolve) => {
    const check = () => {
      if (props.pageComponent?.VerdekConstructor) {
        resolve(props.pageComponent.VerdekConstructor);
        return;
      }
      if (Date.now() - start >= timeout) {
        resolve(null); // не дождались
        return;
      }
      setTimeout(check, interval);
    };
    check();
  });
};

watch(
  () => route.path,
  async (newPath, oldPath) => {
    menuStore.setRulerVisibility(true);
    menuStore.setDrowModeValue(false);
    modelState.setCurrentModel(null);
    roomState.mergeRoomsData();

    historyActions.value = false;
    restorLength.value = 0;
    curActionCount.value = 0;

    let constructor = await waitForConstructor();
    await nextTick();

    if (constructor) {
      verdekConstructor.value = constructor as TApplication;
      historyActions.value = true;
      addEvents3D();

      return;
    }
  },
  // { immediate: true }
  { flush: "post", immediate: true }
);

onBeforeUnmount(() => {
  restorLength.value = 0;
  curActionCount.value = 0;
});
</script>

<template>
  <section class="header">
    <div class="header__container">
      <div class="header-main">
        <router-link to="/" class="header-link">
          <img class="header-link__logo" src="@/assets/img/logo.png" />
        </router-link>
        <div class="header-main-ui">
          <div
            :class="['history', 'history__btns', getHistoruBtnsState]"
            v-if="historyActions && route.path == '/3d'"
          >
            <!-- {{ restorLength }}{{ curActionCount }} -->
            <LeftLightHeaderButton
              @click="prevAction"
              :class="{ disabled: lessThenActions }"
            />
            <RightLightHeaderButton
              @click="nextAction"
              :class="{ disabled: moreThenActions }"
            />
          </div>
          <div class="header-ui-group">
            <S2DLightHeaderButton />
            <S3DLightHeaderButton />
          </div>
          <div class="header-ui-group" v-if="route.path == '/3d'">
            <Modal ref="inputDialogRef">
              <template #modalBody="{ onModalClose }">
                <InputDialog
                  label="Назовите комнату"
                  placeholder="Введите название"
                  initialValue="Комната"
                  confirmText="Создать"
                  @confirm="createNewRoom"
                >
                  <template #confirmButton="{ onConfirm }">
                    <MainButton
                      @click="
                        () => {
                          onConfirm();
                          onModalClose();
                        }
                      "
                    >
                      Создать
                    </MainButton>
                  </template>
                  <template #cancelButton>
                    <MainButton @click="onModalClose">Отменить</MainButton>
                  </template>
                </InputDialog>
              </template>
              <template #modalOpen="{ onModalOpen }">
                <button class="button__rounded" @click="onModalOpen">
                  <span class="icon icon-add"></span>
                </button>
              </template>
            </Modal>
          </div>
          <!-- <div class="header-ui-group" v-if="route.path=='/3d'">
            <button class="button__rounded" @click="drowMode">
              <span class="icon icon-show"></span>
            </button>
          </div>
          <div class="header-ui-group" v-if="route.path=='/3d'">
            <button class="button__rounded" @click="toggleRulerVisibility">
              <span class="icon icon-ruler"></span>
            </button>
          </div> -->
        </div>
      </div>
      <div class="header-utilitys">
        <div class="header-basket">
          <div class="header-utilitys-basket">
            <p class="header-utilitys-basket-cost">14 548 ₽</p>
          </div>
          <BuyBasketButton />
        </div>
        <div class="header-utilitys-helpers">
          <QuickActionsToolbar />
          <!-- <AddPhotoHelperButton />-->
          <!-- <GetAppHelperButton @click="saveProject" />
          <VisibilityHelperButton @click="loadProject" />  -->
          <Avatar />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.header {
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid $light-stroke;

  &__container {
    width: 100%;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &-basket {
    position: relative;
  }
}

.header-utilitys {
  display: flex;
  align-items: center;
  gap: 60px;

  &-basket {
    position: relative;
  }

  &-helpers {
    display: flex;
    gap: 10px;
  }
}

.header-utilitys-basket {
  width: 201px;
  height: 50px;
  display: flex;
  border: 1.2px solid $black;
  border-radius: 50px;
  box-sizing: border-box;
  overflow: hidden;
}

.header-utilitys-basket-cost {
  width: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.header-main {
  width: 100%;
  max-width: 665px;
  display: flex;
  align-items: center;

  &-ui {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 30px;

    .header-ui-group {
      display: flex;
      gap: 10px;
    }
  }
}

.header-link {
  width: 100%;
  max-width: 315px;

  &__logo {
    width: 154px;
    height: 61px;
  }
}
.history {
  position: relative;
  &__btns {
    display: flex;
    gap: 10px;

    &.disabled {
      pointer-events: none;

      .light-radial__button {
      }
    }
  }
}
</style>

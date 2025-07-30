<script setup lang="ts">
// @ts-nocheck
import { useEventBus } from "@/store/appliction/useEventBus";
import { onMounted, watch, nextTick, ref, computed } from "vue";

import LeftLightHeaderButton from "@/components/ui/buttons/header/LeftLightHeaderButton.vue";
import RightLightHeaderButton from "@/components/ui/buttons/header/RightLightHeaderButton.vue";
import S2DLightHeaderButton from "@/components/ui/buttons/header/S2DLightHeaderButton.vue";
import S3DLightHeaderButton from "@/components/ui/buttons/header/S3DLightHeaderButton.vue";
import AddLightHeaderButton from "@/components/ui/buttons/header/AddLightHeaderButton.vue";

import BuyBasketButton from "@/components/ui/buttons/header/BuyBasketButton.vue";

import FullscreenHelperButton from "@/components/ui/buttons/header/helpers/FullscreenHelperButton.vue";
import ReportHelperButton from "@/components/ui/buttons/header/helpers/ReportHelperButton.vue";
import StudyHelperButton from "@/components/ui/buttons/header/helpers/StudyHelperButton.vue";
import AddPhotoHelperButton from "@/components/ui/buttons/header/helpers/AddPhotoHelperButton.vue";
import GetAppHelperButton from "@/components/ui/buttons/header/helpers/GetAppHelperButton.vue";
import InsertFileHelperButton from "@/components/ui/buttons/header/helpers/InsertFileHelperButton.vue";
import PrintHelperButton from "@/components/ui/buttons/header/helpers/PrintHelperButton.vue";
import VisibilityHelperButton from "@/components/ui/buttons/header/helpers/VisibilityHelperButton.vue";

const props = defineProps(["pageComponent"]);
const historyActions = ref<boolean>(false);
const verdekConstructor = ref(null);
const restorLength = ref<number>(0);
const curActionCount = ref<number>(0);

const eventBus = useEventBus();

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

const saveProject = () => {
  if (historyActions.value) eventBus.emit("A:Save");
};

const moreThenActions = computed(() => {
  return (
    curActionCount.value + 1 > restorLength.value || restorLength.value == 0
  );
});

const lessThenActions = computed(() => {
  return curActionCount.value - 1 < 0;
});

watch(
  () => props.pageComponent,
  async () => {
    await nextTick();
    const constructor = props.pageComponent.VerdekConstructor;

    if (constructor) {
      verdekConstructor.value = constructor;
      historyActions.value = true;
      return;
    }
    historyActions.value = false;
    restorLength.value = 0;
    curActionCount.value = 0;
  },
  { flush: "post", immediate: true }
);

const prevAction = () => {
  if (historyActions.value) {
    eventBus.emit("A:PrevAction");
    curActionCount.value = verdekConstructor.value.userHistory._currentIndex;
    props.pageComponent.selected();
  }
};

const nextAction = () => {
  if (historyActions.value) {
    eventBus.emit("A:NextAction");
    curActionCount.value = verdekConstructor.value.userHistory._currentIndex;
    props.pageComponent.selected();
  }
};
</script>

<template>
  <section class="header">
    <div class="header__container">
      <div class="header-main">
        <router-link to="/" class="header-link">
          <img class="header-link__logo" src="@/assets/img/logo.png" />
        </router-link>
        <div class="header-main-ui">
          <div class="header-ui-group" v-if="historyActions">
            {{ restorLength }}{{ curActionCount }}
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
          <div class="header-ui-group">
            <AddLightHeaderButton />
          </div>
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
          <FullscreenHelperButton />
          <ReportHelperButton />
          <StudyHelperButton />
          <AddPhotoHelperButton />
          <GetAppHelperButton @click="saveProject" />
          <InsertFileHelperButton />
          <PrintHelperButton />
          <VisibilityHelperButton />
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

  &-basket{
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
</style>

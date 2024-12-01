<script setup lang="ts">
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


</script>

<template>
  <section class="header">
    <div class="header__container">
      <div class="header-main">
        <router-link to="/" class="header-link">
          <img class="header-link__logo" src="@/assets/img/logo.png" />
        </router-link>
        <div class="header-main-ui">
          <div class="header-ui-group">
            <LeftLightHeaderButton />
            <RightLightHeaderButton />
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
        <div class="header-utilitys-basket">
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
          <GetAppHelperButton />
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
    .header-main {
      width: 100%;
      max-width: 665px;
      display: flex;
      align-items: center;
      .header-link {
        width: 100%;
        max-width: 315px;
        &__logo {
          width: 154px;
          height: 61px;
        }
      }
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
    .header-utilitys {
      display: flex;
      align-items: center;
      gap: 60px;
      &-basket {
        position: relative;
        .header-utilitys-basket {
          width: 201px;
          height: 50px;
          display: flex;
          border: 1.2px solid $black;
          border-radius: 50px;
          box-sizing: border-box;
          overflow: hidden;
          .header-utilitys-basket-cost {
            width: 170px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }
        }
      }
      &-helpers {
        display: flex;
        gap: 10px;
      }
    }
  }
}
</style>

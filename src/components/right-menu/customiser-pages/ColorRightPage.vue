<template>
  <div class="color">
    <div class="color__links">
      <MainButton className="red__button right-menu" @click="handleButtonClick">Фасад 1</MainButton>
      <MainButton className="grey__button right-menu" @click="handleButtonClick">Фасад 2</MainButton>
    </div>

    <!-- component -->
    <div class="customiser-section">
      <p class="customiser-section__title">Цвет фасада</p>
      <div class="settings-color">
        <div v-for="(item, index) in 3" :key="index" class="color-item">
          <div class="item-header">
            <p class="item__title">Эмаль RAL Classic</p>
            <img src="../../../assets/svg/right-menu/arrow.svg" class="item__arrow" />
          </div>

          <MainInput class="input__search" v-model="textValue" type="text" placeholder="Поиск..." />
          <div v-for="(item, index) in 3" :key="index" class="item-group">
            <p class="item-group__title text-grey">High gloss</p>
            <!-- component -->
            <div v-for="(item, index) in 3" :key="index" class="item-group-color">
              <div class="item-group-name">
                <img src="../../../assets/img/right-menu/bg.png" class="name__bg" />
                <p class="name__text">Антрацит металлик</p>
              </div>
              <img src="../../../assets/svg/right-menu/help.svg" class="item-group__question" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import MainButton from "@/components/ui/buttons/MainButton.vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
</script>
<style lang="scss" scoped>
.color {
  height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: scroll;
  &__links {
    display: flex;
    gap: 5px;
  }
  .customiser-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    border: 1px solid $stroke;
    border-radius: 15px;
    &__title {
      font-size: 18px;
      font-weight: 600;
    }
    .settings-color {
      display: flex;
      flex-direction: column;
      gap: 5px;
      .color-item {
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding: 15px;
        box-sizing: border-box;
        border: 1px solid $dark-grey;
        border-radius: 15px;
        .item-header {
          display: flex;
          justify-content: space-between;
          .item__title {
            font-weight: 600;
          }
        }
        .item-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          &-color {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            border-radius: 15px;
            background-color: $bg;
            .item-group-name {
              display: flex;
              align-items: center;
              gap: 10px;
              .name__text {
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }
}
</style>

<template>
  <div class="figure">
    <!-- component -->
    <div class="customiser-section-non">
      <MainInput class="input__search" v-model="textValue" type="text" placeholder="Поиск..." />
      <div class="figure__links">
        <MainButton className="red__button right-menu" @click="handleButtonClick">Фасад 1</MainButton>
        <MainButton className="grey__button right-menu" @click="handleButtonClick">Фасад 2</MainButton>
      </div>
      <div class="settings-figure">
        <div v-for="(item, index) in 3" :key="index" class="figure-item">
          <div class="item-header">
            <p class="item__title">Эмаль RAL Classic</p>
            <img src="../../../assets/svg/right-menu/arrow.svg" class="item__arrow" />
          </div>
          <!-- component -->
          <div v-for="(item, index) in 3" :key="index" class="item-group-figure">
            <div class="item-group-name">
              <img src="../../../assets/img/right-menu/bg.png" class="name__bg" />
              <p class="name__text">Антрацит металлик</p>
            </div>
            <img src="../../../assets/svg/right-menu/help.svg" class="item-group__question" />
          </div>
        </div>
      </div>
      <div class="move-checkboxes">
        <div v-for="(item, index) in 1" :key="index" class="item__checkbox">
          <input type="checkbox" name="" id="1">
          <label for="1">Без петель</label>
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
.figure {
  height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: scroll;
  .customiser-section-non {
    display: flex;
    flex-direction: column;
    gap: 15px;
    .settings-figure {
      display: flex;
      flex-direction: column;
      gap: 5px;
      .figure__links {
        display: flex;
        gap: 5px;
      }
      .figure-item {
        display: flex;
        flex-direction: column;
        gap: 5px;
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
          &-figure {
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
    .move-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 0 10px;
      .item__checkbox {
        display: flex;
        align-items: center;
        gap: 5px;
        label {
          font-size: 9px;
          font-weight: 500;
        }
      }
    }
  }
}
</style>

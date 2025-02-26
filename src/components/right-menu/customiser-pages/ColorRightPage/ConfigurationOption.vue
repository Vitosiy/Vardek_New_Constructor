<script lang="ts" setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  type: String,
  data: Object
})

let title = computed(() => {
  if(props.type === 'surface') return 'Тип покрытия'
  if(props.type === 'milling') return 'Тип фрезеровки'
  if(props.type === 'palette') return 'Цвет покрытия'
})
</script>

<template>
  <div class="config">
    <div class="config__top">
      <img class="config__img" src="../../../../assets/svg/surface-redactor/Frame 1793.svg" alt="">
      <img class="config__delete" src="../../../../assets/svg/surface-redactor/delete.svg" alt="">
    </div>
    <div class="config__bottom">
      <div class="config__title">
        {{ title }}
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.config {
  display: flex;
  flex-direction: column;
  height: 150px;
  width: 150px;
  padding: 8px;
  border-radius: 5px;
  box-shadow: 4px 4px 4px 4px rgba(34, 60, 80, 0.11);

  &__top {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 50%;
    width: 100%;
  }

  &__bottom {
  }

  &__delete {
    height: 25px;
  }

  &__title {
    color: rgb(131, 133, 135);
  }
}
</style>
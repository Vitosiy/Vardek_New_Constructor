<template>
  <div class="project-warning">
    <div class="warning-text">
      <p class="warning-text__title">Внимание</p>
      <p class="warning-text__text">Ваш проект не сохранен. При переходе на новый проект, данные текущего проекта не сохранятся</p>
    </div>
    <MainButton :className="'blue__button'" @click="$emit('save')">Сохранить</MainButton>
  </div>
</template>
<script setup>
import MainButton from '@/components/ui/buttons/MainButton.vue'
</script>
<style scoped lang="scss">
.project-warning {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F6F5FA;
  border-radius: 15px;
  padding: 19px 15px;
}

.warning-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>



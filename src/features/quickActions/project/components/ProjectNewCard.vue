<template>
  <div class="project-new" @click="$emit('create')">
    <img src="@/assets/svg/popup/add.svg" alt="" />
    <p class="new__title">Создать новый проект</p>
  </div>
</template>
<script setup>
</script>
<style scoped lang="scss">
.project-new {
  width: 323px;
  height: 269px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px solid $stroke;
  border-radius: 16px;
  box-sizing: border-box;
}
</style>



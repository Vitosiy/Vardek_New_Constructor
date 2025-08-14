<template>
  <div class="project-list">
    <ProjectNewCard @create="$emit('create')" />
    <ProjectCard v-for="item in items" :key="item.id" :item="item" @select="$emit('select', $event)" />
  </div>
</template>
<script setup lang="ts">
import ProjectCard from './ProjectCard.vue'
import ProjectNewCard from './ProjectNewCard.vue'
import type { ProjectListItem } from '../types'

defineProps<{ items: ProjectListItem[] }>()
</script>
<style scoped lang="scss">
.project-list {
  max-height: 500px;
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
  gap: 15px;
}
</style>



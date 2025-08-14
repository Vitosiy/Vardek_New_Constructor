<template>
  <div class="project-item" @click="$emit('select', item)">
    <img :src="item.previewUrl || placeholder" class="item__image" />
    <div class="item-info">
      <div class="info-id">
        <p class="id__name">{{ item.name || 'Название' }}</p>
        <p class="id__number text-grey">ID {{ item.id }}</p>
      </div>
      <p class="info__date text-grey">{{ item.updatedAt || '-' }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectListItem } from '../types'

const props = defineProps<{ item: ProjectListItem }>()
const placeholder = computed(() => new URL('@/assets/img/proj.png', import.meta.url).href)
</script>
<style scoped lang="scss">
.project-item {
  width: 323px;
  height: 269px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  border-radius: 16px;
  background-color: $bg;
  overflow: hidden;
}

.item__image {
  margin: 0;
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.item-info {
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 15px 10px;
  box-sizing: border-box;
}
</style>



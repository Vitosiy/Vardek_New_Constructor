<template>
  <div class="quick-actions">
    <Tooltip
      v-for="(action, index) in actions"
      :key="index"
      :content="action.tooltip"
      position="bottom"
    >
      <template #trigger>
        <button
          class="grey-radial__button"
          @click="action.action"
        >
          <span class="icon" :class="action.iconClass"></span>
        </button>
      </template>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
import Tooltip from '@/components/ui/tooltip/Tooltip.vue';
import { useQuickActionsToolbar } from './useQuickActionsToolbar';

const { actions } = useQuickActionsToolbar();
</script>

<style scoped>
.quick-actions {
  display: flex;
  gap: 8px;
}
</style> 
<template>
  <div class="tree-node" :style="{ marginLeft: `${level * 24}px`, display: 'flex', alignItems: 'center' }">
    <span v-if="!isLeaf" style="width: 16px; display: inline-block;">└</span>
    <MainButton
      :className="isLeaf && selectedTabId === node.id ? 'red__button' : 'grey__button'"
      :disabled="!isLeaf"
      @click="handleClick"
      style="margin: 2px 0; min-width: 120px; text-align: left;"
    >
      {{ node.title }}
    </MainButton>
    <div v-if="node.children && node.children.length">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selectedTabId="selectedTabId"
        :level="level + 1"
        @select-leaf="$emit('select-leaf', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import MainButton from '@/components/ui/buttons/MainButton.vue';

const props = defineProps({
  node: { type: Object, required: true },
  selectedTabId: { type: [Number, null], required: true },
  level: { type: Number, default: 0 },
});
const emit = defineEmits(['select-leaf']);

const isLeaf = computed(() => !props.node.children || props.node.children.length === 0);
const handleClick = () => {
  if (isLeaf.value) emit('select-leaf', props.node.id);
};
</script>

<style scoped>
.tree-node {
  white-space: nowrap;
  display: flex;
  align-items: center;
}
</style>
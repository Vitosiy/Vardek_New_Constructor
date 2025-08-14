<template>
  <div class="project-search">
    <MainInput class="input__search" v-model="name" type="text" placeholder="Название" />
    <MainInput class="input__search" v-model="pid" type="text" placeholder="ID" />
  </div>
  
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import MainInput from '@/components/ui/inputs/MainInput.vue'

const emit = defineEmits<{ (e: 'update:filters', value: { name: string; id: string }): void }>()

const name = ref('')
const pid = ref('')

watch([name, pid], () => {
  emit('update:filters', { name: name.value, id: pid.value })
})
</script>
<style scoped lang="scss">
.project-search {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>



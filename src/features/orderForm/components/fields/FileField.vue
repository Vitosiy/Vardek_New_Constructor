<script lang="ts" setup>
import { computed } from 'vue'
import type { NormalizedFields } from '../../types/form.types'

const props = defineProps<{
  field: NormalizedFields
  modelValue?: File[] | File | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: File[] | File | null): void
}>()

const filesList = computed<File[]>(() => {
  if (!props.modelValue) return []
  return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
})

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files ? Array.from(target.files) : []
  if (props.field.MULTIPLE) {
    emit('update:modelValue', files)
  } else {
    emit('update:modelValue', files[0] ?? null)
  }
}
</script>

<template>
  <div class="order-file-field">
    <label class="order-file-field__label" :for="`field-${field.CODE}`">
      {{ field.NAME }}
      <sup v-if="field.REQUIED">*</sup>
    </label>

    <label class="order-file-field__upload" :for="`field-${field.CODE}`">
      Загрузить файлы
    </label>
    <input
      class="order-file-field__control"
      :id="`field-${field.CODE}`"
      :name="field.CODE"
      type="file"
      :required="Boolean(field.REQUIED)"
      :multiple="Boolean(field.MULTIPLE)"
      @change="onChange"
    />

    <p v-if="field.DESCRIPTION" class="order-file-field__hint">{{ field.DESCRIPTION }}</p>

    <ul v-if="filesList.length" class="order-file-field__list">
      <li v-for="file in filesList" :key="`${file.name}-${file.size}`">{{ file.name }}</li>
    </ul>
  </div>
</template>

<style scoped>
.order-file-field {
  display: grid;
  gap: 8px;
}

.order-file-field__label {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #272727;
}

.order-file-field__label sup {
  color: #da444c;
  font-weight: 700;
}

.order-file-field__upload {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid #d5d8e0;
  border-radius: 8px;
  background: #fff;
  color: #131313;
  font-size: 14px;
  cursor: pointer;
}

.order-file-field__control {
  display: none;
}

.order-file-field__hint {
  margin: 0;
  color: #5d6069;
  font-size: 12px;
}

.order-file-field__list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #272727;
}
</style>

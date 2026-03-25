<script lang="ts" setup>
import { computed } from 'vue'
import type { NormalizedFields } from '../../types/form.types'

const props = defineProps<{
  field: NormalizedFields
  modelValue?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const currentValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return String(props.field.DEFAULT_VALUE ?? '')
  }
  return String(props.modelValue)
})

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="order-textarea-field">
    <label class="order-textarea-field__label" :for="`field-${field.CODE}`">
      {{ field.NAME }}
      <sup v-if="field.REQUIED">*</sup>
    </label>

    <textarea
      class="order-textarea-field__control"
      :id="`field-${field.CODE}`"
      :name="field.CODE"
      :required="Boolean(field.REQUIED)"
      :minlength="field.MIN"
      :maxlength="field.MAX"
      :value="currentValue"
      rows="3"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.order-textarea-field {
  display: grid;
  gap: 8px;
}

.order-textarea-field__label {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #272727;
}

.order-textarea-field__label sup {
  color: #da444c;
  font-weight: 700;
}

.order-textarea-field__control {
  width: 100%;
  min-height: 84px;
  padding: 10px 12px;
  border: 1px solid #d5d8e0;
  border-radius: 8px;
  background: #fff;
  color: #131313;
  font-size: 14px;
  resize: vertical;
  outline: none;
}

.order-textarea-field__control:focus {
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.15);
}
</style>

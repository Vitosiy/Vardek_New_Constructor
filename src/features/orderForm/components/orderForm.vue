<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useProjectAPI } from '@/features/quickActions/project/composables/useProjectAPI'
import { normalizer } from '../utils/normalizeFields'
import type { NormalizedFields } from '../types/form.types'
import { fieldComponentMap } from '../config/fieldComponentMap'

const { getOrderFormData, submitOrderForm } = useProjectAPI()
const MAX_MULTIPLE_ITEMS = 5

const fields = ref<NormalizedFields[]>([])
const formValues = ref<Record<string, any>>({})
const isLoaded = ref(false)
const loadError = ref<string | null>(null)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref(false)

const renderedFields = computed(() =>
  fields.value.filter((field) => Boolean(fieldComponentMap[field.TYPE]))
)
const splitFieldsIndex = computed(() => Math.ceil(renderedFields.value.length / 2))
const leftColumnFields = computed(() => renderedFields.value.slice(0, splitFieldsIndex.value))
const rightColumnFields = computed(() => renderedFields.value.slice(splitFieldsIndex.value))

const isRepeatableField = (field: NormalizedFields) =>
  Boolean(field.MULTIPLE) && field.TYPE !== 'CHECKBOX' && field.TYPE !== 'FILE'

const createDefaultFieldValue = (field: NormalizedFields) => {
  if (field.TYPE === 'FILE') return null
  return field.DEFAULT_VALUE
}

const normalizeInitialFieldValue = (field: NormalizedFields) => {
  if (!isRepeatableField(field)) return field.DEFAULT_VALUE
  return [createDefaultFieldValue(field)]
}

onMounted(async () => {
  const response = await getOrderFormData()

  if (!response.success || !response.data) {
    loadError.value = response.error || 'Ошибка загрузки формы заказа'
    console.error('Ошибка загрузки', response.error)
    return
  }

  const normalized = normalizer(response.data)
  fields.value = normalized
  formValues.value = normalized.reduce<Record<string, any>>((acc, field) => {
    acc[field.CODE] = normalizeInitialFieldValue(field)
    return acc
  }, {})

  isLoaded.value = true
})

const appendFieldToFormData = (
  payload: FormData,
  index: number,
  fieldId: string,
  fieldCode: string,
  value: unknown
) => {
  payload.append(`fields[${index}][id]`, fieldId)
  payload.append(`fields[${index}][code]`, fieldCode)

  if (value === null || value === undefined) return

  if (value instanceof File) {
    payload.append(`fields[${index}][value]`, value)
    return
  }

  if (Array.isArray(value)) {
    const hasFiles = value.some((item) => item instanceof File)

    if (hasFiles) {
      value.forEach((item) => {
        if (item instanceof File) {
          payload.append(`fields[${index}][value][]`, item)
        } else {
          payload.append(`fields[${index}][value][]`, String(item))
        }
      })
      return
    }

    value.forEach((item) => {
      payload.append(`fields[${index}][value][]`, String(item))
    })
    return
  }

  if (typeof value === 'boolean') {
    payload.append(`fields[${index}][value]`, value ? 'Y' : 'N')
    return
  }

  payload.append(`fields[${index}][value]`, String(value))
}

const sanitizeArrayValue = (value: unknown[]) =>
  value.filter((item) => {
    if (item === null || item === undefined) return false
    if (item instanceof File) return true
    if (typeof item === 'string') return item.trim() !== ''
    return true
  })

const getSubmitValue = (field: NormalizedFields, value: unknown) => {
  if (!isRepeatableField(field)) return value
  if (!Array.isArray(value)) return []
  return sanitizeArrayValue(value)
}

const addMultipleValue = (field: NormalizedFields) => {
  const current = formValues.value[field.CODE]
  if (!Array.isArray(current)) {
    formValues.value[field.CODE] = [createDefaultFieldValue(field)]
    return
  }
  if (current.length >= MAX_MULTIPLE_ITEMS) return
  current.push(createDefaultFieldValue(field))
}

const canAddMultipleValue = (field: NormalizedFields) => {
  const current = formValues.value[field.CODE]
  if (!Array.isArray(current)) return true
  return current.length < MAX_MULTIPLE_ITEMS
}

const removeMultipleValue = (field: NormalizedFields, valueIndex: number) => {
  const current = formValues.value[field.CODE]
  if (!Array.isArray(current) || current.length <= 1) return
  current.splice(valueIndex, 1)
}

const getFieldForRender = (field: NormalizedFields, valueIndex: number): NormalizedFields => {
  const isAdditionalValue = valueIndex > 0
  if (!isAdditionalValue && field.TYPE !== 'FILE') return field

  return {
    ...field,
    REQUIED: isAdditionalValue ? false : field.REQUIED,
    // Для повторяемых file-полей каждый инпут представляет отдельное значение.
    ...(field.TYPE === 'FILE' ? { MULTIPLE: false } : {})
  }
}

const submitForm = async () => {
  submitError.value = null
  submitSuccess.value = false
  isSubmitting.value = true

  try {
    const payload = new FormData()
    renderedFields.value.forEach((field, index) => {
      appendFieldToFormData(
        payload,
        index,
        field.ID,
        field.CODE,
        getSubmitValue(field, formValues.value[field.CODE])
      )
    })

    const response = await submitOrderForm(payload)
    if (!response.success) {
      submitError.value = response.error || 'Не удалось отправить форму'
      return { success: false, error: submitError.value }
    }

    submitSuccess.value = true
    return { success: true }
  } finally {
    isSubmitting.value = false
  }
}

defineExpose({
  submitForm,
  isSubmitting
})
</script>

<template> 
  <section class="order-form">
    <div class="order-form__container">
      <p v-if="loadError" class="order-form__error">{{ loadError }}</p>

      <div v-else-if="!isLoaded" class="order-form__loading">Загрузка полей...</div>

      <div v-else class="order-form__fields">
        <div class="order-form__column">
          <template v-for="field in leftColumnFields" :key="`left-${field.ID}`">
            <div v-if="isRepeatableField(field)" class="order-form__multiple-field">
              <div
                v-for="(_, valueIndex) in formValues[field.CODE]"
                :key="`${field.ID}-${valueIndex}`"
                class="order-form__multiple-row"
              >
                <component
                  :is="fieldComponentMap[field.TYPE]"evelop2
                  :field="getFieldForRender(field, Number(valueIndex))"
                  v-model="formValues[field.CODE][valueIndex]"
                />
                <button
                  v-if="valueIndex === 0"
                  type="button"
                  class="order-form__multiple-btn"
                  :disabled="!canAddMultipleValue(field)"
                  @click="addMultipleValue(field)"
                >
                  +
                </button>
                <button
                  v-else
                  type="button"
                  class="order-form__multiple-btn order-form__multiple-btn--remove"
                  @click="removeMultipleValue(field, Number(valueIndex))"
                >
                  -
                </button>
              </div>
            </div>

            <component
              v-else
              :is="fieldComponentMap[field.TYPE]"
              :field="field"
              v-model="formValues[field.CODE]"
            />
          </template>
        </div>

        <div class="order-form__column">
          <template v-for="field in rightColumnFields" :key="`right-${field.ID}`">
            <div v-if="isRepeatableField(field)" class="order-form__multiple-field">
              <div
                v-for="(_, valueIndex) in formValues[field.CODE]"
                :key="`${field.ID}-${valueIndex}`"
                class="order-form__multiple-row"
              >
                <component
                  :is="fieldComponentMap[field.TYPE]"
                  :field="getFieldForRender(field, Number(valueIndex))"
                  v-model="formValues[field.CODE][valueIndex]"
                />
                <button
                  v-if="valueIndex === 0"
                  type="button"
                  class="order-form__multiple-btn"
                  :disabled="!canAddMultipleValue(field)"
                  @click="addMultipleValue(field)"
                >
                  +
                </button>
                <button
                  v-else
                  type="button"
                  class="order-form__multiple-btn order-form__multiple-btn--remove"
                  @click="removeMultipleValue(field, Number(valueIndex))"
                >
                  -
                </button>
              </div>
            </div>

            <component
              v-else
              :is="fieldComponentMap[field.TYPE]"
              :field="field"
              v-model="formValues[field.CODE]"
            />
          </template>
        </div>
      </div>

      <p v-if="submitError" class="order-form__error">{{ submitError }}</p>
      <p v-if="submitSuccess" class="order-form__success">Форма успешно отправлена</p>
    </div>
  </section>
</template>

<style scoped>
.order-form {
  width: 100%;
  max-width: 100%;
  padding: 8px 0 12px;
}

.order-form__container {
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  background: #ffffff;
  padding: 14px;
}

.order-form__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

.order-form__column {
  display: grid;
  gap: 14px;
}

.order-form__multiple-field {
  display: grid;
  gap: 10px;
}

.order-form__multiple-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 40px;
  align-items: end;
  gap: 8px;
}

.order-form__multiple-btn {
  height: 40px;
  border: 1px solid #d5d8e0;
  border-radius: 8px;
  background: #fff;
  color: #131313;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.order-form__multiple-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.order-form__multiple-btn--remove {
  color: #bf353d;
}

.order-form__loading {
  color: #5d6069;
  font-size: 14px;
}

.order-form__error {
  margin: 0;
  color: #bf353d;
  font-size: 14px;
}

.order-form__success {
  margin: 10px 0 0;
  color: #1f8f49;
  font-size: 14px;
}

@media (max-width: 900px) {
  .order-form__fields {
    grid-template-columns: 1fr;
  }
}
</style>

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

const fieldsForSubmit = computed(() =>
  fields.value.filter((field) => Boolean(fieldComponentMap[field.TYPE]))
)

// DELIVERY_COORDS должен уходить в запрос, но не должен отображаться пользователю.
const visibleFields = computed(() => fieldsForSubmit.value.filter((field) => field.CODE !== 'DELIVERY_COORDS'))

const splitFieldsIndex = computed(() => Math.ceil(visibleFields.value.length / 2))
const leftColumnFields = computed(() => visibleFields.value.slice(0, splitFieldsIndex.value))
const rightColumnFields = computed(() => visibleFields.value.slice(splitFieldsIndex.value))

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

const setDeliveryCoords = (coords: string | null) => {
  formValues.value['DELIVERY_COORDS'] = coords ?? ''
}

const submitForm = async () => {
  submitError.value = null
  submitSuccess.value = false
  isSubmitting.value = true

  try {
    // Проверка обязательных полей перед отправкой.
    // Так как отправка идёт через JS, нативная HTML-валидация не срабатывает.
    const requiredFields = fieldsForSubmit.value.filter((f) => f.REQUIED === true)
    const isValueFilled = (field: NormalizedFields, value: any): boolean => {
      if (value === null || value === undefined) return false

      if (field.TYPE === 'CHECKBOX') {
        return value === true
      }

      if (field.TYPE === 'FILE') {
        if (Array.isArray(value)) return value.length > 0
        return value instanceof File
      }

      if (field.TYPE === 'PHONE') {
        if (typeof value !== 'string') return false
        // Если маска оставила незаполненные позиции
        if (value.includes('_')) return false
        // Проверка по количеству цифр
        const digits = value.replace(/\D/g, '')
        return digits.length === 11
      }

      if (Array.isArray(value)) {
        // Для repeatable полей: считаем заполненными, если в каждом элементе есть значение.
        if (value.length === 0) return false
        return value.every((item) => {
          if (item === null || item === undefined) return false
          if (typeof item === 'string') return item.trim() !== ''
          if (item instanceof File) return true
          return Boolean(item)
        })
      }

      if (typeof value === 'string') return value.trim() !== ''
      if (typeof value === 'number') return Number.isFinite(value) && !Number.isNaN(value)
      return Boolean(value)
    }

    for (const f of requiredFields) {
      const value = formValues.value[f.CODE]
      if (!isValueFilled(f, value)) {
        submitError.value = `Поле "${f.NAME}" обязательно для заполнения`
        return { success: false, error: submitError.value }
      }
    }

    const address = String(formValues.value['ADDRESS'] ?? '').trim()
    const getDeliveryCoords = () => String(formValues.value['DELIVERY_COORDS'] ?? '').trim()

    if (address !== '' && getDeliveryCoords() === '') {
      const timeoutMs = 2000
      const intervalMs = 100
      const startedAt = Date.now()

      console.log('[orderForm] wait deliveryCoords after address select', {
        address,
        deliveryCoordsInitially: getDeliveryCoords()
      })

      while (Date.now() - startedAt < timeoutMs && getDeliveryCoords() === '') {
        await new Promise((resolve) => setTimeout(resolve, intervalMs))
      }

      if (getDeliveryCoords() === '') {
        submitError.value = 'Пожалуйста, выберите адрес из автокомплита Яндекса'
        return { success: false, error: submitError.value }
      }
      console.log('[orderForm] deliveryCoords received after wait:', getDeliveryCoords())
    }


    const payload = new FormData()
    fieldsForSubmit.value.forEach((field, index) => {
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
                  @update-delivery-coords="setDeliveryCoords"
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
              @update-delivery-coords="setDeliveryCoords"
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
                  @update-delivery-coords="setDeliveryCoords"
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
              @update-delivery-coords="setDeliveryCoords"
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

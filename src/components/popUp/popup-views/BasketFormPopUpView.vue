<template>
  <div class="form-order">
    <div class="form-order__header">
      <h2 class="form-order__title">Оформить заказ</h2>
      <ClosePopUpButton 
        class="form-order__close" 
        @close="closePopup" 
      />
    </div>

    <div class="form-order__content">
      <!-- Ошибка (раскомментировать при необходимости) -->
      <!-- <div 
        v-if="app.errors.saveproject" 
        class="form-order__error alert alert-danger"
        v-text="app.errors.saveproject"
      ></div> -->

      <form class="form-order__form" @submit.prevent="handleSubmit">

        <div class="form-order__form-row">
          <div class="form-order__form-col">
            <!-- Название проекта -->
            <div class="form-field">
              <label class="form-field__label">Название проекта</label>
              <input
                v-model="form.projectName"
                type="text"
                class="form-field__input"
                name="project_name"
                required
              />
            </div>

            <!-- Информация о клиенте -->
            <div class="form-order__client-info">
              <!-- Имя клиента -->
              <div class="form-field">
                <label for="client_name" class="form-field__label">
                  Имя клиента
                </label>
                <input
                  v-model="form.clientName"
                  type="text"
                  class="form-field__input"
                  id="client_name"
                  name="client_name"
                  required
                />
              </div>

              <!-- Контактный телефон -->
              <div class="form-field">
                <label for="client_phone" class="form-field__label">
                  Контактный телефон
                </label>
                <input
                  v-model="form.clientPhone"
                  type="tel"
                  class="form-field__input"
                  id="client_phone"
                  name="client_phone"
                  placeholder="+7 (___) ___-____"
                  v-mask="'#(###) ###-####'"
                  required
                />
              </div>

              <!-- Комментарий -->
              <div class="form-field">
                <label for="client_comment" class="form-field__label">
                  Комментарий
                </label>
                <textarea
                  v-model="form.comment"
                  name="client_comment"
                  id="client_comment"
                  class="form-field__textarea"
                  rows="3"
                ></textarea>
              </div>
            </div>

   
          </div>
          <div class="form-order__form-col">
            <!-- Скриншот проекта -->
            <div class="form-order__screenshot">
              <img 
                :src="screenshot"
                :alt="form.projectName || 'Скриншот проекта'"
                class="form-order__screenshot-image"
              />
            </div>
          </div>
        </div>

         <!-- Кнопки действий -->
        <div class="form-order__actions">
          <button 
            type="button" 
            @click="closePopup"
            class="form-order__button form-order__button--cancel"
          >
            Отмена
          </button>
          <button 
            type="submit" 
            class="form-order__button form-order__button--submit"
          >
            Оформить заказ
          </button>
 
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import { onMounted, reactive, ref } from 'vue';
import { usePopupStore } from '@/store/appStore/popUpsStore';
import { useProjectAPI } from '@/features/quickActions/project/composables/useProjectAPI';
import { useSceneState } from '@/store/appliction/useSceneState'
import { useConfigStore } from '@/store/appStore/useConfigStore'
import { useBasketStore } from '@/store/appStore/useBasketStore'

const { getProjectScreenshot } = useProjectAPI();
const { creatDataBasket } = useBasketStore();
const { styleData, configData } = useConfigStore();
const popupStore = usePopupStore();
const screenshot = ref('');
const basket = ref({});
const sceneState = useSceneState()

const projectData = sceneState.getCurrentProjectParams;

interface FormData {
  projectName: string;
  clientName: string;
  clientPhone: string;
  comment: string;
}

const form = reactive<FormData>({
  projectName: '',
  clientName: '',
  clientPhone: '',
  comment: '',
});

const closePopup = () => {
  popupStore.closePopup('formbasket');
};

const handleSubmit = () => {
  console.log('Отправка данных:', {
    // project_img: screenshot.value,
    project_img: '',
    project_name: form.projectName,
    project:projectData,
    config: configData,
    style: styleData,
    fio: form.clientName,
    phone: form.clientPhone,
    comment: form.comment,
    basket: basket.value
  });

  // Здесь будет логика отправки формы
  // await sendFormData(form);
};

onMounted(async () => {
  try {
    screenshot.value = await getProjectScreenshot();
  } catch (error) {
    console.error('Ошибка при загрузке скриншота:', error);
  }
  basket.value = creatDataBasket();

  console.log('projectData', projectData)
});
</script>

<style lang="scss" scoped>
.form-order {
  width: 800px;
  max-width: 100%;
  background: $white;
  border-radius: 16px;
  max-height: 90vh;
  overflow-y: scroll;
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  &__title {
    font-size: 32px;
    font-weight: 600;
    text-align: center;
  }

  &__close {
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.7;
    }
  }

  &__content {
    margin-bottom: 24px;
  }

  &__error {
    padding: 12px 16px;
    margin-bottom: 20px;
    border-radius: 8px;
    background-color: rgba($red, 0.1);
    color: $red;
    font-size: 14px;
  }

  &__form {
    &-row {
      display: flex;
      justify-content: space-between;
      // align-items: center;
    }
    &-col {
      flex-basis: 50%;
      &:last-child {
        margin-left: 1rem;
      }
    }
  }


  &__screenshot {
    margin: 27px 0;
    text-align: center;

    &-image {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      border: 1px solid $stroke;
      object-fit: contain;
    }
  }

  &__client-info {
    margin-top: 24px;
  }

  &__actions {
    display: flex;
    gap: 16px;
    margin-top: 32px;
    justify-content: flex-end;
  }

  &__button {
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;

    &--submit {
      background: $red;
      color: $white;

      &:hover {
        background: darken($red, 10%);
      }

      &:active {
        transform: translateY(1px);
      }
    }

    &--cancel {
      background: $light-grey;
      color: $strong-grey;

      &:hover {
        background: darken($light-grey, 5%);
      }
    }
  }
}

.form-field {
  margin-bottom: 20px;

  &__label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: $dark-grey;
  }

  &__input,
  &__textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid $stroke;
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
    transition: border-color 0.2s ease;
    background: $white;

    &:focus {
      outline: none;
      border-color: $red;
      box-shadow: 0 0 0 2px rgba($red, 0.1);
    }

    &::placeholder {
      color: lighten($strong-grey, 30%);
    }
  }

  &__textarea {
    resize: vertical;
    min-height: 100px;
  }

  &--error {
    .form-field__input,
    .form-field__textarea {
      border-color: $red;
    }

    .form-field__error {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: $red;
    }
  }
}

// Адаптивность
@media (max-width: 576px) {
  .form-order {
    width: 100%;
    padding: 16px;
    
    &__header {
      margin-bottom: 24px;
    }
    
    &__title {
      font-size: 20px;
    }
    
    &__actions {
      flex-direction: column;
      gap: 12px;
    }
    
    &__button {
      width: 100%;
      min-width: auto;
    }
  }
}
</style>
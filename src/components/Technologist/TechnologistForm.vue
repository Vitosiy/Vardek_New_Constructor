<script setup lang="ts">
import {onBeforeMount, onMounted, ref} from "vue";

import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import {usePopupStore} from "@/store/appStore/popUpsStore.ts";
import {useTechnologistApi} from "@/store/appStore/technologist/useTechnologistApi.ts";
import {useTechnologistStorage} from "@/store/appStore/technologist/useTechnologistStorage.ts";
import {TechnologistFormItem} from "@/types/technologist.ts";

const popupStore = usePopupStore();
const technologistStorage = useTechnologistStorage();
const technologistAPI = useTechnologistApi();
const currentProjectID = ref<number | boolean>(false);
const currentForm = ref<TechnologistFormItem>(<TechnologistFormItem>{});
const techFormError = technologistStorage.getTechFormError();

const init = () => {
  currentProjectID.value = technologistStorage.getCurrentProjectID();
  currentForm.value.id = `${currentProjectID.value}`;
}

const closeForm = () => {
  technologistStorage.clearStorage();
  popupStore.closePopup('technologist-form')
}

const submitTechForm = () => {

  let formData = currentForm.value;

  technologistStorage.clearError()
  let fileUpDrop = {}

  for (var i in self.scope.arrIdInputFile) {
    if (i == 'comments') continue;
    fileUpDrop[i] = fileUp.get(self.scope.arrIdInputFile[i]);

    for (var f in fileUpDrop[i].getFiles()) {
      formData.append(i + '[]', fileUpDrop[i].getFiles()[f]['_file']);
    }

  }

  technologistAPI.submitTechForm(formData)
}

onBeforeMount(() => {
  currentForm.value = <TechnologistFormItem>{}
})

onMounted(() => {
  init()
})
</script>

<template>
  <div class="technologist-form-content">

    <div class="technologist-form-header">
      <h4 class="technologist-form-title">Форма отправки на проверку технологу</h4>
      <ClosePopUpButton
          class="technologist-header__close-btn"
          @click="closeForm"
      />
    </div>

    <div class="technologist-form-body">
      <div>
        <label style="width: 100px;">* ID проекта</label>
        <input 
            :class="{'errorForm': techFormError['id']}"
            autocomplete="off" 
            type="str"
             name="projectId" 
            id="projectId" 
            value="currentForm.id" 
            readonly
        >
      </div>

      <div>
        <label style="width: 100px;">* Телефон</label>
        <input 
            :class="{'errorForm': techFormError['phone']}"
            ui-mask="+9(999) 999-9999" 
            type="phone"
            data-mask="true" 
            autocomplete="off" 
            data-validate-type="phone" 
            name="phone"
            value="currentForm.phone"
        >
      </div>

      <div style="margin-bottom: 30px;">
        <label style="width: 100px;">* Почта</label>
        <input
            :class="{'errorForm': techFormError['email']}"
            autocomplete="off" 
            type="str"
            name="email" 
            value="currentForm.email" 
            data-validate-type="email"
        >
      </div>

      <div style="margin-bottom: 30px;">
        <label>Список техники с указанием модели</label>
        <ul>
          <li ng-repeat="(techniqueKey, techniqueVal) in currentForm.technique">
            <input
                autocomplete="off"
                type="str"
                name="technique[]"
                value="currentForm.technique[techniqueKey]"
            >
          </li>
        </ul>

        <div ng-click="addInputTechnique();" class="calculation-form__file-button"
             style="margin-left: 40px;">Добавить
        </div>

      </div>

      <div
          :class="{'errorForm': techFormError['sketch']}"
           class="calculation-form__item calculation-form__item--wide projectSketch"
      >
        <p class="calculation-form__label">* Техническое задание с размерами</p>
        <p>Доступные форматы: pdf, txt, docx, doc, rtf, jpg, jpeg, bmp, png.</p>

        <div class="calculation-form__upload-button">
          <input type="file" id="sketch" multiple style="display: none">

          <div id="sketch-dropzone"
               class="fileup-dropzone p-4 d-inline-block text-primary-emphasis fs-5 rounded-4 text-center">
            <i class="bi bi-folder2-open"></i> Перетащите сюда ваши файли или кликните
            <div class="fs-6 mt-2">Максимальный размер 20Mb</div>
          </div>

          <div id="sketch-queue"></div>
        </div>
      </div>

      <div class="calculation-form__item calculation-form__item--wide photoRoom">
        <p class="calculation-form__label">Фото помещения со всех ракурсов</p>
        <p>Доступные форматы: pdf, txt, docx, doc, rtf, jpg, jpeg, bmp, png.</p>

        <div class="calculation-form__upload-button">
          <input type="file" id="photoRoom" multiple style="display: none">

          <div id="photoRoom-dropzone"
               class="fileup-dropzone p-4 d-inline-block text-primary-emphasis fs-5 rounded-4 text-center">
            <i class="bi bi-folder2-open"></i> Перетащите сюда ваши файли или кликните
            <div class="fs-6 mt-2">Максимальный размер 20Mb</div>
          </div>

          <div id="photoRoom-queue"></div>
        </div>
      </div>

      <div class="calculation-form__item calculation-form__item--wide metering">
        <p class="calculation-form__label">Замер помещения</p>
        <p>Доступные форматы: pdf, txt, docx, doc, rtf, jpg, jpeg, bmp, png.</p>

        <div class="calculation-form__upload-button">
          <input type="file" id="metering" multiple style="display: none">

          <div id="metering-dropzone"
               class="fileup-dropzone p-4 d-inline-block text-primary-emphasis fs-5 rounded-4 text-center">
            <i class="bi bi-folder2-open"></i> Перетащите сюда ваши файли или кликните
            <div class="fs-6 mt-2">Максимальный размер 20Mb</div>
          </div>

          <div id="metering-queue"></div>
        </div>
      </div>
      <div class="message" style="display: none"></div>
      <div class="btn btn-primary" @click="submitTechForm">Отправить заявку</div>

    </div>
  </div>
</template>

<style scoped lang="scss">
.technologist-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  background: white;
  border-radius: 15px;
  padding: 15px;
  width: 100%;
  box-sizing: border-box;
  max-height: 80vh;
  height: 100%;
  max-width: 1447px;
  width: 90vw;

  .technologist-header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;

    &__title {
      font-weight: 600;
      font-size: 32px;
      line-height: 100%;
      letter-spacing: 0%;
      text-align: center;
    }

    &__close-btn {
      fill: #A3A9B5;
      position: absolute;
      right: 0;
      top: 10px;
      cursor: pointer;
    }
  }

  &__additional-table {
    margin-top: 2rem;
  }

  .technologist-container {
    width: 100%;
    height: 100%;
    overflow-y: auto;

    &__main-table {
      // margin-bottom: 2rem;
      .technologist-table {
        background-color: #F6F5FA;
        border-radius: 15px;
      }
    }

  }

  .technologist-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;

    @media (max-width: 768px) {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    &-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    &-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
      }

      .technologist__error {
        display: flex;
        align-items: center;
        margin-right: 30px;
        color: $red;

        @media (max-width: 768px) {
          width: 100%;
          margin-right: 0;
          margin-bottom: 10px;
          justify-content: center;
        }
      }

      button {
        width: 114px;
        height: 50px;
        background: $stroke;
        border-radius: 15px;
        border: none;

        @media (max-width: 768px) {
          flex: 1;
          min-width: 100px;
        }
      }

      .technologist__close {
        color: $strong-grey;
        font-weight: 600;
      }

      .technologist__save {
        width: 132px;
        color: $white;
        font-weight: 600;
        background-color: $black;

        @media (max-width: 768px) {
          width: auto;
          flex: 1;
        }
      }

      .technologist__order {
        width: 174px;
        color: $white;
        font-weight: 600;
        background-color: $red;

        @media (max-width: 768px) {
          width: auto;
          flex: 2;
        }

        &:disabled {
          background-color: #A3A9B5;
          cursor: not-allowed;
        }
      }
    }
  }

  &__loader {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    position: absolute;
    top: 1px;
    left: 0;
    animation: rotate 1s linear infinite
  }

  &__loader::before, &__loader::after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    inset: 0px;
    border-radius: 50%;
    border: 5px solid #da444c73;
    animation: prixClipFix 2s linear infinite;
  }

  &__loader::after {
    border-color: #DA444C;
    animation: prixClipFix 2s linear infinite, rotate 0.5s linear infinite reverse;
    inset: 6px;
  }

  &__sum {
    font-weight: 600;
    line-height: 100%;
    letter-spacing: 0%;

  }

  &__sum-no {
    // font-weight: 600;
    line-height: 100%;
    letter-spacing: 0%;

  }
}

</style>
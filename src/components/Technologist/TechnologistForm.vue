<script setup lang="ts">
import {onBeforeMount, onMounted, ref} from "vue";

import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import {usePopupStore} from "@/store/appStore/popUpsStore.ts";
import {useTechnologistApi} from "@/store/appStore/technologist/useTechnologistApi.ts";
import {useTechnologistStorage} from "@/store/appStore/technologist/useTechnologistStorage.ts";
import {TechnologistFormItem} from "@/types/technologist.ts";
import MainButton from "@/components/ui/buttons/MainButton.vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
import {varying} from "three/src/nodes/core/VaryingNode";

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
  /*
    for (var i in self.scope.arrIdInputFile) {
      if (i == 'comments') continue;
      fileUpDrop[i] = fileUp.get(self.scope.arrIdInputFile[i]);

      for (var f in fileUpDrop[i].getFiles()) {
        formData.append(i + '[]', fileUpDrop[i].getFiles()[f]['_file']);
      }

    }*/

  technologistAPI.submitTechForm(formData)
}

const addInputTechnique = () => {
  if (!currentForm.value.technique)
    currentForm.value.technique = []

  currentForm.value.technique.push("")
}

onBeforeMount(() => {
  currentForm.value = <TechnologistFormItem>{
    technique: [""]
  }
})

onMounted(() => {
  init()
})
</script>

<template>
  <div
      class="technologist-form"
  >
    <div class="technologist-form-container">

      <div class="technologist-form-header">
        <h4 class="technologist-form-header__title">Форма отправки на проверку технологу</h4>
        <ClosePopUpButton
            class="technologist-form-header__close-btn"
            @click="closeForm"
        />
      </div>

      <div class="technologist-form-footer">

        <div class="technologist-form-footer-info">
          <div class="technologist-form-footer-info-item">
            <label>* ID проекта</label>
            <MainInput
                :input-class="'technologist-form-footer-info-item__input'"
                :model-value="currentForm.id"
                id="projectId"
                disabled
            />
          </div>

          <div class="technologist-form-footer-info-item">
            <label>* Дизайнер Ф.И.О.</label>
            <input
                :class="['technologist-form-footer-info-item__input', {'errorForm': techFormError['name']}]"
                type="text"
                required
                name="name"
                v-model="currentForm.name"
            >
          </div>

          <div class="technologist-form-footer-info-item">
            <label>* Телефон</label>
            <input
                :class="['technologist-form-footer-info-item__input', {'errorForm': techFormError['phone']}]"
                pattern="(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?"
                mask="'+7 (000)-000-0000'"
                type="tel"
                required
                name="phone"
                v-model="currentForm.phone"
            >
          </div>

          <div class="technologist-form-footer-info-item">
            <label>* Почта</label>
            <input
                :class="['technologist-form-footer-info-item__input', {'errorForm': techFormError['email']}]"
                type="text"
                name="email"
                v-model="currentForm.email"
                data-validate-type="email"
                required
            >
          </div>

          <div class="technologist-form-footer-info-technique">
            <label>* Список техники с указанием модели:</label>
            <ul class="technologist-form-footer-info-technique__list">
              <li
                  v-for="(techniqueVal, techniqueKey) in currentForm.technique"
                  :key="techniqueKey"
              >
                <input
                    class="technologist-form-footer-info-technique__input"
                    autocomplete="off"
                    type="text"
                    :id="`technique_${techniqueKey}`"
                    v-model="currentForm.technique[techniqueKey]"
                >
              </li>
            </ul>

            <MainButton @click="addInputTechnique">
              Добавить
            </MainButton>
          </div>
        </div>

        <div
            :class="['technologist-form-footer-filedrop', 'projectSketch', {'errorForm': techFormError['sketch']}]"
        >
          <p class="technologist-form-footer-filedrop__label">* Техническое задание с размерами</p>
          <p>Доступные форматы: pdf, txt, docx, doc, rtf, jpg, jpeg, bmp, png.</p>

          <div class="technologist-form-footer-filedrop__upload-button">
            <input type="file" id="sketch" multiple style="display: none">

            <div id="sketch-dropzone"
                 class="fileup-dropzone p-4 d-inline-block text-primary-emphasis fs-5 rounded-4 text-center">
              <i class="bi bi-folder2-open"></i> Перетащите сюда ваши файли или кликните
              <div class="fs-6 mt-2">Максимальный размер 20Mb</div>
            </div>

            <div id="sketch-queue"></div>
          </div>
        </div>

        <div class="technologist-form-footer-filedrop photoRoom">
          <p class="technologist-form-footer-filedrop__label">* Фото помещения со всех ракурсов</p>
          <p>Доступные форматы: pdf, txt, docx, doc, rtf, jpg, jpeg, bmp, png.</p>

          <div class="technologist-form-footer-filedrop__upload-button">
            <input type="file" id="photoRoom" multiple style="display: none">

            <div id="photoRoom-dropzone"
                 class="fileup-dropzone p-4 d-inline-block text-primary-emphasis fs-5 rounded-4 text-center">
              <i class="bi bi-folder2-open"></i> Перетащите сюда ваши файли или кликните
              <div class="fs-6 mt-2">Максимальный размер 20Mb</div>
            </div>

            <div id="photoRoom-queue"></div>
          </div>
        </div>

        <div class="technologist-form-footer-filedrop metering">
          <p class="technologist-form-footer-filedrop__label">* Замер помещения</p>
          <p>Доступные форматы: pdf, txt, docx, doc, rtf, jpg, jpeg, bmp, png.</p>

          <div class="technologist-form-footer-filedrop__upload-button">
            <input type="file" id="metering" multiple style="display: none">

            <div id="metering-dropzone"
                 class="fileup-dropzone p-4 d-inline-block text-primary-emphasis fs-5 rounded-4 text-center">
              <i class="bi bi-folder2-open"></i> Перетащите сюда ваши файли или кликните
              <div class="fs-6 mt-2">Максимальный размер 20Mb</div>
            </div>

            <div id="metering-queue"></div>
          </div>
        </div>

        <MainButton @click="submitTechForm">
          Отправить заявку
        </MainButton>

      </div>
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

  &-container {
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

  &-header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;

    &__title {
      font-weight: 600;
      font-size: 30px;
      line-height: 100%;
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

  &-footer {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 20px;
    width: 100%;
    flex-direction: column;

    @media (max-width: 768px) {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    &-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin: 1rem;

      &-item {
        width: 17vw;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: space-between;
        align-content: center;
        align-items: flex-start;


        &__input {
          padding-left: 10px;
          border: $dark-grey solid 1px;
        }
      }

      &-technique {
        width: 15vw;
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        justify-content: space-between;
        align-content: center;
        align-items: flex-start;
        gap: 0.5rem;

        &__list {
          gap: 3px;
          display: flex;
          flex-direction: column;
        }

        &__input {
          padding-left: 10px;
          border: $dark-grey solid 1px;
        }
      }
    }

    &-filedrop {
      padding: 20px;
      margin-bottom: 22px;
      border: 1px solid #dce5e7;
      box-sizing: border-box;
      width: 95%;
      min-height: 102px;

      &__label {
        display: block;
        font-family: "Open Sans", "Arial", sans-serif;
        font-size: 14px;
        line-height: 19px;
        letter-spacing: 0.04em;
        color: #8C8C8C;
      }

      &__upload-button {

      }
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

  &__additional-table {
    margin-top: 2rem;
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
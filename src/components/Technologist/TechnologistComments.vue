<script setup lang="ts">
// @ts-nocheck

import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import DragAndDropFiles from "@/components/ui/drag&drop/DragAndDropFiles.vue";
import MainButton from "@/components/ui/buttons/MainButton.vue";
import {useAppData} from "@/store/appliction/useAppData.ts";
import {usePopupStore} from "@/store/appStore/popUpsStore.ts";
import {useTechnologistStorage} from "@/store/appStore/technologist/useTechnologistStorage.ts";
import {useTechnologistApi} from "@/store/appStore/technologist/useTechnologistApi.ts";
import {onMounted, ref} from "vue";
import {TechnologistFormReview} from "@/types/technologist.ts";

const APP = useAppData().getAppData;
const popupStore = usePopupStore();
const technologistStorage = useTechnologistStorage();
const technologistAPI = useTechnologistApi();

const loading = <boolean>ref(false)
const reviewStatus = <boolean>ref(false)
const formReview = <TechnologistFormReview>ref(technologistStorage.formReview)

const closePopup = () => {
  technologistStorage.clearFormReview();
  reviewStatus.false = false;

  popupStore.closePopup('technologist-comments');
  popupStore.openPopup('technologist');
};

const changeCommentsFiles = (files: File[]) => {
  formReview.value.commentsFiles = files;
}

const sendToDesigner = () => {

  let formData = new FormData();

  formData.append("id", +formReview.value.projectId);

  if(formReview.value.statusId)
    formData.append("statusId", formReview.value.statusId);
  if(formReview.value.projectTechId)
    formData.append("projectTechId", +formReview.value.projectTechId);

  formData.append("message", formReview.value.message);
  formReview.value.commentsFiles?.forEach((item, index) => {
    formData.append(`comments[${index}]`, item);
  })

  technologistAPI.setStatus(formData).then((res) => {
    if (res?.DATA.success) {
      closePopup();
    }
  });
}

onMounted(() => {
  formReview.value = technologistStorage.getFormReview();

  if (formReview.value.statusId) {
    reviewStatus.value = true;
  }

})

</script>

<template>
  <div class="technologist">
    <div class="technologist-header">
      <div class="technologist-header__title">Проект №{{ formReview.projectId }}</div>

      <ClosePopUpButton
          class="technologist-header__close-btn"
          @click="closePopup"
      />
    </div>

    <div class="technologist-container">

      <label>История сообщений:</label>
      <div class="commentsList">
        <div class="commentsItem" v-for="comment in formReview.comments">
          <span>{{ comment.COMMENT }}</span>
          <div>
            <div v-for="file in comment.fileBx">
              <a
                  :href="file.path"
                  v-if="file.previewUrl"
                  class="preview"
                  rel="gallery1"
              >
                <img
                    :src="file.previewUrl"
                    :alt="file.file.name"
                    class="preview__image"
                />
              </a>

              <a
                  v-if="file.type == 'docs'"
                  :href="file.path"
              >
                Ссылка на документ
              </a>
            </div>
          </div>
        </div>
      </div>

      <label>Комментарий:</label>

      <div class="technologist-container-review" v-if="!formReview.result.success">

        <div v-if="reviewStatus && formReview.statusId == 'C10:PREPAYMENT_INVOIC'">
          <span>ID проекта</span>
          <input
              class="technologist-review__input"
              autocomplete="off"
              type="text"
              name="projectTechId"
              v-model="formReview.projectTechId"
          >
        </div>

        <textarea
            class="technologist-review__textarea"
            v-model="formReview.message"></textarea>

        <div class="technologist-filedrop">
          <p class="technologist-filedrop__label">* Прикрепите файлы</p>

          <DragAndDropFiles
              accept=".pdf, .txt, .docx, .doc, .rtf, .jpg, .jpeg, .bmp, .png"
              @update:files="changeCommentsFiles"
          />
        </div>

        <MainButton
            @click="sendToDesigner()"
            :class-name="'btn'"
        >
          Отправить
        </MainButton>

      </div>

      <div style="margin-top: 10px;text-align: center;">
        <p style="color: green" v-if="formReview.result.success">Успешно отправлено.</p>
        <p style="color: red" v-if="formReview.result.error"
           v-for="m in formReview.result.error">{{ m }}</p>
      </div>

    </div>

  </div>
</template>

<style lang="scss" scoped>
.technologist {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  background: white;
  border-radius: 15px;
  padding: 15px;
  box-sizing: border-box;
  width: 90vw;
  height: 85vh;
  overflow: hidden;

  &-header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
    align-content: center;
    flex-direction: row;
    flex-wrap: wrap;

    &__title {
      font-weight: 600;
      font-size: 32px;
      line-height: 100%;
      text-align: center;
    }

    &__close-btn {
      fill: #A3A9B5;
      position: absolute;
      right: 0;
      cursor: pointer;
    }
  }

  .commentsList {
    padding: 30px;
    border: 1px solid;
    margin-top: 1rem;
    margin-bottom: 1rem;

    &-commentsItem {
      font-size: 18px;
      border-bottom: 2px solid;
      padding-bottom: 10px;
      margin-bottom: 10px;

      &-span {
        word-wrap: break-word;
      }

      .preview {
        width: 48px;
        height: 48px;
        border-radius: 6px;
        overflow: hidden;
        flex-shrink: 0;
        border: 1px solid #e0e0e0;
        background: #fafafa;
        display: flex;
        align-items: center;
        justify-content: center;

        &__image {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
        }
      }
    }

  }

  &-review {
    background-color: #fff;
    z-index: 999;
    padding: 20px;
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;

    &__input {
      margin-bottom: 10px;
    }

    &__textarea {
      margin-bottom: 10px;
      width: 600px;
      height: 200px;
      padding: 15px;
    }

    .adm-fileinput-wrapper {
      margin-bottom: 30px;
    }
  }


  &-container {
    padding: 0 50px;
    height: 100%;
    width: 100%;

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
  }

  &__sum-no {
    // font-weight: 600;
    line-height: 100%;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg)
  }
  100% {
    transform: rotate(360deg)
  }
}

@keyframes prixClipFix {
  0% {
    clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0)
  }
  25% {
    clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0)
  }
  50% {
    clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%)
  }
  75% {
    clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%)
  }
  100% {
    clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0)
  }
}

</style>

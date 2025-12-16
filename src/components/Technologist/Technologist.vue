<script setup lang="ts">

import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import {usePopupStore} from "@/store/appStore/popUpsStore.ts";
import {ref} from "vue";


const popupStore = usePopupStore();
const loading = ref(false)


const closePopup = () => {
  popupStore.closePopup('technologist');
};
</script>

<template>
  <div class="technologist">
    <div class="technologist-header">
      <div v-if="loading" class="technologist__loader"></div>

      <div class="technologist-header__title">Технолог</div>

      <ClosePopUpButton
          class="technologist-header__close-btn"
          @click="closePopup"
      />

<!--      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span>
          </button>
          <h4 class="modal-title">Список заявок</h4>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="mainCont">
              <div class="filterList">
                <label class="filterItem" for="filterItem_1" ng-class="{'active': '0' == techList.filter}">
                  <input
                      type="radio"
                      name="filterItem"
                      value="0"
                      id="filterItem_1"
                      style="display: none;"
                      v-model="techList.filter"
                  >
                  <span>Все</span>
                </label>
                <label
                    class="filterItem"
                    for="filterItem_{{status.ID}}"
                    :class="{'active': status.STATUS_ID == techList.filter}"
                    ng-repeat="status in app.STATUS_TECH | orderObjectBy:'SORT':false"
                    style="color:{{status.EXTRA.COLOR}}"
                >
                  <input
                      type="radio"
                      name="filterItem"
                      value="{{status.STATUS_ID}}"
                      id="filterItem_{{status.ID}}"
                      style="display: none;"
                      ng-model="techList.filter"
                  >
                  <span>{{ status.NAME }}</span>
                </label>
              </div>

              <div v-show="techList.nav" class="pagination_wrap">
                <div uib-pagination previous-text="<?= GetMessage('CON_TPL_70') ?>"
                     next-text="<?= GetMessage('CON_TPL_73') ?>"
                     items-per-page="techList.nav.NavPageSize"
                     total-items="techList.nav.NavRecordCount"
                     ng-model="techList.pager"
                     max-size="5"
                     class="pagination-sm pull-left" boundary-link-numbers="true"></div>
                <div class="badge">{{ techList.nav.NavPageNomer }}/{{ techList.nav.NavPageCount }}</div>
              </div>

              <div id="progressModal" ng-include data-src="'progressModal'" v-show="techList.loader"></div>

              <div class="appList">
                <div ng-repeat="elem in techList.elements" class="appItem">
                  <div class="propText">{{ elem.name }}</div>
                  <div class="propText">{{ elem.projectId }}</div>
                  <div class="propText">{{ app.STATUS_TECH[elem.statusId].NAME }}</div>
                  <div
                      v-show="app.userGroup[56]"
                      @click="setStatus(elem.id, 'C10:LOSE');"
                      class="btn btn-primary">Отказать
                  </div>
                  <div
                      v-show="app.userGroup[56]"
                      class="btn btn-primary"
                      @click="openModalSTD(elem, 'C10:1');"
                  >Отправить проект на доработку
                  </div>
                  <div
                      v-show="app.userGroup[56] && elem.projectId"
                      @click="uploadProjectTech(elem.projectId);"
                      class="btn btn-primary">Загрузить проект дизайнера
                  </div>
                  <div
                      v-show="elem.projectTechId"
                      @click="uploadProjectTech(elem.projectTechId);"
                      class="btn btn-primary">Загрузить проект технолога
                  </div>
                  <div
                      v-show="elem.statusId == 'C10:NEW' && app.userGroup[56]"
                      @click="setStatus(elem.id, 'C10:PREPARATION');"
                      class="btn btn-default">Взять в работу
                  </div>
                  <div
                      v-show="app.userGroup[56] && (elem.statusId == 'C10:PREPARATION' || elem.statusId == 'C10:1')"
                      class="btn btn-default"
                      @click="openModalSTD(elem, 'C10:PREPAYMENT_INVOIC');">Отправить проект на
                    проверку
                  </div>
                  <div
                      @click="openModalComments(elem.id);"
                      class="btn btn-default">Комментарии
                  </div>
                  <div
                      v-show="((app.userGroup[6] || app.userGroup[29]) && elem.statusId == 'C10:PREPAYMENT_INVOIC')"
                      class="btn btn-default"
                      @click="openModalSTD(elem, 'C10:1');"
                  >Отправить проект на доработку
                  </div>
                  <div
                      v-show="(app.userGroup[6] || app.userGroup[29]) && elem.statusId == 'C10:PREPAYMENT_INVOIC'"
                      class="btn btn-default"
                      @click="setStatus(elem.id, 'C10:2');"
                  >Принять работу
                  </div>
                  <div
                      v-show="app.userGroup[56] && elem.statusId == 'C10:2'"
                      class="btn btn-default"
                      @click="setStatus(elem.id, 'C10:3');"
                  >Принять работу
                  </div>
                  <div
                      v-show="(app.userGroup[6] || app.userGroup[29]) && elem.statusId == 'C10:3'"
                      class="btn btn-default"
                      @click="openModalOrder(elem.projectTechId);"
                  >Оформить заказ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default"
                  data-dismiss="modal"><?= GetMessage('CON_TPL_8') ?></button>
        </div>
      </div>-->

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

  &__loader::before , &__loader::after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    inset: 0px;
    border-radius: 50%;
    border: 5px solid #da444c73;
    animation: prixClipFix 2s linear infinite ;
  }

  &__loader::after{
    border-color: #DA444C;
    animation: prixClipFix 2s linear infinite , rotate 0.5s linear infinite reverse;
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

@keyframes rotate {
  0%   {transform: rotate(0deg)}
  100%   {transform: rotate(360deg)}
}

@keyframes prixClipFix {
  0%   {clip-path:polygon(50% 50%,0 0,0 0,0 0,0 0,0 0)}
  25%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0)}
  50%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%)}
  75%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 100%)}
  100% {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 0)}
}

.technologist-footer__notification {
  background: #cfe2ff;
  width: 100%;
  border-radius: 8px;
  padding: 12px;
  max-height: 114px;
  overflow-y: auto;
}

</style>

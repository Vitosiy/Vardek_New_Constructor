<script setup lang="ts">
// @ts-nocheck

import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import {usePopupStore} from "@/store/appStore/popUpsStore.ts";
import {nextTick, ref} from "vue";
import {useAppData} from "@/store/appliction/useAppData.ts";
import {useTechnologistStorage} from "@/store/appStore/technologist/useTechnologistStorage.ts";
import {useTechnologistApi} from "@/store/appStore/technologist/useTechnologistApi.ts";
import {TechnologistTechList} from "@/types/technologist.ts";
import {useToast} from "@/features/toaster/useToast.ts";
import {useProjectAPI} from "@/features/quickActions/project/composables/useProjectAPI.ts";
import {useProjectStore} from "@/features/quickActions/project/store/useProjectStore.ts";
import {useSceneState} from "@/store/appliction/useSceneState.ts";
import {useEventBus} from "@/store/appliction/useEventBus.ts";
import {useSchemeTransition} from "@/store/canvasMerge/schemeTransition.ts";
import {useRoute, useRouter} from "vue-router";
import {useRoomState} from "@/store/appliction/useRoomState.ts";

// Загрузка проекта
const router = useRouter();
const route = useRoute();
const isProjectLoading = ref(false);
const toaster = useToast();
const projectAPI = useProjectAPI();
const projectState = useProjectStore();
const sceneState = useSceneState();
const eventBus = useEventBus();
const schemeTransition = useSchemeTransition();
const roomState = useRoomState();

const APP = useAppData().getAppData;
const popupStore = usePopupStore();
const technologistStorage = useTechnologistStorage();
const technologistAPI = useTechnologistApi();

const loading = ref(false)
const techList = ref(<TechnologistTechList>{})
const arrIdInputFile = ref({})
const formReview = ref({})
const fileUpDropArr = ref({});

const closePopup = () => {
  popupStore.closePopup('technologist');
};

const getTechList = function () {
  
  techList.value.loader = true;

  let formData = new FormData();

  formData.append("filter", techList.value.filter);
  formData.append("pager", techList.value.pager);

  $.ajax({
    url: '/api/technologist/main/GetList/',
    method: 'post',
    processData: false,
    contentType: false,
    data: formData,
    success: function (data) {

      techList.value.elements = data.DATA.items;
      techList.value.loader = false;
      //techList.nav = data.DATA.nav;
    }
  });

}

const setStatus = function (id, statusId, projectTechId = false, message = false, comments = false) {
  let formData
  if (comments) {
     let f = document.querySelector("#commentsForm");
     formData = new FormData(f);

     let fileUpDrop = fileUp.get(arrIdInputFile['comments']);

    for ( let f in fileUpDrop.getFiles()) {
      formData.append('comments[]', fileUpDrop.getFiles()[f]['_file']);
    }
  } else {
     formData = new FormData();
  }

  formData.append("id", id);
  formData.append("statusId", statusId);

  if (projectTechId != false)
    formData.append("projectId", projectTechId);

  if (message != false)
    formData.append("message", message);

  $.ajax({
    url: '/api/technologist/main/SetStatus/',
    method: 'post',
    processData: false,
    contentType: false,
    data: formData,
    success: function (data) {
      if (statusId == 'C10:PREPAYMENT_INVOIC' || statusId == 'C10:1') {
        formReview.value['result'] = data.DATA;

        if (formReview.value.result.success) {
           alert("Успешно отправлено на проверку", "success");
          $('#review').modal("hide");
        }

        if (formReview.value.result.success) getTechList();
      } else {
        getTechList();
      }
    }
  });
}

const openModalSTD = function (elem, statusId) {

  $("#review").modal();
  formReview.value = {}
  formReview.value.id = elem.id;
  formReview.value.statusId = statusId;
  if (arrIdInputFile['comments'] === undefined) {
     let fileUpDrop = fileUp.create({
      url: '/upload/tmp',
      input: 'comments',
      queue: 'comments-queue',
      dropzone: 'comments-dropzone',
      autostart: false,
      sizeLimit: 20048576,
      lang: 'ru',
      onSelect: function (file) {

         let format = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/msword',
          'application/rtf',
          'image/jpeg',
          'image/png',
          'image/bmp',
        ];

        if (format.indexOf(file.type) == -1) {
          alert('Формат файла "' + file.name + '" невозможно загрузить.');
          return false;
        }
      },
    })

    arrIdInputFile['comments'] = fileUpDrop.getId();
  } else {
    let fileUpDrop = fileUp.get(arrIdInputFile['comments']);
    fileUpDrop.removeAll();
  }
}

const openModalComments = function (id) {
  $('#commentsList').modal();

  $('#commentsList').on('hide.bs.modal', function (e) {
    setTimeout(() => {
      $("body").addClass("modal-open")
    }, 1000);
  })
   let formData = new FormData();
  formData.append("id", id);

  $.ajax({
    url: '/api/technologist/main/GetComments/',
    method: 'post',
    processData: false,
    contentType: false,
    data: formData,
    success: function (data) {
      formComments = {}
      formComments['comments'] = data.DATA;
      $applyAsync();
    }
  });
}

const openModalOrder = function (id) {
  closePopup()

  setTimeout(() => {
    uploadProjectTech(id);
  }, 1000)

  setTimeout(() => {
    popupStore.openPopup('basket');
  }, 5000)
}

const uploadProjectTech = async (id: string | number) => {
  if (!id) return;

  isProjectLoading.value = true;

  try {
    const projectData = await projectAPI.loadProject(id.toString());
    if (projectData) {
      projectState.resetState();
      projectState.setInitialState(projectData);
      console.log(projectData, "----PROD");

      try {
        schemeTransition.clearStore();
        // 1. Обновляем данные проекта в sceneState
        await sceneState.loadProjectFromData(projectData);
        sceneState.updateProjectParams({});

        // 2. Устанавливаем данные в schemeTransition
        schemeTransition.setAppData(projectData.rooms);

        const currentPath = route.path;
        const is3DView = currentPath === '/3d';

        if (is3DView) {
          // Если мы на 3D, конвертируем данные только для 3D
          roomState.routConvertData('/3d');

          // Устанавливаем ID проекта в store
          projectState.setProjectId(id.toString());

          // Ждем, чтобы данные успели обновиться
          await nextTick();

          // Уведомляем о загрузке контента
          eventBus.emit("A:ContantLoaded", true);

          // Загружаем первую комнату в 3D сцену
          const rooms = roomState.getRooms;
          if (rooms && rooms.length > 0) {
            const firstRoomId = rooms[0].id;
            // Небольшая задержка для гарантии обновления данных
            await nextTick();

            // Устанавливаем состояние загрузки перед загрузкой комнаты
            await roomState.setLoad(false);
            eventBus.emit("A:Load", firstRoomId);

            // Ждем, пока сцена отрендерится
            await waitForSceneReady();
          }

          toaster.success("Проект загружен");

          // Закрываем попап
          closePopup();
        } else {
          // Если мы на 2D или другом маршруте, конвертируем данные для 2D
          // 3. Конвертируем данные для 3D (чтобы rooms.value был заполнен)
          roomState.routConvertData('/3d');

          // 4. Конвертируем данные для 2D (чтобы данные были в правильном формате)
          roomState.routConvertData('/2d');

          // 5. Устанавливаем ID проекта в store
          projectState.setProjectId(id.toString());

          // 6. Уведомляем о загрузке контента
          eventBus.emit("A:ContantLoaded", true);

          toaster.success("Проект загружен");

          // 7. Переходим на 2D конструктор
          await router.push("/2d");

          // 8. Ждем готовности C2D и инициализируем слои
          await nextTick(); // Ждем, чтобы компонент начал монтироваться
          const c2d = await waitForC2D();

          if (c2d?.layers?.planner && c2d?.layers?.doorsAndWindows) {
            // Проверяем, что данные есть перед инициализацией
            const roomsData = schemeTransition.getAllData();
            if (roomsData && roomsData.length > 0) {
              c2d.layers.planner.init(true);
              c2d.layers.doorsAndWindows.init(true);
            } else {
              console.warn("Данные проекта не найдены в schemeTransition");
            }
          } else {
            console.warn("C2D не готов после ожидания");
          }

          // 9. Закрываем попап только после успешной инициализации
          closePopup();
        }
      } catch (error) {
        console.error("Ошибка применения данных проекта:", error);
        toaster.error("Ошибка загрузки проекта");
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки проекта:", error);
    toaster.error("Ошибка загрузки проекта");
  } finally {
    isProjectLoading.value = false;
  }
};

// Ожидание готовности 3D сцены
const waitForSceneReady = async (timeout = 30000, interval = 100) => {
  const start = Date.now();
  return new Promise<void>((resolve) => {
    const check = () => {
      if (roomState.getLoad) {
        resolve();
        return;
      }
      if (Date.now() - start >= timeout) {
        console.warn("Таймаут ожидания готовности сцены");
        resolve();
        return;
      }
      setTimeout(check, interval);
    };
    check();
  });
};

// Функция ожидания готовности C2D
const waitForC2D = async (timeout = 3000, interval = 50) => {
  const start = Date.now();
  return new Promise<typeof window.C2D | null>((resolve) => {
    const check = () => {
      if (window.C2D?.layers?.planner && window.C2D?.layers?.doorsAndWindows) {
        resolve(window.C2D);
        return;
      }
      if (Date.now() - start >= timeout) {
        resolve(null);
        return;
      }
      setTimeout(check, interval);
    };
    check();
  });
};

/*const uploadProjectTech = function (id) {
  loadProject(id);
  closePopup();
}*/

</script>

<template>
  <div class="technologist">
    <div class="technologist-header">
      <div v-if="loading" class="technologist__loader"></div>

      <div class="technologist-header__title">Список заявок</div>

      <ClosePopUpButton
          class="technologist-header__close-btn"
          @click="closePopup"
      />

      <div class="modal-body">
        <div class="row">
          <div class="mainCont">
            <div class="filterList">
              <label class="filterItem" for="filterItem_1" :class="{'active': '0' == techList.filter}">
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
                  v-for="status in APP.STATUS_TECH"
                  :style="`color:${status.EXTRA.COLOR}`"
              >
                <input
                    type="radio"
                    name="filterItem"
                    value="{{status.STATUS_ID}}"
                    id="filterItem_{{status.ID}}"
                    style="display: none;"
                    v-model="techList.filter"
                >
                <span>{{ status.NAME }}</span>
              </label>
            </div>

            <div v-show="techList.nav" class="pagination_wrap">
<!--              <div
                  uib-pagination previous-text="<?= GetMessage('CON_TPL_70') ?>"
                   next-text="<?= GetMessage('CON_TPL_73') ?>"
                   items-per-page="techList.nav.NavPageSize"
                   total-items="techList.nav.NavRecordCount"
                   v-model="techList.pager"
                   max-size="5"
                   class="pagination-sm pull-left" boundary-link-numbers="true"></div>-->
              <div class="badge">{{ techList.nav.NavPageNomer }}/{{ techList.nav.NavPageCount }}</div>
            </div>

            <div id="progressModal" ng-include data-src="'progressModal'" v-show="techList.loader"></div>

            <div class="appList">
              <div v-for="elem in techList.elements" class="appItem">
                <div class="propText">{{ elem.name }}</div>
                <div class="propText">{{ elem.projectId }}</div>
                <div class="propText">{{ APP.STATUS_TECH[elem.statusId].NAME }}</div>
                <div
                    v-show="APP.userGroup[56]"
                    @click="setStatus(elem.id, 'C10:LOSE');"
                    class="btn btn-primary">Отказать
                </div>
                <div
                    v-show="APP.userGroup[56]"
                    class="btn btn-primary"
                    @click="openModalSTD(elem, 'C10:1');"
                >Отправить проект на доработку
                </div>
                <div
                    v-show="APP.userGroup[56] && elem.projectId"
                    @click="uploadProjectTech(elem.projectId);"
                    class="btn btn-primary">Загрузить проект дизайнера
                </div>
                <div
                    v-show="elem.projectTechId"
                    @click="uploadProjectTech(elem.projectTechId);"
                    class="btn btn-primary">Загрузить проект технолога
                </div>
                <div
                    v-show="elem.statusId == 'C10:NEW' && APP.userGroup[56]"
                    @click="setStatus(elem.id, 'C10:PREPARATION');"
                    class="btn btn-default">Взять в работу
                </div>
                <div
                    v-show="APP.userGroup[56] && (elem.statusId == 'C10:PREPARATION' || elem.statusId == 'C10:1')"
                    class="btn btn-default"
                    @click="openModalSTD(elem, 'C10:PREPAYMENT_INVOIC');">Отправить проект на
                  проверку
                </div>
                <div
                    @click="openModalComments(elem.id);"
                    class="btn btn-default">Комментарии
                </div>
                <div
                    v-show="((APP.userGroup[6] || APP.userGroup[29]) && elem.statusId == 'C10:PREPAYMENT_INVOIC')"
                    class="btn btn-default"
                    @click="openModalSTD(elem, 'C10:1');"
                >Отправить проект на доработку
                </div>
                <div
                    v-show="(APP.userGroup[6] || APP.userGroup[29]) && elem.statusId == 'C10:PREPAYMENT_INVOIC'"
                    class="btn btn-default"
                    @click="setStatus(elem.id, 'C10:2');"
                >Принять работу
                </div>
                <div
                    v-show="APP.userGroup[56] && elem.statusId == 'C10:2'"
                    class="btn btn-default"
                    @click="setStatus(elem.id, 'C10:3');"
                >Принять работу
                </div>
                <div
                    v-show="(APP.userGroup[6] || APP.userGroup[29]) && elem.statusId == 'C10:3'"
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
                data-dismiss="modal"></button>
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

.technologist-footer__notification {
  background: #cfe2ff;
  width: 100%;
  border-radius: 8px;
  padding: 12px;
  max-height: 114px;
  overflow-y: auto;
}

</style>

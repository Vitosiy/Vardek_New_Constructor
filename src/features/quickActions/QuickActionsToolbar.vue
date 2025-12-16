<template>
  <div class="quick-actions">
    <Tooltip
      v-for="(action, index) in actions"
      :key="index"
      :content="action.tooltip"
      position="bottom"
      v-show="action.path=='default' || route.path == action.path"
    >
      <template #trigger>
        <button
       
          class="grey-radial__button"
          @click="action.action"
        >
          <span v-if="action.iconSrc === 'folder'" class="icon">
            <img :src="folderIcon" alt="" class="icon-svg" />
          </span>
          <span v-else-if="action.iconSrc" class="icon">
            <img :src="action.iconSrc" alt="" class="icon-svg" />
          </span>
          <span v-else class="icon" :class="action.iconClass"></span>
        </button>
      </template>
    </Tooltip>

    <!-- Модальное окно для ввода имени проекта -->
    <Modal ref="saveDialogRef">
      <template #modalBody="{ onModalClose }">
        <InputDialog
          label="Назовите проект"
          placeholder="Введите название"
          :initialValue="currentProjectName"
          confirmText="Сохранить"
          @confirm="handleSaveConfirm"
          @cancel="onModalClose"
        >
          <template #confirmButton="{ onConfirm }">
            <MainButton
              @click="
                () => {
                  onConfirm();
                }
              "
            >
              Сохранить
            </MainButton>
          </template>
          <template #checkBox>
            <div class="checkbox_wrap">
              <div>
                <input type="checkbox" v-model="kpCheckbox"/>
                <label class="checkbox_label">Сохранить КП</label>
              </div>
              <div>
                <input 
                type="checkbox"
                v-model="centeringCheckbox" 
                @change="changeCamera()"
                />
                <label class="checkbox_label">Отцентровать</label>
              </div>
            </div>
          </template>
          <template #cancelButton>
            <MainButton @click="onModalClose">Отменить</MainButton>
          </template>
        </InputDialog>
      </template>
    </Modal>
      
      <Modal ref="kpDialogRef">
        <template #modalBody="{ onModalClose }">
          <Notification 
            :label="'Коммерческое предложение'"
            :description="kpData?.text"
            :link="kpData?.link"
            @cancel="onModalClose"
          >
          <template #cancelButton>
            <MainButton @click="onModalClose">Закрыть</MainButton>
          </template>
          </Notification>
        </template>
      </Modal>
  </div>
  <GenericLoader v-show="projectStore.isSaving" />
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from "vue";
import Tooltip from "@/components/ui/tooltip/Tooltip.vue";
import Modal from "@/components/ui/modals/Modal.vue";
import InputDialog from "@/components/ui/inputs/InputDialog.vue";
import MainButton from "@/components/ui/buttons/MainButton.vue";
import GenericLoader from "@/components/ui/loader/GenericLoader.vue";
import Notification from "@/components/ui/inputs/Notification.vue";

import { useQuickActionsToolbar } from "./useQuickActionsToolbar";
import { useRoute } from "vue-router";
import { useSceneState } from "@/store/appliction/useSceneState";
import { useToast } from "@/features/toaster/useToast";
import { useEventBus } from "@/store/appliction/useEventBus";
import { useProjectStore } from "./project/store/useProjectStore";
import folderIcon from "@/assets/svg/folder.svg";

const { actions, openSaveDialog, handleSaveConfirm: handleSaveConfirmFromComposable } = useQuickActionsToolbar();
const route = useRoute();
const sceneState = useSceneState();
const toaster = useToast();
const eventBus = useEventBus()
const projectStore = useProjectStore()

const kpCheckbox = ref(false)
const centeringCheckbox = ref(false)
const changeCamera = () => {
  if (centeringCheckbox.value) {
    eventBus.emit("A:ChangeCameraPos", 4);
  } 
}

// Реф для модального окна сохранения
const saveDialogRef = ref<InstanceType<typeof Modal> | null>(null);
const kpDialogRef = ref<InstanceType<typeof Modal> | null>(null);
  
const kpData = ref<{ link: string; text: string } | null>(null);

const openKpModal = (kp: { link: string; text: string }) => {
  kpData.value = kp;
  kpDialogRef.value?.openModal();
};

// Текущее название проекта
const currentProjectName = computed(() => {
  const projectData = sceneState.getCurrentProjectParams;
  return (projectData.project_name as string) || "Новый проект";
});

// Обработка подтверждения сохранения с названием проекта
const handleSaveConfirm = async (projectName: string) => {
  if (!projectName.trim()) {
    toaster.error("Введите название проекта");
    return;
  }

  // Вызываем композицию сохранения
  const result = await handleSaveConfirmFromComposable(
    projectName.trim(),
    () => {
      saveDialogRef.value?.closeModal();
    },
    kpCheckbox.value
  );

  // Если сохранение провалилось — просто выходим
  //@ts-ignore
  if (!result?.success) return;

  // Если пользователь ставил галочку "Сохранить КП" и сервер вернул kp
  //@ts-ignore
  if (kpCheckbox.value && result.kp) {
    //@ts-ignore
    openKpModal(result.kp); 
  }
};


// Функция открытия модального окна
const openModal = () => {
  saveDialogRef.value?.openModal();
};

// Передаем функцию открытия модального окна в composable после монтирования
onMounted(() => {
  if (openSaveDialog) {
    openSaveDialog.value = openModal;
  }
});
</script>

<style scoped>
.quick-actions {
  display: flex;
  gap: 8px;
}

.icon-svg {
  width: 40%;
  height: 40%;
  object-fit: contain;
}

.checkbox_label {
  font-size: 16px;
  padding-left: 7px;
}

.checkbox_wrap {
  display: flex;
  justify-content: space-between;
}
</style>

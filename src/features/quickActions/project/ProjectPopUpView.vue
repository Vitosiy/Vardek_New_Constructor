<template>
  <div class="project">
    <div class="project__title">Открыть проект</div>
    <ClosePopUpButton class="popup__close" @close="closePopup" />
    <div class="project__container">
      <div class="project-header">
        <ProjectSearchBar @update:filters="onUpdateFilters" />
        <div class="project-buttons">
          <MainButton :className="'red__button'">Готовые проекты</MainButton>
          <MainButton :className="'grey__button'">Мои проекты</MainButton>
        </div>
      </div>
      <ProjectWarning @save="onSave" />
      <ProjectList :items="projectsStore.getProjects" @select="onSelect" @create="onCreate" />
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import MainButton from "@/components/ui/buttons/MainButton.vue";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import ProjectSearchBar from './components/ProjectSearchBar.vue'
import ProjectWarning from './components/ProjectWarning.vue'
import ProjectList from './components/ProjectList.vue'
import { usePopupStore } from '@/store/appStore/popUpsStore'
import { useProjectsStore } from './store/useProjectsStore'

const popupStore = usePopupStore()
const projectsStore = useProjectsStore()

const closePopup = () => {
  popupStore.closePopup('project')
}

const onSave = async () => {
  await projectsStore.save()
}

const onSelect = async (item) => {
  await projectsStore.getProject(item.id)
}

const onCreate = async () => {
  await projectsStore.save('Новый проект')
}

const onUpdateFilters = () => {
  // Пока игнорируем фильтрацию
}

onMounted(() => {
  projectsStore.getList()
})
</script>
<style lang="scss" scoped>
.project {
  width: 100%;
  height: 80vh;
  max-width: 1347px;
  position: relative;
  overflow: hidden;
  &__title {
    text-align: center;
    margin-bottom: 30px;
    font-size: 32px;
    font-weight: 600;
  }

  &__container {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      border: 1px solid $stroke;
      border-radius: 15px;

      .project-search {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .project-buttons {
        display: flex;
        align-items: center;
        gap: 10px;

      }
    }

    
  }
}
</style> 
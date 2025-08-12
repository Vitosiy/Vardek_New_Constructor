<template>
  <div>
    <div class="study">
      <div class="study-header">
        <div class="study__title">Обучение</div>
        <ClosePopUpButton class="popup__close" @close="closePopup" />
      </div>
      <div class="tree-scroll">
        <div class="study-parts tree-root">
          <TreeNode
            v-for="node in learningTabs.getTree()"
            :key="node.id"
            :node="node"
            :selectedTabId="selectedTabId"
            @select-leaf="selectTab"
          />
        </div>
      </div>
      <MainInput class="input__search" v-model="textValue" type="text" placeholder="Поиск..." />
      <div class="study-main">
        <div v-if="learningTabs.loadingContent">Загрузка...</div>
        <div v-if="learningTabs.hasErrorContent">Ошибка загрузки контента</div>
        <div v-if="selectedTabId !== null && learningTabs.getTabContent()">
          <h4>{{ learningTabs.getTabContent()?.title }}</h4>
          <div>{{ learningTabs.getTabContent()?.content.text }}</div>
          <div v-if="learningTabs.getTabContent()?.content.images.length">
            <div>Картинки:</div>
            <ul>
              <li v-for="img in learningTabs.getTabContent()?.content.images" :key="img">
                <img :src="img" alt="image" width="100" />
              </li>
            </ul>
          </div>
          <div v-if="learningTabs.getTabContent()?.content.videos.length">
            <div>Видео:</div>
            <ul>
              <li v-for="vid in learningTabs.getTabContent()?.content.videos" :key="vid">
                <video :src="vid" controls width="200"></video>
              </li>
            </ul>
          </div>
          <div v-if="learningTabs.getTabContent()?.content.links.length">
            <div>Ссылки:</div>
            <ul>
              <li v-for="link in learningTabs.getTabContent()?.content.links" :key="link.url">
                <a :href="link.url" target="_blank">{{ link.label }}</a>
              </li>
            </ul>
          </div>
        </div>
        <div v-else>Выберите таб (лист)</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainInput from "@/components/ui/inputs/MainInput.vue";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import { usePopupStore } from '@/store/appStore/popUpsStore';
import { useLearningTabs } from '@/composables/useLearningTabs';
import TreeNode from './TreeNode.vue';

const popupStore = usePopupStore();
const closePopup = () => {
  popupStore.closePopup('study');
};

const textValue = ref('');
const learningTabs = useLearningTabs();
const selectedTabId = ref(null);

onMounted(async () => {
  await learningTabs.fetchTree();
});

const selectTab = async (id) => {
  selectedTabId.value = id;
  await learningTabs.fetchTabContent(id);
};
</script>

<style lang="scss" scoped>
.study {
  width: 100%;
  max-width: 1250px;
  position: relative;
  &-header {
    .study__title {
      margin-bottom: 20px;
      font-size: 32px;
      font-weight: 600;
      text-align: center;
    }
  }
  .study-parts {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    padding: 5px 0;
    margin-bottom: 10px;
    border-top: 1px solid $stroke;
    border-bottom: 1px solid $stroke;
    min-width: 350px;
  }
  .tree-scroll {
    overflow-x: auto;
    max-width: 100vw;
    padding-bottom: 8px;
  }
  .tree-root {
    min-width: 400px;
    max-width: 800px;
  }
  .study-main {
    margin-top: 30px;
  }
}
</style>

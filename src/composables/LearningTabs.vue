<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useLearningTabs } from './useLearningTabs';

const learningTabs = useLearningTabs();
const selectedTabId = ref<number | null>(null);

onMounted(async () => {
  await learningTabs.fetchTree();
});

const selectTab = async (id: number) => {
  selectedTabId.value = id;
  await learningTabs.fetchTabContent(id);
};
</script>

<template>
  <div>
    <div>
      <h3>Табы</h3>
      learningTabs.getTree()
      <ul>
        <template v-for="node in learningTabs.getTree()" :key="node.id">
          <li>
            <button type="button" @click="selectTab(node.id)">{{ node.title }}</button>
            <ul v-if="node.children && node.children.length">
              <template v-for="child in node.children" :key="child.id">
                <li>
                  <button type="button" @click="selectTab(child.id)">{{ child.title }}</button>
                  <ul v-if="child.children && child.children.length">
                    <template v-for="sub in child.children" :key="sub.id">
                      <li>
                        <button type="button" @click="selectTab(sub.id)">{{ sub.title }}</button>
                      </li>
                    </template>
                  </ul>
                </li>
              </template>
            </ul>
          </li>
        </template>
      </ul>
      <div v-if="learningTabs.loadingTree">Загрузка...</div>
      <div v-if="learningTabs.hasErrorTree">Ошибка загрузки дерева</div>
    </div>
    <div>
      <h3>Контент таба</h3>
      <div v-if="learningTabs.loadingContent">Загрузка...</div>
      <div v-if="learningTabs.hasErrorContent">Ошибка загрузки контента</div>
      <div v-if="learningTabs.getTabContent()">
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
      <div v-else>Выберите таб</div>
    </div>
  </div>
</template>

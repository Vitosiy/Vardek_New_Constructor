<script setup lang="ts">
// @ts-nocheck 31

import { onMounted, ref } from "vue";
import { useAppData } from "@/store/appliction/useAppData";

import MainHeader from "@/components/header/MainHeader.vue";
import OptionsMenu from "@/components/left-menu/OptionsMenu.vue";
import OptionsMenu2D from "@/components/left-menu/constructor2d/OptionsMenu.vue";
import CustomiserMenu from "@/components/right-menu/CustomiserMenu.vue";
import MainPopUp from "@/components/popUp/MainPopUp.vue";
import InfoPopUp from "@/components/popUp/InfoPopUp.vue";
import { indexDBCreator } from "@/layouts/utils/IndexDBCreator.ts";

import { useRoute } from "vue-router";

const route = useRoute();

const ready = ref<boolean>(false);

let indexedDataBase: IDBDatabase;

const loadEvents = async () => {
  let result;
  try {
    console.log("Start");

    const url = new URL(
      "https://dev.vardek.online/api/modeller/mainobject/GetData/"
    );

    // url.searchParams.append('config', '689680');
    // url.searchParams.append('style_id', '43830');

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status}`);
    }

    // Проверка на тип контента в ответе
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json(); // Если JSON
      useAppData().setAppData(data.DATA);
      ready.value = true;

      console.log("Полученные JSON данные:", useAppData().getAppData);
      return data.DATA
    } else {
      data = await response.text(); // Если текст или HTML
      console.log("Полученные текстовые данные:", data);
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
};

onMounted(() => {
  console.log('mounted default layout');
  
  let openRequest = indexedDB.open("storage", 1);

  // слушатель отрабатывает при первой инициации базы
  openRequest.onupgradeneeded = () => {
    indexedDataBase = openRequest.result;
    indexedDataBase.createObjectStore("data", { keyPath: "name" });
  };

  openRequest.onsuccess = () => {
    indexedDataBase = openRequest.result;
    let transaction = indexedDataBase.transaction("data", "readwrite");
    let data = transaction.objectStore("data");
    let req = data.getAll()
    
    req.onsuccess = async () => {
      if(req.result.length) {
        console.log(req.result, 'already comlete');
        //TODO засинхронизировать стор

        useAppData().setAppData(req.result[0]);
        console.log(useAppData().getAppData, 'appData');
        
        return
      }

      let fetchData = await loadEvents();
      let new_transaction = indexedDataBase.transaction("data", "readwrite");
      let new_data = new_transaction.objectStore("data");
      
      let request =  new_data.add({...{name: 'db'}, ...fetchData}) 
      request.onsuccess = () => {
        console.log('fetch added to base'); 
      };
      request.onerror = function () {
        console.log("Ошибка", request.error);
      };
    }
  };

  openRequest.onerror = () => {
    console.log('error to db');
  }
});
</script>

<!-- <template>
    <MainHeader/>
    <MainPopUp/>
    <InfoPopUp />
    <div class="main__container" v-if="ready">
        <OptionsMenu v-if="route.name === 'Constructor3d'"/>
        <OptionsMenu2D v-else-if="route.name === 'Constructor2d'"/>
        <CustomiserMenu/>
        <RouterView/>
    </div>
</template> -->

<template>
  <MainHeader />
  <MainPopUp />
  <InfoPopUp />
  <div class="main__container">
    <OptionsMenu v-if="route.name === 'Constructor3d' && ready" />
    <OptionsMenu2D v-else-if="route.name === 'Constructor2d'" />
    <CustomiserMenu />
    <RouterView />
  </div>
</template>

// import MainHeader from '@/components/header/MainHeader.vue' // import
OptionsMenu from '@/components/left-menu/OptionsMenu.vue' // import
OptionsMenu2D from '@/components/left-menu/constructor2d/OptionsMenu.vue' //
import CustomiserMenu from '@/components/right-menu/CustomiserMenu.vue' //
import MainPopUp from '@/components/popUp/MainPopUp.vue' // import { useRoute }
from "vue-router"; // const route = useRoute();

<style lang="scss" scoped>
.main__container {
  width: 100%;
  height: calc(100% - 91px);
  display: flex;
  flex-wrap: nowrap;
}
</style>

// New_Constructor_flow/src/layouts/DefaultLayout.vue

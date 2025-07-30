<script setup lang="ts">
// @ts-nocheck 31

import { onMounted, ref, watch, useTemplateRef, nextTick } from "vue";
import { useAppData } from "@/store/appliction/useAppData";

import MainHeader from "@/components/header/MainHeader.vue";
import OptionsMenu from "@/components/left-menu/OptionsMenu.vue";
import OptionsMenu2D from "@/components/left-menu/constructor2d/OptionsMenu.vue";
import CustomiserMenu from "@/components/right-menu/CustomiserMenu.vue";
import MainPopUp from "@/components/popUp/MainPopUp.vue";
import InfoPopUp from "@/components/popUp/InfoPopUp.vue";

import { useRoute } from "vue-router";

const route = useRoute();
const ready = ref<boolean>(false);
const pageComponentRef = ref(null);

let indexedDataBase: IDBDatabase;

const loadEvents = async () => {
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



      console.log(data.DATA)

      console.log("Полученные JSON данные:", useAppData().getAppData);
      return data.DATA;
    } else {
      data = await response.text(); // Если текст или HTML
      console.log("Полученные текстовые данные:", data);
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
};

onMounted(() => {
  /* подключение к indexedDB */
  let openRequest = indexedDB.open("storage", 1);

  /* слушатель срабатывает при первой инициализации базы */
  openRequest.onupgradeneeded = (): void => {
    indexedDataBase = openRequest.result;
    /* создание объекта хранилища куда будут загружены  данные с базы */
    indexedDataBase.createObjectStore("data", { keyPath: "name" });
  };

  /* слушатель срабатывает каждый раз при перезагрузке страницы */
  openRequest.onsuccess = (): void => {
    indexedDataBase = openRequest.result;
    /* создание тестовой транзакции для проверки загружены ли данные в локальную базу */
    let transaction = indexedDataBase.transaction("data", "readwrite");
    let data = transaction.objectStore("data");
    let req = data.getAll(); /* запрос на содержимое базы */

    req.onsuccess = async (): void => {
      if (req.result.length) {
        console.log(req.result[0], '---DATA1')
        /* если локальная база не пуста, все содержимое загружается в стор */
        useAppData().setAppData(req.result[0]);
        return;
      }

      /* если база пуста, происходит загрузка данных с удаленной базы */
      let fetchResponse = await loadEvents();

      /* создание новой транзакции и добавление данных в локальную базу*/
      let new_transaction = indexedDataBase.transaction("data", "readwrite");
      let new_data = new_transaction.objectStore("data");
      let request = new_data.add({ ...{ name: "db" }, ...fetchResponse });
      request.onerror = function (): void {
        console.log("Ошибка", request.error);
      };
    };
    ready.value = true;
  };

  /* слушатель обработки ошибок подключения к indexedDB */
  openRequest.onerror = (): void => {
    console.log("error to db");
  };
});

</script>

<template>
  <MainHeader :page-component="pageComponentRef" />
  <MainPopUp />
  <InfoPopUp />
  <div class="main__container">
    <OptionsMenu v-if="route.name === 'Constructor3d' && ready" />
    <OptionsMenu2D v-else-if="route.name === 'Constructor2d'" />
    <CustomiserMenu />
    <RouterView v-slot="{ Component }">
      <component :is="Component" ref="pageComponentRef" />
    </RouterView>
  </div>
</template>


<style lang="scss" scoped>
.main__container {
  width: 100%;
  height: calc(100% - 91px);
  display: flex;
  flex-wrap: nowrap;
}
</style>

// New_Constructor_flow/src/layouts/DefaultLayout.vue

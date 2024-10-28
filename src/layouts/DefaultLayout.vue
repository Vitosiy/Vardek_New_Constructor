<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAppData } from "@/store/appliction/useAppData";

import MainHeader from "@/components/header/MainHeader.vue";
import OptionsMenu from "@/components/left-menu/OptionsMenu.vue";
import MainPopUp from "@/components/popUp/MainPopUp.vue";
import CustomiserMenu from "@/components/right-menu/CustomiserMenu.vue";


const ready = ref<boolean>(false);

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

      console.log("Полученные JSON данные:", useAppData().getAppData);
    } else {
      data = await response.text(); // Если текст или HTML
      console.log("Полученные текстовые данные:", data);
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
};

onMounted(() => {
  loadEvents();
});

</script>

<template>
  <MainHeader />
  <MainPopUp />

  <div class="main__container" v-if="ready">
    <CustomiserMenu />
    <OptionsMenu />
    <RouterView />
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

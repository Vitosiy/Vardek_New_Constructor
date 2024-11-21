<script setup lang="ts">
// @ts-nocheck 31

import { onMounted, ref } from "vue";
import { useAppData } from "@/store/appliction/useAppData";

import MainHeader from '@/components/header/MainHeader.vue'
import OptionsMenu from '@/components/left-menu/OptionsMenu.vue'
import OptionsMenu2D from '@/components/left-menu/constructor2d/OptionsMenu.vue'
import CustomiserMenu from '@/components/right-menu/CustomiserMenu.vue'
import MainPopUp from '@/components/popUp/MainPopUp.vue'
import InfoPopUp from "@/components/popUp/InfoPopUp.vue";

import { useRoute } from "vue-router";

const route = useRoute();

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
    <MainHeader/>
    <MainPopUp/>
    <InfoPopUp />
    <div class="main__container">
        <OptionsMenu v-if="route.name === 'Constructor3d'"/>
        <OptionsMenu2D v-else-if="route.name === 'Constructor2d'"/>
        <CustomiserMenu/>
        <RouterView/>
    </div>
</template>


// import MainHeader from '@/components/header/MainHeader.vue'
// import OptionsMenu from '@/components/left-menu/OptionsMenu.vue'
// import OptionsMenu2D from '@/components/left-menu/constructor2d/OptionsMenu.vue'
// import CustomiserMenu from '@/components/right-menu/CustomiserMenu.vue'
// import MainPopUp from '@/components/popUp/MainPopUp.vue'

// import { useRoute } from "vue-router";

// const route = useRoute();





<style lang="scss" scoped>
.main__container {
  width: 100%;
  height: calc(100% - 91px);
  display: flex;
  flex-wrap: nowrap;
}
</style>

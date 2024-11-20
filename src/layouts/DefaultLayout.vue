<template>
    <MainHeader/>
    <MainPopUp/>
    <div class="main__container">
        <OptionsMenu v-if="route.name === 'Constructor3d'"/>
        <OptionsMenu2D v-else-if="route.name === 'Constructor2d'"/>
        <CustomiserMenu/>
        <RouterView/>
    </div>
</template>

<script setup>
import MainHeader from '@/components/header/MainHeader.vue'
import OptionsMenu from '@/components/left-menu/OptionsMenu.vue'
import OptionsMenu2D from '@/components/left-menu/constructor2d/OptionsMenu.vue'
import CustomiserMenu from '@/components/right-menu/CustomiserMenu.vue'
import MainPopUp from '@/components/popUp/MainPopUp.vue'

import { useRoute } from "vue-router";

const route = useRoute();

</script>

<style lang="scss" scoped>
.main__container {
    width: 100%;
    height: calc(100% - 91px);
    display: flex;
    flex-wrap: nowrap;
}
</style>
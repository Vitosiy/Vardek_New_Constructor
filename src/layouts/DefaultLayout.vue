<template>
    <MainHeader/>
    <MainPopUp/>
    <div class="main__container">
        <OptionsMenu/>
        <RouterView/>
    </div>
</template>

<script setup>
import MainHeader from '@/components/header/MainHeader.vue'
import OptionsMenu from '@/components/left-menu/OptionsMenu.vue'
import MainPopUp from '@/components/popUp/MainPopUp.vue'
</script>

<style lang="scss" scoped>
.main__container {
    width: 100%;
    height: calc(100% - 91px);
    display: flex;
    flex-wrap: nowrap;
}
</style>
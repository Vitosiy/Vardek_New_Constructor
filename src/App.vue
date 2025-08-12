<template>
    <router-view/>
</template>

<script setup>
import { onMounted } from 'vue';
import { AuthService } from '@/services/authService'


onMounted(() => {
    isInitHeader();
})

const isInitHeader = async () =>  {
   await AuthService.initHeader();
}

</script>
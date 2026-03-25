<script lang="ts" setup>
//@ts-nocheck

    import { useProjectAPI } from '../quickActions/project/composables/useProjectAPI';

    const { getOrderFormData } = useProjectAPI()
</script>

<template> 
    <button @click="getOrderFormData">X</button>
</template>

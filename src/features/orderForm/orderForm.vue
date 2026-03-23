<script lang="ts" setup>
    import { useProjectAPI } from '../quickActions/project/composables/useProjectAPI';

    const { getOrderFormData } = useProjectAPI()
</script>

<template> 
    <button @click="getOrderFormData">X</button>
</template>

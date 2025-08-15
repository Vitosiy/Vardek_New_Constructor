<script setup>
import { onMounted, ref } from 'vue'
import { SwaggerUIBundle } from "swagger-ui-dist"
import 'swagger-ui-dist/swagger-ui.css'

const swaggerContainer = ref(null)

onMounted(() => {
  SwaggerUIBundle({
    domNode: swaggerContainer.value,
    url: '/api/openapi_combined.json', // Путь до схемы
  })
})
</script>

<template>
  <div style="width: 100%; height: 100%; overflow: scroll;">
    <div ref="swaggerContainer"></div>
  </div>
</template>

<style scoped>
</style>
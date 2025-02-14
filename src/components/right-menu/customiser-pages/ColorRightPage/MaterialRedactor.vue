<script setup lang="ts">
// @ts-nocheck 31

import { defineProps, watch } from 'vue';

const props = defineProps({
  materialList: Array/* Возможные варианты материала */ 
})


watch(() => props.materialList, () => {
  console.log(props.materialList, 'PROPS MATERIAL');
})
</script>

<template>
  <select>
    <option v-for="item in props.materialList" :value="item">{{ item.NAME }}</option>
  </select>
  <!--
    <div v-for="item in props.materialList">
      {{ item.NAME }}
      <div>//////////////////////////////////////////////</div>
    </div>
    
    <div>
      {{ props.materialList[0] }}
    </div>
  -->
</template>
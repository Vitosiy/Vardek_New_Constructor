<script lang="ts" setup>

import { defineProps } from 'vue';

const props = defineProps({
  type: String
})

</script>

<template>
 {{ props.type }}
</template>
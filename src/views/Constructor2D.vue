<script lang="ts" setup>

import { ref, onMounted, Ref, watch } from "vue";

import { useC2DLeftMenuStore } from "@/store/constructor2d/store/useLeftMenuStore";

const leftMenuStore = useC2DLeftMenuStore();

import Constructor2D from '@/Constructor2D';

// root container
const root2d: Ref<HTMLCanvasElement | undefined> = ref();
// canvas
const canvas2d: Ref<HTMLCanvasElement | undefined> = ref();

document.oncontextmenu = document.body.oncontextmenu = function() {return false;};

let App2d: Constructor2D | null = null; 

onMounted(async () => {

  App2d = new Constructor2D(root2d.value, canvas2d.value);
  await App2d.init();

  console.log("!!! App2d:", App2d);
  
});

</script>

<style lang="scss" setup>
#app2D {
  display: flex;
  width: 100%;
}
// #constructor2D{
//   width: 100%;
//   height: 100%;
// }
</style>

<template>
  <div ref="root2d" id="app2D">
    <canvas ref="canvas2d" id="constructor2D"></canvas>
  </div>
</template>
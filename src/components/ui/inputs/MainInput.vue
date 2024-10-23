<template>
  <input 
    :class="inputClass"
    :type="type"
    :min="min"
    :max="max"
    v-model="inputValue"
    :placeholder="placeholder" 
    :style="inputStyle" 
  />


</template>

<script setup>
import { ref, watch, toRefs } from "vue";

const props = defineProps({
modelValue: {
  type: [String, Number],
  required: true,
},
min: {
  type: Number,
  default: 1,
},
max: {
  type: Number,
  default: 10,
},
type: {
  type: String,
  default: "text",
},
placeholder: {
  type: String,
  default: "",
},
inputClass: {
  type: String,
  default: "",
},
inputStyle: {
  type: Object,
  default: () => ({}),
},
});


const emit = defineEmits(["update:modelValue"]);


const inputValue = ref(props.modelValue);

watch(inputValue, (newValue) => {
let value = newValue;
emit("update:modelValue", value);
});

watch(
() => props.modelValue,
(newValue) => {
  inputValue.value = newValue;
}
);


</script>

<style lang="scss" scoped>
.input__search {
width: 100%;
height: 50px;
min-height: 50px;
font-size: 16px;
padding: 0 32px;
box-sizing: border-box;
&.right-menu {
  height: 39px;
  padding: 0 15px;
}
}
</style>
<!-- v-if="isChangeEnabled"  -->
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
// TODO написать логику ограничения размеров min/max
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
inputInfo: {
  type: String,
}
});

const isChangeEnable = () => {
  console.log((props.min !== null) && (props.max !== null), 'IS_CHANGE_ENABLE');
  
 return (props.min !== null) && (props.max !== null)
}

const emit = defineEmits(["update:modelValue"]);

const inputInfo = props.inputInfo

// const update = (e) => {
  
//   console.log('OUTPUT OF INPUT', {inputInfo:  e.target.value});
  
//   // emit("update:modelValue", {inputInfo:  e.target.value});
// }

const inputValue = ref(props.modelValue);

watch(inputValue, (newValue) => {
  console.log('WATCHER', newValue);
  isChangeEnable()
emit("update:modelValue", newValue);
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
  width: 100% !important; 
  height: 50px;
  min-height: 50px;
  font-size: 16px;
  padding: 0 32px;
  box-sizing: border-box;
    &.right-menu {
      width: 100%;
      height: 39px;
      padding: 0 15px;
    }
}
</style>
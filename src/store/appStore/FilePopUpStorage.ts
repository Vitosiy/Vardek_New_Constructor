import { ref } from 'vue'
import {defineStore} from "pinia";

export const useFilePopUpStorage = defineStore('file-popup-data', () => {
  const storedFile = ref<File | null>(null)

  const setFile = (file?: File) => {
    if (file) {
      storedFile.value = file
    }
  }

  const getFile = () => {
    return storedFile.value
  }

  const clearFile = () => {
    storedFile.value = null
  }

  return {
    setFile,
    getFile,
    clearFile,
  }
})
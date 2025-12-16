import { ref } from 'vue'
import {TechnologistFormError} from "@/types/technologist.ts";

const STORAGE_KEY = 'technologist-data'

export function useTechnologistStorage() {
  const currentProjectID = ref<number|boolean>(false)
  const techFormError = ref<TechnologistFormError>(<TechnologistFormError>{})

  const setCurrentProjectID = (id: number) => {
    if(id && currentProjectID.value !== id) {
      currentProjectID.value = id
    }
  }

  const setTechFormError = (error: TechnologistFormError) => {
    if(error) {
      techFormError.value = error
    }
  }

  const getCurrentProjectID = () => {
    return currentProjectID.value;
  }

  const getTechFormError = () => {
    return techFormError.value;
  }

  const clearStorage = () => {
    currentProjectID.value = false
  }

  const clearError = () => {
    techFormError.value = <TechnologistFormError>{}
  }

  return {
    setTechFormError,
    getTechFormError,
    getCurrentProjectID,
    setCurrentProjectID,
    clearStorage,
    clearError
  }
}
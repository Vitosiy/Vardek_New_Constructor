//@ts-nocheck

import { readonly, ref } from 'vue'
import { TechnologistService} from "@/services/technologistService.ts";
import {TechnologistFormResponse, TechnologistResponse} from "@/types/technologist.ts";
import {useTechnologistStorage} from "@/store/appStore/technologist/useTechnologistStorage.ts";

export const useTechnologistApi = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const technologistStorage = useTechnologistStorage();

  const submitTechForm = async (formItem: FormData): Promise<TechnologistFormResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await TechnologistService.submitTechForm(formItem)

      if (response.DATA.error) {
        technologistStorage.setTechFormError(response.DATA)
      } else {
        technologistStorage.setTechFormError({})
      }

      return <TechnologistFormResponse>{ ...response }
    }
    catch (err: any) {
      error.value = err.message || 'Ошибка при отправке заявки'
      return null
    }
    finally {
      loading.value = false
    }
  }

  const getList = async (formItem: FormData): Promise<TechnologistResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await TechnologistService.getList(formItem)
      return <TechnologistResponse>{ ...response }
    }
    catch (err: any) {
      error.value = err.message || 'Ошибка при получении списка заявок'
      return null
    }
    finally {
      loading.value = false
    }
  }

  const setStatus = async (formItem: FormData): Promise<TechnologistResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await TechnologistService.setStatus(formItem)
      return <TechnologistResponse>{ ...response }
    }
    catch (err: any) {
      error.value = err.message || 'Ошибка при смене статуса заявки'
      return null
    }
    finally {
      loading.value = false
    }
  }
  return {
    loading: readonly(loading),
    error: readonly(error),
    submitTechForm,
    getList,
    setStatus,
  }
}
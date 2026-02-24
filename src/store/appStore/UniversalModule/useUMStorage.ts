import { ref } from 'vue'
import {defineStore} from "pinia";

export const useUMStorage = defineStore('um-data', () => {
  const UM_GRID = ref(false)
  const UM_CONFIG = ref(false)

  const UM_CASH_GRID = ref(false)
  const UM_CASH_CONFIG = ref(false)

  const setUMGrid = (value: any) => {
    if(value)
      UM_GRID.value = value
  }
  const setUMConfig = (value: any) => {
    if(value)
      UM_CONFIG.value = value
  }
  const setUMCashConfig = (value: any) => {
    if(value)
      UM_CASH_CONFIG.value = value
  }
  const setUMCashGrid = (value: any) => {
    if(value)
      UM_CASH_GRID.value = value
  }

  const getUMGrid = () => {
    return UM_GRID.value
  }
  const getUMConfig = () => {
    return UM_CONFIG.value
  }
  const getUMCashConfig = () => {
    return UM_CASH_CONFIG.value
  }
  const getUMCashGrid = () => {
    return UM_CASH_GRID.value
  }

  return {
    setUMGrid,
    setUMConfig,
    setUMCashConfig,
    setUMCashGrid,
    getUMGrid,
    getUMConfig,
    getUMCashConfig,
    getUMCashGrid,
  }
})
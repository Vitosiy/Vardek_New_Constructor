// @ts-nocheck
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAppData = defineStore('AppData', () => {
  const appData = ref<{ [key: string]: any }>({})
  const indexedDataBase = ref<IDBDatabase | null>(null)
  const isLoading = ref(false)
  const isLoaded = ref(false)

  const fetchRemoteData = async () => {
    isLoading.value = true;
    console.log('Start fetch from API')
    const url = new URL('https://dev.vardek.online/api/modeller/mainobject/GetData/')
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`)

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      console.log('Полученные JSON данные:', data.DATA)
      return data.DATA
    } else {
      const text = await response.text()
      console.log('Полученные текстовые данные:', text)
      return null
    }
  }

  const initIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open('storage', 1)
      openRequest.onupgradeneeded = () => {
        const db = openRequest.result
        db.createObjectStore('data', { keyPath: 'name' })
      }
      openRequest.onsuccess = () => resolve(openRequest.result)
      openRequest.onerror = () => reject(openRequest.error)
    })
  }

  const getFromIndexedDB = (db: IDBDatabase): Promise<any | null> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('data', 'readonly')
      const store = transaction.objectStore('data')
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result.length ? req.result[0] : null)
      req.onerror = () => reject(req.error)
    })
  }

  const saveToIndexedDB = (db: IDBDatabase, value: any) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('data', 'readwrite')
      const store = transaction.objectStore('data')
      const request = store.add({ ...{ name: 'db' }, ...value })
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }

  const setAppData = (value: any) => {
    appData.value = value
  }

  const initAppData = async () => {
    if (isLoaded.value || isLoading.value) return
    isLoading.value = true
    try {
      indexedDataBase.value = await initIndexedDB()
      let localData = await getFromIndexedDB(indexedDataBase.value)
      if (localData) {
        console.log('Загружено из IndexedDB', localData)
        setAppData(localData)
        isLoaded.value = true
        return
      }
      const remoteData = await fetchRemoteData()
      if (remoteData) {
        setAppData(remoteData)
        await saveToIndexedDB(indexedDataBase.value, remoteData)
        isLoaded.value = true
      }
    } catch (err) {
      console.error('Ошибка инициализации данных:', err)
    } finally {
      isLoading.value = false
      document.querySelector('#main-loader').style.display = 'none';
    }
  }

  const getAppData = computed(() => appData.value)

  return {
    getAppData,
    isLoaded,
    isLoading,
    setAppData,
    initAppData,
  }
})

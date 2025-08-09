// @ts-nocheck
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAppData = defineStore('AppData', () => {
  const appData = ref<{ [key: string]: any }>({})
  const indexedDataBase = ref<IDBDatabase | null>(null)

  /** Получить данные из API */
  const fetchRemoteData = async () => {
    console.log('Start fetch from API')

    const url = new URL('https://dev.vardek.online/api/modeller/mainobject/GetData/')
    // url.searchParams.append('config', '689680')
    // url.searchParams.append('style_id', '43830')

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

  /** Инициализация IndexedDB */
  const initIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open('storage', 1)

      openRequest.onupgradeneeded = () => {
        const db = openRequest.result
        db.createObjectStore('data', { keyPath: 'name' })
      }

      openRequest.onsuccess = () => {
        resolve(openRequest.result)
      }

      openRequest.onerror = () => {
        reject(openRequest.error)
      }
    })
  }

  /** Получить данные из IndexedDB */
  const getFromIndexedDB = (db: IDBDatabase): Promise<any | null> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('data', 'readonly')
      const store = transaction.objectStore('data')
      const req = store.getAll()

      req.onsuccess = () => {
        if (req.result.length) {
          resolve(req.result[0])
        } else {
          resolve(null)
        }
      }

      req.onerror = () => reject(req.error)
    })
  }

  /** Сохранить данные в IndexedDB */
  const saveToIndexedDB = (db: IDBDatabase, value: any) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('data', 'readwrite')
      const store = transaction.objectStore('data')
      const request = store.add({ ...{ name: 'db' }, ...value })

      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }

  /** Установить данные в стор */
  const setAppData = (value: any) => {
    appData.value = value
  }

  /** Инициализация данных (IndexedDB -> API -> IndexedDB) */
  const initAppData = async () => {
    try {
      indexedDataBase.value = await initIndexedDB()
      let localData = await getFromIndexedDB(indexedDataBase.value)

      if (localData) {
        console.log('Загружено из IndexedDB', localData)
        setAppData(localData)
        return
      }

      const remoteData = await fetchRemoteData()
      if (remoteData) {
        setAppData(remoteData)
        await saveToIndexedDB(indexedDataBase.value, remoteData)
      }
    } catch (err) {
      console.error('Ошибка инициализации данных:', err)
    }
  }

  const getAppData = computed(() => appData.value)

  return {
    getAppData,
    setAppData,
    initAppData,
  }
})

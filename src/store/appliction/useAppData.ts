// @ts-nocheck
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';


export const useAppData = defineStore('AppData', () => {

    const appData = ref<{ [key: string]: any }>({})
    const indexedDataBase = ref<IDBDatabase | null>(null)

    const setAppData = async (value: any) => {
        if (value) {

            appData.value = value
            return
        }

        appData.value = await createData()

        // console.log(result, 'result')



        console.log('Данные с бэка в сторе')
    }

    const createData = async (): Promise<any> => {
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open("storage", 1);

            openRequest.onsuccess = () => {
                indexedDataBase.value = openRequest.result;

                const transaction = indexedDataBase.value.transaction("data", "readwrite");
                const data = transaction.objectStore("data");
                const req = data.getAll();

                req.onsuccess = () => {
                    if (req.result.length) {
                        resolve(req.result[0]);
                    } else {
                        resolve(null);
                    }
                };

                req.onerror = (event) => {
                    reject(req.error);
                };
            };

            openRequest.onerror = () => {
                reject(openRequest.error);
            };
        });
    };

    const getAppData = computed(() => {
        return appData.value
    })


    return {
        getAppData,
        setAppData
    };

})

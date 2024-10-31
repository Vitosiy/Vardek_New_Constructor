import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useRoomContantData = defineStore('RoomContantData', () => {

    const roomContantData = ref<any>({})

    const setRoomContantData = (value: any) => {
        roomContantData.value = value
    }

    const getRoomContantData = computed(() => {
        return roomContantData.value
    })

    return {
        getRoomContantData,
        setRoomContantData
    };

})

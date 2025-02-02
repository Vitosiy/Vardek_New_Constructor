

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useEventBus = defineStore('EventBus', () => {

  const events = ref<{ [key: string]: Function[] }>({});

  const emit = (event: string, payload?: any) => {
    if (!events.value[event]) {
      console.warn(`Event "${event}" not found`);
      return;
    }
    events.value[event].forEach(callback => callback(payload));
  }

  const on = (event: string, callback: Function) => {
    if (!events.value[event]) {
      events.value[event] = [];
    }
    events.value[event].push(callback);

  }

  const off = (event: string, callback: Function) => {
    if (events.value[event]) {
      events.value[event] = events.value[event].filter(cb => cb !== callback);
    }
  }

  const clearEvents = () => {
    events.value = {}
  }

  const getEvents = computed(() => {
    return events.value
  })

  return { emit, on, off, getEvents, clearEvents };
});
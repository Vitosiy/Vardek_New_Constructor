

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEventBus = defineStore('EventBus', () => {

  const events = ref<{ [key: string]: Function[] }>({});

  const emit = (event: string, payload?: any) => {
    if (events.value[event]) {
      events.value[event].forEach(callback => callback(payload));
    }
  }

  const on = (event: string, callback: Function)  => {
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

  return { emit, on, off };
});
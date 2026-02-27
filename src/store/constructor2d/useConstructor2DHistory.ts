/**
 * Объект с историей для 2D конструктора.
 * Хранит снапшоты состояния схемы (комнаты, стены, двери/окна) и поддерживает undo/redo.
 * Аналог UserHistory из 3D, но работает с объектом-историей снапшотов целиком.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/** Один снапшот = массив комнат в формате schemeTransition */
export type Constructor2DSnapshot = Record<string, unknown>[];

const MAX_HISTORY_SIZE = 50;

export const useConstructor2DHistory = defineStore('constructor2DHistory', () => {
  /** Массив снапшотов состояния */
  const history = ref<Constructor2DSnapshot[]>([]);
  /** Индекс текущего состояния в истории */
  const currentIndex = ref(0);
  /** Флаг: идёт восстановление из истории (не добавлять новый снапшот при сохранении) */
  const isRestoring = ref(false);

  const historyLength = computed(() => history.value.length);
  const canUndo = computed(() => currentIndex.value > 0);
  const canRedo = computed(() => currentIndex.value < history.value.length - 1);

  function deepClone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Добавить снапшот в историю (после действия пользователя).
   * Обрезает "ветку" redo при новом действии.
   */
  function addAction(snapshot: Constructor2DSnapshot): void {
    if (isRestoring.value) return;

    const cloned = deepClone(snapshot);

    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1);
    }

    history.value.push(cloned);
    currentIndex.value = history.value.length - 1;

    if (history.value.length > MAX_HISTORY_SIZE) {
      history.value.shift();
      currentIndex.value--;
    }
  }

  /**
   * Undo: вернуть предыдущий снапшот и сдвинуть индекс.
   */
  function undo(): Constructor2DSnapshot | null {
    if (!canUndo.value) return null;
    currentIndex.value--;
    return history.value[currentIndex.value] ?? null;
  }

  /**
   * Redo: вернуть следующий снапшот и сдвинуть индекс.
   */
  function redo(): Constructor2DSnapshot | null {
    if (!canRedo.value) return null;
    currentIndex.value++;
    return history.value[currentIndex.value] ?? null;
  }

  function getCurrentSnapshot(): Constructor2DSnapshot | null {
    if (history.value.length === 0) return null;
    return history.value[currentIndex.value] ?? null;
  }

  /**
   * Сбросить историю и установить один начальный снапшот (например, при входе на 2D).
   */
  function clearHistory(initialSnapshot?: Constructor2DSnapshot): void {
    if (initialSnapshot) {
      history.value = [deepClone(initialSnapshot)];
      currentIndex.value = 0;
    } else {
      history.value = [];
      currentIndex.value = 0;
    }
  }

  function setRestoring(value: boolean): void {
    isRestoring.value = value;
  }

  return {
    history,
    currentIndex,
    historyLength,
    canUndo,
    canRedo,
    addAction,
    undo,
    redo,
    getCurrentSnapshot,
    clearHistory,
    setRestoring,
  };
});

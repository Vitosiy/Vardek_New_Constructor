import { ref, computed } from "vue";

// Типы модальных окон
export type ModalKey = 'basket' | 'error' | 'project' | 'study' | 'info';

// Опции для каждой модалки
export interface ModalOptions {
    title?: string;
    size?: 'small' | 'medium' | 'large';
    closable?: boolean;
    data?: any;
}

// Конфиги для модальных окон
const MODAL_CONFIG: Record<ModalKey, ModalOptions> = {
    basket: {
        title: 'Корзина',
        size: 'large',
        closable: true
    },
    error: {
        title: 'Ошибка',
        size: 'medium',
        closable: true
    },
    project: {
        title: 'Проект',
        size: 'large',
        closable: true
    },
    study: {
        title: 'Обучение',
        size: 'large',
        closable: true
    },
    info: {
        title: 'Информация',
        size: 'small',
        closable: true
    }
} as const;

export interface UseModal {
    open: (key: ModalKey, data?: any) => void;
    close: (key: ModalKey) => void;
    closeAll: () => void;
    isOpen: (key: ModalKey) => boolean;
    getOptions: (key: ModalKey) => ModalOptions;
    isAnyOpen: boolean;
    activeModals: ModalKey[];
}

// TODO: add notifications
export const useModal = (): UseModal => {
    const activeModals = ref<ModalKey[]>([]);
    const modalData = ref<Partial<Record<ModalKey, any>>>({});

    const open = (key: ModalKey, data?: any) => {
        if (!activeModals.value.includes(key)) {
            activeModals.value.push(key);
        }
        if (data) {
            modalData.value[key] = data;
        }
    };

    const close = (key: ModalKey) => {
        activeModals.value = activeModals.value.filter(modal => modal !== key);
        delete modalData.value[key];
    };

    const closeAll = () => {
        activeModals.value = [];
        modalData.value = {};
    };

    const isOpen = (key: ModalKey): boolean => {
        return activeModals.value.includes(key);
    };

    const getOptions = (key: ModalKey): ModalOptions => {
        return MODAL_CONFIG[key] || {};
    };

    const isAnyOpen = computed(() => activeModals.value.length > 0);

    return {
        open,
        close,
        closeAll,
        isOpen,
        getOptions,
        isAnyOpen: isAnyOpen.value,
        activeModals: activeModals.value,
    };
};

/*
Пример использования:

const { open, close, isOpen, isAnyOpen } = useModal();

// Открыть модальное окно
open('basket', { items: [...] });

// Проверить, открыто ли модальное окно
if (isOpen('basket')) {
    // ...
}

// Закрыть модальное окно
close('basket');

// Проверить, есть ли открытые модальные окна
if (isAnyOpen) {
    // ...
}
*/ 
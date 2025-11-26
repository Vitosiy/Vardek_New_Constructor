//@ts-nocheck

import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { TApplication, TMoveManager } from '@/types/types';
import { useEventBus } from '@/store/appliction/useEventBus';
import { useModelState } from '@/store/appliction/useModelState';
// Интерфейс для callbacks (хуков)
interface TransformControlsCallbacks {
    onAttach?: (object: THREE.Object3D) => void;
    onDetach?: (object: THREE.Object3D) => void;
    onToggle?: (enabled: boolean) => void;
    onModeChange?: (mode: 'translate' | 'rotate' | 'scale') => void;
    onDraggingChanged?: (dragging: boolean) => void;
}

export class TransformControlsManager {
    private eventBus: ReturnType<typeof useEventBus> = useEventBus()
    private modelState: ReturnType<typeof useModelState> = useModelState();
    private orbitControls: OrbitControls
    private moveManager: TMoveManager
    private root: TApplication
    private canvas: HTMLElement
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;
    private callbacks: Required<TransformControlsCallbacks>; // Используем Required, чтобы свойства всегда функции
    private controls: TransformControls;
    private isEnabled: boolean = false;
    private currentTarget: THREE.Object3D | null = null;
    private disposed: boolean = false; // Флаг для предотвращения использования после dispose

    constructor(
        root: TApplication,
        callbacks: TransformControlsCallbacks = {}
    ) {
        this.root = root
        this.scene = root._scene!;
        this.camera = root._camera!;
        this.renderer = root._renderer;
        this.canvas = root._canvas!
        this.moveManager = root._trafficManager?.moveManager!
        this.orbitControls = root._orbitControls!


        // Опциональные callbacks (хуки) с дефолтными пустыми функциями (теперь Required гарантирует тип)
        this.callbacks = {
            onAttach: callbacks.onAttach || (() => { }),
            onDetach: callbacks.onDetach || (() => { }),
            onToggle: callbacks.onToggle || (() => { }),
            onModeChange: callbacks.onModeChange || (() => { }),
            onDraggingChanged: callbacks.onDraggingChanged || (() => { }),
        };

        // Создаём TransformControls
        this.controls = new TransformControls(this.camera, this.canvas);
        const helper = this.controls.getHelper()
        helper.userData.isTransformGizmo = true;
        // this.controls.showZ = false
        // this.controls.showX = false

        this.scene.add(this.controls.getHelper()); // Добавляем в сцену (включая helper)
        this.addEvents()
        // Подписываемся на встроенные события TransformControls
        this.controls.addEventListener('dragging-changed', (event) => {
            this.onDraggingChanged(event.value as boolean); // true = dragging, false = idle
        });


    }

    // Проверка disposed в каждом методе (опционально, но предотвращает ошибки)
    private checkDisposed(): void {
        if (this.disposed) {
            throw new Error('TransformControlsManager is disposed and cannot be used.');
        }
    }

    // Прикрепление к объекту
    attach(): void {

        const object: THREE.Object3D | null = this.modelState.getCurrentModel
        if (!object) return

        this.enable()
        this.checkDisposed();
        if (this.currentTarget === object) return; // Уже прикреплён

        this.moveManager.clearSelectVisual()

        this.detach(); // Отцепляем предыдущий, если есть
        this.controls.attach(object);

        this.currentTarget = object;
        this.callbacks.onAttach(object);



    }

    onDraggingChanged(value: boolean) {

        if (value) {
            this.orbitControls.enabled = false
        }
        else {
            this.orbitControls.enabled = true
        }
    }

    // Отцепление от объекта
    detach(): void {
        // this.checkDisposed();
        if (!this.currentTarget) return;
        const pos = this.moveManager.getMousePos(this.currentTarget.position)
        this.currentTarget.userData.MOUSE_POSITION = pos
        this.currentTarget.userData.obb.center.copy(this.currentTarget.position)
        this.currentTarget.userData.obb.rotation.setFromMatrix4(this.currentTarget.matrixWorld);
        this.currentTarget.userData.PROPS.CONFIG.ROTATION = this.currentTarget.rotation;
        this.currentTarget.userData.targetPosition = this.currentTarget.position


        this.controls.detach();
        this.callbacks.onDetach(this.currentTarget);
        this.currentTarget = null;
    }

    totalDetach() {
        this.isEnabled = false;
        this.controls.enabled = false;
        this.controls.detach();
        this.currentTarget = null;
    }

    // Включение (enabled = true)
    enable(): void {
        // this.checkDisposed();
        if (this.isEnabled) return;
        this.isEnabled = true;
        this.controls.enabled = true;
        if (this.currentTarget) {
            this.attach(this.currentTarget); // Переприкрепляем, если был отцеплён
        }
        this.callbacks.onToggle(true);
    }

    // Выключение (enabled = false)
    disable(): void {
        // this.checkDisposed();
        if (!this.isEnabled) return;
        this.isEnabled = false;
        this.controls.enabled = false;
        this.detach(); // Автоматически отцепляем при выключении
        this.callbacks.onToggle(false);
    }

    // Переключение состояния
    toggle(): void {
        this.checkDisposed();
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    // Переключение режима (translate, rotate, scale)
    setMode(mode: 'translate' | 'rotate' | 'scale'): void {
        // this.checkDisposed();
        if (this.isEnabled && this.currentTarget) {
            this.controls.setMode(mode);
            // this.callbacks.onModeChange(mode);
        }
    }

    // Обновление в анимационном цикле
    update(): void {
        if (this.disposed) return; // Не throw, чтобы анимация не падала

        this.controls.update();
    }

    // Getter для прямого доступа к TransformControls (если нужно)
    getControls(): TransformControls {
        this.checkDisposed();
        return this.controls;
    }

    // Очистка ресурсов
    dispose(): void {
        if (this.disposed) return;
        this.disable(); // Выключаем перед dispose
        this.controls.dispose();
        this.scene.remove(this.controls);
        this.currentTarget = null;
        this.disposed = true;
        // НЕ трогаем callbacks — они остаются функциями для типизации
    }

    // Getter для состояния enabled (для внешнего использования, напр. обновление UI)
    get _isEnabled(): boolean {
        return this.isEnabled;
    }

    addEvents() {
        const onAttach = () => {
            this.attach()
        }
        const onDisable = () => {
            this.disable()
        }

        const onTotalDetach = () => {
            this.totalDetach()
        }

        const onSetMode = (value) => {
            this.setMode(value)
        }


        this.eventBus.on("A:TransformSetMode", onSetMode)
        this.eventBus.on("A:TransformMode_On", onAttach)
        this.eventBus.on("A:TransformMode_Off", onDisable)
        this.eventBus.on("A:Load", onTotalDetach)
        this.eventBus.on("A:Create", onTotalDetach)
        this.eventBus.on("A:NextAction", onTotalDetach)
        this.eventBus.on("A:PrevAction", onTotalDetach)

    }
}
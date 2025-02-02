//@ts-nocheck
import * as THREE from "three"
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export class DeepDispose {

    constructor() { }

    clearRoom(room: THREE.Object3D, scene: THREE.Scene) {

        room.children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
                // Очистка геометрии
                if (child.geometry) {
                    child.geometry.dispose();
                    child.geometry = null;
                }

                // Очистка материалов и текстур
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((material) => {
                            material.map?.dispose();
                            material.dispose();
                        });
                    } else {
                        child.material.map?.dispose();
                        child.material.dispose();
                    }
                    child.material = null;
                }

                // Удаляем меш из сцены
                scene.remove(child);
            } else if (child instanceof THREE.Object3D) {
                // Если это не меш, рекурсивно удаляем его детей
                this.clearScene(child as THREE.Scene);
            }
        });

    }

    clearScene(scene: THREE.Scene) {
        // Проверяем, что сцена существует

        if (!scene) return;

        // Копируем массив детей, чтобы избежать изменений во время итерации

        const objects = [...scene.children];

        objects.forEach((child) => {

            if (child instanceof THREE.Camera) {
                // Не удаляем камеры и свет, оставляем их в сцене
                return;
            }

            if (child instanceof THREE.Mesh) {
                // Очистка геометрии
                if (child.geometry) {
                    child.geometry.dispose();
                    child.geometry = null;
                }


                // Очистка материалов и текстур
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((material) => {
                            material.
                                material.map?.dispose();
                            material.dispose();
                        });
                    } else {
                        child.material.map?.dispose();
                        child.material.dispose();
                    }
                    child.material = null;
                }

                // Удаляем меш из сцены
                scene.remove(child);

            } else if (child instanceof THREE.Object3D) {

                this.clearScene(child as THREE.Scene);
                scene.remove(child);
            }
        });

    }

    clearObject(object: THREE.Object3D, scene: THREE.Scene) {

        if (object instanceof THREE.Group || object instanceof THREE.Object3D) {
            // Удаляем все дочерние объекты рекурсивно
            for (let i = object.children.length - 1; i >= 0; i--) {
                this.clearObject(object.children[i], scene);
            }
        }

        // Проверяем, является ли объект CSS2DObject
        if (object instanceof CSS2DObject) {
            // Удаляем элемент DOM, связанный с CSS2DObject
            if (object.element && object.element.parentNode) {
                object.element.parentNode.removeChild(object.element);
            }
        }

        if (object instanceof THREE.Mesh) {
            // Очистка геометрии
            if (object.geometry) {
                object.geometry.dispose();
                object.geometry = null;
            }

            // Очистка материалов и текстур
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        material.map?.dispose();
                        material.dispose();
                    });
                } else {
                    object.material.map?.dispose();
                    object.material.dispose();
                }
                object.material = null;
            }
        }

        // Удаляем объект из сцены
        scene.remove(object);
    }

    clearParent(object: THREE.Object3D) {
        while (object.children.length > 0) {
            const child = object.children[0];

            if (child instanceof THREE.Mesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
            this.clearParent(child);  // Рекурсивно удаляем дочерние
            object.remove(child);  // Удаляем из родителя
        }
    }

    clearTotal(scene: THREE.Scene) {

        // Рекурсивная функция для очистки объектов и их ресурсов
        function disposeObject(object) {

            if (object.geometry) {
                object.geometry.dispose(); // Освобождаем геометрию
            }

            if (object.material) {
                if (Array.isArray(object.material)) {
                    // Если материал — это массив материалов
                    object.material.forEach(material => {
                        if (material.map) material.map.dispose(); // Освобождаем текстуру
                        if (material.lightMap) material.lightMap.dispose();
                        if (material.bumpMap) material.bumpMap.dispose();
                        if (material.normalMap) material.normalMap.dispose();
                        if (material.specularMap) material.specularMap.dispose();
                        material.dispose(); // Освобождаем материал
                    });
                } else {
                    // Если материал — это одиночный материал
                    if (object.material.map) object.material.map.dispose(); // Освобождаем текстуру
                    if (object.material.lightMap) object.material.lightMap.dispose();
                    if (object.material.bumpMap) object.material.bumpMap.dispose();
                    if (object.material.normalMap) object.material.normalMap.dispose();
                    if (object.material.specularMap) object.material.specularMap.dispose();
                    object.material.dispose(); // Освобождаем материал
                }
            }

            if (object instanceof CSS2DObject) {
                // Удаляем элемент DOM, связанный с CSS2DObject
                if (object.element && object.element.parentNode) {
                    object.element.parentNode.removeChild(object.element);
                }
            }

            if (object.texture) {
                object.texture.dispose(); // Освобождаем текстуру
            }

            if (object.children && object.children.length > 0) {
                // Рекурсивно очищаем дочерние объекты
                object.children.slice().forEach(child => {
                    disposeObject(child);
                });
            }

            if (object.dispose) {
                object.dispose(); // Если объект имеет метод dispose, вызываем его
            }
        }

        // Очищаем все объекты в сцене
        while (scene.children.length > 0) {
            const object = scene.children[0];
            disposeObject(object); // Очищаем объект и его ресурсы
            scene.remove(object); // Удаляем объект из сцены
        }

        console.log('Сцена и ресурсы полностью очищены.');
    }
}
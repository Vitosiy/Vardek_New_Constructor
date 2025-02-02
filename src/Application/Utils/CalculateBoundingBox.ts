import * as THREE from 'three';
import { OBB } from 'three/examples/jsm/math/OBB.js';

export function createOBBFromObject(object: THREE.Object3D): OBB {

    // object.updateMatrixWorld(true);
    object.matrixWorldNeedsUpdate = true

    // object.traverse(children => {
    //     if (children instanceof THREE.Mesh) {
    //         children.geometry.computeBoundingBox();
    //     }
    // })

    // // Получаем размеры объекта

    // const size = new THREE.Vector3();
    // boundingBox.getSize(size);

    // const obb = new OBB().fromBox3(boundingBox)

    // return obb;

    // Получаем bounding box объекта
    const boundingBox = new THREE.Box3().setFromObject(object);
    const obb = new OBB().fromBox3(boundingBox)

    // Находим центр объекта
    // const center = new THREE.Vector3();
    // boundingBox.getCenter(center);

    // // Рассчитываем размер объекта
    // const size = new THREE.Vector3();
    // boundingBox.getSize(size);

    // // Создаем OBB с центром и половиной размеров
    // const obb = new OBB(center, size.multiplyScalar(0.5));

    // Применяем мировую матрицу объекта для OBB
    // obb.applyMatrix4(object.matrixWorld);

    return obb;
}

export function separateArrows(object: THREE.Object3D, box: THREE.Box3) {
    object.traverse((child) => {
        // Пропускаем ArrowHelper и его дочерние элементы
        if (child instanceof THREE.ArrowHelper || child.type === 'Line' || child.type === 'Cone') {
            return; // Игнорируем ArrowHelper
        }

        // Увеличиваем Bounding Box для всех других объектов
        if (child instanceof THREE.Object3D && child.visible) {
            box.expandByObject(child); // Расширяем Bounding Box объектом
        }
    });
}

export class OBBHelper {

    helper: THREE.Object3D | null = null

    add(obb: OBB, color:string = '#6385ff') {

        const geometry = new THREE.BoxGeometry(obb.halfSize.x * 2, obb.halfSize.y * 2, obb.halfSize.z * 2);
        const material = new THREE.MeshBasicMaterial({ color, wireframe: true });
        this.helper = new THREE.Mesh(geometry, material);
        this.helper.userData.obb = obb

        const matrix4 = new THREE.Matrix4();
        matrix4.setFromMatrix3(obb.rotation); // Fills upper-left 3x3 rotation part of Matrix4

        // Extract quaternion (rotation) from the Matrix4
        const quaternion = new THREE.Quaternion();
        quaternion.setFromRotationMatrix(matrix4);

        // Устанавливаем центр OBB
        this.helper.position.copy(obb.center);

        this.helper.quaternion.copy(quaternion);

        return this.helper;

    }

    update() {
        this.helper!.position.copy(this.helper!.userData.obb.center);
    }

}




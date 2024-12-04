import * as THREE from "three"
import * as THREEInterfases from "@/types/interfases"
import { OBB } from 'three/examples/jsm/math/OBB.js';

import { Resources } from "../Utils/Resources";
import { useAppData } from "@/store/appliction/useAppData";

export class WallBuilder {

    appData: ReturnType<typeof useAppData> = useAppData()
    resources: Resources = new Resources()
    floorTextureData: { [key: string]: any } = this.appData.getAppData.FLOOR
    wallTextureData: { [key: string]: any } = this.appData.getAppData.WALL

    createMesh(
        GeometryClass: new (...args: any[]) => THREE.BufferGeometry,
        dimensions: number[],
        position: THREEInterfases.IPosition,
        rotation: THREEInterfases.IRotationEuler,
        side: THREE.Side | number,
        type: string,
        textureId: number | string
    ) {

        const material = this.createMaterial(side, type, textureId, dimensions);
        const geometry = new GeometryClass(...dimensions);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.receiveShadow = true;
        mesh.position.set(position.x as number, position.y as number, position.z as number)
        mesh.rotation.set(rotation._x, rotation._y, rotation._z, rotation._order);

        geometry.computeBoundingBox();
        // geometry.userData.obb = new OBB().fromBox3(
        //     mesh.geometry.boundingBox as THREE.Box3
        // )

        mesh.userData.dimensions = dimensions

        mesh.userData.obb = new OBB().fromBox3(
            mesh.geometry.boundingBox as THREE.Box3
        )

        mesh.userData.name = 'wall'

        mesh.userData.plane = this.convertPlaneGeometryToPlane(mesh)

        return mesh;
    }

    createPlaneWall(width: number, height: number, position: THREEInterfases.IPosition, rotation: THREEInterfases.IRotationEuler, side: number, textureId: string | number) {
        let wallmesh = this.createMesh(THREE.PlaneGeometry, [width, height], position, rotation, side, 'wall', textureId);
        return wallmesh;
    }

    /** Создание пола */

    createFloorFromWalls(

        walls: THREEInterfases.IWallData[],
        textureId: number | string) {

        const points: THREE.Vector2[] = [];

        walls.forEach((wall: THREEInterfases.IWallData) => {
            const halfWidth = wall.width / 2;
            const rotation = wall.rotation._y; // Угол поворота стены вокруг оси Y

            // Вычисляем начальные и конечные точки на плоскости y=0
            const startPoint = new THREE.Vector2(
                (wall.position.x as number - Math.cos(rotation) * halfWidth),
                wall.position.z as number - Math.sin(rotation) * -halfWidth
            );

            const endPoint = new THREE.Vector2(
                wall.position.x as number + Math.cos(rotation) * halfWidth,
                wall.position.z as number + Math.sin(rotation) * -halfWidth
            );

            // Добавляем начальную и конечную точки каждой стены в массив
            points.push(startPoint, endPoint);
        });

        // Создаем форму (Shape) для пола на основе вычисленных точек
        const shape = new THREE.Shape();
        shape.moveTo(points[0].x, points[0].y);

        // Добавляем остальные точки
        for (let i = 1; i < points.length; i++) {
            shape.lineTo(points[i].x, points[i].y);
        }

        // Замыкаем контур
        shape.lineTo(points[0].x, points[0].y);

        // Создаем геометрию для пола на основе формы
        const geometry = new THREE.ShapeGeometry(shape);
        const material = this.createMaterial(1, 'floor', textureId);

        // Создаем Mesh для пола
        const floorMesh = new THREE.Mesh(geometry, material);
        floorMesh.receiveShadow = true;

        // Устанавливаем пол на уровень Y = 0 и поворачиваем его
        floorMesh.position.y = 0;
        floorMesh.rotateX(Math.PI * 0.5);

        // Обновляем матрицы
        floorMesh.updateMatrixWorld(true);

        geometry.computeBoundingBox();

        // Вычисляем boundingBox с учетом всех трансформаций
        const boundingBox = new THREE.Box3().setFromObject(floorMesh);

        // Получаем центр и размеры с учетом всех трансформаций
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);

        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        // Создаем OBB на основе вычисленных значений
        const obb = new OBB(center, size.multiplyScalar(0.5));

        obb.applyMatrix4(floorMesh.matrixWorld);

        floorMesh.userData.obb = obb;
        floorMesh.userData.name = 'floor'

        floorMesh.userData.plane = this.convertPlaneGeometryToPlane(floorMesh)
        console.log(floorMesh.userData.plane)

        return floorMesh;
    }

    private createMaterial(side: THREE.Side | number, type: string, textureId: number | string, dimensions?: number[]): THREE.MeshPhysicalMaterial {

        const material = new THREE.MeshPhysicalMaterial({
            metalness: 0.5,
            roughness: 0.5,
            clearcoat: 0,
            clearcoatRoughness: 0.6,
            side: side as THREE.Side,
            depthTest: true,
            depthWrite: false
        });

        if (textureId) {
            this.loadTexture(type, textureId, material, dimensions)
        }
        else {
            switch (type) {
                case 'wall':
                    material.color = new THREE.Color('#ffffff')
                    break;
                case 'floor':
                    material.color = new THREE.Color('#ab8b65')
                    break;
                default:
                    console.warn(`Неизвестный тип материала: ${type}`);
                    break;
            }
        }

        return material;
    }

    // Устанавливаем текстуру
    private loadTexture(type: string, textureId: number | string, material: THREE.MeshPhysicalMaterial, dimensions?: number[]) {

        switch (type) {
            case 'wall':
                this.resources.startLoading(this.wallTextureData[textureId].texture, 'texture', (file) => {
                    if (file instanceof THREE.Texture) {
                        file.colorSpace = THREE.SRGBColorSpace
                        material.color = new THREE.Color('#ffffff')
                        material.map = file;  // Устанавливаем загруженную текстуру как карту материала
                        material.needsUpdate = true;  // Обновляем материал после изменения
                        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
                        material.map.repeat.set(
                            (dimensions![0] / 1000),
                            (dimensions![1] / 1000)
                        );
                    }
                });
                break;

            case 'floor':
                this.resources.startLoading(this.floorTextureData[textureId].texture, 'texture', (file) => {
                    if (file instanceof THREE.Texture) {
                        file.colorSpace = THREE.SRGBColorSpace
                        material.color = new THREE.Color('#ffffff')
                        material.map = file;  // Устанавливаем загруженную текстуру как карту материала
                        material.needsUpdate = true;  // Обновляем материал после изменения
                        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
                        material.map.repeat.set(0.001, 0.001)
                        // material.map.repeat.set(
                        //     (dimensions[0]),
                        //     (dimensions[1])
                        // );
                    }
                });
                break;

            default:
                console.warn(`Неизвестный тип материала: ${type}`);
                break;
        }
    }

    // Обновляем текстуру
    updateTexture(mesh: THREE.Mesh, type: string, textureId: string | number, dimensions: number[]): void {
        const material = mesh.material as THREE.MeshPhysicalMaterial;

        if (!material) {
            console.warn("У объекта нет материала для обновления.");
            return;
        }

        this.loadTexture(type, textureId, material, dimensions);
    }

    // Создаёь PLANE для обработки коллизии

    convertPlaneGeometryToPlane(object: THREE.Object3D): THREE.Plane {
        // Получаем нормаль в локальном пространстве PlaneGeometry (по умолчанию (0, 0, 1))
        const localNormal = new THREE.Vector3(0, 0, 1);

        // Преобразуем нормаль в мировое пространство
        const worldNormal = localNormal.applyQuaternion(object.quaternion).normalize();

        // Позиция объекта в мировом пространстве
        const worldPosition = new THREE.Vector3();
        object.getWorldPosition(worldPosition);

        // Вычисляем `constant` для плоскости (расстояние от начала координат)
        const constant = -worldNormal.dot(worldPosition);

        // Создаем плоскость
        return new THREE.Plane(worldNormal, constant);
    }

}
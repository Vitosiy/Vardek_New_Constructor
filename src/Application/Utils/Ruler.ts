//@ts-nocheck

import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import {RoomManager} from '../Room/RoomManager';

export class Ruler {

    rulerLines: THREE.Object3D[] | null = null;
    rullerSizeLines: THREE.Object3D[] | null = null;
    room: RoomManager | null = null
    scene: THREE.Scene | null = null;
    raycasterWall: THREE.Raycaster = new THREE.Raycaster()
    raycasterProd: THREE.Raycaster = new THREE.Raycaster()

    constructor(scene?: THREE.Scene, room?: RoomManager, rulerLines?: THREE.Object3D[], rullerSizeLines?: THREE.Object3D[]) {
        this.scene = scene as THREE.Scene
        this.rulerLines = rulerLines as THREE.Object3D[]
        this.rullerSizeLines = rullerSizeLines as THREE.Object3D[]
        this.room = room as RoomManager

    }
    /** Линейка до стен */
    drawRulerWalls(object: THREE.Object3D, ray?: THREE.Raycaster) {
        // const raycaster = new THREE.Raycaster();

        const raycaster = ray;
        // Получаем габаритную рамку объекта
        const objectBox = new THREE.Box3().setFromObject(object);

        // Получаем центры каждой грани объекта

        const faceCenters = [
            new THREE.Vector3(objectBox.max.x, (objectBox.max.y), (objectBox.min.z + objectBox.max.z) / 2), // x
            new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, objectBox.max.y, (objectBox.min.z + objectBox.max.z) / 2), // y
            new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, (objectBox.max.y), objectBox.max.z), // z

            new THREE.Vector3(objectBox.min.x, (objectBox.max.y), (objectBox.min.z + objectBox.max.z) / 2),//-x
            new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, objectBox.min.y, (objectBox.min.z + objectBox.max.z) / 2), // -y
            new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, (objectBox.max.y), objectBox.min.z - 20), //-z 
        ];

        const directions = [
            new THREE.Vector3(1, 0, 0),   // X-положительное направление
            new THREE.Vector3(0, 1, 0),   // Y-положительное направление
            new THREE.Vector3(0, 0, 1),   // Z-положительное направление
            new THREE.Vector3(-1, 0, 0),  // X-отрицательное направление
            new THREE.Vector3(0, -1, 0),  // Y-отрицательное направление
            new THREE.Vector3(0, 0, -1),  // Z-отрицательное направление
        ];

        const minDistance = 0.01; // Минимальная дистанция для фильтрации

        directions.forEach((direction, i) => {

            const originPoint = faceCenters[i]

            raycaster!.set(originPoint, direction);

            const intersects = raycaster!.intersectObjects(
                [...this.room!._roomWalls, this.room!._roomFloor] as THREE.Object3D[],
                true
            );

            if (intersects.length > 0 && intersects[0].distance > minDistance) {

                const closestIntersection = intersects[0];

                let middle = new THREE.Vector3(0, 0, 0,)
                middle.lerpVectors(closestIntersection.point, originPoint, 0.5)
                middle.y += 100

                this.createArrow(direction, originPoint, closestIntersection.distance, '#77cadb');

                let distanceLabel = this.cssDrow({ axis: closestIntersection.distance, position: middle, css: 'distance-label--wall' })
                this.scene!.add(distanceLabel)
                this.rulerLines!.push(distanceLabel);
            }
        });
    }
    /** Линейка до объектов */
    drawRulerToObjects(object: THREE.Object3D) {
        const raycaster = this.raycasterProd;
        this.clearRuler();  // Очищаем предыдущие линии/стрелки
        this.drawRulerWalls(object, this.raycasterWall);
        // this.drawRullerObjects(object);

        const objectBox = new THREE.Box3().setFromObject(object);

        // Количество точек вдоль каждой оси для проверки пересечений
        const additionalPoints = 4; // Уменьшаем количество точек для лучшей производительности

        // Функция для генерации точек вдоль осей
        function generatePoints(min: number, max: number, count: number): number[] {
            const step = (max - min) / (count - 1);
            return Array.from({ length: count }, (_, i) => min + step * i);
        }

        // Генерация точек вдоль x, z осей для граней объекта
        const xPoints = generatePoints(objectBox.min.x, objectBox.max.x, additionalPoints);
        const zPoints = generatePoints(objectBox.min.z, objectBox.max.z, additionalPoints);

        // Ограничиваем количество точек до минимума
        // const xPoints = [objectBox.min.x, objectBox.max.x];
        // const zPoints = [objectBox.min.z, objectBox.max.z];

        const directions = [
            new THREE.Vector3(1, 0, 0),    // X-положительное направление
            new THREE.Vector3(0, 1, 0),    // Y-положительное направление
            new THREE.Vector3(0, 0, 1),    // Z-положительное направление
            new THREE.Vector3(-1, 0, 0),   // X-отрицательное направление
            new THREE.Vector3(0, -1, 0),   // Y-отрицательное направление
            new THREE.Vector3(0, 0, -1),   // Z-отрицательное направление
        ];

        const minDistance = 0.01;
        const intersectionPoint = new THREE.Vector3();

        // Обрабатываем только ближайшие боксы, которые могут быть пересечены
        this.room!._roomTotalBounds.forEach(box => {
            directions.forEach((direction) => {
                let intersectionFound = false;

                for (let x of xPoints) {
                    for (let z of zPoints) {
                        const originPoint = new THREE.Vector3(x, (objectBox.min.y + objectBox.max.y) / 2, z);

                        // Рассчитываем правильное смещение
                        let offsetMagnitude = 0;
                        if (direction.x !== 0) {
                            offsetMagnitude = direction.x > 0 ? objectBox.max.x - originPoint.x : originPoint.x - objectBox.min.x;
                        } else if (direction.y !== 0) {
                            offsetMagnitude = direction.y > 0 ? objectBox.max.y - originPoint.y : originPoint.y - objectBox.min.y;
                        } else if (direction.z !== 0) {
                            offsetMagnitude = direction.z > 0 ? objectBox.max.z - originPoint.z : originPoint.z - objectBox.min.z;
                        }

                        const offset = direction.clone().multiplyScalar(offsetMagnitude);
                        originPoint.add(offset);

                        // Проверяем пересечение
                        raycaster.set(originPoint, direction);
                        const ray = raycaster.ray;
                        if (ray.intersectsBox(box)) {
                            ray.intersectBox(box, intersectionPoint);
                            const distance = originPoint.distanceTo(intersectionPoint);

                            if (distance > minDistance) {
                                intersectionFound = true;

                                const middle = new THREE.Vector3().lerpVectors(intersectionPoint, originPoint, 0.5);
                                middle.y += 100;

                                const extreme = intersectionPoint.clone();
                                extreme.y += 100;

                                // Отрисовка стрелки и линии
                                this.createArrow(direction, originPoint, distance, '#444444');
                                this.createLine(intersectionPoint, '#444444');

                                let distanceLabel = this.cssDrow({ axis: distance, position: extreme, css: 'distance-label' })
                                this.scene!.add(distanceLabel)
                                this.rulerLines!.push(distanceLabel);
                            }
                            break;
                        }
                    }
                    if (intersectionFound) break;
                }
            });
        });
    }

    /** Линейка размера */
    drawRullerObjects(object: THREE.Object3D) {
        let arrows: any[] = [];

        // Рассчитываем Bounding Box объекта
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());

        const headWidth = 25;
        const headLength = 50

        const percentage = 0.85;
        const arrowLengthX = size.x * percentage;
        const arrowLengthY = size.y * percentage;
        const arrowLengthZ = size.z * percentage;



        // Рассчитываем начальные точки для каждой оси
        const axes = [
            {
                dir: new THREE.Vector3(1, 0, 0), // Направление по X
                start: new THREE.Vector3((box.min.x + box.max.x) * 0.5 - arrowLengthX * 0.5, box.max.y - (headWidth * 0.5), box.min.z + (headWidth * 0.5)), // Центр по оси X
                color: '#444444',
                label: arrowLengthX
            },
            {
                dir: new THREE.Vector3(0, 1, 0), // Направление по Y
                start: new THREE.Vector3(box.min.x + (headWidth * 0.5), (box.min.y + box.max.y) * 0.5 - arrowLengthY * 0.5, box.min.z + (headWidth * 0.5)), // Центр по оси Y
                color: '#444444',
                label: arrowLengthY
            },
            {
                dir: new THREE.Vector3(0, 0, 1), // Направление по Z
                start: new THREE.Vector3(box.max.x - (headWidth * 0.5), box.min.y + (headWidth * 0.5), (box.min.z + box.max.z) * 0.5 - arrowLengthZ * 0.5), // Центр по оси Z
                color: '#444444',
                label: arrowLengthZ
            }
        ];

        axes.forEach(({ dir, start, color, label }) => {
            // Создаём ArrowHelper с учётом направления и длины
            const arrowPos = new THREE.ArrowHelper(dir, start, label, color, headLength, headWidth);
            const arrowNeg = new THREE.ArrowHelper(dir.clone().negate(), start, 0, color, headLength, headWidth);

            configureArrow(arrowPos, color);
            configureArrow(arrowNeg, color);

            arrowPos.line.computeLineDistances();

            let middle;

            // Вычисление средней точки для размещения метки
            if (dir.x || dir.z > 0) {
                middle = new THREE.Vector3().addVectors(start, dir.clone().multiplyScalar(label / 2));
                middle.y += 60; // Смещение метки по оси Y
            } else {
                middle = new THREE.Vector3().addVectors(start, dir.clone().multiplyScalar(label / 2));
                middle.x -= 100; // Смещение метки по оси X
            }

            // Создаём метку на средней точке
            const labelDiv = this.cssDrow({ axis: label / percentage, position: middle, css: 'dimension-label' });
            arrows.push({ arrowPos, arrowNeg, labelDiv });
        });

        return arrows;

        // Функция для конфигурации стрелок
        function configureArrow(arrow: any, color: string | THREE.Color) {
            arrow.traverse((child: any) => {
                child.userData.isArrowHelper = true;
            });

            if (arrow.line.material instanceof THREE.LineBasicMaterial) {
                arrow.line.material = new THREE.LineDashedMaterial({
                    color: color,
                    dashSize: 10,
                    gapSize: 5,
                    linewidth: 2,
                    scale: 250,
                    transparent: true,
                    opacity: 1.0,
                });

                arrow.line.material.depthTest = false;
                arrow.line.material.depthWrite = false;
            }

            if (arrow.cone.material instanceof THREE.MeshBasicMaterial) {
                arrow.cone.material.depthTest = false;
                arrow.cone.material.depthWrite = false;
                arrow.cone.material.transparent = true;
                arrow.cone.material.opacity = 1;
            }

            arrow.renderOrder = 1;
            arrow.name = 'ARROW_SIZE';
        }
    }

    createArrow(direction: THREE.Vector3, originPoint: THREE.Vector3, distance: number, color: string | THREE.Color) {
        const arrow = new THREE.ArrowHelper(
            direction.clone().normalize(),
            originPoint,
            distance,
            color,
            100 * 0.75,
            50 * 0.75
        );
        const arrow2 = new THREE.ArrowHelper(
            direction.clone().negate().normalize(),
            originPoint,  // Используем центр грани для обратной стрелки
            0,
            color,
            100 * 0.75,
            50 * 0.75
        );
        this.scene!.add(arrow, arrow2);
        this.rulerLines!.push(arrow, arrow2);
    }

    createLine(intersectionPoint: THREE.Vector3, color: string | THREE.Color) {
        const lineMaterial = new THREE.LineBasicMaterial({ color });
        const points = [
            intersectionPoint.clone(),
            new THREE.Vector3(intersectionPoint.x, 0, intersectionPoint.z),
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.scene!.add(line);
        this.rulerLines!.push(line);
    }

    cssDrow({ axis, position, css }: { [key: string]: any }) {

        const lableDiv = document.createElement('div');
        lableDiv.className = css;
        lableDiv.textContent = `${axis.toFixed(0)}`;
        const heightLabel = new CSS2DObject(lableDiv);
        heightLabel.position.copy(position);
        return heightLabel
    }

    // Обновление линейки расстояния
    clearRuler() {
        if (this.rulerLines) {
            this.clear(this.rulerLines)
            this.rulerLines = [];
        }
    }

    // Обновление линейки размера
    // clearRullerSize() {
    //     if (this.rullerSizeLines) {
    //         this.clear(this.rullerSizeLines)
    //         this.rullerSizeLines = [];
    //     }
    // }

    clear(rulerStorage: THREE.Object3D[]) {
        rulerStorage.forEach(line => {
            this.scene!.remove(line);
            line.traverse(children => {
                if (children instanceof THREE.Mesh) {
                    children.geometry.dispose();
                    (children.material as THREE.Material).dispose();
                }
            })
        })
    }

    update(room: RoomManager, rulerLines: THREE.Object3D[], rullerSizeLines: THREE.Object3D[]) {
        this.room = room
        this.rulerLines = rulerLines
        this.rullerSizeLines = rullerSizeLines
    }

}
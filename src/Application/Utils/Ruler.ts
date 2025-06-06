import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { RoomManager } from '../Room/RoomManager';

interface RulerConfig {
    POINT_COUNT: number;
    MIN_DISTANCE: number;
    MAX_DISTANCE: number; // Максимальное расстояние для проверки
    LINE_COLOR: string;
    LABEL_HEIGHT_OFFSET: number;
    DIRECTIONS: THREE.Vector3[]
}

export class Ruler {

    rulerLines: THREE.Object3D[];
    rullerSizeLines: THREE.Object3D[];
    room: RoomManager
    scene: THREE.Scene;
    raycasterWall: THREE.Raycaster = new THREE.Raycaster()
    raycasterProd: THREE.Raycaster = new THREE.Raycaster()

    private config: RulerConfig = {
        POINT_COUNT: 4, // Количество точек для проверки на осях X и Z
        MIN_DISTANCE: 0.01, // Минимальное расстояние для отрисовки (в метрах)
        MAX_DISTANCE: 3000, // Максимальное расстояние для проверки (в единицах сцены)
        LINE_COLOR: '#444444', // Цвет линий и стрелок
        LABEL_HEIGHT_OFFSET: 100, // Смещение меток по высоте (в единицах сцены)

        DIRECTIONS: [
            new THREE.Vector3(1, 0, 0),   // X-положительное направление
            new THREE.Vector3(0, 1, 0),   // Y-положительное направление
            new THREE.Vector3(0, 0, 1),   // Z-положительное направление
            new THREE.Vector3(-1, 0, 0),  // X-отрицательное направление
            new THREE.Vector3(0, -1, 0),  // Y-отрицательное направление
            new THREE.Vector3(0, 0, -1),  // Z-отрицательное направление
        ]
    };

    constructor(scene?: THREE.Scene, room?: RoomManager, rulerLines?: THREE.Object3D[], rullerSizeLines?: THREE.Object3D[]) {
        this.scene = scene as THREE.Scene
        this.rulerLines = rulerLines as THREE.Object3D[]
        this.rullerSizeLines = rullerSizeLines as THREE.Object3D[]
        this.room = room as RoomManager

    }



    setParams({ scene, room, rulerLines, rullerSizeLines }: { scene?: THREE.Scene, room?: RoomManager, rulerLines?: THREE.Object3D[], rullerSizeLines?: THREE.Object3D[] }) {


        this.scene = scene as THREE.Scene
        this.rulerLines = rulerLines as THREE.Object3D[]
        this.rullerSizeLines = rullerSizeLines as THREE.Object3D[]
        this.room = room as RoomManager
    }

    /** Линейка до стен */
    drawRulerWalls(objectBox: THREE.Box3) {

        // Получаем центры каждой грани объекта

        const faceCenters = [
            new THREE.Vector3(objectBox.max.x, (objectBox.max.y), (objectBox.min.z + objectBox.max.z) / 2), // x
            new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, objectBox.max.y, (objectBox.min.z + objectBox.max.z) / 2), // y
            new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, (objectBox.max.y), objectBox.max.z), // z

            new THREE.Vector3(objectBox.min.x, (objectBox.max.y), (objectBox.min.z + objectBox.max.z) / 2),//-x
            new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, objectBox.min.y, (objectBox.min.z + objectBox.max.z) / 2), // -y
            new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, (objectBox.max.y), objectBox.min.z - 20), //-z 
        ];

        const minDistance = 0.01; // Минимальная дистанция для фильтрации

        this.config.DIRECTIONS.forEach((direction, i) => {

            const originPoint = faceCenters[i]

            this.raycasterWall.set(originPoint, direction);

            const intersects = this.raycasterWall.intersectObjects(
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

    /**
     * Отрисовывает линейки от объекта до границ комнаты, используя рейкастинг.
     * @param object - 3D-объект для измерения расстояний.
     */

    drawRulerToObjects(object: THREE.Object3D): void {

        if (!this.isValidState()) {
            console.warn('Не определены обязательные свойства: room, roomTotalBounds или scene');
            return;
        }

        this.clearRuler();
        const objectBox = object.userData.aabb

        this.drawRulerWalls(objectBox)
        this.calculateAndRenderRulers(objectBox);
    }

    private isValidState(): boolean {
        return !!this.room && !!this.room._roomTotalBounds && !!this.scene && !!this.rulerLines;
    }

    private getNearbyBoxes(objectBox: THREE.Box3, allBoxes: THREE.Box3[]): THREE.Box3[] {
        const nearbyBoxes: THREE.Box3[] = [];
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();

        for (const box of allBoxes) {
            if (objectBox.distanceToPoint(box.getCenter(center)) < this.config.MAX_DISTANCE + box.getSize(size).x) {
                nearbyBoxes.push(box);
            }
        }

        return nearbyBoxes;
    }

    private generatePoints(min: number, max: number, count: number): number[] {
        const step = (max - min) / (count - 1);
        return Array.from({ length: count }, (_, i) => min + step * i);
    }

    private calculateAndRenderRulers(objectBox: THREE.Box3): void {
        const xPoints = this.generatePoints(objectBox.min.x, objectBox.max.x, this.config.POINT_COUNT);
        const zPoints = this.generatePoints(objectBox.min.z, objectBox.max.z, this.config.POINT_COUNT);
        const yMid = (objectBox.min.y + objectBox.max.y) / 2;

        const intersectionPoint = new THREE.Vector3();
        const originPoint = new THREE.Vector3();
        const offset = new THREE.Vector3();

        const nearbyBoxes = this.getNearbyBoxes(objectBox, this.room._roomTotalBounds);

        nearbyBoxes.forEach((box: THREE.Box3) => {
            if (!(box instanceof THREE.Box3)) {
                console.warn('Недопустимый объект в границах комнаты:', box);
                return;
            }

            for (const direction of this.config.DIRECTIONS) {
                let intersectionFound = false;

                for (const x of xPoints) {
                    for (const z of zPoints) {
                        originPoint.set(x, yMid, z);
                        const offsetMagnitude = this.calculateOffsetMagnitude(direction, originPoint, objectBox);
                        offset.copy(direction).multiplyScalar(offsetMagnitude);
                        originPoint.add(offset);

                        this.raycasterProd.set(originPoint, direction);
                        if (this.raycasterProd.ray.intersectBox(box, intersectionPoint)) {
                            const distance = originPoint.distanceTo(intersectionPoint);

                            if (distance > this.config.MIN_DISTANCE && distance < this.config.MAX_DISTANCE) {
                                intersectionFound = true;
                                this.renderRulerElements(direction, originPoint, intersectionPoint, distance);
                                break;
                            }
                        }
                    }
                    if (intersectionFound) break;
                }
            }
        });
    }

    private calculateOffsetMagnitude(direction: THREE.Vector3, origin: THREE.Vector3, box: THREE.Box3): number {
        if (direction.x !== 0) return direction.x > 0 ? box.max.x - origin.x : origin.x - box.min.x;
        if (direction.y !== 0) return direction.y > 0 ? box.max.y - origin.y : origin.y - box.min.y;
        if (direction.z !== 0) return direction.z > 0 ? box.max.z - origin.z : origin.z - box.min.z;
        return 0;
    }

    private renderRulerElements(
        direction: THREE.Vector3,
        originPoint: THREE.Vector3,
        intersectionPoint: THREE.Vector3,
        distance: number
    ): void {
        try {
            const middle = new THREE.Vector3()
                .lerpVectors(intersectionPoint, originPoint, 0.5)
                .add(new THREE.Vector3(0, this.config.LABEL_HEIGHT_OFFSET, 0));
            const extreme = intersectionPoint.clone().add(new THREE.Vector3(0, this.config.LABEL_HEIGHT_OFFSET, 0));

            this.createArrow(direction, originPoint, distance, this.config.LINE_COLOR);
            this.createLine(intersectionPoint, this.config.LINE_COLOR);
            const distanceLabel = this.cssDrow({
                axis: distance,
                position: extreme,
                css: 'distance-label'
            });
            this.scene.add(distanceLabel);
            if (!this.rulerLines.includes(distanceLabel)) {
                this.rulerLines.push(distanceLabel);
            }
        } catch (error) {
            console.error('Ошибка при отрисовке элементов линейки:', error);
        }
    }



    /** Линейка размера */

    public drawRullerObjects(object: THREE.Object3D) {
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

    private createArrow(direction: THREE.Vector3, originPoint: THREE.Vector3, distance: number, color: string | THREE.Color) {
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

        function configureArrow(arrow: any) {

            if (arrow.cone.material instanceof THREE.MeshBasicMaterial) {
                arrow.cone.material.depthTest = false;
                arrow.cone.material.depthWrite = false;
                arrow.cone.material.transparent = true;
                arrow.cone.material.opacity = 1;

                arrow.renderOrder = 1;
            }

            if (arrow.line.material instanceof THREE.LineBasicMaterial) {
                arrow.line.material.depthTest = false;
                arrow.line.material.depthWrite = false;
                arrow.line.material.transparent = true;
                arrow.line.material.opacity = 1;
            }


        }

        configureArrow(arrow);
        configureArrow(arrow2);





        this.scene!.add(arrow, arrow2);
        this.rulerLines!.push(arrow, arrow2);
    }

    private createLine(intersectionPoint: THREE.Vector3, color: string | THREE.Color) {
        const lineMaterial = new THREE.LineBasicMaterial({
            color,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            opacity: 1
        });


        const points = [
            intersectionPoint.clone(),
            new THREE.Vector3(intersectionPoint.x, 0, intersectionPoint.z),
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.renderOrder = 1;

        this.scene!.add(line);
        this.rulerLines!.push(line);
    }

    private cssDrow({ axis, position, css }: { [key: string]: any }) {

        const lableDiv = document.createElement('div');
        lableDiv.className = css;
        lableDiv.textContent = `${axis.toFixed(0)}`;
        const heightLabel = new CSS2DObject(lableDiv);
        heightLabel.position.copy(position);
        return heightLabel
    }

    // Обновление линейки расстояния
    public clearRuler() {
        if (this.rulerLines) {
            this.clear(this.rulerLines)
            this.rulerLines = [];
        }
    }

    private clear(rulerStorage: THREE.Object3D[]) {
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

    public update(room: RoomManager, rulerLines: THREE.Object3D[], rullerSizeLines: THREE.Object3D[]) {
        this.room = room
        this.rulerLines = rulerLines
        this.rullerSizeLines = rullerSizeLines
    }

}
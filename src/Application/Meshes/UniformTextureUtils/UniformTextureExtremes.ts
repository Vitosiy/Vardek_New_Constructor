import * as THREE from 'three';

interface ObjectSize {
    WIDTH: number;
    HEIGHT: number;
    DEPTH: number;
}

type LevelItem =
    | THREE.Object3D
    | { columnItems: THREE.Object3D[] };

export class UniformTextureExtremes {
    private firstProduct: THREE.Object3D | null = null;
    private localXAxis = new THREE.Vector3(1, 0, 0);
    private localYAxis = new THREE.Vector3(0, 1, 0);
    private localZAxis = new THREE.Vector3(0, 0, 1);
    private cachedRotationMatrix: THREE.Matrix4 | null = null;

    private ensureFirstProduct(): THREE.Object3D {
        if (!this.firstProduct) {
            throw new Error('First product is not set');
        }
        return this.firstProduct;
    }

    private updateLocalAxes() {
        const firstProduct = this.ensureFirstProduct();

        // Кэширование матрицы поворота для производительности
        if (!this.cachedRotationMatrix) {
            this.cachedRotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(firstProduct.quaternion);
        }

        this.localXAxis.set(1, 0, 0).applyMatrix4(this.cachedRotationMatrix).normalize();
        this.localYAxis.set(0, 1, 0).applyMatrix4(this.cachedRotationMatrix).normalize();
        this.localZAxis.set(0, 0, 1).applyMatrix4(this.cachedRotationMatrix).normalize();
    }

    private getProjectionOnLocal(product: THREE.Object3D) {
        const firstProduct = this.ensureFirstProduct();
        const relativePosition = new THREE.Vector3().subVectors(product.position, firstProduct.position);

        return {
            x: relativePosition.dot(this.localXAxis),
            y: relativePosition.dot(this.localYAxis),
        };
    }

    private areObjectsVerticallyAligned(obj1: THREE.Object3D, obj2: THREE.Object3D): boolean {
        // Get projected positions on local X axis
        this.firstProduct = obj1;
        this.updateLocalAxes();

        const proj1 = this.getProjectionOnLocal(obj1);
        const proj2 = this.getProjectionOnLocal(obj2);

        // Check if objects are approximately aligned on X axis
        const xThreshold = 10; // Adjust this threshold based on your needs
        return Math.abs(proj1.x - proj2.x) < xThreshold;
    }

    private areObjectsOverlapping(obj1: THREE.Object3D, obj2: THREE.Object3D): boolean {
        const size1 = obj1.userData.trueSizes as ObjectSize;
        const size2 = obj2.userData.trueSizes as ObjectSize;

        // Calculate horizontal boundaries
        const left1 = obj1.position.x - size1.WIDTH;
        const right1 = obj1.position.x + size1.WIDTH;
        const left2 = obj2.position.x - size2.WIDTH;
        const right2 = obj2.position.x + size2.WIDTH;

        // Check for horizontal overlap
        const horizontalOverlap = (left1 <= right2 && right1 >= left2);

        return horizontalOverlap && this.areObjectsVerticallyAligned(obj1, obj2);
    }
    
    sortObjectsByLevels(products: THREE.Object3D[]): LevelItem[][] {
        if (products.length === 0) {
            return [];
        }

        // Шаг 1: Сортируем объекты по высоте (от высоких к низким)
        const sortedByHeight = [...products].sort((a, b) => {
            const heightA = (a.userData.trueSizes as ObjectSize).HEIGHT;
            const heightB = (b.userData.trueSizes as ObjectSize).HEIGHT;
            return heightB - heightA; // Сортировка от больших к меньшим
        });

        // Шаг 2: Находим объекты, которые могут определять уровни
        const threshold = sortedByHeight[0].userData.trueSizes.HEIGHT * 0.7; // 70% от высоты самого высокого объекта
        const levelDefiningObjects = sortedByHeight.filter(obj =>
            (obj.userData.trueSizes as ObjectSize).HEIGHT >= threshold);

        // Шаг 3: Группируем определяющие объекты по их Y-позиции
        const positionGroups: THREE.Object3D[][] = [];
        const yPositionTolerance = 5; // Допустимая разница в Y-позиции для объектов одного уровня

        for (const obj of levelDefiningObjects) {
            const objY = obj.position.y;
            const objHeight = (obj.userData.trueSizes as ObjectSize).HEIGHT;

            // Проверяем, подходит ли объект в существующую группу
            let foundGroup = false;

            for (const group of positionGroups) {
                const groupObj = group[0];
                const groupY = groupObj.position.y;
                const groupHeight = (groupObj.userData.trueSizes as ObjectSize).HEIGHT;

                // Проверяем близость позиций и перекрытие по Y
                const yDiff = Math.abs(objY - groupY);

                // Проверяем, пересекаются ли объекты по вертикали
                const objMinY = objY - objHeight;
                const objMaxY = objY + objHeight;
                const groupMinY = groupY - groupHeight;
                const groupMaxY = groupY + groupHeight;

                const verticalOverlap = (objMinY <= groupMaxY && objMaxY >= groupMinY) || (yDiff <= yPositionTolerance);

                if (verticalOverlap) {
                    group.push(obj);
                    foundGroup = true;
                    break;
                }
            }

            // Если не нашли подходящую группу, создаем новую
            if (!foundGroup) {
                positionGroups.push([obj]);
            }
        }

        // Шаг 4: Сортируем группы по их средней Y-позиции
        const sortedPositionGroups = positionGroups.sort((a, b) => {
            const avgYA = a.reduce((sum, obj) => sum + obj.position.y, 0) / a.length;
            const avgYB = b.reduce((sum, obj) => sum + obj.position.y, 0) / b.length;
            return avgYA - avgYB;
        });

        // Шаг 5: Создаем начальные уровни на основе групп
        const levels: THREE.Object3D[][] = sortedPositionGroups.map(group => [...group]);

        // Шаг 6: Распределяем остальные объекты по уровням
        const remainingObjects = products.filter(obj =>
            !levelDefiningObjects.includes(obj));

        for (const obj of remainingObjects) {
            const objectSize = obj.userData.trueSizes as ObjectSize;
            const objMinY = obj.position.y - objectSize.HEIGHT;
            const objMaxY = obj.position.y + objectSize.HEIGHT;
            const objY = obj.position.y;

            // Найдем наиболее подходящий уровень для объекта
            let bestLevelIndex = -1;
            let bestOverlapScore = -Infinity;

            for (let i = 0; i < levels.length; i++) {
                const level = levels[i];

                // Вычисляем границы уровня на основе уже добавленных объектов
                const levelBounds = level.map(levelObj => {
                    const size = levelObj.userData.trueSizes as ObjectSize;
                    return {
                        minY: levelObj.position.y - size.HEIGHT,
                        maxY: levelObj.position.y + size.HEIGHT,
                        y: levelObj.position.y
                    };
                });

                const levelMinY = Math.min(...levelBounds.map(b => b.minY));
                const levelMaxY = Math.max(...levelBounds.map(b => b.maxY));
                const avgLevelY = levelBounds.reduce((sum, b) => sum + b.y, 0) / levelBounds.length;

                // Вычисляем степень перекрытия объекта с уровнем
                const overlapStart = Math.max(objMinY, levelMinY);
                const overlapEnd = Math.min(objMaxY, levelMaxY);
                const overlapLength = overlapEnd - overlapStart;

                // Коэффициент близости Y-позиций
                const yProximity = 1 / (1 + Math.abs(objY - avgLevelY));

                // Если есть перекрытие, оцениваем его относительно размера объекта
                if (overlapLength > 0) {
                    const objectHeight = objMaxY - objMinY;
                    // Учитываем и перекрытие, и близость позиций
                    const overlapScore = (overlapLength / objectHeight) * 0.7 + yProximity * 0.3;

                    if (overlapScore > bestOverlapScore) {
                        bestOverlapScore = overlapScore;
                        bestLevelIndex = i;
                    }
                } else if (Math.abs(objY - avgLevelY) <= yPositionTolerance * 2) {
                    // Даже если нет перекрытия, но объекты близки по Y, считаем их на одном уровне
                    const proximityScore = yProximity * 0.5; // Меньший вес, чем при перекрытии

                    if (proximityScore > bestOverlapScore) {
                        bestOverlapScore = proximityScore;
                        bestLevelIndex = i;
                    }
                }
            }

            // Если найден подходящий уровень, добавляем объект на него
            if (bestLevelIndex >= 0) {
                levels[bestLevelIndex].push(obj);
            } else {
                // Если не найден подходящий уровень, создаем новый
                levels.push([obj]);
            }
        }

        // Сортируем уровни по минимальной Y позиции
        const sortedLevels = levels.sort((a, b) => {
            const minYLevelA = Math.min(...a.map(o => o.position.y - (o.userData.trueSizes as ObjectSize).HEIGHT));
            const minYLevelB = Math.min(...b.map(o => o.position.y - (o.userData.trueSizes as ObjectSize).HEIGHT));
            return minYLevelA - minYLevelB;
        });

        // Организация объектов внутри каждого уровня (как в оригинальном коде)
        const result: LevelItem[][] = [];

        for (const level of sortedLevels) {
            this.firstProduct = level[0];
            this.updateLocalAxes();

            // Сортируем объекты на уровне по X-координате
            const sortedLevelObjects = [...level].sort((a, b) => {
                const projectionA = this.getProjectionOnLocal(a);
                const projectionB = this.getProjectionOnLocal(b);
                return projectionA.x - projectionB.x;
            });

            // Группируем вертикально выровненные объекты
            const processedIndices = new Set<number>();
            const organizedLevel: LevelItem[] = [];

            for (let i = 0; i < sortedLevelObjects.length; i++) {
                if (processedIndices.has(i)) continue;

                const currentObj = sortedLevelObjects[i];
                const verticallyAligned: THREE.Object3D[] = [currentObj];
                processedIndices.add(i);

                // Ищем другие объекты, вертикально выровненные с текущим
                for (let j = 0; j < sortedLevelObjects.length; j++) {
                    if (i === j || processedIndices.has(j)) continue;

                    const otherObj = sortedLevelObjects[j];
                    if (this.areObjectsOverlapping(currentObj, otherObj)) {
                        verticallyAligned.push(otherObj);
                        processedIndices.add(j);
                    }
                }

                // Сортируем вертикально выровненные объекты по высоте
                verticallyAligned.sort((a, b) => a.position.y - b.position.y);

                // Добавляем одиночный объект или колонку объектов
                if (verticallyAligned.length === 1) {
                    organizedLevel.push(verticallyAligned[0]);
                } else {
                    organizedLevel.push({ columnItems: verticallyAligned });
                }
            }

            result.push(organizedLevel);
        }

        this.firstProduct = null;
        this.cachedRotationMatrix = null;

        return result;
    }
}

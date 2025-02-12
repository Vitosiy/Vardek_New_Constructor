// @ts-nocheck 31

import * as THREE from 'three'
import * as THREEInterfases from "@/types/interfases"
import * as THREETypes from "@/types"

import { useEventBus } from '@/store/appliction/useEventBus'

export default class CreateShape {
    parent: THREETypes.TApplication
    eventBus: ReturnType<typeof useEventBus> = useEventBus();
    points: THREE.Vector3[] = [];
    totalPoints: THREE.Vector3[] = [];
    wallsStorage: any[] = []

    floorPoints: THREE.Vector2[] = [];

    mouse: THREE.Vector2 = new THREE.Vector2();
    canvas: HTMLElement;
    camera: THREE.Camera;
    scene: THREE.Scene

    vector: THREE.Vector3 | null = null;
    updateVector: THREE.Vector3 | null = null;

    dotGeometry: THREE.CircleGeometry | null = null;
    dotMaterial: THREE.Material | null = null;

    lineGeometry: THREE.BufferGeometry | null = null;
    lineMaterial: THREE.LineBasicMaterial | null = null;

    currentDot: THREE.Mesh | null = null;
    currentLine: THREE.Line | null = null;
    isDrawing: boolean = false;
    isCreateDot: boolean = false;
    isCreating: boolean = false;

    planeHeight: number = 3000;
    drowHeight: number = this.planeHeight * 0.001 + 1

    private createPointBound: (event: MouseEvent) => void;
    private updateMouseMoveBound: (event: MouseEvent) => void;

    constructor(canvas: HTMLElement, camera: THREE.Camera, scene: THREE.Scene, parent: THREETypes.TApplication) {
        this.parent = parent
        this.canvas = canvas;
        this.camera = camera;
        this.scene = scene

        // Привязка методов в конструкторе
        this.createPointBound = this.createPoint.bind(this);
        this.updateMouseMoveBound = this.updateMouseMove.bind(this);

        this.createDotBase();
        this.createLineBase();
        this.vueEvents();

    }

    setapDraw() {
        // Используем привязанные методы
        this.canvas.addEventListener('mousedown', this.createPointBound, false);
        this.canvas.addEventListener('mousemove', this.updateMouseMoveBound, false);
        this.canvas.addEventListener('dblclick', this.stopDrow.bind(this), false)
    }

    createPoint() {

        if (this.isCreating) return

        this.totalPoints.push(this.updateVector as THREE.Vector3)
        this.points.push(this.updateVector as THREE.Vector3);



        // Создаём стартовую точку
        if (!this.isCreateDot) {
            this.setDot(this.vector as THREE.Vector3);
            this.isCreateDot = true
        }

        // Проверяем на замыкание стен

        if (this.totalPoints.length > 2 && this.isCloseToFirstPoint()) {
            this.createWall();
            this.createFloor();
            this.stopDrow();
            return
        }

        // Создаём каждую последующую точку
        if (this.isCreateDot) {
            this.setDot(this.vector as THREE.Vector3);
        }


        if (!this.isDrawing) {
            this.setLine();
            this.scene.add(this.currentLine as THREE.Line);
            this.isDrawing = true;

        }
        else {
            this.isDrawing = false;
            this.createWall();
            this.points = [new THREE.Vector3(this.updateVector!.x, this.drowHeight, this.updateVector!.z)];
            this.setLine();
            this.scene.add(this.currentLine as THREE.Line);
            this.isDrawing = true;
        }

    }

    updateMouseMove(event: MouseEvent) {
        this.updateMousePosition(event.clientX, event.clientY);

        this.vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0).unproject(this.camera);
        this.updateVector = new THREE.Vector3(this.vector.x, this.drowHeight, this.vector.z);


        if (this.isDrawing && this.currentLine) {

            const lastPoint = this.points[this.points.length - 1];
            let angle = Math.atan2(this.updateVector.z - lastPoint.z, this.updateVector.x - lastPoint.x);
            angle = THREE.MathUtils.radToDeg(angle); // Переводим в градусы

            // Проверка угла на кратность 90 градусам с учетом люфта
            const snapAngle = 90 * Math.round(angle / 90); // Ближайший угол кратный 90 градусам

            if (Math.abs(angle - snapAngle) <= 5) {
                angle = snapAngle;
            }

            // Преобразуем угол обратно в радианы и рассчитываем новую точку
            angle = THREE.MathUtils.degToRad(angle);
            const distance = this.updateVector.distanceTo(lastPoint);
            this.updateVector.x = lastPoint.x + distance * Math.cos(angle);
            this.updateVector.z = lastPoint.z + distance * Math.sin(angle);

            // Примагничивание при движении мыши
            if (this.totalPoints.length > 2 && this.isCloseToFirstPoint()) {
                this.updateVector = this.totalPoints[0].clone();
            }

            // Обновляем позицию конечной точки линии
            const pointsToUpdate = [...this.points, this.updateVector];
            this.currentLine.geometry.setFromPoints(pointsToUpdate);
        }

        this.currentDot?.position.set(this.updateVector.x, this.drowHeight, this.updateVector.z);

    }

    createWall() {
        /** Плоские стены */

        if (this.points.length < 2) return;

        // Определяем ширину стены
        const width = this.points[0].distanceTo(this.points[1]);

        // Создаем плоскость (стену)
        const geometry = new THREE.PlaneGeometry(width, this.planeHeight);

        // Проверка направления стены
        const isNormalOutward = this.checkWallDirection(this.points);

        // Создаем материал для стены
        const material = new THREE.MeshStandardMaterial({
            color: 0xff00ff,
            side: isNormalOutward ? THREE.FrontSide : THREE.BackSide
        });

        const wall = new THREE.Mesh(geometry, material);

        // Позиционируем стену
        wall.position.x = (this.points[0].x + this.points[1].x) / 2;
        wall.position.z = (this.points[0].z + this.points[1].z) / 2;
        wall.position.y = this.planeHeight / 2;

        // Вычисляем угол поворота стены
        const angle = Math.atan2(this.points[1].z - this.points[0].z, this.points[1].x - this.points[0].x);
        wall.rotation.y = -angle;

        wall.castShadow = true;
        wall.receiveShadow = true;

        let wallData = new Object() as { [key: string]: any }
        wallData.width = wall.geometry.parameters.width
        wallData.height = wall.geometry.parameters.height
        wallData.position = wall.position
        wallData.rotation = wall.rotation
        wallData.side = wall.material.side

        this.scene.add(wall);

        this.wallsStorage.push(wallData)
        console.log(this.wallsStorage,'wallsStorage')


        // helper для вычисления направления нормалей
        // const helper = new VertexNormalsHelper(wall, 1, 0xff0000);
        // this.scene.add(helper);
    }
    // Проверка направления плоскости стен
    checkWallDirection(points: THREE.Vector3[]): boolean {
        if (points.length < 2) return true;

        const p1 = points[0];
        const p2 = points[1];

        // Вычисляем произведение координат для проверки направления
        const crossProduct = p1.x * p2.z - p1.z * p2.x;

        // Если стена движется вдоль оси Z (по прямой линии, параллельной Z)
        if (p1.x === p2.x) {
            // Если движемся в положительном направлении по оси Z (от -Z к +Z)
            return p2.z > p1.z;
        }

        // Если значение crossProduct > 0, нормаль направлена наружу
        return crossProduct > 0;
    }

    createFloor() {
        // Проверяем, что есть хотя бы три точки для создания многоугольника
        if (this.totalPoints.length < 3) {
            console.error('Недостаточно точек для создания пола');
            return;
        }

        // Создаем форму (Shape) для пола
        const shape = new THREE.Shape();

        // Начинаем с первой точки
        shape.moveTo(this.totalPoints[0].x, this.totalPoints[0].z);

        // Добавляем остальные точки
        for (let i = 1; i < this.totalPoints.length; i++) {
            shape.lineTo(this.totalPoints[i].x, this.totalPoints[i].z);
        }

        // Замыкаем контур, возвращаемся к первой точке
        shape.lineTo(this.totalPoints[0].x, this.totalPoints[0].z);


        // Создаем геометрию для пола на основе формы
        const geometry = new THREE.ShapeGeometry(shape);

        // Создаем материал для пола
        const material = new THREE.MeshBasicMaterial({
            color: 'crimson',
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });

        // Создаем Mesh для пола
        const floorMesh = new THREE.Mesh(geometry, material);

        // Устанавливаем пол на уровень Y = 0
        floorMesh.position.y = 0;
        floorMesh.rotateX(Math.PI * 0.5)

        // Добавляем пол на сцену
        this.scene.add(floorMesh);

    }

    createLineBase() {
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
    }

    createDotBase() {
        this.dotGeometry = new THREE.CircleGeometry(0.05 * 1000)
        this.dotMaterial = new THREE.MeshBasicMaterial({ color: 'black', side: THREE.DoubleSide })
    }

    setDot(vector: THREE.Vector3) {
        console.log('Dot')
        this.currentDot = new THREE.Mesh(this.dotGeometry as THREE.CircleGeometry, this.dotMaterial as THREE.Material)
        this.currentDot.rotateX(Math.PI * -0.5)
        this.currentDot.position.set(vector.x, this.drowHeight, vector.z)
        this.scene.add(this.currentDot);
    }

    setLine() {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(this.points);
        this.currentLine = new THREE.Line(lineGeometry, this.lineMaterial as THREE.Material);
    }

    stopDrow() {
        this.currentLine = null
        this.currentDot = null
        this.isCreateDot = false;
        this.isDrawing = false;
        this.isCreating = true;
        this.points = [];
        this.totalPoints = [];
    }

    // Функция для проверки замыкания контура
    isCloseToFirstPoint(): boolean {

        if (this.totalPoints.length === 0) return false;

        const firstPoint = this.totalPoints[0];
        const currentPoint = this.updateVector!;

        const distance = firstPoint.distanceTo(currentPoint);
        return distance < 20; // Радиус примагничивания, который можно настроить
    }

    despose() {
        // Используем привязанные методы для удаления слушателей
        this.canvas.removeEventListener('mousedown', this.createPointBound, false);
        this.canvas.removeEventListener('mousemove', this.updateMouseMoveBound, false);
        this.canvas.removeEventListener('dblclick', this.stopDrow.bind(this), false)
    }

    private updateMousePosition(clientX: number, clientY: number) {
        this.mouse.x = ((clientX - this.canvas.getBoundingClientRect().left) / this.canvas.clientWidth) * 2 - 1;
        this.mouse.y = -((clientY - this.canvas.getBoundingClientRect().top) / this.canvas.clientHeight) * 2 + 1;
    }

    vueEvents() {
        this.eventBus.on('A:CameraToggle', (value: boolean) => {
            if (value) {
                this.camera = this.parent.camera.instance
                this.setapDraw();
                return;
            }
            console.log('SHAPE-2');
            this.despose();
        });
    }

    hideDraft() {
        this.scene.traverse(child => {
            if (child instanceof THREE.Mesh && child.geometry instanceof THREE.CircleGeometry || child instanceof THREE.Line) {
                if (this.parent._draft) {
                    child.visible = true
                }
                else {
                    child.visible = false
                }
            }
        })
    }
}
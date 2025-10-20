import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomManager } from '../Room/RoomManager';
import { useMenuStore } from '@/store/appStore/useMenuStore';

// Интерфейс для конфигурации линейки
interface RulerConfig {
  POINT_COUNT: number;
  MIN_DISTANCE: number;
  MAX_DISTANCE: number;
  LINE_COLOR: string;
  LABEL_HEIGHT_OFFSET: number;
  DIRECTIONS: THREE.Vector3[];
  ARROW_WIDTH: number;
  ARROW_HEIGHT: number;
  OBJECT_ARROW_WIDTH: number;
  OBJECT_ARROW_HEIGHT: number;
}

// Интерфейс для параметров создания метки
interface DrawLabelParams {
  axis: number;
  position: THREE.Vector3;
  css: string;
}

export class Ruler {
  private menuStore = useMenuStore();

  private rulerLines: THREE.Object3D[] = [];
  private rullerSizeLines: THREE.Object3D[] = [];
  private room: RoomManager | null = null;
  private scene: THREE.Scene | null = null;
  private readonly raycasterWall = new THREE.Raycaster();
  private readonly raycasterProd = new THREE.Raycaster();

  private readonly config: RulerConfig = {
    POINT_COUNT: 3,
    MIN_DISTANCE: 0.01,
    MAX_DISTANCE: 1500,
    LINE_COLOR: '#444444',
    LABEL_HEIGHT_OFFSET: 100,
    ARROW_WIDTH: 75,
    ARROW_HEIGHT: 38,
    OBJECT_ARROW_WIDTH: 25,
    OBJECT_ARROW_HEIGHT: 50,
    DIRECTIONS: [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, -1),
    ],
  };

  constructor(scene?: THREE.Scene, room?: RoomManager, rulerLines?: THREE.Object3D[], rullerSizeLines?: THREE.Object3D[]) {
    this.scene = scene ?? null;
    this.rulerLines = rulerLines ?? [];
    this.rullerSizeLines = rullerSizeLines ?? [];
    this.room = room ?? null;
  }

  public setParams({ scene, room, rulerLines, rullerSizeLines }: { scene?: THREE.Scene; room?: RoomManager; rulerLines?: THREE.Object3D[]; rullerSizeLines?: THREE.Object3D[] }) {
    this.scene = scene ?? null;
    this.rulerLines = rulerLines ?? [];
    this.rullerSizeLines = rullerSizeLines ?? [];
    this.room = room ?? null;
  }

  // Переключение видимости линеек расстояния и размеров
  public toggleRulerVisibility(visible: boolean): void {
    const toggleObjects = (objects: THREE.Object3D[]) => {
      objects.forEach(obj => {
        obj.visible = visible;
        obj.traverse(child => {
          child.visible = visible;
        });
      });
    };

    toggleObjects(this.rulerLines);
    toggleObjects(this.rullerSizeLines);
  }

  // Отрисовка сплошных линий до стен
  public drawRulerWalls(objectBox: THREE.Box3): void {
    const faceCenters = [
      new THREE.Vector3(objectBox.max.x, objectBox.max.y, (objectBox.min.z + objectBox.max.z) / 2),
      new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, objectBox.max.y, (objectBox.min.z + objectBox.max.z) / 2),
      new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, objectBox.max.y, objectBox.max.z),
      new THREE.Vector3(objectBox.min.x, objectBox.max.y, (objectBox.min.z + objectBox.max.z) / 2),
      new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, objectBox.min.y, (objectBox.min.z + objectBox.max.z) / 2),
      new THREE.Vector3((objectBox.min.x + objectBox.max.x) / 2, objectBox.max.y, objectBox.min.z - 20),
    ];

    this.config.DIRECTIONS.forEach((direction, i) => {
      if (!this.scene || !this.room) return;

      this.raycasterWall.set(faceCenters[i], direction);
      const intersects = this.raycasterWall.intersectObjects(
        [...this.room._roomWalls, this.room._roomFloor].filter(obj => obj instanceof THREE.Object3D),
        true
      );

      if (intersects.length > 0 && intersects[0].distance > this.config.MIN_DISTANCE) {
        const { point, distance } = intersects[0];
        const middle = new THREE.Vector3().lerpVectors(point, faceCenters[i], 0.5).add(new THREE.Vector3(0, this.config.LABEL_HEIGHT_OFFSET, 0));

        this.createArrow(direction, faceCenters[i], distance, '#77cadb', false);
        const distanceLabel = this.createLabel({ axis: distance, position: middle, css: 'distance-label--wall' });
        this.scene.add(distanceLabel);
        this.rulerLines.push(distanceLabel);
      }
    });
  }

  // Отрисовка сплошных линий до объектов
  public drawRulerToObjects(object: THREE.Object3D | null): void {
    if (!this.isValidState()) {
      console.warn('Отсутствуют необходимые свойства: комната, границы комнаты или сцена');
      return;
    }

    this.clearRuler();
    if (!this.menuStore.getRulerVisibility) return

    const objectBox = object!.userData.aabb as THREE.Box3;

    this.drawRulerWalls(objectBox);
    this.calculateAndRenderRulers(objectBox);
  }

  // Отрисовка пунктирных линий размеров объекта
  public drawRullerObjects(object: THREE.Object3D, group?: THREE.Object3D): { arrowPos: THREE.ArrowHelper; arrowNeg: THREE.ArrowHelper; labelDiv: CSS2DObject }[] {
    const arrows: { arrowPos: THREE.ArrowHelper; arrowNeg: THREE.ArrowHelper; labelDiv: CSS2DObject }[] = [];
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());

    console.log(group)

    const getLableSizes = () => {
      const obj = {
        width: size.x,
        height: size.y,
        depth: size.z
      };

      const configSize = group?.userData?.prodSize;
      if (configSize) {
        obj.width = configSize.width;
        obj.height = configSize.height;
        obj.depth = configSize.depth;
      }

      return obj;
    };

    const lableSizes = getLableSizes()
    const percentage = 0.85;

    console.log(lableSizes, 'lableSizes')

    const axes = [
      {
        dir: new THREE.Vector3(1, 0, 0),
        start: new THREE.Vector3(
          (box.min.x + box.max.x) * 0.5 - (size.x * percentage) * 0.5,
          box.max.y - this.config.OBJECT_ARROW_WIDTH * 0.5,
          box.min.z + this.config.OBJECT_ARROW_WIDTH * 0.5
        ),
        length: size.x * percentage,
        lable: lableSizes.width
      },
      {
        dir: new THREE.Vector3(0, 1, 0),
        start: new THREE.Vector3(
          box.min.x + this.config.OBJECT_ARROW_WIDTH * 0.5,
          (box.min.y + box.max.y) * 0.5 - (size.y * percentage) * 0.5,
          box.min.z + this.config.OBJECT_ARROW_WIDTH * 0.5
        ),
        length: size.y * percentage,
        lable: lableSizes.height
      },
      {
        dir: new THREE.Vector3(0, 0, 1),
        start: new THREE.Vector3(
          box.max.x - this.config.OBJECT_ARROW_WIDTH * 0.5,
          box.min.y + this.config.OBJECT_ARROW_WIDTH * 0.5,
          (box.min.z + box.max.z) * 0.5 - (size.z * percentage) * 0.5
        ),
        length: size.z * percentage,
        lable: lableSizes.depth
      },
    ];

    axes.forEach(({ dir, start, length, lable }) => {
      if (!this.scene) return;
      if (length < 1) return

      const arrowPos = new THREE.ArrowHelper(dir, start, length, this.config.LINE_COLOR, this.config.OBJECT_ARROW_HEIGHT, this.config.OBJECT_ARROW_WIDTH);
      const arrowNeg = new THREE.ArrowHelper(dir.clone().negate(), start, 0, this.config.LINE_COLOR, this.config.OBJECT_ARROW_HEIGHT, this.config.OBJECT_ARROW_WIDTH);

      this.configureArrow(arrowPos, true);
      this.configureArrow(arrowNeg, true);
      arrowPos.line.computeLineDistances();

      const middle = new THREE.Vector3().addVectors(start, dir.clone().multiplyScalar(length / 2));
      middle.add(dir.x || dir.z ? new THREE.Vector3(0, 60, 0) : new THREE.Vector3(-100, 0, 0));
      //length / percentage
      const labelDiv = this.createLabel({ axis: lable, position: middle, css: 'dimension-label' });
      this.scene.add(arrowPos, arrowNeg, labelDiv);
      this.rullerSizeLines.push(arrowPos, arrowNeg, labelDiv);
      arrows.push({ arrowPos, arrowNeg, labelDiv });
    });

    return arrows;
  }

  // Проверка валидности состояния
  private isValidState(): boolean {
    // return !!this.room && !!this.room._roomTotalBounds && !!this.scene && !!this.rulerLines;
      return !!this.room && !!this.scene && !!this.rulerLines;
  }

  // Получение ближайших боксов
  private getNearbyBoxes(objectBox: THREE.Box3): THREE.Box3[] {
    if (!this.room?._roomTotalBounds) return [];

    const nearbyBoxes: THREE.Box3[] = [];
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    for (const box of this.room._roomTotalBounds) {
      if (objectBox.distanceToPoint(box.getCenter(center)) < this.config.MAX_DISTANCE + box.getSize(size).x) {
        nearbyBoxes.push(box);
      }
    }

    return nearbyBoxes;
  }

  // Генерация точек для рейкастинга
  private generatePoints(min: number, max: number): number[] {
    const step = (max - min) / (this.config.POINT_COUNT - 1);
    return Array.from({ length: this.config.POINT_COUNT }, (_, i) => min + step * i);
  }

  // Расчёт и отрисовка сплошных линий до объектов
  private calculateAndRenderRulers(objectBox: THREE.Box3): void {

    const xPoints = this.generatePoints(objectBox.min.x, objectBox.max.x);
    const zPoints = this.generatePoints(objectBox.min.z, objectBox.max.z);
    const yMid = (objectBox.min.y + objectBox.max.y) / 2;
    const intersectionPoint = new THREE.Vector3();
    const originPoint = new THREE.Vector3();
    const offset = new THREE.Vector3();

    for (const box of this.getNearbyBoxes(objectBox)) {

       console.log('ASTRAL')

      if (objectBox.intersectsBox(box)) {
        continue; // Пропускаем отрисовку линейки, если есть пересечение
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
                this.renderRulerElements(direction, originPoint, intersectionPoint, distance);
                intersectionFound = true;
                break;
              }
            }
          }
          if (intersectionFound) break;
        }
      }
    }
  }

  // Расчёт смещения для начальной точки
  private calculateOffsetMagnitude(direction: THREE.Vector3, origin: THREE.Vector3, box: THREE.Box3): number {
    if (direction.x !== 0) return direction.x > 0 ? box.max.x - origin.x : origin.x - box.min.x;
    if (direction.y !== 0) return direction.y > 0 ? box.max.y - origin.y : origin.y - box.min.y;
    return direction.z > 0 ? box.max.z - origin.z : origin.z - box.min.z;
  }

  // Отрисовка элементов линейки со сплошными линиями
  private renderRulerElements(direction: THREE.Vector3, originPoint: THREE.Vector3, intersectionPoint: THREE.Vector3, distance: number): void {
    if (!this.scene) return;

    // const middle = new THREE.Vector3().lerpVectors(intersectionPoint, originPoint, 0.5).add(new THREE.Vector3(0, this.config.LABEL_HEIGHT_OFFSET, 0));
    const extreme = intersectionPoint.clone().add(new THREE.Vector3(0, this.config.LABEL_HEIGHT_OFFSET, 0));

    this.createArrow(direction, originPoint, distance, this.config.LINE_COLOR, false);
    this.createLine(intersectionPoint, this.config.LINE_COLOR);
    const distanceLabel = this.createLabel({ axis: distance, position: extreme, css: 'distance-label' });
    this.scene.add(distanceLabel);
    this.rulerLines.push(distanceLabel);
  }

  // Создание стрелки с выбором сплошной или пунктирной линии
  private createArrow(direction: THREE.Vector3, originPoint: THREE.Vector3, distance: number, color: string | THREE.Color, dashed: boolean): void {
    if (!this.scene) return;

    const arrow = new THREE.ArrowHelper(direction.clone().normalize(), originPoint, distance, color, this.config.ARROW_WIDTH, this.config.ARROW_HEIGHT);
    const arrow2 = new THREE.ArrowHelper(direction.clone().negate().normalize(), originPoint, 0, color, this.config.ARROW_WIDTH, this.config.ARROW_HEIGHT);

    this.configureArrow(arrow, dashed);
    this.configureArrow(arrow2, dashed);
    this.scene.add(arrow, arrow2);
    this.rulerLines.push(arrow, arrow2);
  }

  // Создание сплошной линии
  private createLine(intersectionPoint: THREE.Vector3, color: string | THREE.Color): void {
    if (!this.scene) return;

    const lineMaterial = new THREE.LineBasicMaterial({
      color,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      opacity: 1,
    });

    const points = [intersectionPoint.clone(), new THREE.Vector3(intersectionPoint.x, 0, intersectionPoint.z)];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.renderOrder = 1;

    this.scene.add(line);
    this.rulerLines.push(line);
  }

  // Конфигурация стрелки с выбором сплошной или пунктирной линии
  private configureArrow(arrow: THREE.ArrowHelper, dashed: boolean = false): void {
    arrow.traverse(child => {
      child.userData.isArrowHelper = true;
    });

    if (arrow.line.material instanceof THREE.LineBasicMaterial) {
      if (dashed) {
        arrow.line.material = new THREE.LineDashedMaterial({
          color: arrow.line.material.color,
          dashSize: 10,
          gapSize: 5,
          linewidth: 2,
          scale: 250,
          transparent: true,
          opacity: 1,
        });
      } else {
        arrow.line.material = new THREE.LineBasicMaterial({
          color: arrow.line.material.color,
          transparent: true,
          opacity: 1,
        });
      }
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

  // Создание метки
  private createLabel({ axis, position, css }: DrawLabelParams): CSS2DObject {
    const labelDiv = document.createElement('div');
    labelDiv.className = css;
    labelDiv.textContent = `${axis.toFixed(0)}`;
    const heightLabel = new CSS2DObject(labelDiv);
    heightLabel.position.copy(position);
    return heightLabel;
  }

  // Очистка линейки расстояния
  public clearRuler(): void {
    this.clear(this.rulerLines);
    this.rulerLines = [];
  }

  // Очистка объектов сцены
  private clear(rulerStorage: THREE.Object3D[]): void {
    if (!this.scene) return;

    rulerStorage.forEach(line => {
      this.scene!.remove(line);
      line.traverse(child => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    });
  }

  // Обновление параметров линейки
  public update(room: RoomManager, rulerLines: THREE.Object3D[], rullerSizeLines: THREE.Object3D[]): void {
    this.room = room;
    this.rulerLines = rulerLines;
    this.rullerSizeLines = rullerSizeLines;
  }
}
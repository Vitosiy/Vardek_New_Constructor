/**// @ts-nocheck */

import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { CSG } from 'three-csg-ts';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { MILLINGS } from '@/Application/F-millings';

export class MillingBuilder {
  svgLoader: SVGLoader = new SVGLoader();
  millingsStore = MILLINGS

  constructor() {
    console.log(this.millingsStore, 'CREATE MILLINGS')
  }

  createMillingFasade(object, fasadePosition, millingParams: number, defaultGeometry) {

    /** Данные для корректировки положения булевой геометрии */

    let millingData = this.millingsStore[millingParams] ? this.millingsStore[millingParams] : this.millingsStore[2462671]

    // let millingData = millingParams


    let startGeometry = defaultGeometry.clone()

    let back_bsp;
    try {
      back_bsp = CSG.fromGeometry(startGeometry.geometry);
    } catch {
      return;
    }

    switch (millingParams) {
      case 2475715:
        const hendless = this.hendlesCreate(fasadePosition, millingParams, object);
        const shape_bsp = CSG.fromMesh(hendless);
        back_bsp = back_bsp.subtract(shape_bsp);
        break;

      default:
        const shapesArray = millingData
          .map(figure => this.extractShape(fasadePosition, figure))
          .filter(Boolean);

        console.log(shapesArray, 'shapesArray')

        shapesArray.forEach(({ shape, extrudeSettings, topPosition, boolParams, pattern }) => {

          if (boolParams) {
            console.log(extrudeSettings, boolParams.depth.direction)
          }


          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings || { steps: 1, depth: 2, bevelEnabled: false });
          const material = new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
          material.color.convertSRGBToLinear();

          geometry.computeBoundingBox()
          const shapeMesh = new THREE.Mesh(geometry, material);

          let box = new THREE.Box3().setFromObject(shapeMesh)
          let vec = new THREE.Vector3();
          let size = box.getSize(vec)

          console.log(size, 'SIZE')

          if (boolParams) {

            /** POSITION */

            boolParams.position?.front ? shapeMesh.position.z = fasadePosition.FASADE_DEPTH * 0.5 + boolParams.position.front : ''

            boolParams.position?.bottom ? shapeMesh.position.y = -fasadePosition.FASADE_HEIGHT * 0.5 + (size.x * 0.5 + boolParams.depth.offset) : ''
            boolParams.position?.top ? shapeMesh.position.y = fasadePosition.FASADE_HEIGHT * 0.5 - (size.x * 0.5 + boolParams.depth.offset) : ''

            boolParams.position?.left ? shapeMesh.position.x = fasadePosition.FASADE_WIDTH * 0.5 - (size.x * 0.5 + boolParams.depth.offset) : ''
            boolParams.position?.right ? shapeMesh.position.x = -fasadePosition.FASADE_WIDTH * 0.5 + (size.x * 0.5 + boolParams.depth.offset) : ''


            boolParams.position?.centerHorizontal ? shapeMesh.position.x = -size.z * 0.5 : ''
            boolParams.position?.centerVertical ? shapeMesh.position.y = -size.z * 0.5 : ''
            /** ROTATION */

            boolParams.rotate?.x ? shapeMesh.rotation.x = boolParams.rotate.x : ''
            boolParams.rotate?.z ? shapeMesh.rotation.z = boolParams.rotate.z : ''
            boolParams.rotate?.y ? shapeMesh.rotation.y = boolParams.rotate.y : ''

          }

          else {

            shapeMesh.rotation.y = -Math.PI;
            shapeMesh.position.z = -fasadePosition.FASADE_DEPTH * 0.5 + size.z;

          }

          if (topPosition) {
            shapeMesh.position.y = (fasadePosition.FASADE_HEIGHT * 0.5) + topPosition
          }

          /** Если есть паттерн */

          if (pattern) {

            const patternCount = this.calculateFit(
              {
                containerLength: fasadePosition.FASADE_WIDTH,
                itemLength: pattern.offset
              }
            )

            const startGeometry = shapeMesh.geometry.clone()

            const patternGeometry = this.mergePattern(
              {
                geometry: startGeometry,
                count: patternCount,
                offsetX: pattern.offset
              }
            )

            const patternMesh = new THREE.Mesh(patternGeometry, material)
            patternMesh.rotation.copy(shapeMesh.rotation)
            patternMesh.position.copy(shapeMesh.position)

            patternMesh.updateMatrixWorld(true)

            // object.add(patternMesh)

            const shape_bsp = CSG.fromMesh(patternMesh);
            back_bsp = back_bsp.subtract(shape_bsp);

          }

          else {
            shapeMesh.updateMatrixWorld(true)
            
            // object.add(shapeMesh)

            const shape_bsp = CSG.fromMesh(shapeMesh);
            back_bsp = back_bsp.subtract(shape_bsp);
          }

        });

        break;
    }

    // Преобразуем BSP-геометрию обратно
    const newGeometry = CSG.toGeometry(back_bsp, new THREE.Matrix4());

    this.applyPlanarMappingToFaces(newGeometry)

    object.geometry = newGeometry;

  }

  private hendlesCreate(fasadePosition, millingParams, object) {

    let shape = new THREE.Shape();
    let c = Math.PI / 180;
    shape.moveTo(7.5, -15);
    shape.lineTo(-5, -15);
    shape.absarc(-2, 15, 3, -180 * c, 0 * c, true);
    shape.absarc(5, 9, 2, -180 * c, 0 * c, false);

    var extrudeSettings = {
      steps: 2,
      depth: fasadePosition.FASADE_WIDTH,
      bevelEnabled: false,
    };

    let geometryq = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    let materialq = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    let shapeMesh = new THREE.Mesh(geometryq, materialq);

    shapeMesh.rotation.y = -Math.PI * 0.5
    shapeMesh.rotation.z = - Math.PI

    shapeMesh.position.y = fasadePosition.FASADE_HEIGHT * 0.5 - 10
    shapeMesh.position.x = fasadePosition.FASADE_WIDTH / 2
    shapeMesh.position.z = fasadePosition.FASADE_DEPTH / 2 - 2.5

    shapeMesh.updateMatrixWorld(true);

    return shapeMesh
  }

  private extractShape(fasadePosition, figure) {

    const figureParams = figure.figureParams.find(({ condition }) => {
      return this.matchesCondition(fasadePosition, condition)
    })

    if (!figureParams) return null;

    const shape = this.parseSVG(
      {
        svgStr: figureParams.figure.svg,
        width: fasadePosition.FASADE_WIDTH / 2 + (figureParams.figure.widthOffset || 0),
        height: fasadePosition.FASADE_HEIGHT / 2 + (figureParams.figure.heightOffset || 0),
        radius: figureParams.figure.radius
      }
    );

    const holes = this.parseSVG(
      {
        svgStr: figureParams.hole.svg,
        width: fasadePosition.FASADE_WIDTH / 2 + (figureParams.hole.widthOffset || 0),
        height: fasadePosition.FASADE_HEIGHT / 2 + (figureParams.hole.heightOffset || 0),
        isHole: true
      }
    );

    holes.forEach(hole => shape.holes.push(...hole.toShapes()));

    let boolParams = figureParams.figure.boolParams

    if (boolParams) {

      figure.extrudeSettings.depth = fasadePosition[boolParams.depth.size] - boolParams.depth.offset * 2

    }

    return { shape, extrudeSettings: figure.extrudeSettings, topPosition: figureParams.figure.topPosition, boolParams, pattern: figureParams.figure.pattern };
  }

  private matchesCondition({ FASADE_WIDTH, FASADE_HEIGHT }, { width, height }) {

    return (
      width.min <= FASADE_WIDTH && FASADE_WIDTH <= width.max &&
      height.min <= FASADE_HEIGHT && FASADE_HEIGHT <= height.max
    );
  }

  private parseSVG({ svgStr, width, height, radius, isHole = false }: { svgStr: string, width: number, height: number, radius?: number, isHole?: boolean }): THREE.Shape | THREE.Shape[] {
    // Заменяем wth, hgh и radius на реальные значения
    svgStr = svgStr.replaceAll("wth", width.toString()).replaceAll("hgh", height.toString());
    if (radius) {
      svgStr = svgStr.replaceAll("radius", radius.toString());
    }

    // Обрабатываем выражения в скобках, суммируя их
    svgStr = svgStr.replace(/\(([^)]+)\)/g, (match, expr) => {
      console.log(expr)

      // Суммируем значения, разделенные запятыми, в выражении внутри скобок
      const sum = eval(expr)

      console.log(sum)
      return sum.toString(); // Возвращаем вычисленное значение
    });

    // Дополнительная обработка для вычислений без скобок (если нужно)
    svgStr = svgStr
      .split(/, | /)
      .map(item => item.includes(",") ? item.split(",").reduce((sum, val) => sum + parseFloat(val), 0) : item)
      .join(" ");

    console.log(svgStr, 'svgStr после вычислений');

    // Парсим SVG через SVGLoader
    const paths = this.svgLoader.parse(svgStr).paths;
    return isHole ? paths : paths[0]?.toShapes()[0];
  }

  assignUVs(bufferGeometry) {
    // Проверяем наличие атрибута позиции
    const position = bufferGeometry.attributes.position;
    if (!position) {
      console.warn('Geometry does not have position attribute.');
      return;
    }

    // Получаем массив индексов или создаем его, если он отсутствует
    const indices = bufferGeometry.index?.array || Array.from({ length: position.count }, (_, i) => i);
    const positionsArray = position.array; // Кэшируем массив позиций для оптимизации

    const uvs = [];

    // Кэш для уже вычисленных UV-координат
    const uvCache = new Map();

    // Вспомогательная функция для получения UV из кэша или вычисления
    const getOrCalculateUV = (index) => {
      if (!uvCache.has(index)) {
        const uv = this.calculateUV(positionsArray, index);
        uvCache.set(index, uv);
      }
      return uvCache.get(index);
    };

    // Обрабатываем треугольники
    for (let i = 0; i < indices.length; i += 3) {
      const [a, b, c] = [indices[i], indices[i + 1], indices[i + 2]].map(getOrCalculateUV);
      uvs.push(...a, ...b, ...c);
    }

    // Устанавливаем UV-координаты как атрибут
    bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  }

  private calculateUV(positions, index) {
    const [x, y, z] = [positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]];
    return [x, z];
  }

  applyPlanarMappingToFaces(bufferGeometry) {
    const position = bufferGeometry.attributes.position;
    const uvs = [];
    const positionsArray = position.array;
    const faces = bufferGeometry.index.array; // Индексы треугольников

    // Создаем вспомогательную переменную для нормалей
    const normal = new THREE.Vector3();

    // Функция для вычисления UV-координат в зависимости от нормали
    const computeUV = (v, axis1, axis2) => {
      // Нормализуем координаты
      return new THREE.Vector2((v[axis1] + 1) / 2, (v[axis2] + 1) / 2);
    };

    // Перебираем все треугольники
    for (let i = 0; i < faces.length; i += 3) {
      const [a, b, c] = [faces[i], faces[i + 1], faces[i + 2]];

      // Получаем позиции каждой вершины
      const va = new THREE.Vector3().fromBufferAttribute(position, a);
      const vb = new THREE.Vector3().fromBufferAttribute(position, b);
      const vc = new THREE.Vector3().fromBufferAttribute(position, c);

      // Рассчитываем нормаль этой грани
      new THREE.Triangle(va, vb, vc).getNormal(normal);

      // Вычисляем UV-координаты в зависимости от нормали
      let uvA, uvB, uvC;
      if (Math.abs(normal.x) > Math.abs(normal.y) && Math.abs(normal.x) > Math.abs(normal.z)) {
        // Нормаль по оси X
        uvA = computeUV(va, 'y', 'z');
        uvB = computeUV(vb, 'y', 'z');
        uvC = computeUV(vc, 'y', 'z');
      } else if (Math.abs(normal.y) > Math.abs(normal.x) && Math.abs(normal.y) > Math.abs(normal.z)) {
        // Нормаль по оси Y
        uvA = computeUV(va, 'x', 'z');
        uvB = computeUV(vb, 'x', 'z');
        uvC = computeUV(vc, 'x', 'z');
      } else {
        // Нормаль по оси Z
        uvA = computeUV(va, 'x', 'y');
        uvB = computeUV(vb, 'x', 'y');
        uvC = computeUV(vc, 'x', 'y');
      }

      // Добавляем UV-координаты
      uvs.push(...uvA.toArray(), ...uvB.toArray(), ...uvC.toArray());
    }

    // Устанавливаем UV-координаты
    bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  }

  /** Для паттернов */

  mergePattern({ geometry, count, offsetX, offsetY, offsetZ }) {
    const geometries = [];

    // Создание и смещение копий
    for (let i = 0; i <= count; i++) {
      const cloneGeometry = geometry.clone();

      // Создаем матрицу смещения
      const offsetMatrix = new THREE.Matrix4();
      offsetMatrix.makeTranslation(i * offsetX, 0, 0);

      // Применяем смещение
      cloneGeometry.applyMatrix4(offsetMatrix);

      // Добавляем в массив
      geometries.push(cloneGeometry);
    }

    // Объединяем все геометрии
    const mergedGeometry = mergeGeometries(geometries);

    // Создаем материал и mesh
    return mergedGeometry
  }

  calculateFit({ containerLength, itemLength, gap = 0 }) {

    if (itemLength + gap <= 0 || containerLength <= 0) {
      return 0; // Невозможно разместить фигуры
    }

    // Полезная длина (за исключением последнего отступа)
    const totalItemLength = itemLength + gap;

    // Количество элементов, которые помещаются в контейнер
    const count = Math.floor((containerLength + gap) / totalItemLength);

    return count;
  }

}
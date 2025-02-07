// @ts-nocheck 

import * as THREE from 'three';
import * as THREETypes from "@/types/types"
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { CSG } from 'three-csg-ts';
import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { OBB } from 'three/examples/jsm/math/OBB.js';

import { PatternBuilder } from './PatternBuilder';
import { BuildersHelper } from './BuildersHelper';

import { MILLINGS, additionaMillinglKeys } from '@/Application/F-millings';

export class MillingBuilder extends BuildersHelper {
  private svgLoader: SVGLoader = new SVGLoader();
  private millingsStore = MILLINGS
  private additionaMillinglKeys = additionaMillinglKeys
  patternBuilder: PatternBuilder
  private result = null

  constructor(root) {
    super(root)


  }

  createMillingFasade(object, fasadePosition, millingParams: number, defaultGeometry) {

    /** Данные для корректировки положения булевой геометрии */

    console.log(millingParams)

    console.log(this.additionaMillinglKeys[millingParams])

    const millingKey = this.additionaMillinglKeys[millingParams] ?? millingParams

    // console.log(this.addAdditionalKeys(this.millingsStor, this.additionaMillinglKeys), 'millingParams')



    const millingData = this.millingsStore[millingKey] ? this.millingsStore[millingKey] : this.millingsStore[2462671]
    /** Для дебагинга */
    // let millingData = millingParams
    let startGeometry = defaultGeometry.clone()
    let csgStartGeometry = CSG.fromGeometry(startGeometry.geometry);
    let clonedfasadePosition = JSON.parse(JSON.stringify(fasadePosition))

    let brush_1 = new Brush(startGeometry.geometry);
    let evaluator = new Evaluator()

    let result

    switch (millingData) {

      case 2475715:
        const hendless = this.hendlesCreate(clonedfasadePosition, millingData, object);
        const shape_bsp = CSG.fromMesh(hendless);
        csgStartGeometryback_bsp = back_bsp.subtract(shape_bsp);
        break;

      default:

        const shapesArray = millingData.map(figure => this.extractShape(clonedfasadePosition, figure)).flat(Infinity).filter(Boolean);

        // console.log(shapesArray, 'SHAPES')

        shapesArray.forEach((figureParams, key) => {

          let mesh, boolMesh, patternMesh, booleanCSGMesh

          switch (figureParams.type) {
            case 'svg':
              boolMesh = this.svgShapeCreate(figureParams, fasadePosition, startGeometry);
              break;

            case 'capsule':
              boolMesh = this.capsuleCreate(figureParams, fasadePosition);
              break
          }

          switch (typeof figureParams.pattern) {

            case 'object':
              mesh = new PatternBuilder({
                boolMesh,
                figureParams,
                fasadePosition,
                type: figureParams.type
              })._PatternMesh;
              // object.add(mesh) // Визуализация фрезеровки

              break;

            default:
              boolMesh.updateMatrixWorld(true);
              mesh = boolMesh;

              // object.add(boolMesh) // Визуализация фрезеровки
              break;
          }

          ({ brush_1, csgStartGeometry } = this.processMesh(mesh, brush_1, evaluator, csgStartGeometry, figureParams.lib));


        });

        break;
    }

    // Преобразуем BSP-геометрию обратно

    console.log(result, 'after--')

    let newGeometry = this.result ? this.result.geometry : CSG.toGeometry(csgStartGeometry, new THREE.Matrix4());

    /** Создаём UV развёртку для новой геометрии */

    this.planarUV(newGeometry)

    /** Удаляем старую геометрию */
    object.geometry.dispose()
    object.geometry = null
    object.geometry = newGeometry;

    /** Очищяем память от временной геометрии */
    newGeometry.dispose()
    newGeometry = null
    this.result = null

  }

  private svgShapeCreate(figureParams, fasadePosition, startGeometry) {

    const { FASADE_DEPTH, FASADE_HEIGHT, FASADE_WIDTH } = fasadePosition

    const geometries = figureParams.shape.map((path) => {

      const shape = path.toShapes();

      if (path.userData.holes) {
        shape[0].holes = path.userData.holes;
      }

      return new THREE.ExtrudeGeometry(
        shape,
        figureParams.extrudeSettings || { steps: 1, depth: 2, bevelEnabled: false }
      );
    });

    const mergedGeometry = mergeGeometries(geometries);
    mergedGeometry.computeBoundingBox();

    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3 });
    material.color.convertSRGBToLinear();

    const shapeMesh = new THREE.Mesh(mergedGeometry, material);

    let size

    if (figureParams.boolParams) {

      const { depth, position, rotate, type } = figureParams.boolParams;

      // Ротация
      if (type === 'rotate') {
        shapeMesh.rotation.set(rotate.x || 0, rotate.y || 0, rotate.z || 0);
      }

      const box = new THREE.Box3().setFromObject(shapeMesh);
      size = box.getSize(new THREE.Vector3());

      // Позиция
      shapeMesh.position.set(
        position.right ? -FASADE_WIDTH * 0.5 + (size.x * 0.5 + depth.offset || 0) :
          position.left ? FASADE_WIDTH * 0.5 - (size.x * 0.5 + depth.offset || 0) :
            position.centerHorizontal ? -size.z * 0.5 : 0,

        position.bottom ? -FASADE_HEIGHT * 0.5 + (size.x * 0.5 + depth.offset || 0) :
          position.top ? FASADE_HEIGHT * 0.5 - (size.x * 0.5 + depth.offset || 0) :
            position.centerVertical ? -size.z * 0.5 : 0,

        position.front ? FASADE_DEPTH * 0.5 + position.front :
          -FASADE_DEPTH * 0.5 + size.z
      );

      // Дополнительная ротация, если тип не "rotate"
      if (type !== 'rotate') {
        shapeMesh.rotation.set(
          rotate.x || shapeMesh.rotation.x,
          rotate.y || shapeMesh.rotation.y,
          rotate.z || shapeMesh.rotation.z
        );
      }

    } else {
      // Дефолтное значение для случая отсутствия boolParams
      const box = new THREE.Box3().setFromObject(shapeMesh);
      size = box.getSize(new THREE.Vector3());

      shapeMesh.rotation.y = -Math.PI;
      shapeMesh.position.z = -FASADE_DEPTH * 0.5 + size.z;
    }

    if (figureParams.topPosition) {
      shapeMesh.position.y = (FASADE_HEIGHT * 0.5) + figureParams.topPosition
    }

    shapeMesh.userData.fasadePosition = fasadePosition
    shapeMesh.userData.startSize = size

    // Дополнительная позиция
    if (figureParams.position) {
      const { x, y, z, inpostOffset = 0 } = figureParams.position;

      if (y) {
        switch (y) {
          case "inpostTop":
            shapeMesh.position.y = FASADE_HEIGHT * 0.5 - size.y * 0.5 - inpostOffset
            break
          case "inpostBottom":
            shapeMesh.position.y = -FASADE_HEIGHT * 0.5 + size.y * 0.5 + inpostOffset
            break
          default:
            shapeMesh.position.y += y;
            break
        }
      }
      if (x && typeof x !== 'string') shapeMesh.position.x += x;
      if (z && typeof z !== 'string') shapeMesh.position.z += z;
    }

    // Дополнительная ротация
    if (figureParams.rotation) {
      const { x, y, z } = figureParams.rotation;
      if (x) shapeMesh.rotation.x = x;
      if (y) shapeMesh.rotation.y = y;
      if (z) shapeMesh.rotation.z = z;
    }

    shapeMesh.position.z += FASADE_DEPTH + 4 /** Корректировка */

    return shapeMesh
  }

  private capsuleCreate(figureParams, fasadePosition) {

    let capsuleWidth

    switch (figureParams.length) {

      case 'FASADE_HEIGHT':

        capsuleWidth = fasadePosition.FASADE_HEIGHT - figureParams.padding * 2 - figureParams.radius;
        break;
      case 'FASADE_WIDTH':

        capsuleWidth = fasadePosition.FASADE_WIDTH - figureParams.padding * 2 - figureParams.radius;
        break;
      default:

        capsuleWidth = parseInt(figureParams.length)
    }

    // if (figureParams.pattern) {
    //   if (figureParams.pattern.rotation) {
    //     capsuleWidth = (((capsuleWidth * 0.5) / Math.sin(figureParams.pattern.rotation.z)) * 2)
    //   }
    // }

    if (figureParams.percent) {
      capsuleWidth *= figureParams.percent
    }

    const geometry = new THREE.CapsuleGeometry(figureParams.radius, capsuleWidth, figureParams.capSegments, figureParams.radialSegments);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.1 });
    const capsule = new THREE.Mesh(geometry, material)

    const box = new THREE.Box3().setFromObject(capsule)
    const vec = new THREE.Vector3();
    const size = box.getSize(vec);

    let position = { x: 0, y: 0, z: 0 }

    if (figureParams.position) {

      const { x, y, z } = figureParams.position;

      if (x) {
        switch (x) {
          case 'center':
            position.x = 0
            capsule.rotateY(Math.PI)
            break;
          case 'right':
            position.x = -fasadePosition.FASADE_WIDTH + (fasadePosition.FASADE_WIDTH * 0.5 + figureParams.radius * 2)
            break;
          case 'left':
            position.x = fasadePosition.FASADE_WIDTH - (fasadePosition.FASADE_WIDTH * 0.5 + figureParams.radius * 2)
            // capsule.rotateY(Math.PI)
            break;
          default:
            position.x = x
        }
      }

      if (y) {
        switch (y) {
          case 'center':
            position.y = fasadePosition.FASADE_HEIGHT * 0.5;
            break;
          case 'bottom':
            position.y = -fasadePosition.FASADE_HEIGHT * 0.5
            break;
          case 'top':
            position.y = fasadePosition.FASADE_HEIGHT
            break;
          default:
            position.y = y
            break;
        }
      }

      if (z) {
        switch (z) {
          case 'center':
            position.z = -fasadePosition.FASADE_DEPTH;
            break;
          default:
            position.z = z
        }
      }

    }

    switch (typeof figureParams.rotation) {
      case 'object':
        if (figureParams.rotation.x) {

          capsule.rotation.x = figureParams.rotation.x
        }
        if (figureParams.rotation.y) {

          capsule.rotation.y = figureParams.rotation.y
        }
        if (figureParams.rotation.z) {

          capsule.rotation.z = figureParams.rotation.z
        }
      case undefined:
        break
    }

    capsule.position.x = position.x
    capsule.position.y = position.y
    capsule.position.z = position.z

    if (figureParams.offsetX) {
      capsule.position.x += figureParams.offsetX
    }

    if (figureParams.offsetY) {
      capsule.position.y += figureParams.offsetY
    }

    capsule.position.z += fasadePosition.FASADE_DEPTH + 4

    capsule.userData.fasadePosition = fasadePosition

    capsule.userData.startSize = size


    return capsule;
  }

  private hendlesCreate(fasadePosition, millingData, object) {

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

  private extractShape(fasadePosition, data) {

    const { FASADE_DEPTH, FASADE_HEIGHT, FASADE_WIDTH } = fasadePosition

    let width = FASADE_WIDTH
    // const height = FASADE_HEIGHT * 0.60
    let height = FASADE_HEIGHT


    switch (data.type) {

      case 'capsule':

        let figureParams = this.matchesCondition(fasadePosition, data.capsuleParams.condition)

        if (!figureParams) return

        const params = data.capsuleParams;
        params.type = data.type

        return params;

      case 'svg':

        let svgParams = data.figureParams.map(item => {

          // console.log(item, '--ITEM')

          let figureParams = this.matchesCondition(fasadePosition, item.condition)

          if (!figureParams) return null;

          const { figure, hole, inpost } = item

          const { boolParams, pattern, position, rotation, pading } = figure


          if (inpost) {
            let { inpostOffset = 0 } = position;
            switch (inpost) {
              case "top":
                height = FASADE_HEIGHT * 0.6 - inpostOffset * 0.5
                break;
              case "bottom":
                height = FASADE_HEIGHT * 0.4 - inpostOffset * 0.5
                break;

            }
          }

          const shape = this.parseSVG(
            {
              svgStr: figure.svg,
              width: width * 0.5 + (figure.widthOffset || 0),
              height: height * 0.5 + (figure.heightOffset || 0),
              radius: figure.radius
            }
          );

          if (hole.svg.length > 0) {

            const holes = this.parseSVG(
              {
                svgStr: hole.svg,
                width: width * 0.5 + (hole.widthOffset || 0),
                height: height * 0.5 + (hole.heightOffset || 0),
                radius: figure.radius,
                isHole: true
              }
            );

            // console.log(holes, "HOLES")

            holes.forEach((hole, key) => {
              shape[key].userData.holes = [...hole.toShapes()]
              return
            });

          }

          if (boolParams) {

            let { depth } = boolParams

            if (boolParams?.type === 'rotate' && pattern) {
              data.extrudeSettings.depth = (((width * 0.5) / Math.sin(pattern.rotation.y)) * 2)
            }
            else {

              let extrudeSize = depth.size === 'FASADE_HEIGHT' ? height : depth.size === 'FASADE_WIDTH' ? width : 0

              data.extrudeSettings.depth = extrudeSize + depth.offset * 2 ||
                depth.size + depth.offset * 2 ||
                0
            }

          }

          if (pattern) {
            data.extrudeSettings.depth *= pattern.multiply
          }

          return {
            type: data.type,
            lib: data.lib,
            shape,
            extrudeSettings: data.extrudeSettings,
            topPosition: figure.topPosition,
            inpost,
            boolParams,
            pattern,
            position,
            rotation,
            pading
          };

        })

        return svgParams

    }

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

    while (/\(([^()]+)\)/g.test(svgStr)) {
      svgStr = svgStr.replace(/\(([^()]+)\)/g, (match, expr) => {
        // console.log("Внутреннее выражение:", expr);

        // Вычисляем значение текущего выражения
        // const computedValue = Math.floor(Math.abs(eval(expr))); // Обрабатываем выражение

        const computedValue = Math.floor(Math.abs(this.calculate(expr)))

        // console.log("Вычисленное значение:", computedValue);

        return computedValue.toString(); // Заменяем выражение на результат
      });
    }

    // Дополнительная обработка для вычислений без скобок (если нужно)

    svgStr = svgStr
      .split(/, | /)
      .map(item => item.includes(",") ? item.split(",").reduce((sum, val) => sum + parseFloat(val), 0) : item)
      .join(" ");

    // console.log(svgStr, 'svgStr после вычислений');

    // Парсим SVG через SVGLoader
    const paths = this.svgLoader.parse(svgStr).paths

    return paths;

  }

  private processMesh(mesh, brush_1, evaluator, csgStartGeometry, lib) {
    switch (lib) {
      case 'bvh': {
        const brush = new Brush(mesh.geometry, mesh.material);
        brush.position.copy(mesh.position);
        brush.updateMatrixWorld();
        this.result = evaluator.evaluate(brush_1, brush, SUBTRACTION);
        brush_1 = new Brush(this.result.geometry);

        break;
      }
      default:
        csgStartGeometry = csgStartGeometry.subtract(CSG.fromMesh(mesh));
        break;
    }
    return { brush_1, csgStartGeometry };
  }

  private calculate(expression) {
    try {
      const func = new Function("return " + expression);
      return func();
    } catch (error) {
      return "Недопустимое выражение!";
    }
  }

}
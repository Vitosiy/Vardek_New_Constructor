// @ts-nocheck 

import * as THREE from "three"
import { FBXLoader, GLTFLoader, ColladaLoader } from "three/examples/jsm/Addons.js";

export function expressionsReplace(obj, expressions) {

  if (!expressions || !Object.keys(expressions).length) return obj;

  var objStr = obj;

  // Преобразуем объект в строку, если это объект
  if (typeof obj == "object") {
    objStr = JSON.stringify(obj);
  }

  // Заменяем выражения
  Object.entries(expressions).forEach(([k, v]) => {
    if (typeof objStr != "number") {
      objStr = objStr.split(k).join(v);
    }
  });

  // Возвращаем объект или строку
  if (typeof obj == "object") {
    return JSON.parse(objStr);
  } else {
    return objStr;
  }
};

export function calculateUnionBoundingBox(group: any): THREE.Box3 | null {
  let boundingBox = new THREE.Box3();

  // Если у объекта есть геометрия
  if (group.geometry) {
    group.geometry.computeBoundingBox();

    // Проверяем на наличие валидного bounding box
    if (group.geometry.boundingBox) {
      const groupBoundingBox = group.geometry.boundingBox.clone();
      
      // Если bounding box не содержит значений Infinity
      if (!groupBoundingBox.min.equals(new THREE.Vector3(Infinity, Infinity, Infinity)) && 
          !groupBoundingBox.max.equals(new THREE.Vector3(-Infinity, -Infinity, -Infinity))) {
        boundingBox.copy(groupBoundingBox);
      }
    } else {
      return null;
    }
  }

  // Рекурсивно обрабатываем дочерние элементы
  for (let child of group.children) {
    const childBoundingBox = calculateUnionBoundingBox(child);

    // Объединяем bounding box только если результат не null
    if (childBoundingBox) {
      boundingBox.union(childBoundingBox);
    }
  }

  // Если у объекта нет геометрии, сохраняем объединённый bounding box
  if (!group.geometry) {
    group.unionBoundingBox = boundingBox;
  }

  // Если bounding box пустой, возвращаем null
  if (boundingBox.isEmpty()) {
    return null;
  }

  return boundingBox;
}

export class LoadFileCache {

  loadingManager: THREE.LoadingManager = new THREE.LoadingManager();
  DaeLoader: ColladaLoader = new ColladaLoader(this.loadingManager);
  GLTFLoader: GLTFLoader = new GLTFLoader(this.loadingManager);
  FBXLoader: FBXLoader = new FBXLoader(this.loadingManager);
  TextureLoader: THREE.TextureLoader = new THREE.TextureLoader(this.loadingManager)

  constructor() {

  }

  getData(url: string, type: string, callback: (object: any) => void) {
    let data
    if (url) {
      if (type == "" || type == "dae" || type == "DAE") {
        this.DaeLoader.load(url, function (collada) {
          data = collada;
          callback(data);
        });
      }
      if (type == "GLTF") {
        this.GLTFLoader.load(url, function (collada) {
          data = collada;
          callback(data);
        });
      }
      if (type == "FBX") {
        this.FBXLoader.load(url, function (FBX) {
          data = FBX;
          callback(data);
        });
      }

      if (type == "texture") {
        data = this.TextureLoader.load(url);
        data.encoding = self.encode;
        data.anisotropy = 10;
      }
    }

    console.log(data)

    return data;
  }
};
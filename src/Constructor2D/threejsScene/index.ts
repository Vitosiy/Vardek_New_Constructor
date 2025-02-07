//@ts-nocheck
import {
  // reactive,
  watch
} from 'vue';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { useSchemeTransition } from "@/store/canvasMerge/schemeTransition";

let 
  controls: any, 
  scene: any, 
  camera: any, 
  renderer: any;

const roomStore = useSchemeTransition();
const unwatchList = [];
// следим за добавлением нового объекта
unwatchList.push(
  watch(
    () => roomStore.SchemeTransitionData[0].size.walls.length, // Следим за длиной массива
    (newLength, oldLength) => {
      
      if (newLength > oldLength) {
        // Определяем, что добавлен новый объект
        const lastAddedObject = roomStore.SchemeTransitionData[0].size.walls[newLength - 1];
        
        if (lastAddedObject) {
          
          const newObject = JSON.parse(JSON.stringify(lastAddedObject));
          generateObject(newObject);

        }
      }
    },
    { deep: true } // Включаем глубокое слежение
  )
);

// отслеживаем изменения в объекте
interface Wall {
  id: string | number;
  width: number;
  height: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    _x: number;
    _y: number;
    _z: number;
  };
}

interface SchemeTransitionData {
  size: {
    walls: Wall[];
  };
}

interface RoomStore {
  SchemeTransitionData: SchemeTransitionData[];
}

unwatchList.push(
  watch(
    () => roomStore.SchemeTransitionData[0].size.walls.map((obj: Wall) => ({ ...obj })), // "Копируем" объекты для отслеживания
    (newVal: Wall[], oldVal: Wall[]) => {
      newVal.forEach((newObject, index) => {
        const oldObject = oldVal?.[index];
        
        if (oldObject && JSON.stringify(newObject) !== JSON.stringify(oldObject)) {
          
          const obj = JSON.parse(JSON.stringify(newObject));
          updateGeomytry( obj );

        }

      });
    },
    { deep: true } // Глубокое слежение за изменениями
  )
);

function generateObject(obj: any) {

  const object = obj;

  if (object) {
    const geometry = generateGeometry({x: 0, y: 0, z: 0}, object.width / 100, object.height / 100);
    const material = new THREE.MeshBasicMaterial({ color: 0x005500, side: THREE.DoubleSide });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(object.position.x / 100, object.position.y / 100, object.position.z / 100);
    // cube.position.set(1, 1, 1);
    cube.rotation.set(object.rotation._x, object.rotation._y, object.rotation._z);
    // debugger;
    cube.uuid = object.id;
    scene.add(cube);
  }
  
}

function updateGeomytry(obj: any) {
  
  roomStore.SchemeTransitionData[0].size.walls.forEach((wall: Wall) => {
    const object = JSON.parse(JSON.stringify(wall));
    const cube = scene.getObjectByProperty("uuid", object.id);
    if (cube) {
      scene.remove(cube);
      generateObject(object);
    }
  });

}

function generateGeometry(center: any, width: number, height: number) {

  // 1. вычисляем 2 точки от центра по ширине
  // 2. вычисляем 2 точки от центра по высоте
  // 3. рисуем прямоугольник по 4 точкам
  const shape = new THREE.Shape();

  shape.moveTo(center.x - width / 2, center.y - height / 2);
  shape.lineTo(center.x + width / 2, center.y - height / 2);
  shape.lineTo(center.x + width / 2, center.y + height / 2);
  shape.lineTo(center.x - width / 2, center.y + height / 2);
  shape.lineTo(center.x - width / 2, center.y - height / 2);

  const geometry = new THREE.ShapeGeometry(shape);
  
  return geometry;
}

function threejsScene() {

  // Создаем сцену
  scene = new THREE.Scene();

  // Создаем камеру
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000000); // Соотношение сторон 1:1 (300x300)
  camera.position.x = 0;
  camera.position.y = 50;
  camera.position.z = 50;
  camera.lookAt(0, 0, 0); // Направляем камеру на начало координат

  // Создаем рендерер и устанавливаем размер canvas 300x300
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(300, 300); // Устанавливаем размер canvas
  renderer.setClearColor(0xeeeeee); // Устанавливаем красный фон
  renderer.a

  // Назначаем стили через JS
  renderer.domElement.style.position = "fixed";
  renderer.domElement.style.bottom = "0px";
  renderer.domElement.style.left = "0px";
  renderer.domElement.style.border = "1px solid #222";
  renderer.domElement.style.zIndex = "9999"; // Устанавливаем z-index

  // Добавляем canvas на страницу
  document.body.appendChild(renderer.domElement);

  // Добавляем сетку
  const gridHelper = new THREE.GridHelper(10, 10); // Размер 10, делений 10
  gridHelper.scale.set(10, 10, 10); // Увеличиваем размер сетки в 10 раз
  scene.add(gridHelper);

  // Создаем геометрию и материал для куба
  // const geometry = new THREE.BoxGeometry();
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  // // Создаем меш (объект) и добавляем его на сцену
  // const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  // Подключаем OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);

  // Функция для анимации сцены
  const animate = () => {
    
    requestAnimationFrame(animate);
    controls.update(); // Обновляем контроллер
    renderer.render(scene, camera);

  };

  // Запускаем анимацию
  animate();
  
}

export {
  threejsScene
};
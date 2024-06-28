import './ThreeJs.css';

import { Canvas } from "@react-three/fiber";

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { GridHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls';
import { useEffect, useState, React } from 'react';
import ReactDOM from 'react-dom';
import { Box } from 'js-quadtree';
import { QuadTree, Point, Rectangle } from './QuadTree.js';
import { JsonQuadTree } from './JsonQuadTree.js';
import { TerrainBuilder } from './worker.js';
import { ClassificationColor } from './ClassificationColor.js';
import { BufferGeometry } from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { CustomThread, WorkerPool } from './webworker.js';
import { ChunckMapSet } from './chunkMapSet';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper.js';
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox.js';
import { renderDistanceValueOutput, sectorBoxDraw, pointSelectedFunction, isSinglePointSelect, pointGroupSelectedFunction } from '../../component/menu_content/menu_content.jsx';
export { returnedDots, realativeHeight, negativeRelaHeight, maxHeight, scene, jsonQuadTree, jsonMaterial, lasMaterial };



var camera, scene, renderer, dot, allPointsGeometry, allDots, materialParam, realativeHeight, negativeRelaHeight, maxHeight, selectedPoints;
//let responseArray = [];
//let rectangle = new Rectangle(0, 0, 100000, 100000);
//let quadTree = new QuadTree(rectangle, 1000);
let group = new THREE.Group();
var returnedDots, returnedGeometry;
var jsonQuadTree;

var webWorkerPool;
var chunckMapSet;

var lasMaterial;
var jsonMaterial;

var selectionBox;
var helper;
var controls;
var selectedGorupPoints;

const hdrSkybox = new URL('../img/skybox.hdr', import.meta.url);
const loader = new RGBELoader();
const sphereClicked = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 9, 5),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);

function Init() {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);


  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    5000
  );

  //const gridHelper = new THREE.GridHelper(size, divisions);
  //scene.add(gridHelper);

  //const orbit = new OrbitControls(camera,renderer.domElement);
  controls = new ArcballControls(camera, renderer.domElement, scene);
  controls.setGizmosVisible(false);
  controls.cursorZoom = true;
  //const controls = new MapControls( camera, renderer.domElement );
  //controls.enableDamping = true;

  //const axesHelper = new THREE.AxesHelper(5);
  //scene.add(axesHelper);

  const ambientLight = new THREE.AmbientLight(0xfafafa, 1);
  scene.add(ambientLight);

  camera.position.set(100, 100, 100);
  camera.layers.enable(1);
  controls.update();
  //scene.background = new THREE.Color(0x7393B3);

  loader.load(hdrSkybox, function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture
  });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);



  console.log("Cargado puntos");
  allPointsGeometry = new THREE.BufferGeometry();
  const fileName = 'chuncks';
  const jsonFile = importFile(require.context('../../data/chuncks/0/', false, /data.json/));
  console.log(jsonFile);
  let jsonChunck = jsonFile[0];
  const texture = importAll(require.context('../../texture', false, /\.png/));

  const dotGeometry = new THREE.BufferGeometry();

  //JSON

  returnedGeometry = new THREE.BufferGeometry();
  returnedGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(jsonChunck[0]), 3)
  );
  returnedGeometry.setAttribute(
    'intensity',
    new THREE.BufferAttribute(new Float32Array(jsonChunck[2]), 1)
  );
  returnedGeometry.setAttribute(
    'classification',
    new THREE.BufferAttribute(new Float32Array(jsonChunck[1]), 1)
  );
  returnedGeometry.computeBoundingBox();

  const textureBall = new THREE.TextureLoader().load(texture[0]);
  realativeHeight = returnedGeometry.boundingBox.max.y;
  negativeRelaHeight = 0.0;
  maxHeight = 2 * realativeHeight;
  materialParam = {

    materialThreshold: realativeHeight,
    negativeThreshold: negativeRelaHeight,
    isClassification: false,
    isIntensity: false,
    isRGB: false,
    maxHeight: maxHeight,
    pointSize: 1.0,
    r: 1.0,
    g: 1.0,
    b: 1.0,
    r2: 0.0,
    g2: 0.0,
    b2: 0.0,
    border: 0.0,
    isLasOnly: false,
    intensityRange: 65536.0,
  };
  jsonMaterial = new THREE.ShaderMaterial({

    uniforms: {
      maxHeight: { value: maxHeight },
      realativeHeight: { value: materialParam.materialThreshold },
      negativeRelaHeight: { value: materialParam.negativeThreshold },
      pointTexture: { value: textureBall },
      isClassification: { value: materialParam.isClassification },
      isIntensity: { value: materialParam.isIntensity },
      isRGB: { value: materialParam.isRGB },
      pointSize: { value: materialParam.pointSize },
      maxHeight: { value: materialParam.maxHeight },
      r: { value: materialParam.r },
      g: { value: materialParam.g },
      b: { value: materialParam.b },
      r2: { value: materialParam.r2 },
      g2: { value: materialParam.g2 },
      b2: { value: materialParam.b2 },
      border: { value: materialParam.border },
      isLasOnly: { value: materialParam.isLasOnly },
      classificationColors: {
        value: [
          new THREE.Color(82 / 255, 82 / 255, 82 / 255),
          new THREE.Color(183 / 255, 183 / 255, 183 / 255),
          new THREE.Color(138 / 255, 80 / 255, 55 / 255),
          new THREE.Color(30 / 255, 123 / 255, 18 / 255),
          new THREE.Color(47 / 255, 187 / 255, 29 / 255),
          new THREE.Color(67 / 255, 248 / 255, 44 / 255),
          new THREE.Color(61 / 255, 161 / 255, 208 / 255),
          new THREE.Color(255 / 255, 44 / 255, 22 / 255),
          new THREE.Color(255 / 255, 236 / 255, 0 / 255),
          new THREE.Color(0 / 255, 138 / 255, 229 / 255),
          new THREE.Color(255, 255 / 255, 255 / 255),
          new THREE.Color(208 / 255, 167 / 255, 78 / 255),
          new THREE.Color(0 / 255, 255 / 255, 204 / 255),
          new THREE.Color(187 / 255, 0 / 255, 255 / 255),
          new THREE.Color(4 / 255, 0 / 255, 255 / 255),
          new THREE.Color(255 / 255, 136 / 255, 0 / 255),
          new THREE.Color(255 / 255, 0 / 255, 149 / 255),
          new THREE.Color(199 / 255, 156 / 255, 78 / 255),
          new THREE.Color(148 / 255, 0 / 255, 37 / 255)
        ]
      },
      intensityRange: { value: materialParam.intensityRange }


    },
    vertexShader: `
      varying vec2 vertexUV;
      varying vec3 vertexNormal;
      varying vec3 vertexPosition;
      varying vec3 classificationColor;
      varying float intensityColor;
      uniform float intensityRange;
      
      uniform float pointSize;
      attribute vec3 classification;
      attribute float intensity;

			void main() {
        vertexPosition = position;
        vertexUV = uv;
        vertexNormal = normal;

        classificationColor = vec3(classification);
        intensityColor = intensity;

        gl_PointSize = pointSize;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position , 1.0);
			}
      `,
    fragmentShader: `
      uniform float maxHeight;
      uniform float realativeHeight;
      uniform float negativeRelaHeight;
      
      varying vec3 classificationColor;
      varying float intensityColor;


      uniform bool isClassification;
      uniform bool isIntensity;
      uniform bool isLasOnly;

      uniform float r;
      uniform float g;
      uniform float b;
      uniform float r2;
      uniform float g2;
      uniform float b2;
      uniform float border;


      varying vec2 vertexUV;
      varying vec3 vertexNormal;
      varying vec3 vertexPosition;

			void main() {
        vec3 value =  mix(vec3(r,g,b), vec3(r2,g2,b2), smoothstep(negativeRelaHeight, realativeHeight, vertexPosition.y));
        
        vec2 c = abs( gl_PointCoord - vec2( 0.5 ) ) * border;
        float f = step( c.x, 0.6 ) * step( c.y, 0.6 );
        if(isClassification){
            float r = classificationColor[0];
            float g = classificationColor[1];
            float b = classificationColor[2];
            gl_FragColor = vec4(mix(vec3(0.0,0.0,0.0),vec3(r,g,b),f), 1.0);
        }else if(isIntensity){
          gl_FragColor = vec4(mix(vec3(0.0,0.0,0.0),vec3(intensityColor, intensityColor, intensityColor),f), 1.0);
        }else {
          value = mix(vec3(0.0,0.0,0.0),value,f);
          gl_FragColor = vec4(value, 1.0);
        }
      }
      `
  });


  const colorMap = new Float32Array(256 * 3);
  const colorMapReserved = new ClassificationColor();
  for (let i = 0; i < 256; i++) {
    colorMap[i * 3] = colorMapReserved.getColor(i)[0] / 255;     // R
    colorMap[i * 3 + 1] = colorMapReserved.getColor(i)[1] / 255; // G
    colorMap[i * 3 + 2] = colorMapReserved.getColor(i)[2] / 255; // B
  }
  for (let i = 11; i < 256; i++) {
    colorMap[i * 3] = Math.floor(Math.random() * 255) / 255;     // R
    colorMap[i * 3 + 1] = Math.floor(Math.random() * 255) / 255; // G
    colorMap[i * 3 + 2] = Math.floor(Math.random() * 255) / 255; // B
  }

  lasMaterial = new THREE.ShaderMaterial({

    uniforms: {
      maxHeight: { value: maxHeight },
      realativeHeight: { value: materialParam.materialThreshold },
      negativeRelaHeight: { value: materialParam.negativeThreshold },
      pointTexture: { value: textureBall },
      isClassification: { value: materialParam.isClassification },
      isIntensity: { value: materialParam.isIntensity },
      isRGB: { value: materialParam.isRGB },
      pointSize: { value: materialParam.pointSize },
      maxHeight: { value: materialParam.maxHeight },
      r: { value: materialParam.r },
      g: { value: materialParam.g },
      b: { value: materialParam.b },
      r2: { value: materialParam.r2 },
      g2: { value: materialParam.g2 },
      b2: { value: materialParam.b2 },
      border: { value: materialParam.border },
      isLasOnly: { value: true },
      colorMap: {
        value: colorMap
      },
      intensityRange: { value: materialParam.intensityRange }


    },
    vertexShader: `
      varying vec2 vertexUV;
      varying vec3 vertexNormal;
      varying vec3 vertexPosition;
      varying vec3 classificationColor;
      varying vec4 rgbColor;
      varying float intensityColor;
      uniform float intensityRange;

      uniform float pointSize;
      uniform float colorMap[256];
      attribute float classification;
      attribute float intensity;
      attribute vec4 COLOR_0;

      void main() {
        vertexPosition = position;
        vertexUV = uv;
        vertexNormal = normal;
        int mapValue = int(classification*3.0);
        classificationColor = vec3(colorMap[mapValue],colorMap[mapValue+1],colorMap[mapValue+2]);
        intensityColor = intensity/intensityRange;
        rgbColor = COLOR_0;
      
        gl_PointSize = pointSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position , 1.0);
      }
      `,
    fragmentShader: `
      uniform float maxHeight;
      uniform float realativeHeight;
      uniform float negativeRelaHeight;
      
      varying vec3 classificationColor;
      varying float intensityColor;
      varying vec4 rgbColor;
      
      
      uniform bool isClassification;
      uniform bool isIntensity;
      uniform bool isRGB;
      uniform bool isLasOnly;
      
      uniform float r;
      uniform float g;
      uniform float b;
      uniform float r2;
      uniform float g2;
      uniform float b2;
      uniform float border;
      
      
      varying vec2 vertexUV;
      varying vec3 vertexNormal;
      varying vec3 vertexPosition;
      
      void main() {
        vec3 value =  mix(vec3(r,g,b), vec3(r2,g2,b2), smoothstep(negativeRelaHeight, realativeHeight, vertexPosition.y));
      
        vec2 c = abs( gl_PointCoord - vec2( 0.5 ) ) * border;
        float f = step( c.x, 0.6 ) * step( c.y, 0.6 );
        if(isClassification){
            float r = classificationColor[0];
            float g = classificationColor[1];
            float b = classificationColor[2];
            gl_FragColor = vec4(mix(vec3(0.0,0.0,0.0),vec3(r,g,b),f), 1.0);
        }else if(isIntensity){
          gl_FragColor = vec4(mix(vec3(0.0,0.0,0.0),vec3(intensityColor, intensityColor, intensityColor),f), 1.0);
        }else if(isRGB){
            float r = rgbColor[0]/255.0;
            float g = rgbColor[1]/255.0;
            float b = rgbColor[2]/255.0;
            float alpha = rgbColor[3]/255.0;
          gl_FragColor = vec4(r,g,b,alpha);
        }else {
          value = mix(vec3(0.0,0.0,0.0),value,f);
          gl_FragColor = vec4(value, 1.0);
        }
      }
      `
  });

  returnedDots = new THREE.Points(returnedGeometry, lasMaterial);

  jsonQuadTree = new JsonQuadTree(1, lasMaterial, scene, '0', undefined, fileName);
  jsonQuadTree.setChildFile();
  jsonQuadTree.setRoot(jsonQuadTree);
  jsonQuadTree.createTree();


  sphereClicked.layers.set(1);
  const raycaster = new THREE.Raycaster();
  raycaster.layers.set(0);
  //raycaster.params.Points.threshold = 0.1


  selectionBox = new SelectionBox(camera, scene);
  document.addEventListener('mousedown', onMouseDown);

  function onMouseMove(event) {
    if (!helper.isDown) {
      helper.pointBottomRight.set(event.clientX, event.clientY);
      selectionBox.endPoint.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5
      );
    }
  }

  function onMouseUp(event) {
    if (!helper.isDown) {
      selectedPoints = selectPoints(jsonQuadTree);
      helper.isDown = false;
      pointGroupSelectedFunction(selectedPoints);
    }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  function selectPoints(quadTree) {
    const selectedPoints = [];
    const frustum = new THREE.Frustum();
    const tmpPoint = new THREE.Vector3();
    const tmpMatrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

    frustum.setFromProjectionMatrix(tmpMatrix);
    const startX = Math.min(helper.pointTopLeft.x, helper.pointBottomRight.x);
    const endX = Math.max(helper.pointTopLeft.x, helper.pointBottomRight.x);
    const startY = Math.min(helper.pointTopLeft.y, helper.pointBottomRight.y);
    const endY = Math.max(helper.pointTopLeft.y, helper.pointBottomRight.y);

    let position;
    let points = [];
    let intersects = false;
    let positionArray, classificationArray, intensityArray, RGBaArray;
    if (quadTree.fileName) {
      if (quadTree.geometry) {
        positionArray = quadTree.geometry.attributes.position.array;
        classificationArray = quadTree.geometry.attributes.classification.array;
        intensityArray = quadTree.geometry.attributes.intensity.array;
        if (quadTree.geometry.attributes.COLOR_0) {
          RGBaArray = quadTree.geometry.attributes.COLOR_0.array;
        } else {
          RGBaArray = null;
        }
      }
    } else {
      positionArray = returnedDots.geometry.attributes.position.array;
      classificationArray = returnedDots.geometry.attributes.classification.array;
      intensityArray = returnedDots.geometry.attributes.intensity.array;
      if (returnedDots.geometry.attributes.COLOR_0) {
        RGBaArray = returnedDots.geometry.attributes.COLOR_0.array;
      } else {
        RGBaArray = null;
      }
    }


    for (let i = 0; i < positionArray.length / 3; i++) {
      tmpPoint.set(positionArray[i * 3], positionArray[i * 3 + 1], positionArray[i * 3 + 2]);
      tmpPoint.project(camera);

      const screenX = (tmpPoint.x * window.innerWidth) / 2 + window.innerWidth / 2;
      const screenY = -(tmpPoint.y * window.innerHeight) / 2 + window.innerHeight / 2;

      if (
        screenX >= startX &&
        screenX <= endX &&
        screenY >= startY &&
        screenY <= endY
      ) {
        points.push(i);
        intersects = true;
      }
    }
    if (intersects) {
      selectedPoints.push({ points, classificationArray, intensityArray, RGBaArray });
      if (quadTree.childrens) {
        quadTree.childrens.forEach(childNode => {
          selectedPoints.push(...selectPoints(childNode));
        });
      }
    }

    return selectedPoints;
  }

  function onMouseDown(event) {

    if (event.target.matches('canvas')) {
      if (isSinglePointSelect) {
        const coordinates = new THREE.Vector2(
          (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
          -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
        );
        raycaster.setFromCamera(coordinates, camera);

        const intesercts = raycaster.intersectObjects(scene.children, true);
        if (intesercts.length > 0) {

          try {

            if (intesercts[0].object.isPoints) {
              selectedPoints = [];
              scene.add(sphereClicked);
              const index = intesercts[0].index;
              const position = intesercts[0].object.geometry.attributes.position.array;

              sphereClicked.position.set(position[index * 3], position[index * 3 + 1], position[index * 3 + 2]);


              const classificationArray = intesercts[0].object.geometry.attributes.classification.array;
              const intensityArray = intesercts[0].object.geometry.attributes.intensity.array;
              let RGBaArray
              if (intesercts[0].object.geometry.attributes.COLOR_0) {
                RGBaArray = intesercts[0].object.geometry.attributes.COLOR_0.array;
              }
              let classifColor;
              let classType = classificationArray[index];
              if (intesercts[0].object.material.uniforms.isLasOnly.value) {
                classifColor = [colorMap[classType * 3] * 255, colorMap[classType * 3 + 1] * 255, colorMap[classType * 3 + 2] * 255];
              } else {
                classifColor = [classificationArray[index * 3] * 255, classificationArray[index * 3 + 1] * 255, classificationArray[index * 3 + 2] * 255];
              }

              intesercts[0].object.geometry.attributes.classification.needsUpdate = true;

              let points = []
              points.push(index);
              selectedPoints.push({ points, classificationArray, intensityArray, RGBaArray });

              pointSelectedFunction(intesercts[0].object, classifColor, intesercts[0].index);
            }
          } catch (error) {
            console.error(error);
            pointSelectedFunction(false);
          }


        } else {
          scene.remove(sphereClicked);
          pointSelectedFunction(false);
        }
      } else {
        helper.pointTopLeft.set(event.clientX, event.clientY);
        //helper.isDown = true;
        selectionBox.startPoint.set(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1,
          0.5
        );
        /*
        selectionBox.startPoint.set(
          (helper.pointTopLeft.x / window.innerWidth) * 2 - 1,
          -(helper.pointTopLeft.y / window.innerHeight) * 2 + 1,
          0.5
        );
        */
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    }
  }


  //scene.add(returnedDots);
  /*
  const gui = new GUI();
  const heighmapFolder = gui.addFolder('Límites del Heightmap');
  heighmapFolder.add(materialParam, 'materialThreshold', negativeRelaHeight, realativeHeight)
    .onChange(function () {
      returnedDots.material.uniforms.realativeHeight.value = materialParam.materialThreshold;
      returnedDots.material.uniforms.realativeHeight.needsUpdate =true;
      render();
    }).name("Limite positivo");
   
  heighmapFolder.add(materialParam, 'negativeThreshold', negativeRelaHeight, realativeHeight)
    .onChange(function () {
      returnedDots.material.uniforms.negativeRelaHeight.value = materialParam.negativeThreshold;
      returnedDots.material.uniforms.negativeRelaHeight.needsUpdate =true;
      render();
    }).name("Limite negativo");
   
   
  const pointFolder = gui.addFolder('Características de punto');
  pointFolder.add(materialParam, 'pointSize', 0.01, 10.0)
    .onChange(function () {
      returnedDots.material.uniforms.pointSize.value = materialParam.pointSize;
      render();
    }).name("Tamaño de punto");
   
  const pointFilterFolder = gui.addFolder('Otros filtros');
  pointFilterFolder.add(materialParam, 'isClassification')
    .onChange(function () {
      returnedDots.material.uniforms.isClassification.value = materialParam.isClassification;
      returnedDots.material.uniforms.isClassification.needsUpdate = true;
      render();
    }).name("Color Clasificacion");
   
  pointFilterFolder.add(materialParam, 'isIntensity')
    .onChange(function () {
      returnedDots.material.uniforms.isIntensity.value = materialParam.isIntensity;
      returnedDots.material.uniforms.isIntensity.needsUpdate = true;
      render();
    }).name("Color Intensidad");
   
   
  const allDotsFolder = gui.addFolder('Filtros todos los puntos');
  allDotsFolder.add(returnedDots, 'visible').name("Mostrar Puntos");
  allDotsFolder.add(returnedDots.geometry.drawRange, 'count', 0, returnedDots.geometry.attributes.position.count).name("Numero Puntos");
   
  const jsonFolder = gui.addFolder('JSON');
  pointFolder.open();
   
  */

  //chunckMapSet = new ChunckMapSet("0", jsonChunck);
  //webWorkerPool = new WorkerPool("checkDistance.js", jsonQuadTree);

  animate();

  async function animate() {
    requestAnimationFrame(animate);
    jsonQuadTree.traverseTree(camera.position, renderDistanceValueOutput, sectorBoxDraw);
    //jsonDraw();

    renderer.render(jsonQuadTree.scene, camera);
  }

  async function jsonDraw() {
    //promise = await jsonQTDistance(camera.position, returned, jsonQuadTree);
    //webWorkerPool.Enqueue({ object: jsonQuadTree, camera: camera.position});
    //webWorkerPool.Enqueue({ text: "Hola desde el principal", array: returned, object: jsonQuadTree, camera: camera.position });
    //worker.postMessage({ text: "Hola desde el principal", array: returned, object: jsonQuadTree, camera: camera.position });
    /*
    for (let index = 0; index < returned.length; index++) {
      const element = returned[index];
      //put = put.concat(element);
      pos = pos.concat(element[0]);
      int = int.concat(element[2]);
      classif = classif.concat(element[1]);
    }
   
    const positionAtributte = returnedDots.geometry.getAttribute('position');
   
    returnedDots.geometry.needsUpdate = true;
   
   
    const posAttrib = new THREE.BufferAttribute(new Float32Array(pos), 3);
    returnedDots.geometry.setAttribute("position", posAttrib);
    const posAttrib2 = new THREE.BufferAttribute(new Float32Array(int), 1);
    returnedDots.geometry.setAttribute("intensity", posAttrib2);
    const posAttrib3 = new THREE.BufferAttribute(new Float32Array(classif), 3);
    returnedDots.geometry.setAttribute("classification", posAttrib3);
    //const posAttrib = new THREE.BufferAttribute(new Float32Array(put), 3);
    //returnedDots.geometry.setAttribute("position", posAttrib);
    returnedDots.geometry.rotateX(-1.5708);
    returnedDots.geometry.computeBoundingSphere();
    returnedDots.geometry.needsUpdate = true;
   
   
   
   
    //worker.postMessage("start");
   
    /*
    worker.onmessage = (e) => {
      console.log("SALUDOS PEQUE");
   
    }
    */


    /*
    worker.onmessage = (msg) => {
      const posAttrib = new THREE.BufferAttribute(new Float32Array(msg.data.pos), 3);
      returnedDots.geometry.setAttribute("position", posAttrib);
      const posAttrib2 = new THREE.BufferAttribute(new Float32Array(msg.data.int), 1);
      returnedDots.geometry.setAttribute("intensity", posAttrib2);
      const posAttrib3 = new THREE.BufferAttribute(new Float32Array(msg.data.classif), 3);
      returnedDots.geometry.setAttribute("classification", posAttrib3);
      //const posAttrib = new THREE.BufferAttribute(new Float32Array(put), 3);
      //returnedDots.geometry.setAttribute("position", posAttrib);
      returnedDots.geometry.rotateX(-1.5708);
      returnedDots.geometry.computeBoundingSphere();
      returnedDots.geometry.needsUpdate = true;
    };
  */
  }
}

export async function restartTree(isSingle, file) {
  if (isSingle) {
    jsonQuadTree.disposeTree();
    jsonQuadTree = new JsonQuadTree(1, jsonQuadTree.material, scene, '0', undefined, null);
    jsonQuadTree.scene.remove(returnedDots);
    loadLasFile(file);
    jsonQuadTree.scene.add(returnedDots);
  } else {

    const fileName = file.path.split("/")[1];
    jsonQuadTree.disposeTree();
    jsonQuadTree = new JsonQuadTree(1, jsonQuadTree.material, scene, '0', undefined, fileName);
    jsonQuadTree.scene.remove(returnedDots);
    await jsonQuadTree.setChildFile();
    jsonQuadTree.setRoot(jsonQuadTree);
    jsonQuadTree.createTree();


    realativeHeight = jsonQuadTree.geometry.boundingBox.max.y;
    negativeRelaHeight = jsonQuadTree.geometry.boundingBox.min.y;
    jsonQuadTree.material.uniforms.negativeRelaHeight.value = negativeRelaHeight;
    jsonQuadTree.material.uniforms.negativeRelaHeight.needsUpdate = true;
    jsonQuadTree.material.uniforms.realativeHeight.value = realativeHeight;
    jsonQuadTree.material.uniforms.realativeHeight.needsUpdate = true;
  }
}

export function modificarClasificacion(clasificacionTipo, intensidadValor, valorColor, valorColorAlpha) {
  selectedPoints.forEach((index_geometry) => {

    index_geometry.points.forEach((point) => {
      index_geometry.classificationArray[point] = clasificacionTipo; // Update classification
      index_geometry.intensityArray[point] = intensidadValor;
      if (index_geometry.RGBaArray) {
        index_geometry.RGBaArray[4 * point] = valorColor.r;
        index_geometry.RGBaArray[4 * point + 1] = valorColor.g;
        index_geometry.RGBaArray[4 * point + 2] = valorColor.b;
        index_geometry.RGBaArray[4 * point + 3] = valorColorAlpha;
      }
    });
  });
  if (jsonQuadTree.fileName) {
    updateQuadtree(jsonQuadTree);
  } else {
    updateQuadtree(returnedDots);
  }
}

function updateQuadtree(quadTree) {
  if (!quadTree) return;
  if (quadTree.geometry) {
    quadTree.geometry.attributes.classification.needsUpdate = true;
    quadTree.geometry.attributes.intensity.needsUpdate = true;
    if (quadTree.geometry.attributes.COLOR_0) {
      quadTree.geometry.attributes.COLOR_0.needsUpdate = true;
    }

    if (quadTree.childrens) {
      quadTree.childrens.forEach(childNode => updateQuadtree(childNode));
    }
  }
}

function loadLasFile(file) {
  returnedGeometry = new THREE.BufferGeometry();
  let positions = file.attributes.POSITION.value;
  let intensity = file.attributes.intensity.value;
  let classification = file.attributes.classification.value;

  returnedGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );
  returnedGeometry.setAttribute(
    'intensity',
    new THREE.BufferAttribute(intensity, 1)
  );
  returnedGeometry.setAttribute(
    'classification',
    new THREE.BufferAttribute(classification, 1)
  );
  if (file.attributes.COLOR_0) {

    let rgb = file.attributes.COLOR_0.value;
    returnedGeometry.setAttribute(
      'COLOR_0',
      new THREE.BufferAttribute(rgb, 4)
    );
  }

  let referencePointx = returnedGeometry.getAttribute('position').array[0];
  let referencePointz = returnedGeometry.getAttribute('position').array[1];
  let referencePointy = returnedGeometry.getAttribute('position').array[2];
  returnedGeometry.translate(-referencePointx, -referencePointz, -referencePointy);

  returnedGeometry.rotateX(-1.5708);
  returnedGeometry.computeBoundingBox();
  returnedDots = new THREE.Points(returnedGeometry, lasMaterial);
  realativeHeight = returnedGeometry.boundingBox.max.y;
  negativeRelaHeight = returnedGeometry.boundingBox.min.y;
  returnedDots.material.uniforms.negativeRelaHeight.value = negativeRelaHeight;
  returnedDots.material.uniforms.negativeRelaHeight.needsUpdate = true;
  returnedDots.material.uniforms.realativeHeight.value = realativeHeight;
  returnedDots.material.uniforms.realativeHeight.needsUpdate = true;

}

export function changeSelectionType() {
  if (isSinglePointSelect) {
    sphereClicked.visible = true;
    helper.dispose();
    controls.enabled = true;
  } else {
    sphereClicked.visible = false;
    helper = new SelectionHelper(renderer, "selectBox");
    controls.enabled = false;
  }
}

export function setCameraPosition(center, offset, boundingBox) {
  camera.position.copy(offset);
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}


export function importAll(r) {
  let lasFiles = [];
  r.keys().map((item, index) => { lasFiles.push(r(item)); });
  return lasFiles;
}

export function importFile(r) {
  let lasFiles = {};
  r.keys().map((item, index) => {
    let fileName = new String(item);
    lasFiles[0] = r(item);
  });
  return lasFiles;
}
export function render() {
  renderer.render(scene, camera);
}

export function loadSkybox() {
  loader.load(hdrSkybox, function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture
  });
}

function ThreeJs() {
  return (
    <div>
      {Init()}
    </div>
  )
}

export default ThreeJs;
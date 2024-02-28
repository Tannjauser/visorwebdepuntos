import './ThreeJs.css';

import {Canvas} from "@react-three/fiber";

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { GridHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls';
import { GUI } from 'dat.gui';
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

export {returnedDots, realativeHeight, negativeRelaHeight, maxHeight};

var camera, scene, renderer, dot, allPointsGeometry, allDots, materialParam, realativeHeight, negativeRelaHeight, maxHeight;
let responseArray = [];
let rectangle = new Rectangle(0, 0, 100000, 100000);
let quadTree = new QuadTree(rectangle, 1000);
let group = new THREE.Group();
//let terrainBuilder = new TerrainBuilder();
let jsonQuadTree = new JsonQuadTree(1);
//let jsonQuadTree = terrainBuilder.QuadTree;
var returnedDots, returnedGeometry;
var promise = 0;

//const worker = new Worker("webworker.js");
//const worker = new Worker("worker.js", {type: 'module'});
var webWorkerPool;
var chunckMapSet;
//const webWorker = new CustomThread("webworker.js");
//const MyWorker = new Worker('webworker.js');
//const MyWorker = new Worker('./webworker.js');

function Init() {
  scene = new THREE.Scene();
  const canvas = document.querySelector('#c'); 

  //renderer = new THREE.WebGLRenderer({canvas, antialias: true});
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  
  
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    3500
  );
  const size = 10;
  const divisions = 10;

  //const gridHelper = new THREE.GridHelper(size, divisions);
  //scene.add(gridHelper);

  //const orbit = new OrbitControls(camera,renderer.domElement);
  const controls = new ArcballControls(camera, renderer.domElement, scene);
  //const controls = new MapControls( camera, renderer.domElement );
  //controls.enableDamping = true;

  //const axesHelper = new THREE.AxesHelper(5);
  //scene.add(axesHelper);

  const ambientLight = new THREE.AmbientLight(0xfafafa, 1);
  scene.add(ambientLight);

  camera.position.set(40, 30, 3);
  controls.update();
  scene.background = new THREE.Color(0x7393B3);

  //const response =  async () => await fetch(lasFile);
  //console.log(response());

  function loading() {
    console.log("loading...");
  }

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);



  console.log("Cargado puntos");
  allPointsGeometry = new THREE.BufferGeometry();

  const jsonFile = importFile(require.context('../../data/chuncks/0/', false, /data.json/));
  console.log(jsonFile);
  let jsonChunck = jsonFile[0];
  const texture = importAll(require.context('../../texture', false, /\.png/));

  const dotGeometry = new THREE.BufferGeometry();

  //JSON

  console.log(jsonChunck);
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
    new THREE.BufferAttribute(new Float32Array(jsonChunck[1]), 3)
  );
  returnedGeometry.computeBoundingBox();
  console.log(returnedGeometry);

  const textureBall = new THREE.TextureLoader().load(texture[0]);
  realativeHeight = returnedGeometry.boundingBox.max.z;
  negativeRelaHeight = 0.0;
  maxHeight = 2 * realativeHeight;
  materialParam = {

    materialThreshold: realativeHeight,
    negativeThreshold: negativeRelaHeight,
    isClassification: false,
    isIntensity: false,
    maxHeight: maxHeight,
    pointSize: 1.0,
  };
  const jsonMaterial = new THREE.ShaderMaterial({

    uniforms: {
      maxHeight: { value: maxHeight },
      realativeHeight: { value: materialParam.materialThreshold },
      negativeRelaHeight: { value: materialParam.negativeThreshold },
      pointTexture: { value: textureBall },
      isClassification: { value: materialParam.isClassification },
      isIntensity: { value: materialParam.isIntensity },
      pointSize: { value: materialParam.pointSize },
      maxHeight: { value: materialParam.maxHeight}
    },
    vertexShader: `
      varying vec2 vertexUV;
      varying vec3 vertexNormal;
      varying vec3 vertexPosition;
      varying vec3 classificationColor;
      varying float intensityColor;
      
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
      

      varying vec2 vertexUV;
      varying vec3 vertexNormal;
      varying vec3 vertexPosition;

			void main() {
        vec3 value =  smoothstep(negativeRelaHeight, realativeHeight, vertexPosition.y)*vec3(1.0,1.0,1.0) ;
        if(isClassification){
          float r = classificationColor[0];
          float g = classificationColor[1];
          float b = classificationColor[2];
          gl_FragColor = vec4(r,g,b, 1.0);
        }else if(isIntensity){
          gl_FragColor = vec4(intensityColor, intensityColor, intensityColor, 1.0);
        }else {
          gl_FragColor = vec4(value, 1.0);
        }
      }
      `
  });

  returnedDots = new THREE.Points(returnedGeometry, jsonMaterial);
  console.log(returnedDots)

  scene.add(returnedDots);
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

  chunckMapSet = new ChunckMapSet("0", jsonChunck);
  webWorkerPool = new WorkerPool("checkDistance.js", chunckMapSet, returnedDots);
  animate();
  
  async function animate() {
    requestAnimationFrame(animate);
    jsonDraw();
    render();
  }


  async function jsonDraw() {
    //promise = await jsonQTDistance(camera.position, returned, jsonQuadTree);
    webWorkerPool.Enqueue({ object: webWorkerPool._map, camera: camera.position});
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

function ThreeJs() {
    return (
      <div>
      {Init()}
    </div>
    )
}
  
  export default ThreeJs;
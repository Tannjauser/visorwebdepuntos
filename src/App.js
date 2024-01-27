import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { GridHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//import { LASLoader } from '@loaders.gl/las';
//import { forEach, load } from '@loaders.gl/core';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls';
import { GUI } from 'dat.gui';
//import { OctreeHelper, PointOctree, intersectOctree } from "sparse-octree";
import './App.css';

//import '../public/workerthread.js';
import { useEffect, useState, React } from 'react';
import ReactDOM from 'react-dom';
//import { QuadTree, Box, Point, Circle } from 'js-quadtree';
import { Box } from 'js-quadtree';
import { QuadTree, Point, Rectangle } from './QuadTree.js';
import { JsonQuadTree } from './JsonQuadTree.js';
import { TerrainBuilder } from './worker.js';
import { ClassificationColor } from './ClassificationColor.js';
import { BufferGeometry } from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
//const decompress = require("decompress");
//import {Worker} from './webworker';
import { CustomThread, WorkerPool } from './webworker.js';
import { ChunckMapSet } from './chunkMapSet';



import { Header } from './component/index.js';
import { ThreeJs } from './container/index.js';


var camera, scene, renderer, dot, allPointsGeometry, allDots;
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
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    3500
  );

  renderer = new THREE.WebGLRenderer();
  //renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(700, 400);
  
  document.querySelector('#canvas').appendChild( renderer.domElement );
  //document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  
  const size = 10;
  const divisions = 10;

  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);

  //const orbit = new OrbitControls(camera,renderer.domElement);
  const controls = new ArcballControls(camera, renderer.domElement, scene);
  //const controls = new MapControls( camera, renderer.domElement );
  controls.enableDamping = true;

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

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

  /*
  const getPointCloud = async (index, position0) => {
    const response = await fetch(bigFiles[index]);
    const data = await response.arrayBuffer();
    //READ POINTS
    console.log("LEYENDO PUNTOS");
    //const pointCloud = await load(data, LASLoader,{las:{skip:1,onProgress:loading()}});
    const pointCloud = await load(data, LASLoader);

    console.log("DONE");
    console.log(pointCloud);
    console.log(LASLoader);
    return pointCloud.attributes;




    /*
    dotGeometry.setAttribute(
      'position', 
      new THREE.BufferAttribute(new Float32Array(pointPos),3) 
      );
      */
  /*
 var dotGeometry = new THREE.BufferGeometry();
 dotGeometry.setFromPoints(pointVector);
 //dotGeometry.setAttribute('color', new THREE.Float32BufferedAttribute(colors,3))
 var dotMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
 var dot = new THREE.Points(dotGeometry, dotMaterial);
 */
  //scene.add(dot);

  //const results = quadTree.query(new Circle(150, 150, 100));

  /*
      //OCTREE
      console.log("OCTREE");
      const bbox = new THREE.Box3();
      bbox.setFromObject(dot);
  
  
      const octree = new PointOctree(bbox.min, bbox.max, 0.0, 8, 8);
      if(camera.position .)
      var counter = 0;
      console.log("CARGANDO PUNTOS");
  
      for (let vector of pointVector) {
        octree.set(vector, dot);
      }
  
      //scene.add(new OctreeHelper(octree));
  
      console.log("CARGANDO PUNTOS PARA EL DISPLAY");
      const octreeIterator = octree.leaves();
      const center = new THREE.Vector3();
      counter = 0;
      const pointsToDisplay = [];
      console.log(octree);
  
      //Nodes por nivel
      var LOD = 5;
      for (let i = LOD; i >= 0; i--) {
        const nodesLeveled = octree.findNodesByLevel(i);
        console.log("NODOS NIVEL" + i);
        for (let node of nodesLeveled) {
          if (node.data) {
            pointsToDisplay.push(...node.data.points);
          }
  
        }
      }
      
      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setFromPoints(pointsToDisplay);
      console.log(counter);
      console.log(pointsToDisplay.length);
  
      console.log(pointsToDisplay);
  
      var pointsMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
      var displayedPoints = new THREE.Points(pointsGeometry, pointsMaterial);
      scene.add(displayedPoints);
      }

  */
  const getJsonPointCloud = async (index) => {
    //const response = await fetch(files);
    //const data = await response.arrayBuffer();
    return [0, 0, 0];
  }


  const getReferencePoint = async () => {
    /*
    console.log("REFERENCIA");
    const response = await fetch(bigFiles[0]);
    const data = await response.arrayBuffer();
    const pointCloud = await load(data, LASLoader);
    let MyVector=[];

    let skip=(pointCloud.attributes.POSITION.value.length*0.001)/(pointCloud.attributes.POSITION.value.length);
    let counter = 1;
    for (let i = 0; i < pointCloud.attributes.POSITION.value.length; i+=3) {
      if(counter >=1){
        MyVector.push(pointCloud.attributes.POSITION.value[i]);
        MyVector.push(pointCloud.attributes.POSITION.value[i + 1]);
        MyVector.push(pointCloud.attributes.POSITION.value[i + 2]);
        counter=0;
      }
      counter+=skip;
    }

    //let arrayFloat=new Float32Array(pointCloud.attributes.POSITION.value);
    let arrayFloat=new Float32Array(MyVector);

    dotGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(arrayFloat, 3)
    );
    console.log(dotGeometry);
    dotGeometry.computeBoundingBox();
    console.log(dotGeometry);
    dotGeometry.center();
    console.log(dotGeometry);
    

    dotGeometry.rotateX(-1.5708);
    console.log(dotGeometry);
    //const pointArray = pointCloud.attributes.POSITION.value;
    const rectangle = new Rectangle(
      dotGeometry.boundingSphere.center.x,
      dotGeometry.boundingSphere.center.y,
      dotGeometry.boundingBox.max.x,
      dotGeometry.boundingBox.max.y,
      );
    dot = new THREE.Points(dotGeometry, dotMaterial);
    //dot.frustumCulled = false
    //console.log(pointArray);
    /*const z0 = pointArray[0];
    const x0 = pointArray[1];
    const y0 = pointArray[2];
    const position0 = [z0, x0, y0];
      return position0;
      */
    return [0, 0, 0];
  }



/*
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);

*/

  console.log("Cargado puntos");
  allPointsGeometry = new THREE.BufferGeometry();

  var promises = [];

  let referencePoint;
  //const files = importAll(require.context('./data/chuncks/', false, /\.las/));
  const jsonFile = importFile(require.context('./data/chuncks/0/', false, /data.json/));
  console.log(jsonFile);
  let jsonChunck = jsonFile[0];
  //const bigFiles = importAll(require.context('./data', false, /\.las/));
  const texture = importAll(require.context('./texture', false, /\.png/));

  const dotGeometry = new THREE.BufferGeometry();
  const dotMaterial = new THREE.PointsMaterial({ size: 0.01, color: 0xffffff });

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
  const realativeHeight = returnedGeometry.boundingBox.max.z;
  //const negativeRelaHeight = 0.0 - realativeHeight;
  const negativeRelaHeight = 0.0;
  const maxHeight = 2 * realativeHeight;
  var materialParam = {

    materialThreshold: realativeHeight,
    negativeThreshold: negativeRelaHeight,
    isClassification: false,
    isIntensity: false,

    pointSize: 1.0,
  };
  const jsonMaterial = new THREE.ShaderMaterial({

    uniforms: {
      //amplitude: { value: 1.0 },
      //color: { value: new THREE.Color( 0xffffff ) },
      maxHeight: { value: maxHeight },
      realativeHeight: { value: materialParam.materialThreshold },
      negativeRelaHeight: { value: materialParam.negativeThreshold },
      pointTexture: { value: textureBall },
      isClassification: { value: materialParam.isClassification },
      isIntensity: { value: materialParam.isIntensity },
      pointSize: { value: materialParam.pointSize }
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


  jsonQuadTree.insert(jsonChunck, '0');
  /*
  console.log(jsonFile);
  let i = 0;
  for (var key in jsonFile) {
    var value = jsonFile[key];
    jsonQuadTree.insert(value, key);
  }

  */

  scene.add(returnedDots);
  const gui = new GUI();
  const heighmapFolder = gui.addFolder('Límites del Heightmap');
  heighmapFolder.add(materialParam, 'materialThreshold', negativeRelaHeight, realativeHeight)
    .onChange(function () {
      returnedDots.material.uniforms.realativeHeight.value = materialParam.materialThreshold;
      render();
    }).name("Limite positivo");

  heighmapFolder.add(materialParam, 'negativeThreshold', negativeRelaHeight, realativeHeight)
    .onChange(function () {
      returnedDots.material.uniforms.negativeRelaHeight.value = materialParam.negativeThreshold;
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
      render();
    }).name("Color Clasificacion");

  pointFilterFolder.add(materialParam, 'isIntensity')
    .onChange(function () {
      returnedDots.material.uniforms.isIntensity.value = materialParam.isIntensity;
      render();
    }).name("Color Intensidad");


  const allDotsFolder = gui.addFolder('Filtros todos los puntos');
  allDotsFolder.add(returnedDots, 'visible').name("Mostrar Puntos");
  allDotsFolder.add(returnedDots.geometry.drawRange, 'count', 0, returnedDots.geometry.attributes.position.count).name("Numero Puntos");

  const jsonFolder = gui.addFolder('JSON');
  //jsonFolder.add(jsonDots, 'visible').name("Mostrar Puntos");
  //jsonFolder.add(jsonDots2, 'visible').name("Mostrar Puntos 2");
  /*
  pointFolder.add(dot.material.color, "g", 0, 1).name("dot green");
  pointFolder.add(dot.material.color, "b", 0, 1).name("dot blue");
  pointFolder.add(dot.geometry.drawRange,"count", 1, 10000).name("range");
  */
  pointFolder.open();


  console.log(scene);

  chunckMapSet = new ChunckMapSet("0", jsonChunck);
  webWorkerPool = new WorkerPool("checkDistance.js", chunckMapSet, returnedDots);
  animate();

  /*
    let pointCloudPromise = getPointCloud(2, referencePoint).then((response) => {
  
      //POSITION SETTING
      responseArray = response;
      //console.log(responseArray.classification);
      allPointsGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(responseArray.POSITION.value), 3)
      );
  
      
  
  
  
  
  
  
      /*
          for (var key in jsonDict) {
            var value = jsonDict[key];
            var LODgeometry = new THREE.BufferGeometry();
            LODgeometry.setAttribute(
              'position',
              new THREE.BufferAttribute(new Float32Array(value[0]), 3)
            );
            
            LODgeometry.rotateX(-1.5708);
            var LODpoints = new THREE.Points(LODgeometry, dotMaterial);
            var dimensions = value[3]
            console.log(dimensions);
            lod.addLevel(LODpoints, dimensions[2]*2);
          }
      
      
          console.log(lod)
          console.log(lod.getWorldPosition);
          //Create spheres with 3 levels of detail and create new LOD levels for them
          scene.add(lod);
      
      
          */

  /*
      //CLASSIFICATION SETTING
      let classificationColor = new ClassificationColor();
      let classificationArray = responseArray.classification.value;
      let classificationBuffered = [];
      let classificatedColor;
      for (let i = 0; i < classificationArray.length; i++) {
        classificatedColor = classificationColor.getColor(classificationArray[i]);
        classificationBuffered.push(classificatedColor[0] / 255, classificatedColor[1] / 255, classificatedColor[2] / 255);
  
      }
      console.log(classificationBuffered);
  
  
      allPointsGeometry.setAttribute(
        'classification',
        new THREE.BufferAttribute(new Float32Array(classificationBuffered), 3)
      );
  
  
      //INTENSITY SETTING
  
      let intensityArray = responseArray.intensity.value;
      console.log(intensityArray);
      let intensityBuffered = [];
      for (let i = 0; i < intensityArray.length; i++) {
        intensityBuffered.push(intensityArray[i] / 5000);
      }
  
      allPointsGeometry.setAttribute(
        'intensity',
        new THREE.BufferAttribute(new Float32Array(intensityBuffered), 1)
      );
  
      allPointsGeometry.center();
      allPointsGeometry.rotateX(-1.5708);
  
      //TRIMMED SETTING
  
      const textureBall = new THREE.TextureLoader().load(texture[0]);
      const realativeHeight = allPointsGeometry.boundingBox.max.y;
      const negativeRelaHeight = 0.0 - realativeHeight;
      console.log(negativeRelaHeight);
      const maxHeight = 2 * realativeHeight;
      console.log(maxHeight);
      var materialParam = {
  
        materialThreshold: realativeHeight,
        negativeThreshold: negativeRelaHeight,
        isClassification: false,
        isIntensity: false,
  
        pointSize: 1.0,
      };
      const material = new THREE.ShaderMaterial({
  
        uniforms: {
          //amplitude: { value: 1.0 },
          //color: { value: new THREE.Color( 0xffffff ) },
          maxHeight: { value: maxHeight },
          realativeHeight: { value: materialParam.materialThreshold },
          negativeRelaHeight: { value: materialParam.negativeThreshold },
          pointTexture: { value: textureBall },
          isClassification: { value: materialParam.isClassification },
          isIntensity: { value: materialParam.isIntensity },
          pointSize: { value: materialParam.pointSize }
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
  
      //allDots = new THREE.Points(allPointsGeometry, material);
      allDots = new THREE.Points(allPointsGeometry, material);
      dot = new THREE.Points(dotGeometry, material);
      //let trimmedPoints = new THREE.Points(trimmedGeometry, material);
      //scene.add(trimmedPoints);
      scene.add(dot);
      scene.add(allDots);
      allDots.visible = false;
      console.log(allDots);
  
  
  
      //GUI
  
  
      
  
  
      console.log(returnedDots);
      MyQuadtree();
      animate();
  
      //console.log(allPointsGeometry);
  
  
    });
    /*
    const referencePromise = getReferencePoint().then((response) => {
      referencePoint = response;
      //const quadTree = new QuadTree(new Box(resp[0]-referencePoint[1], minBox[1]-referencePoint[2], maxBox[0]-referencePoint[1], maxBox[1]-referencePoint[2]));
    
      for (let i = 0; i < files.length; i++) {
        promises.push(getPointCloud(i, referencePoint).then((response) => {
          for (let point of response) {
            positionArray.push(point);
          }
    
        }));
      }
    });
    */





  function MyQuadtree() {
    console.log(allPointsGeometry.getAttribute('position').array);
    console.log(quadTree);


    quadTree.__insert(allPointsGeometry.getAttribute('position').array, allPointsGeometry.getAttribute('classification').array, allPointsGeometry.getAttribute('intensity').array);
    console.log(dotGeometry);
    //dot.frustumCulled = false;
    console.log(dot);
    console.log(dotGeometry);

    /*
        const spawner = require('child_process').spawn;
        const test = "test";
        const python_process = spawner.spawn('python',['../backend/QuadTree.py', test]);
        python_process.stdout.on('data',(data)=>{
          console.log(data.toString());
        });
        */
  }

  async function animate() {
    requestAnimationFrame(animate);
    //renderer.render(scene, camera);
    //drawMyChuncks();

    jsonDraw();
    //worker.postMessage({Object: jsonQuadTree}, [jsonQuadTree]);
    //dot.geometry.attributes.size.needsUpdate = true;
    //controls.update();

    //dot.geometry.attributes.position.needsUpdate = true; // required after the first render
    //requestAnimationFrame(animate);
    //console.log(camera.position);
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }


  async function jsonQTDistance(camera, returned, jsonQuadTree) {
    jsonQuadTree.distance(camera, returned);
  }


  var posNOQT = [];
  var intNOQT = [];
  var classifNOQT = [];
  function jsonDrawNoQT() {

  }

  async function jsonDraw() {

    var returned = [];
    var pos = [], int = [], classif = [];

    //promise = await jsonQTDistance(camera.position, returned, jsonQuadTree);
    webWorkerPool.Enqueue({ text: "Hola desde el principal", object: chunckMapSet, camera: camera.position, pos: pos });
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


  let raycaster = new THREE.Raycaster();
  let vect = new THREE.Vector3(0, -1, 0);
  var cameraDirection = new THREE.Vector3();
  var testRaycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.1;

  function drawMyChuncks() {
    //let search = new Rectangle(camera.position.x, camera.position.z, 10, 10);
    const finalPoints = [];
    camera.getWorldDirection(cameraDirection);

    testRaycaster.set(camera.position, cameraDirection);
    raycaster.set(camera.position, vect);

    var inFrontOfCamera = new THREE.Vector3();
    var position = raycaster.ray.at(0, inFrontOfCamera);
    //let rectangleCamera = new Rectangle(position.x, position.z, 50, 50);
    let intersect = testRaycaster.intersectObject(allDots, false);
    if (intersect.length > 0) {
      if (intersect[0].distance < 200) {

        const classificationQuery = [];
        const intensityQuery = [];
        let rectangleCamera = new Rectangle(intersect[0].point.x, intersect[0].point.z, 25, 25);
        quadTree.query(rectangleCamera, finalPoints, classificationQuery, intensityQuery);
        dot.geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array(finalPoints), 3)
        );
        dot.geometry.setAttribute(
          'classification',
          new THREE.BufferAttribute(new Float32Array(classificationQuery), 3)
        );
        dot.geometry.setAttribute(
          'intensity',
          new THREE.BufferAttribute(new Float32Array(intensityQuery), 1)
        );
        //console.log(intersect[0]);
      }
      //dot.geometry.setDrawRange(0,200);
    } else {

      dot.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array([]), 3)
      );
    }
    //dot.geometry.getAttribute('position').array = new Float32Array(finalPoints);
    //console.log(dot.geometry);

    /*
    console.log(quadTree);
    let finalPoints = [];
   
    dot.needsUpdate = true;
    let search = new Rectangle(position.x, position.z, 100, 100);
    quadTree.query(search, finalPoints);
    dotGeometry.getAttribute('position').array = new Float32Array(finalPoints);
    dot.geometry.computeBoundingBox();
    dot.geometry.computeBoundingSphere();
    console.log(dot);
    
    //dotGeometry.computeBoundingSphere();
    
    //console.log(camera.position);
    //scene.add(dot);
    */

  }
}
/*

function drawChuncks() {
  let points = quadTree.query(new Box(camera.position.x, camera.position.y, 10, 10));
  console.log()
  dotGeometry.setFromPoints(points);
  dot = new THREE.Points(dotGeometry, dotMaterial);
  
}

function initChuncks() {
  if (positionArray.length == 1539378 && !done) {
    dotGeometry.setFromPoints(positionArray);
    dot = new THREE.Points(dotGeometry, dotMaterial);
    const bbox = new THREE.Box3();
    bbox.setFromObject(dot);
    console.log(bbox);
    let width = Math.abs(bbox.min.x - bbox.max.x);
    let height = Math.abs(bbox.min.y - bbox.max.y);
    
    boundingArea = new Box(bbox.min.x, bbox.min.y, width, height);
    console.log(boundingArea);
    const config = {
      capacity: 1000,            // Specify the maximum amount of point per node (default: 4)
      removeEmptyNodes: true,  // Specify if the quadtree has to remove subnodes if they are empty (default: false).
      // Specify a custom method to compare point for removal (default: (point1, point2) => point1.x === point2.x && point1.y === point2.y).   
    };
    console.log(positionArray);
    quadTree = new QuadTree(boundingArea, config);
    console.log(quadTree.insert(positionArray));
    done = true;

  }
}
*/

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

function App() {

  return (
    <div className="App" >
      <Header />
      <ThreeJs/>
    <div class="ui-layout-left">
      <Header />
		</div>

    </div>

  );

}

export default App;

import './ThreeJs.css';


import * as THREE from 'three';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls';
import { useEffect, useState, React } from 'react';
import { JsonQuadTree } from './JsonQuadTree.js';
import { ClassificationColor } from './ClassificationColor.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper.js';
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox.js';
import { renderDistanceValueOutput, sectorBoxDraw, pointSelectedFunction, isSinglePointSelect, pointGroupSelectedFunction, isMeasuredSelected, updateDistance } from '../../component/menu_content/menu_content.jsx';
export { returnedDots, realativeHeight, negativeRelaHeight, maxHeight, scene, jsonQuadTree, jsonMaterial, lasMaterial };



var camera, scene, renderer, materialParam, realativeHeight, negativeRelaHeight, maxHeight, selectedPoints;
var returnedDots, returnedGeometry;
var jsonQuadTree;

var lasMaterial;
var jsonMaterial;

var selectionBox;
var helper;
var controls;
var isShiftDown = false;

const hdrSkybox = new URL('../img/skybox.hdr', import.meta.url);
const loader = new RGBELoader();
const sphereClicked = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 9, 5),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
var measurePointArray = [];

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

  controls = new ArcballControls(camera, renderer.domElement, scene);
  controls.setGizmosVisible(false);
  controls.cursorZoom = true;


  const ambientLight = new THREE.AmbientLight(0xfafafa, 1);
  scene.add(ambientLight);

  camera.position.set(100, 100, 100);
  camera.layers.enable(1);
  controls.update();

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
  const fileName = 'chuncks';
  const jsonFile = importFile(require.context('../../data/chuncks/0/', false, /data.json/));
  let jsonChunck = jsonFile[0];
  const texture = importAll(require.context('../../texture', false, /\.png/));

  const dotGeometry = new THREE.BufferGeometry();

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


  selectionBox = new SelectionBox(camera, scene);
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('keyup', shiftUp);
  document.addEventListener('keydown', shiftDown);

  function shiftDown(event) {
    if (event.key === 'Shift') {
      isShiftDown = true;
    }
  }

  function shiftUp(event) {
    if (event.key === 'Shift') {
      isShiftDown = false;
    }
  }

  function onMouseMove(event) {
    if (!isShiftDown) return
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
    if (!isShiftDown || !helper.element) return
    if (!helper.isDown) {
      controls.enabled = true;
      selectedPoints = selectPoints(jsonQuadTree);
      helper.isDown = false;
      helper.element.classList.remove("selecting")
      pointGroupSelectedFunction(selectedPoints);
    }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  function onMouseDown(event) {
    if (!isShiftDown) return
    if (event.target.matches('canvas')) {

      if (isMeasuredSelected) {
        const coordinates = new THREE.Vector2(
          (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
          -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
        );
        raycaster.setFromCamera(coordinates, camera);

        const intesercts = raycaster.intersectObjects(scene.children, true);
        if (intesercts.length > 0) {
          try {
            if (intesercts[0].object.isPoints) {
              const sphereClicked = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 9, 5),
                new THREE.MeshBasicMaterial({ color: 0xFF0000 })
              );
              scene.add(sphereClicked);
              const index = intesercts[0].index;
              const position = intesercts[0].object.geometry.attributes.position.array;

              sphereClicked.position.set(position[index * 3], position[index * 3 + 1], position[index * 3 + 2]);
              if (measurePointArray.length >= 2) cleanSelectionMeasure();
              if (measurePointArray.length < 1) measurePointArray.push(sphereClicked);
              else {
                measurePointArray.push(sphereClicked);
                const material = new THREE.LineBasicMaterial({
                  color: 0x0000ff
                });

                let points = [];
                measurePointArray.forEach(point => {
                  points.push(point.position);
                })

                const geometry = new THREE.BufferGeometry().setFromPoints(points);

                const line = new THREE.Line(geometry, material);
                scene.add(line);
                measurePointArray.push(line);
                let pointDistance = measurePointArray[0].position.distanceTo(measurePointArray[1].position).toFixed(2) + "m";
                updateDistance(pointDistance)
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      } else if (isSinglePointSelect) {
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
        helper.element.classList.add("selecting")
        controls.enabled = false;
        helper.pointTopLeft.set(event.clientX, event.clientY);
        selectionBox.startPoint.set(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1,
          0.5
        );
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    }
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

    if (positionArray) {
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

  animate();

  async function animate() {
    requestAnimationFrame(animate);
    jsonQuadTree.traverseTree(camera.position, renderDistanceValueOutput, sectorBoxDraw);
    
    // Mostrar FPS en consola
    /*
    frames ++;
    const tiempo = performance.now();
    if ( tiempo >= tiempoPrevio + 1000 ) {
    	console.log( Math.round( ( frames * 1000 ) / ( tiempo - tiempoPrevio ) ) );
      frames = 0;
      tiempoPrevio = tiempo;
    }
    */
    renderer.render(jsonQuadTree.scene, camera);
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
      index_geometry.classificationArray[point] = clasificacionTipo;
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

  //Ajustar el mapa para que empiece en la posicion [0,0,0]
  let referencePointx = returnedGeometry.getAttribute('position').array[0];
  let referencePointz = returnedGeometry.getAttribute('position').array[1];
  let referencePointy = returnedGeometry.getAttribute('position').array[2];
  returnedGeometry.translate(-referencePointx, -referencePointz, -referencePointy); 
  
  //Rotacion del mapa para ajustar los ejes a la escena
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
  scene.remove(sphereClicked);
  cleanSelectionMeasure();
  if (isMeasuredSelected) {
    sphereClicked.visible = false;
  } else if (isSinglePointSelect) {
    scene.add(sphereClicked);
    sphereClicked.visible = true;
    if (helper) helper.dispose();
    controls.enabled = true;
  } else {
    sphereClicked.visible = false;
    helper = new SelectionHelper(renderer, "selectBox");
  }
}

function cleanSelectionMeasure() {
  for (let i = 0; i < measurePointArray.length; i++) {
    let pointMeasure = measurePointArray[i]
    pointMeasure.geometry.dispose();
    pointMeasure.material.dispose();
    scene.remove(pointMeasure);
  }
  measurePointArray = [];
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
      <div id="label" class="label hidden">TEST</div>
      <script src="https://threejs.org/build/three.min.js"></script>
    </div>
  )
}

export default ThreeJs;
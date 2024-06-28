import { useInsertionEffect } from "react";
import { Rectangle } from "./QuadTree";
import * as THREE from 'three';
import ThreeJs, { importFile } from './ThreeJs.jsx';

export class JsonQuadTree {
    constructor(maxPoints, jsonMaterial, scene, level, root, fileName) {
        this.maxPoints = maxPoints;
        this.points = [];
        this.divided = false;
        this.level = level;
        this.root = root
        this.pointObject = null;
        this.material = jsonMaterial;
        this.scene = scene;
        this.childrens = [];
        this.fileName = fileName;
    }

    setRoot(root) {
        this.root = root;
    }

    disposeTree() {
        this.childrens.forEach(async children => {
            children.disposeTree();
        });
        if (this.pointObject != null) {
            this.scene.remove(this.pointObject);
            this.pointObject.geometry.dispose();
        }
    }

    async createTree() {
        if (this.level.length < 6) {
            this.subdivide();
            this.childrens.forEach(async children => {
                await children.createTree();
            });
            /*
            await this.children1.createTree();
            await this.children2.createTree();
            await this.children3.createTree();
            await this.children4.createTree();
            */
        }

    }
    /*
        init(maxPoints, points, divided, level, intensity, classification,boundry, geometry,children1, children2, children3, children4, pointObject, jsonMaterial ) {
            this.maxPoints = maxPoints;
            this.points = points;
            this.divided = divided;
            this.level = level;
            this.intensity = intensity;
            this.classification=classification;
            this.boundry=boundry;
            this.geometry=geometry;
            this.children1=children1;
            this.children2=children2;
            this.children3=children3;
            this.children4=children4;
            this.pointObject=pointObject;
            this.material=jsonMaterial;
        }
        */

    insert(chunck, level) {
        if (this.points.length <= this.maxPoints && (this.level === level)) {
            this.boundry = chunck[3]; //Dimensiones del cuadrante
            this.geometry = new THREE.BufferGeometry();
            this.geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array(chunck[0]), 3)
            );
            this.geometry.setAttribute(
                'classification',
                new THREE.BufferAttribute(new Float32Array(chunck[1]), 1)
            );
            this.geometry.setAttribute(
                'intensity',
                new THREE.BufferAttribute(new Float32Array(chunck[2]), 1)
            );
            if (chunck[4]) {
                this.geometry.setAttribute(
                    'COLOR_0',
                    new THREE.BufferAttribute(new Float32Array(chunck[4]), 4)
                );
            }

            this.geometry.computeBoundingSphere();
            this.geometry.computeBoundingBox();
            this.pointObject = new THREE.Points(this.geometry, this.material);
            this.boxHelper = new THREE.BoxHelper(this.pointObject, 0xffff00);
            this.boxHelper.layers.set(1);
            this.scene.add(this.boxHelper);
            this.scene.add(this.pointObject);
            this.delete();
            this.deleteHelper();
            return true;
        }
        /*else {
            if (!this.divided) {
                this.subdivide();
            }
            if (this.continueOn(this.children1, level)) {
                this.children1.insert(chunck, level);
                return true;
            } else if (this.continueOn(this.children2, level)) {
                this.children2.insert(chunck, level);
                return true;
            } else if (this.continueOn(this.children3, level)) {
                this.children3.insert(chunck, level);
                return true;
            } else if (this.continueOn(this.children4, level)) {
                this.children4.insert(chunck, level);
                return true;
            }

        }
        */
    }

    continueOn(children, level) {
        let levelSubstringed = level.substring(0, children.level.length)
        if (children.level === levelSubstringed) {
            return true;
        }
        return false;
    }

    delete() {
        if (this.level !== '0') {
            this.pointObject.visible = false;
            this.pointObject.layers.set(1);
        }
    }

    deleteHelper() {
        this.boxHelper.visible = false;
    }

    show() {
        this.pointObject.visible = true;

        this.pointObject.layers.set(0);
    }

    showHelper() {
        this.boxHelper.visible = true;
    }
    /*
        distance(cameraPosition, returned) {
            if (this.points.length > this.maxPoints) {
                //let test = cameraPosition.distanceTo(this.geometry.boundingSphere.center);
                if (cameraPosition.distanceTo(this.geometry.boundingSphere.center) < this.boundry[2] ) {
                    if (this.divided) {
                        let childenReturned = [];
                        childenReturned.push(this.children1.distance(cameraPosition, returned));
                        childenReturned.push(this.children2.distance(cameraPosition, returned));
                        childenReturned.push(this.children3.distance(cameraPosition, returned));
                        childenReturned.push(this.children4.distance(cameraPosition, returned));
    
                        for (let index = 0; index < childenReturned.length; index++) {
                            const element = childenReturned[index];
                            if (element !== undefined) {
                                returned.push(element);
                            }
                        }
                    } else {
                        this.subdivide();
                    }
                    returned.push([this.points, this.intensity, this.classification, this.level]);
                    //returned.push(this.points)
                }
            }
        }
        */


    isSelectionBoxIn(startX, startY, endX, endY) {
        return true;

    }

    distance(cameraPosition) {
        if (this.points.length > this.maxPoints) {
            //let test = cameraPosition.distanceTo(this.geometry.boundingSphere.center);
            let distance = cameraPosition.distanceTo(this.pointObject.geometry.boundingSphere.center)
            if (distance < this.boundry[2] || distance < this.boundry[3]) {
                if (!this.divided) {
                    this.subdivide();
                }
                this.children1.checkInsideOfChunck(cameraPosition);
                this.children2.checkInsideOfChunck(cameraPosition);
                this.children3.checkInsideOfChunck(cameraPosition);
                this.children4.checkInsideOfChunck(cameraPosition);
            }
        }
    }

    traverseTree(cameraPosition, renderDistance, showHelper) {
        if (this.pointObject !== null) {

            //Mientras la distancia al centro sea más pequeño que el ancho o el alto del cuadrante, se entra en el hijo
            let distance = cameraPosition.distanceTo(this.pointObject.geometry.boundingSphere.center)
            if (distance < this.boundry[2] * renderDistance || distance < this.boundry[3] * renderDistance) {
                if (showHelper) this.showHelper();
                else this.deleteHelper();
                this.show();
                this.childrens.forEach(children => {
                    children.traverseTree(cameraPosition, renderDistance, showHelper);
                });
            }
            else {
                this.deleteHelper();
                this.delete();
            }
        }
    }

    async setChildFile(self) {
        //const jsonFile = await importAll(require.context('./data/chuncks/', false, levelRegex));
        //const jsonFile = await importFile(require.context('./data/chuncks/${self.level}/', false, /data.json/));
        /*
            await fetch('chuncks1/'+this.level+'/data.json',
               {headers: 
                   {'Content-Type': 'application/json','Accept': 'application/json'}
               }).then((response) => response.json())
               .then((value) =>{
                console.log(value);
               });
               
        */
        try {
            await fetch(this.fileName + '/' + this.level + '/data.json',
                {
                    headers:
                        { 'Content-Type': 'application/json', 'Accept': 'application/json' }
                }).then(async (response) => {
                    if (response.ok) {
                        response = await response.json();
                        this.insert(response, this.level);
                    } else {
                        delete this;
                    }
                });
        } catch {
            delete this;
        }
    }


    subdivide() {
        //const jsonFile = importFile(require.context('./data/chuncks/', false, levelRegex));
        //console.log(file);

        /*

        this.children1 = new JsonQuadTree(this.maxPoints, this.material, this.scene, this.level+1, this.root);
        //this.children1.level = this.level + 1;
        this.children1.setChildFile();

        this.children2 = new JsonQuadTree(this.maxPoints, this.material, this.scene, this.level+2, this.root);
        //this.children2.level = this.level + 2;
        this.children2.setChildFile();

        this.children3 = new JsonQuadTree(this.maxPoints, this.material, this.scene, this.level+3, this.root);
        //this.children3.level = this.level + 3;
        this.children3.setChildFile();

        this.children4 = new JsonQuadTree(this.maxPoints, this.material, this.scene, this.level+4, this.root);
        //this.children4.level = this.level + 4;
        this.children4.setChildFile();

        */
        this.childrens = [
            new JsonQuadTree(this.maxPoints, this.material, this.scene, this.level + 1, this.root, this.fileName),
            new JsonQuadTree(this.maxPoints, this.material, this.scene, this.level + 2, this.root, this.fileName),
            new JsonQuadTree(this.maxPoints, this.material, this.scene, this.level + 3, this.root, this.fileName),
            new JsonQuadTree(this.maxPoints, this.material, this.scene, this.level + 4, this.root, this.fileName)
        ]

        this.childrens.forEach(children => {
            children.setChildFile();
        });

        this.divided = true;
    }

    /*
    travelTo(level) {
        if(this.level===level){
            return this;
        }else{

            if(this.children1.level===level.slice(0,this.children1.level.length)){
                this.children1.travelTo(level);

            }else if(this.children2.level===level.slice(0,this.children2.level.length)){
                this.children2.travelTo(level);

            }else if(this.children3.level===level.slice(0,this.children3.level.length)){
                this.children3.travelTo(level);
                
            }else{
                this.children4.travelTo(level);
            }
        }
    }
    */

    /*
  subdivide() {

      this.children1 = new JsonQuadTree(this.maxPoints);
      this.children1.level = this.level + 1;

      this.children2 = new JsonQuadTree(this.maxPoints);
      this.children2.level = this.level + 2;

      this.children3 = new JsonQuadTree(this.maxPoints);
      this.children3.level = this.level + 3;

      this.children4 = new JsonQuadTree(this.maxPoints);
      this.children4.level = this.level + 4;
      this.divided = true;
  }
  */

}




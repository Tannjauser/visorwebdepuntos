import { useInsertionEffect } from "react";
import { Rectangle } from "./QuadTree";
import * as THREE from 'three';
import { importFile } from './ThreeJs.jsx';

export class JsonQuadTree {
    constructor(maxPoints) {
        this.maxPoints = maxPoints;
        this.points = [];
        this.divided = false;
        this.level = '0';
    }
    init(maxPoints, points, divided, level, intensity, classification,boundry, geometry,children1, children2, children3, children4 ) {
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
        


    }

    insert(chunck, level) {
        if (this.points.length < this.maxPoints && this.level === level) {
            this.points = chunck[0];
            this.intensity = chunck[1];
            this.classification = chunck[2];
            this.boundry = chunck[3];
            this.geometry = new THREE.BufferGeometry();
            this.geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array(this.points), 3)
            );
            this.geometry.computeBoundingSphere();
            return true;
        } /*else {
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

    getThreePoints(material) {
        return new THREE.Points(this.geometry, material);
    }

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
        await fetch('chuncks/' + this.level + '/data.json',
            {headers:
                { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            }).then(async (response) => {
                if (response.ok) {
                    response = await response.json();
                    this.insert(response, this.level);
                  }else{

                      throw new Error('Something went wrong');
                  }
            }).catch((error) => {
              });
    }


    subdivide() {
        //const jsonFile = importFile(require.context('./data/chuncks/', false, levelRegex));
        //console.log(file);


        this.children1 = new JsonQuadTree(this.maxPoints);
        this.children1.level = this.level + 1;
        this.children1.setChildFile();


        this.children2 = new JsonQuadTree(this.maxPoints);
        this.children2.level = this.level + 2;
        this.children2.setChildFile();

        this.children3 = new JsonQuadTree(this.maxPoints);
        this.children3.level = this.level + 3;
        this.children3.setChildFile();

        this.children4 = new JsonQuadTree(this.maxPoints);
        this.children4.level = this.level + 4;
        this.children4.setChildFile();
        
        this.divided = true;
    }

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




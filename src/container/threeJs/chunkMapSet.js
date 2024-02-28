
import { importFile } from './ThreeJs.jsx';
import * as THREE from 'three';

export class ChunckMapSet {
    constructor(initChunck, chunck) {
        let points = chunck[0];
        let classif = chunck[1];
        let intensity = chunck[2];
        let boundry = chunck[3];
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(points), 3)
        );
        geometry.computeBoundingSphere();
        let array = [geometry.boundingSphere.center, boundry, points,intensity,classif];
        this.chuncks = new Map([[initChunck, array]]);
        this.unusedChuncks = new Map();
        this.notFound = new Set();
    }


    delete(level) {
        if (level !== "0") {
            if (this.chuncks.has(level)) {
                this.chuncks.delete(level);
            }
        }

    }

    add(level) {
        if (!this.chuncks.has(level) && !this.notFound.has(level)) {
            if (this.unusedChuncks.has(level)) {
                this.chuncks.set(level, this.unusedChuncks.get(level));
                this.unusedChuncks.delete(level);
            } else {

                try {
                    this.setChildFile(level);

                } catch {

                }
            }
        }

    }
    async setChildFile(level) {
        try{

            await fetch('chuncks/' + level + '/data.json',
            {
                headers:
                { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            }).then(async (response) => {
                if (response.ok) {
                    response = await response.json();
                    this.insert(response, level);
                } else {
                    
                    this.notFound.add(level)
                }
            });
        } catch{
            this.notFound.add(level)
        }
    }
        
    insert(chunck, level) {
        let points = chunck[0];
        let classif = chunck[1];
        let intensity = chunck[2];
        //const pointsShared = new Float32Array( new SharedArrayBuffer(4 * points.lenght));
        let boundry = chunck[3];
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(points), 3)
        );
        geometry.computeBoundingSphere();
        let array = [geometry.boundingSphere.center, boundry, points,intensity,classif];
        this.chuncks.set(level, array);
        return true;
    }

}

import { importFile } from './App.js';
import * as THREE from 'three';

export class ChunckMapBuilder {
    constructor(initChunck, pointChunck) {
        const points = chunck[0];
        const boundry = chunck[3];
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(points), 3)
        );
        geometry.computeBoundingSphere();
        const array = [geometry, boundry, points];
        this.chuncks = new Map([[initChunck, array]]);
        this.unusedChuncks = new Map();
        this.notFound = new Set();
    }


    delete(level) {
        if (level !== "0") {
            if (this.chuncks.has(level)) {
                this.unusedChuncks.set(level, this.chuncks.get(level));
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
        const points = chunck[0];
        const classif = chunck[1];
        const intensity = chunck[2];
        const boundry = chunck[3];
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(points), 3)
        );
        geometry.computeBoundingSphere();
        const array = [geometry, boundry, points, classif, intensity];
        this.chuncks.set(level, array);
        return true;
    }

}
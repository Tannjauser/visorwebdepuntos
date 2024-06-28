import * as THREE from 'three';
let _IDs = 0;

let UPDATE_DELAY_MS = 100;
const _NUM_WORKERS = 1;
export class CustomThread {
    constructor(entry, workerPool) {
        this._worker = new Worker(entry, { type: 'module' });
        this._worker.onmessage = (e) => {
            this._OnMessage(e);
        };
        this._id = _IDs++;
        this._parent = workerPool;
    }

    _OnMessage(e) {
        this._parent._map = e.data.object;
        this._parent.finish(this, e.data.pointData, e.data.intensity, e.data.classif);
    }

    get id() {
        return this._id;
    }

    postMessage(s) {
        this._worker.postMessage(s);
    }
}

export class WorkerPool {
    constructor(entry, map) {
        this._workers = [...Array(_NUM_WORKERS)].map(_ => new CustomThread(entry, this));
        this._free = [...this._workers];
        this._busy = {};
        this._queue = [];
        this._map = map;
    }

    get length() {
        return this._workers.length;
    }

    get Busy() {
        return this._queue.length > 0 || Object.keys(this._busy).length > 0;
    }

    Enqueue(workItem) {
        if (this._queue.length < _NUM_WORKERS) {
            this._queue.push(workItem);
            this._PumpQueue();
        } else if (this._queue.length > 0) {
            this._PumpQueue();
        }
    }

    _PumpQueue() {
        if (this._free.length > 0 && this._queue.length > 0) {
            const w = this._free.pop();
            this._busy[w.id] = w;

            const workItem = this._queue.shift();
            w.postMessage(workItem);
        }
    }



    finish(w, pointData, intensity, classif) {
        //console.log(w);
        this._returnedDots.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pointData), 3));
        this._returnedDots.geometry.setAttribute("intensity", new THREE.BufferAttribute(new Float32Array(intensity), 1));
        this._returnedDots.geometry.setAttribute("classification", new THREE.BufferAttribute(new Float32Array(classif), 3));

        this._returnedDots.geometry.computeBoundingSphere();
        //this._returnedDots.geometry.rotateX(-1.5708);
        //this._returnedDots.geometry.computeBoundingSphere();
        this._returnedDots.geometry.needsUpdate = true;
        delete this._busy[w.id];
        this._free.push(w);
        this._PumpQueue();
    }

}





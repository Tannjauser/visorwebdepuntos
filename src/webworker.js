import * as THREE from 'three';
let _IDs = 0;


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
        //console.log(e);
        if (e.data.msg === "modify") {
            this._parent.add(e.data.addlevels, this);
        }
        this._parent.finish(this, e.data.pos);
    }

    /*
    _OnMessage(e) {
        const resolve = this._resolve;
        this._resolve = null;
        console.log(e);
        if (e.data.msg === "subdivide") {
            this._parent.subdivide(e.data.level);
        }
        this._parent.finish(this);
    }
    */

    get id() {
        return this._id;
    }

    postMessage(s) {
        this._worker.postMessage(s);
    }
}

export class WorkerPool {
    constructor(entry, map, returnedDots) {
        this._workers = [...Array(_NUM_WORKERS)].map(_ => new CustomThread(entry, this));
        this._free = [...this._workers];
        this._busy = {};
        this._queue = [];
        this._map = map;
        this._returnedDots = returnedDots;
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
        }else if(this._queue.length >0){
            this._PumpQueue();
        }
    }

    _PumpQueue() {
        if (this._free.length > 0 && this._queue.length > 0) {
            const w = this._free.pop();
            this._busy[w.id] = w;

            const workItem = this._queue.shift();
            //console.log(workItem);
            w.postMessage(workItem);
            /*, (v) => {
            console.log(v);
            delete this._busy[w.id];
            this._free.push(w);
            this._PumpQueue();
        });
        /*
        w.postMessage(workItem);
        delete this._busy[w.id];
        this._free.push(w);
        this._PumpQueue();
        */
        }
    }
    /*
    subdivide(level) {
        this._map.travelTo(level).subdivide();
    }
    */

    add(addlevels, deletelevels, w) {
        addlevels.forEach(level => {
            this._map.add(level);
        });
        /*
        deletelevels.forEach(level => {
            this._map.delete(level);
        });
        w.postMessage({draw:true,object:this._map});
*/
    }


    finish(w, pos) {
        //console.log(w);
        this._returnedDots.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
        //this._returnedDots.geometry.rotateX(-1.5708);
        //this._returnedDots.geometry.computeBoundingSphere();
        this._returnedDots.geometry.needsUpdate = true;
        delete this._busy[w.id];
        this._free.push(w);
        //this._PumpQueue();
    }

}





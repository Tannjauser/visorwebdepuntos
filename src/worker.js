
const _NUM_WORKERS = 6;
let _IDs = 0;
export class TerrainBuilder {
  constructor(params) {
    this.pool = {};
    this.workerpool = new WorkerThreadPool(_NUM_WORKERS,"worker.js");
    this.params = params;
  }
  _OnResult(chunk, msg) {
    console.log(msg)
  }

  llamadaAWorker(params){
    const threadedParams = {
      noiseParams: params.noiseParams,
      colourNoiseParams: params.colourNoiseParams,
      biomesParams: params.biomesParams,
      colourGeneratorParams: params.colourGeneratorParams,
      heightGeneratorsParams: params.heightGeneratorsParams,
      width: params.width,
      offset: [params.offset.x, params.offset.y, params.offset.z],
      radius: params.radius,
      resolution: params.resolution,
      worldMatrix: params.group.matrix,
    };

    const msg = {
      subject: 'distance',
      params: threadedParams
    }

    this.workerpool.Enqueue(msg, (m) => {
      this._OnResult(m)
    });
    
  }

  get Busy() {
    return this._workerPool.Busy;
  }
}


class WorkerThread {
  constructor(s) {
    this._worker = new Worker(s, { type: 'module' });
    this._worker.onmessage = (e) => {
      this._OnMessage(e);
    };
    this._resolve = null;
    this._id = _IDs++;
  }

  _OnMessage(e) {
    const resolve = this._resolve;
    this._resolve = null;
  }

  get id() {
    return this._id;
  }

  postMessage(s, resolve) {
    this._resolve = resolve;
    this._worker.postMessage(s);
  }
}

class WorkerThreadPool {
  constructor(sz, entry) {
    this._workers = [...Array(sz)].map(_ => new WorkerThread(entry));
    this._free = [...this._workers];
    this._busy = {};
    this._queue = [];
  }

  get length() {
    return this._workers.length;
  }

  get Busy() {
    return this._queue.length > 0 || Object.keys(this._busy).length > 0;
  }

  Enqueue(workItem, resolve) {
    this._queue.push([workItem, resolve]);
    this._PumpQueue();
  }

  _PumpQueue() {
    while (this._free.length > 0 && this._queue.length > 0) {
      const w = this._free.pop();
      this._busy[w.id] = w;

      const [workItem, workResolve] = this._queue.shift();

      w.postMessage(workItem, (v) => {
        console.log("busy?")
        delete this._busy[w.id];
        this._free.push(w);
        workResolve(v);
        this._PumpQueue();
      });
    }
  }
}
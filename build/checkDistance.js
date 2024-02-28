import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';

onmessage = async (e) => {
        let addLevels=[];
        let pointData = [];
        let intensity=[];
        let classif=[];
        let chunckMap;
        let chunckMapSize = e.data.object.chuncks.size;
        //console.log(e);
        for (const [key, value] of e.data.object.chuncks.entries()) {
            if (distanceTo(value[0], e.data.camera) < value[1][2] * 1.5) {
                chunckMap = e.data.object;
                pointData = pointData.concat(value[2]);
                intensity = intensity.concat(value[3]);
                classif = classif.concat(value[4]);
    
                chunckMap = await add(chunckMap, key + "1");
                chunckMap =await add(chunckMap, key + "2");
                chunckMap =await add(chunckMap, key + "3");
                chunckMap =await add(chunckMap, key + "4");
            } else {
                deleteLevel(e.data.object, key);
            }
        }
        /*
        e.data.object.chuncks.forEach( function (value, key) {
            if (distanceTo(value[0], e.data.camera) < (value[1])[2] * 1.5) {
                chunckMap = e.data.object;
                pointData = pointData.concat(value[2]);
                intensity = intensity.concat(value[3]);
                classif = classif.concat(value[4]);
                //console.log("HOLA");
                add(chunckMap,key+"1")
                 add(chunckMap,key+"2")
                 add(chunckMap,key+"3")
                 add(chunckMap,key+"4")
                /*
                if(add(e.data.object,key+"1")){
                    addLevels.push(key+"1");
                }
                if(add(e.data.object,key+"2")){
                    addLevels.push(key+"2");
                }
                if(add(e.data.object,key+"3")){
                    addLevels.push(key+"3");
                }
                if(add(e.data.object,key+"4")){
                    addLevels.push(key+"4");
                }
                */
                /*
                if(!e.data.object.chuncks.has(key+"1") || ){
                    addLevels.push(key+"1");
                }if(!e.data.object.chuncks.has(key+"2")){
                    addLevels.push(key+"2");
                }if(!e.data.object.chuncks.has(key+"3")){
                    addLevels.push(key+"3");
                }if(!e.data.object.chuncks.has(key+"4")){
                    addLevels.push(key+"4");
                }
                */
        
            postMessage({pointData: pointData, intensity: intensity, classif: classif, object: chunckMap});


}

function distanceTo(v, other) {

    return Math.sqrt(distanceToSquared(v, other));

}
function distanceToSquared(v, other) {

    const dx = other.x - v.x, dy = other.y - v.y, dz = other.z - v.z;

    return dx * dx + dy * dy + dz * dz;

}
function draw(chuncks) {
    let pointData = [];

    chuncks.forEach(function (value) {
        pointData = pointData.concat(value[2]);
    });

    return pointData;
}
/*
function add(chuncksMap,level) {
    if (!chuncksMap.chuncks.has(level) && !chuncksMap.notFound.has(level)) {
        if (chuncksMap.unusedChuncks.has(level)) {
            chuncksMap.chuncks.set(level, chuncksMap.unusedChuncks.get(level));
            chuncksMap.unusedChuncks.delete(level);
            return false;
        } else {
            return true;
        }
    }
    return false;
}
*/

async function add(chuncksMap, level) {
    if (!chuncksMap.chuncks.has(level) && !chuncksMap.notFound.has(level)) {
        if (chuncksMap.unusedChuncks.has(level)) {
            chuncksMap.chuncks.set(level, chuncksMap.unusedChuncks.get(level));
            chuncksMap.unusedChuncks.delete(level);
        } else {
            try{
                const response = setChildFileWork(chuncksMap,level);
                chuncksMap = response;
            }catch(error){
            }
        }
    }
    return chuncksMap;

}

function deleteLevel(chuncksMap, level) {
    if (level !== "0") {
        if (chuncksMap.chuncks.has(level)) {
            chuncksMap.unusedChuncks.set(level, chuncksMap.chuncks.get(level));
            chuncksMap.chuncks.delete(level);
        }
    }

}

async function setChildFileWork(chuncksMap,level) {
    try{
         let response = await fetch('chuncks/' + level + '/data.json', {
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        });
        if(!response.ok){
            throw new Error("Failed to fetch");
        }
        
        const data = await response.json();
        chuncksMap = insert(data, level,chuncksMap);
        return chuncksMap;
    } catch{
        chuncksMap.notFound.add(level)
        return chuncksMap;
    }
}

function insert(chunck, level,chuncksMap) {
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
    chuncksMap.chuncks.set(level, array);
    return chuncksMap;
}
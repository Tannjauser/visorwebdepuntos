onmessage = (e) => {
        const addLevels=[];
        var pos = [];
        //console.log(e);
        e.data.object.chuncks.forEach(function (value, key) {
           // console.log(value);
            if (distanceTo(value[0].boundingSphere.center, e.data.camera) < (value[1])[2] * 1.5) {
                pos = pos.concat(value[2]);
                //console.log("HOLA");
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
            } else {
               deleteLevel(e.data.object,key);
            }
        });
        if(addLevels.size===0){
            postMessage("finish");
        }else{
            postMessage({msg:"modify", addlevels: addLevels, pos: pos});
        }


}

function distanceTo(v, other) {

    return Math.sqrt(distanceToSquared(v, other));

}
function distanceToSquared(v, other) {

    const dx = other.x - v.x, dy = other.y - v.y, dz = other.z - v.z;

    return dx * dx + dy * dy + dz * dz;

}
function draw(chuncks) {
    var pos = [];

    chuncks.forEach(function (value, key) {
        pos = pos.concat(value[2]);
    });

    return pos;
}
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

function deleteLevel(chuncksMap, level) {
    if (level !== "0") {
        if (chuncksMap.chuncks.has(level)) {
            chuncksMap.unusedChuncks.set(level, chuncksMap.chuncks.get(level));
            chuncksMap.chuncks.delete(level);
        }
    }

}
onmessage = (e) => {
    console.log(e);

    var pos = [], int = [], classif = [], returned = [];

    try {
        distance(e.data.object, e.data.array, e.data.camera);

        for (let index = 0; index < returned.length; index++) {
            const element = returned[index];
            //put = put.concat(element);
            pos = pos.concat(element[0]);
            int = int.concat(element[2]);
            classif = classif.concat(element[1]);
        }
        console.log(pos);
        postMessage({ pos: pos, int: int, classif: classif });
    } catch {
        postMessage({ msg: "error" });
    }


}


function distance(qt, returned, cameraPosition) {
    if (qt.points.length > qt.maxPoints) {
        if (distanceTo(qt.geometry.boundingSphere.center, cameraPosition) < qt.boundry[2]) {
            if (qt.divided) {
                let childenReturned = [];
                childenReturned.push(qt.children1.distance(cameraPosition, returned));
                childenReturned.push(qt.children2.distance(cameraPosition, returned));
                childenReturned.push(qt.children3.distance(cameraPosition, returned));
                childenReturned.push(qt.children4.distance(cameraPosition, returned));

                for (let index = 0; index < childenReturned.length; index++) {
                    const element = childenReturned[index];
                    if (element !== undefined) {
                        returned.push(element);
                    }
                }
            } else {
                postMessage({ msg: "subdivide", level: qt.level });
            }
            returned.push([qt.points, qt.intensity, qt.classification, qt.level]);
            //returned.push(this.points)

        }
    }

}


function distanceTo(v, other) {

    return Math.sqrt(distanceToSquared(v, other));

}
function distanceToSquared(v, other) {

    const dx = other.x - v.x, dy = other.y - v.y, dz = other.z - v.z;

    return dx * dx + dy * dy + dz * dz;

}
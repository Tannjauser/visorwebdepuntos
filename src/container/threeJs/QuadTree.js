import { Vector3 } from "three";

export class Point{
    constructor(x, y, z, r, g , b, intensity){
        this.x = x;
        this.y = y;
        this.z = z;
        this.r = r;
        this.g = g;
        this.b = b;
        this.intensity = intensity;
    }
}

export class Rectangle {

    constructor(x, z, width, height) {
        this.x = x;
        this.z = z;
        this.width = width;
        this.height = height;
    }

    contains(point) {
        return (
            point.x >= this.x - this.width &&
            point.x <= this.x + this.width &&
            point.z >= this.z - this.height &&
            point.z <= this.z + this.height
        );
    }

    intersects(range) {
        return !(range.x - range.width > this.x + this.width ||
            range.x + range.width < this.x - this.width ||
            range.z - range.height > this.z + this.height ||
            range.z + range.height < this.z - this.height);
    }

    distanceToCenter(x, z) {
        return Math.sqrt(((x - this.x) ** 2) + ((z - this.z) ** 2));
    }
}

export class QuadTree {

    constructor(bounds, maxPoints) {
        this.bounds = bounds;
        this.maxPoints = maxPoints;
        this.points = [];
        this.divided = false;
        this.level = 0;
    }



    query(range, found, classification,intensity) {
        if (!this.bounds.intersects(range)) {
        }else{

            for (let p of this.points) {
                if (range.contains(p)) {
                    found.push(p.x);
                    found.push(p.y);
                    found.push(p.z);
                    classification.push(p.r);
                    classification.push(p.g);
                    classification.push(p.b);
                    intensity.push(p.intensity);
                }
            }
            
            if (this.divided) {
                this.northwest.query(range, found,classification, intensity);
                this.northeast.query(range, found,classification, intensity);
                this.southwest.query(range, found,classification, intensity);
                this.southeast.query(range, found,classification, intensity);
            }
            return;
        }

    }



    subdivide() {
        let x = this.bounds.x;
        let z = this.bounds.z;
        let width = this.bounds.width;
        let height = this.bounds.height;

        let nw = new Rectangle(x + width / 2, z - height / 2, width / 2, height / 2);
        this.northwest = new QuadTree(nw, this.maxPoints);
        this.northwest.level = this.level + 1;

        let ne = new Rectangle(x - width / 2, z - height / 2, width / 2, height / 2);
        this.northeast = new QuadTree(ne, this.maxPoints);
        this.northeast.level = this.level + 1;

        let sw = new Rectangle(x + width / 2, z + height / 2, width / 2, height / 2);
        this.southwest = new QuadTree(sw, this.maxPoints);
        this.southwest.level = this.level + 1;

        let se = new Rectangle(x - width / 2, z + height / 2, width / 2, height / 2);
        this.southeast = new QuadTree(se, this.maxPoints);
        this.southeast.level = this.level + 1;
        this.divided = true;
    }

    __insert(vector, classificationVector, intensityArray) {
        var j=0;
        for (let index = 0; index < vector.length; index += 3) {
            this.insert(new Point(vector[index], vector[index + 1], vector[index + 2],classificationVector[index], classificationVector[index + 1], classificationVector[index + 2],intensityArray[j]));
            j++;
        }
    }

    /*
    insert(point) {
        if (!this.bounds.intersects(point)) {
            return false;
        }
        if (this.divided && this.level < this.maxLevel) {
            if (this.northeast.insert(point)) {
                return true;
            } else if (this.northwest.insert(point)) {
                return true;
            } else if (this.southeast.insert(point)) {
                return true;
            } else if (this.southwest.insert(point)) {
                return true;
            }
        }
        if (this.points.length === this.maxPoints && this.level < this.maxLevel) {
            if (!this.divided) {
                this.subdivide();
            }
            if (this.northeast.insert(point)) {
            } else if (this.northwest.insert(point)) {
            } else if (this.southeast.insert(point)) {
            } else if (this.southwest.insert(point)) {
            }

        } else {
            this.points.push(point);

            if (this.points.length > this.maxPoints) {
                if (!this.divided && this.level < this.maxLevel) {
                    this.subdivide();
                    if (this.northeast.__insert(this.points)) {
                    } else if (this.northwest.__insert(this.points)) {
                    } else if (this.southeast.__insert(this.points)) {
                    } else if (this.southwest.__insert(this.points)) {
                    }
                    this.points = [];
                    return true;
                } else if (this.level >= this.maxLevel) {

                }
                /*
                for (let i = 0; i < this.points.length; i++) {
                    if (this.northeast.insert(this.points[i])) {
                    } else if (this.northwest.insert(this.points[i])) {
                    } else if (this.southeast.insert(this.points[i])) {
                    } else if (this.southwest.insert(this.points[i])) {
                    }
    
                }
                



            }
        }
        return true;
    }
    */


    
        insert(point) {
            if (!this.bounds.contains(point)) {
                return false;
            }
            if (this.points.length < this.maxPoints) {
                this.points.push(point);
                return true;
            } else {
                if (!this.divided) {
                    this.subdivide();
                }
                if (this.northeast.insert(point)) {
                    return true;
                } else if (this.northwest.insert(point)) {
                    return true;
                } else if (this.southeast.insert(point)) {
                    return true;
                } else if (this.southwest.insert(point)) {
                    return true;
                }
    
            }
    
        }
        

/*
    test(point, found) {
        if (this.bounds.contains(point)) {

            if (this.bounds.distanceToCenter(point.x, point.z) < this.bounds.width) {
                if (this.divided) {
                    if (this.northeast.test(point)) {
                    } else if (this.northwest.test(point)) {
                    } else if (this.southeast.test(point)) {
                    } else if (this.southwest.test(point)) {
                    }
                } else {
                    for (let p of this.points) {
                        found.push(p.x);
                        found.push(p.y);
                        found.push(p.z);
                    }
                    return true;
                }
            }
        }
    }

    getPoints(x, z, found) {
        if (this.center(x, z, 10)) {
            for (let p of this.points) {
                found.push(p.x);
                found.push(p.y);
                found.push(p.z);
            }

        }
        if (this.divided) {
            this.northwest.getPoints(x, z, found);
            this.northeast.getPoints(x, z, found);
            this.southwest.getPoints(x, z, found);
            this.southeast.getPoints(x, z, found);
        }
    }


    center(x, z, threshold) {
        let distance = this.bounds.distanceToCenter(x, z);
        if (distance < threshold) {
            return true;
        }
        return false;
    }
    */
}

export class ClassificationColor {
    constructor(){
        this.map = new Map();
        this.map.set(0, [82, 82, 82]);
        this.map.set(1, [183, 183, 183]);
        this.map.set(2, [138, 80, 55]);
        this.map.set(3, [30, 123, 18]);
        this.map.set(4, [47, 187, 29]);
        this.map.set(5, [67, 248, 44]);
        this.map.set(6, [61, 161, 208]);
        this.map.set(7, [255, 44, 22]);
        this.map.set(8, [255, 236, 0]);
        this.map.set(9, [0, 138, 229]);
        this.map.set(10, [255, 255, 255]);
        this.map.set(11, [208, 167, 78]);
        this.map.set(12, [0, 255, 204]);
        this.map.set(13, [187, 0, 255]);
        this.map.set(14, [4, 0, 255]);
        this.map.set(15, [255, 136, 0]);
        this.map.set(16, [255, 0, 149]);
        this.map.set(17, [199, 156, 78]);
        this.map.set(18, [148, 0, 37]);
    }

    getColor(key) {
        if(this.map.has(key)){
            return this.map.get(key);
        }else{
            this.map.set(key, [ Math.floor(Math.random() * 255),Math.floor(Math.random() * 255),Math.floor(Math.random() * 255) ]);
            
            return this.map.get(key);
        }
    }
}
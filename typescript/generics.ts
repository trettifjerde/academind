function merge<T, U>(obj1: T, obj2: U) {
    return {...obj1, ...obj2}
}

const o1 = {name: 'Muhsik', age: 28};
const o2 = ['programming', 'reading', 'jogging', 'playing videogames', 'coffee brewing'];

const o3 = merge(o1, o2);
console.log(o3)

function mergeObjAndArray<T = string | number, U = T[]>(obj: {[k: string]: T | U}, key: string, arr: U) {
    const merged = {...obj};
    merged[key] = arr;
    return merged;
} 

const o4 = mergeObjAndArray(o1, 'hobbies', o2);

const o5 = mergeObjAndArray({id: 34, server: 2}, 'players', ['G-Virus', 'Snappy', 'Shade']);


function countElements<T extends {length: number}>(param: T): [T, string] {
    return [param, 'Has length of ' + param.length];
}

console.log(countElements('meow'));
console.log(countElements(['Element', 23, 'One more Element']));

function findByKeyAndDecorate<T extends object, U extends keyof T>(obj: T, key: U) {
    return `xXx${obj[key]}xXx`;
}

console.log(findByKeyAndDecorate({username: 'trettifjerde', id: 34}, 'username'));

class DataStorage<T extends string | boolean | number> {
    private data: T[] = [];
    constructor() {}

    addItem(item: T) {
        this.data.push(item);
    }

    removeFirst(item: T) {
        const i = this.data.indexOf(item);
        if (i < 0) 
            return;

        this.data.splice(i, 1);
    }

    removeAll(item: T) {
        this.data = this.data.filter(i => i !== item);
    }

    getItems() {
        return [...this.data];
    }
}

const texts = new DataStorage<string>();
texts.addItem('meow');
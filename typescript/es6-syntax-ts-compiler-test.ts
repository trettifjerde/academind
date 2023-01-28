function reduceToObject(...keys: string[]) {

    const obj = keys.reduce((acc, v, i) => {
        acc[v] = i;
        return acc;
    }, {} as {[key: string]: number});
    return obj;
}

function destructAndReverseObj(obj: {firstKey: string, secondKey: string, thirdKey: number}) {
    const {firstKey: first, secondKey: second, thirdKey} = obj;
    return [thirdKey, second, first];
}

const res = reduceToObject('meow', 'meo', 'md', 'mifk', 'mev');
console.log(res);

const res2 = destructAndReverseObj({firstKey: 'woof', thirdKey: 666, secondKey: 'meow'});
console.log(res2);

const res3 = {...res};


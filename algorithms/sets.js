// Time complexity: O(n*m*q)
// Space complexity: O(1)

let c = 0;

function cartSet(sets) {
    const result = [];
    const counter = [];

    for (let i = 0; i < sets.length; i++) {
        counter.push(0);
    }

    while(true) {
        c++;

        const r = [];
        for (let i = 0; i < sets.length; i++) {
            r.push(sets[i][counter[i]])
        }
        result.push(r);
        
        for (let i = counter.length - 1; i >= 0; i--) {
            if (counter[i] + 1 < sets[i].length) {
                counter[i] = counter[i] + 1;
                break;
            }
            else {
                if (i === 0)
                    return result;
                else 
                    counter[i] = 0;
            }
        }
    }
}

function cartSetRecursive(sets, n=0) {
    const result = [];

    if (n < sets.length - 1) {
        const combined = cartSetRecursive(sets, n + 1);
        for (const el1 of sets[n]) {
            for (const el2 of combined) {
                c++;
                result.push([el1, ...el2]);
            }
        }

    }
    else if (n === sets.length - 1) {
        sets[n].forEach(el => {
            c++;
            result.push([el])
        });
    }
    
    return result;
}

const colors = ['black', 'white', 'green', 'blue'];
const sizes = ['xs', 's', 'm', 'l', 'xl'];
const models = ['v-shape', 'round-shape'];

const allModels = cartSetRecursive([colors, sizes, models]);
console.log(allModels);
console.log(c);
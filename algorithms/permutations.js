/*
function withRepetition(array, n) {
    const combinations = [];

    if (n === undefined) {
        n = array.length;
    }

    if (n > 1) {
        const combinationsForMinusN = withRepetition(array, n - 1);

        for (const el of array) {
            
            for (const comb of combinationsForMinusN) {
                counter++;
                const c = [el, ...comb];
                combinations.push(c);
            }
        }
    }
    else {
        for (const el of array) {
            combinations.push([el]);
        }
    }
    
    return combinations;
}
*/
function withCounterRepetition(array) {
    const c = [];
    const combinations = [];

    array.forEach(digit => c.push(0));

    while (true) {
        const comb = [];
        counter++;

        for (let i = 0; i < c.length; i++) {
            comb.push(array[c[i]]);
        }
        combinations.push(comb);

        for (let j = 0; j < c.length; j++) {
            c[j]++;
            counter++;

            if (c[j] < array.length) {
                break;
            }
            else {
                c[j] = 0;

                if (j === c.length - 1) {
                    return combinations;
                }
            }
        }
    }
}

// Time complexity: n ** r where n is number of options and r is the length of the combination

function withRepetition(array, length) {
    if (length === 1) {
        return array.map(digit => ([digit]));
    }

    const combinations = [];
    const partialCombinations = withRepetition(array, length - 1);

    for (const digit of array) {
        for (const comb of partialCombinations) {
            counter++;
            combinations.push([...comb, digit]);
        }
    }
    return combinations;
}

// Time complexity: O(n!)

function withoutRepetition(array) {
    if (array.length === 1)
        return [array];

    const combinations = [];
    const firstEl = array[0];

    const partialCombinations = withoutRepetition(array.slice(1));

    for (const comb of partialCombinations) {
        for (let i = 0; i <= comb.length; i++) {
            combinations.push([...comb.slice(0, i), firstEl, ...comb.slice(i)]);
        }
    }
    return combinations;
}

/*let counter = 0;
console.log(withRepetition([1, 2, 3, 4], 4));
console.log('counter', counter);
counter = 0;
console.log(withCounterRepetition([1, 2, 3, 4]));
console.log('counter', counter);
counter= 0;
console.log(withoutRepetition([1, 2, 3, 4]));
console.log(counter);
*/



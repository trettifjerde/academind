// Time complexity: some less than O(n*n)
// Space complexity: O(1)

function bubbleSort(array) {
    const sorted = [...array];

    for (let i = 0; i < sorted.length; i++) {

        for (let j = i + 1; j < sorted.length; j++) {

            if (sorted[i] > sorted[j]) {
                const buffer = sorted[i];
                sorted[i] = sorted[j];
                sorted[j] = buffer;
            }
        }
    }
    return sorted;
}

// Time complexity: 
// Space complexity: O(n)

function quickSort(array) {

    if (array.length > 1) {

        const pivot = array[0];
        const smaller = [];
        const equal = [pivot];
        const larger = [];

        for (let i = 1; i < array.length; i++) {

            const el = array[i];

            if (el === pivot) 
                equal.push(el);

            else if (el < pivot) 
                smaller.push(el);

            else 
                larger.push(el);

        }
        
        return [...quickSort(smaller), ...equal, ...quickSort(larger)];
    }
    return array;
}

// Time complexity: 
// Space complexity: O(n) - one branch is fully exhausted first

function mergeSort(array) {
    counter++;
    if (array.length > 2) {
        //console.log('BEFORE MERGE', array);
        const middleI = Math.floor(array.length / 2);

        //console.log('GOING LEFT');
        const left = mergeSort(array.slice(0, middleI));
        //console.log('GOING RIGHT');
        const right = mergeSort(array.slice(middleI));

        let leftI = 0;
        let rightI = 0;
        const merged = [];
        //console.log('MERGING', left, right);

        while (leftI < left.length || rightI < right.length) {
            if (leftI === left.length) {
                //console.log('pushing whole right', right.slice(rightI));
                merged.push(...right.slice(rightI));
                rightI = right.length;
            }
            else if (rightI === right.length) {
                //console.log('pushing whole left', left.slice(leftI));
                merged.push(...left.slice(leftI));
                leftI = left.length;
            }
            else {
                if (left[leftI] === right[rightI]) {
                    merged.push(left[leftI], right[rightI]);
                    //console.log('pushing two equals', left[leftI]);
                    leftI++;
                    rightI++;
                }
                else if (left[leftI] < right[rightI]) {
                    //console.log('pushing', left[leftI]);
                    merged.push(left[leftI]);
                    leftI++;
                }
                else {
                    //console.log('pushing', right[rightI]);
                    merged.push(right[rightI]);
                    rightI++;
                }
            }
        }

        /*while (leftI < left.length || rightI < right.length) {
            if (leftI >= left.length || left[leftI] > right[rightI]) {
                merged.push(right[rightI]);
                rightI++;
            }
            else {
                merged.push(left[leftI]);
                leftI++;
            }
        }*/
        //console.log('RETURNING MERGED', merged);
        return merged;
    }
    else if (array.length === 2) {
        //console.log('RETURNING TWO ITEMS', array);
        return array[0] > array[1] ? [array[1], array[0]] : array;;
    }
    else {
        //console.log('RETURNING LESS THAN TWO', array)
        return array;
    }
}

let counter = 0;
const array = [5, 3, 2, 6, 2, 14, 66, 57, 28, 969, 25, 34, -1, 204, 8, 1, 9, 4, 30, 21, 6];
const result = mergeSort(array);
console.log(result);
console.log(counter);
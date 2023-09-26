// Time complexity: O(n)
// Space complexity: O(1)

function linearSearch(array, n) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === n)
            return i;
    }
    return null;
}

/*  
    Times complexity: O (log n);
    Space complexity: 0 (1);
*/
function binarySearch(array, n, start, end) {
    start = start || 0;
    end = end || array.length;

    if (start < end) {

        let i = start + Math.floor((end - start) / 2);
        const e = array[i];

        if (e === n) {
            return i;
        }
        else if (e > n) {
            end = i;
        }
        else {
            start = i + 1; 
        }

        return binarySearch(array, n, start, end)
    }
    return null;
}
// Time complexity: 
// Space complexity: O(n)
function fact(n, counter) {
    if (n > 1) {
        return n * fact(n - 1, counter);
    }    
    return 1;
}

// Time complexity: 
// Space complexity:

function fib(n, array) {
    if (!array) 
        array = [1, 1];

    if (array.length > n) {
        return array[n];
    }

    else {
        const newN = fib(n - 1, array) + fib(n - 2, array);    
        array.push(newN);
        return newN;
    }
}
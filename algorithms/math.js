// Time complexity: O(n)
// Space complexity: O(1)

function fib(i) {
    const numbers = [1, 1];

    // while (i > numbers.length - 1) {
    //     numbers.push(numbers[numbers.length - 1] + numbers[numbers.length - 2]);
    // }

    for (let j = 2; j < i; j++) {
        numbers.push(numbers[j - 2] + numbers[j - 1]);
    }

    return numbers[i];
}

// Time complexity: O(n)
// Space complexity: O(1)

function isPrime(n) {

    if (n === undefined) {
        throw Error('Invalid argument');
    }
    n = Math.abs(n);

    if (n === 0) 
        return false;

    const sqr = Math.sqrt(n);

    for (let i = 2; i <= sqr; i++) {
        if (n % i === 0) {
            return false;
        }
    }
    return true;

}

function minimum(array) {
    if (array.length === 0)
        return undefined;

    let solution = array[0];

    array.forEach(n => {
        if (n < solution) {
            solution = n;
        }
    });
    return solution;
}

function isPowerOfTwo(n) {
    n = Math.abs(n);

    while (n > 1) {
        if (n % 2 !== 0)
            return false;
        n = n / 2;
    }
    return true;
}

// Time complexity: O(n)
// Space complexity: O(1)

function fact(n) {
    let result = 1;

    while (n > 1) {
        result = result * n;
        n = n - 1;
    }

    return result;
}
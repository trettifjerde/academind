function fib(i) {
    const numbers = [1, 1];

    /*

    while (i > numbers.length - 1) {
        numbers.push(numbers[numbers.length - 1] + numbers[numbers.length - 2]);
    }

    */

    for (let j = 2; j < i; j++) {
        numbers.push(numbers[j - 2] + numbers[j - 1]);
    }

    return numbers[i];
}

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
/*
    ARRAYS
        - insertion order is memorized
        - element access via index
        - iterable
        - length adjusts dynamically
        - duplicates are allowed
        - search by element value is performance intensive

*/
const namesArray = ['max', "julie", 'manu'];
console.log('Access by index:', namesArray[1]);

for (const el of namesArray) 
    console.log('Printed from for loop: ', el);

const julieIndex = namesArray.findIndex(el => el === 'julie');

/* 
    SETS
        - insertion order is not memorized
        - element access via method
        - iterable
        - size adjusts dynamically
        - duplicates are not allowed
        - search by element value is fast

*/

const idSet = new Set([12, 3, 54, 6, 3]); // duplicates will be removed

/*
    OBJECTS
        - unordered
        - key-value pairs
        - element access by key
        - not really iterable (only keys using for in loop)
        - keys are unique, values dont't have to be
        - keys must be strings, numbers or symbolsi in JS
        - JS benefits: 
            ~ have prototypes
            ~ can be created with constructor functions 
            ~ can store methods/functions

*/

const obj1 = {
    firstName: 'Alex', 
    age: 29, 
    hobbies: ['movies', 'video games', 'fiction', 'languages']
};
console.log(obj1.firstName);
console.log(obj1['age']);

obj1.lastName = 'Andreeva';
delete obj1.lastName;

obj1.greet = function() { 
    console.log('Hi, I am', this.firstName);
}

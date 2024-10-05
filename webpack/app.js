import { selectLessQualified } from './files/helpers';
import { fred, george, ron, ginny, mrmistery } from './files/meow';

const result1 = selectLessQualified(fred, george).name;
const result2 = selectLessQualified(ron, fred).name;
const result3 = selectLessQualified(george, ron).name;
const result4 = selectLessQualified(ron, ginny).name;
const result5 = selectLessQualified(mrmistery, ron).name;

console.log(result1, result2, result3, result4, result5);
console.log(result5?.[0]);
console.log(result5 ?? 'Mr Mistery');
console.log(result5 || 'Mr. Mistery');
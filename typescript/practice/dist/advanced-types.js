"use strict";
const fred = { tables: [1, 3], name: 'fred' };
const george = { dishes: ['pizza', 'burger'], name: 'george' };
const ron = { tables: [2, 3], dishes: ['pizza'], name: 'ron' };
const ginny = { tables: [1, 2], dishes: ['burger'], name: 'ginny' };
const mrmistery = { tables: [3], name: '' };
function selectLessQualified(a, b) {
    const isOddman = (e) => ('dishes' in e) && ('tables' in e);
    const aCheck = isOddman(a);
    const bCheck = isOddman(b);
    if (aCheck === bCheck) {
        return (Math.random() < 0.5) ? a : b;
    }
    else {
        return aCheck ? b : a;
    }
}
const result1 = selectLessQualified(fred, george).name;
const result2 = selectLessQualified(ron, fred).name;
const result3 = selectLessQualified(george, ron).name;
const result4 = selectLessQualified(ron, ginny).name;
const result5 = selectLessQualified(mrmistery, ron).name;
console.log(result1, result2, result3, result4, result5);
console.log(result5?.[0]);
console.log(result5 ?? 'Mr Mistery');
console.log(result5 || 'Mr. Mistery');
//# sourceMappingURL=advanced-types.js.map
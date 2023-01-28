type Waitor = {tables: number[], name?: string}
type Cook = { dishes: string[], name?: string}
type Empl = Waitor | Cook;
type Oddman = Waitor & Cook;

const fred = {tables: [1, 3], name: 'fred'} as Empl;
const george = {dishes: ['pizza', 'burger'], name: 'george'} as Empl;
const ron = {tables: [2, 3], dishes: ['pizza'], name: 'ron'} as Oddman;
const ginny = {tables: [1, 2], dishes: ['burger'], name: 'ginny'} as Oddman;
const mrmistery = {tables: [3], name: ''};

function selectLessQualified(a: Oddman, b: Oddman): Oddman;
function selectLessQualified(a: Empl, b: Empl): Empl;
function selectLessQualified(a: Empl, b: Empl) {
    const isOddman = (e: Empl) => ('dishes' in e) && ('tables' in e);

    const aCheck = isOddman(a);
    const bCheck = isOddman(b);
    if (aCheck === bCheck) {
        return (Math.random() < 0.5) ? a: b;
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
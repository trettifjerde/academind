export function selectLessQualified(a, b) {
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
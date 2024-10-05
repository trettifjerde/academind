const COINS = [1, 2, 5, 10, 20, 50, 100];

function giveChange(target, source) {
    
    const info = { total: 0, coins: new Map() };
    let rem = source - target;
    if (rem <= 0)
        return info;
    for (let i = COINS.length - 1; i > 0; i--) {
        const coin = COINS[i];
        const n = Math.floor(rem / coin);
        if (n > 0) {
            const t = coin * n;
            info.coins.set(coin, n);
            info.total += t;
            rem -= t;
        }
    }
    return info;
}

function giveChangeRecursive(target, source) {
    if (source <= target) {
        return { total: 0, coins: new Map() };
    }
    const rem = source - target;
    const coin = getNextCoin(rem);
    const info = giveChangeRecursive(target, source - coin);
    info.total += coin;
    const curCoinEntry = info.coins.get(coin) || 0;
    info.coins.set(coin, curCoinEntry + 1);
    return info;
}

function getNextCoin(amount) {
    for (let i = COINS.length - 1; i > -1; i--) {
        const coin = COINS[i];
        if (coin <= amount)
            return coin;
    }
    return 0;
}
const amounts = [326, 500];
const r = giveChange(...amounts);
console.log(amounts, r);

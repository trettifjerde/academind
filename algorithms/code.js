function knapsack(items, maxWeight) {
    const sortedItems = [...items].sort((a, b) => {
        const [coefA, coefB] = [a, b].map(e => e.value / e.weight);
        if (coefA > coefB)
            return -1;
        else if (coefA === coefB) 
            return a.weight < b.weight ? -1 : 1;
        else
            return 1;
    })
    //console.log('sorted', sortedItems);
    const itemsForLooping = [...sortedItems];
    const sack = [];
    let kgLeft = maxWeight;

    while (kgLeft > 0 && itemsForLooping.length > 0) {
        const item = itemsForLooping.splice(0, 1)[0];
        if (item.weight <= kgLeft) {
            sack.push(item);
            kgLeft = kgLeft - item.weight;
        }
    }

    return sack;
}

function knapsackLeastPerformant(items, maxWeight) {
    const combinations = withoutRepetition(items);
    console.log('all combinations');
    console.log(combinations);

    const clipped = combinations.map(comb => {
        let weightLeft = maxWeight;
        const clipped = [];
        let totalValue = 0;
        for (const item of comb) {
            if (item.weight <= weightLeft) {
                clipped.push(item.id);
                weightLeft -= item.weight;
                totalValue += item.value;
            }
        }
        
        return {items: clipped, weight: maxWeight - weightLeft, totalValue}

    })
    console.log('clipped', clipped);

    const sortedByValue = [...clipped].sort((a, b) => a.totalValue > b.totalValue ? -1 : 1);
    console.log('sorted by value', sortedByValue);

    const uniqueSets = {};
    for (const info of sortedByValue) {
        uniqueSets[generateKey(info.items)] = info;
    }

    console.log('unique', uniqueSets);

    let sortedUnique = Array.from(Object.values(uniqueSets));
    sortedUnique.sort((a, b) => a.totalValue > b.totalValue ? -1 : 1);

    console.log('unique sorted', sortedUnique);
}

function knapsackAllSacks(items, maxWeight) {
    const combinations = [];
    
    if (items.length > 1) {
        const firstItem = items[0];
        const partialCombinations = knapsackAllSacks(items.slice(1), maxWeight);
        combinations.push(...partialCombinations);
    
        for (const combInfo of partialCombinations) {
            if (combInfo.totalWeight + firstItem.weight <= maxWeight) {
                const newComb = {};
                newComb.items = [...combInfo.items, firstItem.id];
                newComb.totalValue = combInfo.totalValue + firstItem.value;
                newComb.totalWeight = combInfo.totalWeight + firstItem.weight;
    
                combinations.push(newComb);
            }   
        }
    }

    else if (items.length === 1) {
        const item = items[0];

        combinations.push({items: [], totalValue: 0, totalWeight: 0});

        if (item.weight <= maxWeight) {
            combinations.push({items: [item.id], totalWeight: item.weight, totalValue: item.value});
        }
    }

    return combinations;
}

function knapsackDynamic(items, maxWeight) {
    const memo = {};
    return knapsackTree(items, maxWeight, items.length - 1, memo);
}

function knapsackTree(items, maxWeight, index, memo) {

    const hash = `${maxWeight}-${index}`;

    if (memo[hash])
        return memo[hash];

    counter++;

    if (maxWeight === 0 || index < 0) {
        return {items: [], value: 0, weight: 0}
    }

    if (maxWeight < items[index].weight) {
        return knapsackTree(items, maxWeight, index - 1, memo);
    }
    
    const sackWithItem = knapsackTree(items, maxWeight - items[index].weight, index - 1, memo);
    const sackWithoutItem = knapsackTree(items, maxWeight, index - 1, memo);

    const sackWithItemValue = sackWithItem.value + items[index].value;
    const sackWithoutItemValue = sackWithoutItem.value;

    if (sackWithItemValue > sackWithoutItemValue) {
        const updatedSack = {
            items: [...sackWithItem.items, items[index]],
            value: sackWithItemValue,
            weight: sackWithItem.weight + items[index].weight
        }
        memo[hash] = updatedSack;
        return updatedSack;
    }
    else {
        memo[hash] = sackWithoutItem;
        return sackWithoutItem;
    }
}

function generateKey(items) {
    const sorted = [...items].sort((a, b) => a < b ? -1 : 1);
    return sorted.join('');
}

function totalValue(items) {
    return items.reduce((acc, v) => {
        acc += v.value;
        return acc;
    }, 0)
}

function totalWeight(items) {
    return items.reduce((acc, v) => {
        acc += v.weight;
        return acc;
    }, 0)
}

const items = [
    {id: 'laptop', value: 80, weight: 8},
    {id: 'cellphone', value: 30, weight: 2.5},
    {id: 'lighter', value: 20, weight: 2},
    {id: 'tablet', value: 50, weight: 4},
    {id: 'carrot', value: 4, weight: 1},
    {id: 'potatoes', value: 2, weight: 3},
    {id: 'apples', value: 3, weight: 2},
    {id: 'lemons', value: 4, weight: 2},
    {id: 'bananas', value: 3, weight: 3},
    {id: 'necklace', value: 14, weight: 1.5},
    {id: 'bracelet', value: 12, weight: 1.5},
    {id: 'earrings', value: 10, weight: 1.5},
    {id: 'ring', value: 8, weight: 1},
    {id: 'broche', value: 8, weight: 1}

]
let counter = 0;
const weight = 10;
const sack = knapsackDynamic(items, weight);
console.log(sack);
console.log(counter);
counter = 0;

const sack2 = knapsack(items, weight);
console.log(sack);
console.log(counter);
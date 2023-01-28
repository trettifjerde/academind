enum Producers {Gusti, Pizzara, Famiglia, Pomodoro};

interface Ingredient {
    readonly name: string,
    quantity: number,
}

interface Topping extends Ingredient {
    price: number
}

interface PizzaCrust {
    name: 'regular' | 'cheese',
    price: number
};

type MainDish = Burger | Pizza;

abstract class Dish {
    protected toppings: Topping[] = [];
    protected abstract type: string;

    constructor(
        protected readonly id: number, 
        protected readonly producer: Producers,
        protected readonly name: string, 
        protected readonly ingredients: Ingredient[],
        protected readonly initialPrice: number
    ) {}

    addToppings(...toppings: Topping[]) {
        toppings.forEach(t => {
            if (t.name && t.quantity > 0) {
                this.toppings.push(t);
            }
        })
    }

    removeTopping(toppingName: string) {
        this.toppings = this.toppings.filter(t => t.name !== toppingName);
    }

    updateToppingQuantity(name: string, n: number) {
        const topping = this.toppings.find(t => t.name === name);
        if (topping) {
            topping.quantity += n;
        }
    }

    abstract getCurrentPrice() : number;
}

class Pizza extends Dish {
    type = 'pizza';
    constructor(
        id: number,
        producer: Producers, 
        name: string,
        ingredients: Ingredient[],
        initialPrice: number,
        private crust: PizzaCrust,
    ) {
        super(id, producer, name, ingredients, initialPrice);
    }

    chooseCrust(choice: PizzaCrust) {
        this.crust = choice;
    }

    getCurrentPrice(): number {
        return this.toppings.reduce((price, t) => price + t.price, this.initialPrice + this.crust.price)
    }
}

class Burger extends Dish {
    type = 'burger';
    constructor(
        id: number,
        producer: Producers, 
        name: string,
        ingredients: Ingredient[],
        initialPrice: number,
    ) {
        super(id, producer, name, ingredients, initialPrice);
    }

    getCurrentPrice(): number {
        return this.toppings.reduce((price, t) => price + t.price, this.initialPrice);
    }
}
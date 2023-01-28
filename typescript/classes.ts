type Employee = {name: string; id: number};

abstract class Department {
    protected employees: Employee[];
    protected messages: string[];

    static numberOfEmployees = 0;
    static createEmployee(name: string) {
        if (!name) 
            return null;

        this.numberOfEmployees++;
        return {name: name, id: this.numberOfEmployees} as Employee;
    }

    constructor(public id: number, public name: string) {
        this.employees = [];
        this.messages = [];
    }

    get lastMessage() {
        if (this.messages.length === 0) {
            return 'No messages yet';
        }
        return this.messages[this.messages.length - 1];
    }

    set lastMessage(message: string) {
        if (message)
            this.messages.push(message);
    }

    abstract showInfo(): void;

    addEmployee(name: string) {
        const employee = Department.createEmployee(name);
        if (employee)
            this.employees.push(employee);
    }

    addMessage(message: string) {
        if (message)
            this.messages.push(message);
    }
}

class ITDeparment extends Department {
    constructor(id: number, public admin: number) {
        super(id, 'IT');
    }

    showInfo() {
        let desc = `${this.name} department\nId: ${this.id}\nEmployees: ${this.employees.length}\n`;

        console.log(desc);
    }

    addEmployee(name: string): void {
        if (name === 'Dog') {
            console.log('Sorry, only cats will be employed');
            return;
        }
        super.addEmployee(name);
    }
}

class AccountingDepartment extends Department {

    private static instance: AccountingDepartment;

    private constructor(id: number) {
        super(id, 'Accounting');
    }

    static getInstance() {
        if (!this.instance)
            this.instance = new AccountingDepartment(2);
        return this.instance;
    }
    
    showInfo(): void {
        console.log('Info on Accounting department is classified');
    }
}

const it = new ITDeparment(1, 34);
const accounting = AccountingDepartment.getInstance();

it.addEmployee('Muhsik');
it.addEmployee('');
it.addEmployee('Kesak');
it.addEmployee('Dymok');
accounting.addEmployee('Miska');
console.log(Department.numberOfEmployees);

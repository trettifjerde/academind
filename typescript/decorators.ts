function Logger(constructor: Function) {
    console.log('Logger decorator');
}

function Logger2(param: string) {
    return function(constructor: Function) {
        console.log('Logger 2', param);
    }
}

function WithTemplate(template: string, elId: string) {
    return function(constructor: any) {
        const container = document.getElementById(elId);
        if (container) {
            const instance = new constructor();
            container.innerHTML = template + '<p>Your name is supposed to be ' + instance.name + '</p>';
        }
    }
}

function PropertyDec(target: any, name: string | Symbol) {
    console.log('Property decorator');
    console.log(target);
    console.log(name);
}

function MethodDec(target: any, name: string | Symbol, descriptor: PropertyDescriptor) {
    console.log('Method decorator');
    console.log(target);
    console.log(name);
    console.log(descriptor);
}

function ParamDec(target: any, name: string | Symbol, position: number) {
    console.log('Parameter decorator');
    console.log(target);
    console.log(name);
    console.log(position);
}

function ClassModifier<T extends { new(...args: any): {} }>(originalConstructor: T) {
    return class extends originalConstructor {
        newProperty: number;
        constructor(..._: any) {
            super();
            this.newProperty = 34;
            console.log(this.newProperty);
        }
    }
}

function Autobind(target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        enumerable: false,
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    }
    return adjDescriptor;
}

@ClassModifier
class Person {
    @PropertyDec
    static personId = 0;

    @PropertyDec
    name: string;
    
    constructor() {
        this.name = 'Muhsik';
        console.log('Creating Person instance');
    }

    @MethodDec
    @Autobind
    printName() {
        console.log(this.name);
    }
} 

type ValidationCheck = 'required' | 'positive';

interface ValidationStorage {
    [className: string]: {
        [fieldName: string]: Set<ValidationCheck>
    }
}

function addToValidationStorage(className: string, fieldName: string, checkName: ValidationCheck) {
    if (!(className in formValidationInfo)) {
        formValidationInfo[className] = {};
    }
    if (!(fieldName in formValidationInfo[className])) {
        formValidationInfo[className][fieldName] = new Set();
    }
    formValidationInfo[className][fieldName].add(checkName);
}

function NotEmpty(target: any, fieldName: string) {
    const className = target.constructor.name;
    addToValidationStorage(className, fieldName, 'required');
}

function Positive(target: any, fieldName: string) {
    const className = target.constructor.name;
    addToValidationStorage(className, fieldName, 'positive');
}

function validate(obj: any) {
    let result = true;
    const classConstraints = formValidationInfo[obj.constructor.name];
    if (!classConstraints) {
        return true;
    }
    
    for (const fieldName in classConstraints) {
        for (const checkName of classConstraints[fieldName]) {
            switch(checkName) {
                case 'required':
                    result = result && obj[fieldName];
                    break;
                case 'positive':
                    result = result && obj[fieldName] > 0;
                    break;
            }
        }
    }
    return result;
}

const formValidationInfo: ValidationStorage = {};

class Course {
    @NotEmpty
    courseName: string;
    @Positive
    courseId: number; 

    constructor(name: string, id: number) {
        this.courseName = name;
        this.courseId = id;
    }
}

const p = new Person();
const btn = document.getElementById('btn')!;
btn.addEventListener('click', p.printName);

const form = document.querySelector('form')!;
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const title = form.courseName.value;
    const courseId = +form.courseId.value;
    const course = new Course(title, courseId);

    if (!validate(course)) {
        alert('Invalid course info');
        return;
    }
    
    console.log(course);
});
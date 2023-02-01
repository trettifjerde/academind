type ValidationCheckName = 'required' | 'positive' | ['maxNum', number] | ['maxLength', number];

interface ValidationInfo {
    [elName: string]: {
        [fieldName: string]: Set<ValidationCheckName>
    }
}

export class Validator {
    private static instance: Validator;

    static getValidator() {
        if (! this.instance) {
            this.instance = new Validator();
        }
        return this.instance;
    }

    static NotEmpty(target: any, fieldName: string) {
        Validator.getValidator().addValidationCheck(target.constructor.name, fieldName, 'required');
    }
    
    static Positive(target: any, fieldName: string) {
        Validator.getValidator().addValidationCheck(target.constructor.name, fieldName, 'positive');
    }
    
    static MaxLength(n: number) {
        return function(target: any, fieldName: string) {
            Validator.getValidator().addValidationCheck(target.constructor.name, fieldName, ['maxLength', n])
        }
    }
    
    static MaxNumber(n: number) {
        return function (target: any, fieldName: string) {
            Validator.getValidator().addValidationCheck(target.constructor.name, fieldName, ['maxNum', n]);
        }
    }

    private info: ValidationInfo;

    private constructor() {
        this.info = {};
    }

    addValidationCheck(elName: string, fieldName: string, checkName: ValidationCheckName) {
        if (!(elName in this.info)) {
            this.info[elName] = {};
        }
        if (!(fieldName in this.info[elName])) {
            this.info[elName][fieldName] = new Set();
        }
        this.info[elName][fieldName].add(checkName);
    }
    
    validate(obj: any) {
        let result = true;
    
        const vInfo = this.info[obj.constructor.name];
        for (const fieldName in vInfo) {
            for (const check of vInfo[fieldName]) {
                switch(check) {
                    case 'required':
                        result = result && obj[fieldName].value.trim();
                        break;
                    case 'positive':
                        result = result && +obj[fieldName].value > 0;
                        break;
                    default:
                        switch(check[0]) {
                            case 'maxNum':
                                result = result && +obj[fieldName].value <= check[1];
                                break;
                            case 'maxLength': 
                                result = result && obj[fieldName].value.trim().length <= check[1];
                                break;
                        }
                }
            }
        }
        return result;
    }  
}
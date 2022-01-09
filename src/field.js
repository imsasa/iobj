import {throttle} from "../assets/throttle.js";

// import Evt from "../assets/evt.js"
function isDiff(a1, a2) {
    if (!Array.isArray(a1)) return a1 !== a2;
    if ((a1 && !a2) || (!a1 && a2) || a1.length !== a2.length) return true;
    for (let i = 0, n = a1.length; i < n; i++)
        if (!a2.includes(a1[i])) return true;
    return false;
}

function proxyArray(initVal = [], fn) {
    let arr              = [...initVal];
    let myArrayPrototype = Object.create(Array.prototype);
    [
        "push", "pop", "shift", "unshift", "splice", "sort", "reverse"
    ].forEach(method => {
        let m                    = Array.prototype[method];
        myArrayPrototype[method] = function () {
            let pre    = [...this];
            let result = m.apply(this, arguments);
            fn(this, pre);
            return result;
        };
    });
    arr.__proto__ = myArrayPrototype;
    return arr;
}

function ifDirtyFn(newValue, initValue, preValue) {
    this.$ref && this.$ref.$emit("fieldValueChg", this.name, newValue, preValue);
    if (this.isModified !== isDiff(newValue, initValue)) {
        this.isModified = !this.isModified;
        this.$ref && this.$ref.$emit("fieldModChg", this.name, this.isModified);
        //this.$emit('isModifiedChange', this.isModified,this);
    }
    this.$validate();
}

let computeFn;
let willComputed = (function () {
    let set       = new Set();
    let executeFn = function () {
        set.forEach(i => {
            set.delete(i);
            i()
        });
    }
    return {
        add(v) {
            set.add(v);
            executeFn();
        }
    }
})();

/**
 *
 * @param initVal
 * @param ctx
 * @constructor
 */

function Destor(initVal, ctx) {
    let value;
    let fn = (newVal, preVal) => ifDirtyFn.call(ctx, newVal, initVal, preVal)

    function setVal(newValue, preVal) {
        if (!isDiff(newValue, preVal)) return;
        Array.isArray(newValue) && (newValue = proxyArray(newValue, fn));
        value = newValue;
        fn(value = newValue, preVal);
    }

    if (ctx.type === 'compute') {
        this.get  = () => value;
        let cfn   = ctx.value;
        computeFn = () => {
            let newVal = Reflect.apply(cfn, ctx.$ref, []);
            setVal(newVal, value);
        }
        initVal   = Reflect.apply(cfn, ctx.$ref, []);
        computeFn = undefined;
    } else {
        let computeSet;
        this.get = () => {
            if (computeFn) {
                computeSet || (computeSet = new Set());
                computeSet.add(computeFn);
            }
            return value;
        }
        this.set = function (newVal) {
            setVal(newVal, value);
            if (!computeSet) return;
            for (let i of computeSet) {
                willComputed.add(i);
            }
        }
    }
    value = (initVal && Array.isArray(initVal)) ? proxyArray(initVal, fn) : initVal;
}

/**
 *
 * @param isValid
 * @returns {*}
 * @private
 */
function FieldPrototype({name, alias, desc, validator, defaultValue, required, type, value}) {
    this.name         = name || this.constructor.name;
    this.alias        = alias;
    this.desc         = desc;
    this.validator    = validator;
    this.defaultValue = defaultValue;
    this.required     = !!required;
    this.type         = type || '';
    this.value        = value;
    return this;
}

/**
 *
 */
FieldPrototype.prototype.isField = true;
const validateHelper               = function (isValid) {
    let validateMsg = isValid&&isValid.msg;
    isValid         =  typeof isValid!=='boolean'?isValid.isValid:isValid;
    if (this.isValid !== isValid) {
        this.isValid     = isValid;
        this.validateMsg = validateMsg;
        this.$ref && this.$ref.$emit("fieldValidChg", this.name, isValid,validateMsg);
        // this.$emit('$isValidChange', this.isValid, this);
    }
    return isValid;
}
FieldPrototype.prototype.$validate = function () {
    let isValid, val = this.value;
    let validator    = this.validator;
    if (this.required && val === undefined) {
        isValid = false
    } else if (val === this.defaultValue || (Array.isArray(val) && !isDiff(val, this.defaultValue))) {
        isValid = true;
    } else if (val === undefined || val === "") {
        isValid = !this.required;
    } else {
        isValid = typeof validator === "function" ? this.validator(val) : (validator && this.validator.test(val));
    }
    isValid = (isValid && isValid.then) ? isValid : Promise.resolve(isValid);
    isValid.then(i => Reflect.apply(validateHelper, this, [i]))
    return isValid;
};
export default function defineField(conf) {
    function F(value, ref) {
        if (value === undefined && this.required) {
            value = this.defaultValue;
        }
        this.isValid    = undefined;
        this.isModified = false;
        this.$ref       = ref;
        this.$validate  = throttle(this.$validate, 200, {immediate: false, promise: true});
        Object.defineProperty(this, "value", new Destor(value, this));
    }

    F.prototype             = new FieldPrototype(conf);
    F.prototype.constructor = F;
    Object.defineProperty(F, "name", {value: conf.name});
    F.isField = true;
    return F;
};

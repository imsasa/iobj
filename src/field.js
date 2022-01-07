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
        // this.$emit('isModifiedChange', this.isModified,this);
    }
    this.$validate();
}


/**
 *
 * @param initVal
 * @param ctx
 * @constructor
 */

function Destor(initVal, ctx) {
    let value = initVal;
    let fn    = (newVal, preVal) => ifDirtyFn.call(ctx, newVal, initVal, preVal)
    if (initVal && Array.isArray(initVal)) {
        value = proxyArray(initVal, fn);
    }
    if(typeof initVal==='function'){
        this.get=()=>Reflect.apply(initVal,ctx,[]);
    }else{
        this.get = () => value;
        this.set = function (newValue) {
            if (!isDiff(newValue, value)) return value;
            Array.isArray(newValue) && (newValue = proxyArray(newValue, fn));
            let preVal=value;
            value = newValue;
            fn(value = newValue, preVal);
            return value;
        };
    }
}

/**
 *
 * @param isValid
 * @returns {*}
 * @private
 */
function FieldPrototype({name, alias, desc, validator, defaultValue, required}) {
    this.name         = name;
    this.alias        = alias;
    this.desc         = desc;
    this.validator    = validator;
    this.defaultValue = defaultValue;
    this.required     = !!required;
    return this;
}

/**
 *
 */
FieldPrototype.prototype.isField = true;
const validateHelper               = function (isValid) {
    if (this.isValid !== isValid) {
        this.isValid = isValid;
        this.$ref && this.$ref.$emit("fieldValidChg", this.name, isValid);
        this.$emit('$isValidChange', this.isValid,this);
    }
    return isValid;
}
FieldPrototype.prototype.$validate = function () {
    let isValid, val = this.value;
    let validator    = this.validator;
    if(this.required&&val===undefined){
        isValid=false
    }else if (val === this.defaultValue || (Array.isArray(val) && !isDiff(val, this.defaultValue))) {
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
export default  function defineField(conf) {
    function F(value, ref) {
        if (value === undefined&&this.required) {
            value = this.defaultValue;
        }
        Object.defineProperty(this, "value", new Destor(value, this));
        this.isValid    = undefined;
        this.isModified = false;
        this.$ref       = ref;
        this.$validate  = throttle(this.$validate, 200, {immediate: false, promise: true});
    }

    F.prototype             = new FieldPrototype(conf);
    F.prototype.constructor = F;
    Object.defineProperty(F, "name", {value: conf.name});
    F.isField = true;
    return F;
};

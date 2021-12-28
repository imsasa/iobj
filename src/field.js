function isDiff(a1, a2) {
    if (!Array.isArray(a1)) return a1 !== a2;
    if ((a1 && !a2) || (!a1 && a2) || a1.length !== a2.length) return true;
    for (let i = 0, n = a1.length; i < n; i++)
        if (!a2.includes(a1[i])) return true;
    return false;
}
let throttle = require("../assets/throttle").throttle;
let Evt           = require("../assets/evt");

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

function ifDirtyFn(newValue, initValue, preValue,evt) {
    this.$ref && this.$ref.$emit("fieldValueChg", this.name, newValue, preValue);
    if (this.isModified !== isDiff(newValue, initValue)) {
        this.isModified = !this.isModified;
        this.$ref && this.$ref.$emit("fieldModChg", this.name, this.isModified);
        this.$emit('isModifiedChange', this.isModified,this);
    }
    let isValid=this.isValid;
    Promise.resolve(this.$validate()).then(
        ()=> this.isValid!==isValid&&this.$emit('isValidChange', this.isValid,this)
    );
}


/**
 *
 * @param initVal
 * @param ctx
 * @constructor
 */

function Destor(initVal, ctx) {
    // initVal === undefined && (initVal = "");
    let value = initVal;
    const evt        = new Evt(ctx);
    let fn    = (newVal, preVal) => ifDirtyFn.call(ctx, newVal, initVal, preVal,evt)
    if (initVal && Array.isArray(initVal)) {
        value = proxyArray(initVal, fn);
    }
    this.get = () => value;
    this.set = function (newValue) {
        if (!isDiff(newValue, value)) return value;
        ctx.$emit("valueChange",newValue,ctx);
        Array.isArray(newValue) && (newValue = proxyArray(newValue, fn));
        value = newValue
        fn(newValue, value);
        return value;
    };
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
    }
    // this.$validate.isValid = isValid;
    return isValid;
}
FieldPrototype.prototype.$validate = function () {
    let isValid, val = this.value;
    let validator    = this.validator;
    if (val === this.defaultValue || (Array.isArray(val) && !isDiff(val, this.defaultValue))) {
        isValid = true;
    } else if (val === undefined || val === "") {
        isValid = !this.required;
    } else {
        isValid = typeof validator === "function" ? this.validator(val) : validator && this.validator.test(val);
    }
    isValid = typeof isValid === "object" && isValid && isValid.then ? isValid : Promise.resolve(isValid);
    if (isValid && isValid.then) {
        isValid.then(i => Reflect.apply(validateHelper, this, [i]))
    } else {
        Reflect.apply(validateHelper, this, [isValid])
    }
    return isValid;
};
module.exports                     = function defineField(conf) {
    function F(value, isValid, ref) {
        if (value === undefined) {
            this.required ? value = this.defaultValue : isValid = true;
        }
        if (isValid === undefined) {
            if (this.required && value === undefined) {
                isValid = false;
            } else {
                isValid = !!((value === undefined && !this.required) || (this.defaultValue === value));
            }
        }
        Object.defineProperty(this, "value", new Destor(value, this));
        this.isValid    = isValid;
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

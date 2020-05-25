let Evt      = require("../assets/evt");
let debounce = require("../assets/throttle").debounce;

/**
 *
 * @param initVal
 * @constructor
 */
function Destor(initVal) {
    let value = initVal;
    this.get  = () => value;
    this.set  = function (newValue) {
        let isMod = Array.isArray(newValue) ? wrapArr.isDiff(newValue, value) : value !== newValue;
        if (!isMod) return value;
        this.emit("valueChg", newValue, value, this);
        this.ref && this.ref.emit("fieldValueChg", this.name, newValue, value);
        if (!Array.isArray(newValue) && this.isModified !== (newValue !== initVal)) {
            this.isModified = !this.isModified;
            this.emit("modChg", this.isModified);
            this.ref && this.emit("fieldModChg", this.name, this.isModified);
        }
        value = newValue;
        Array.isArray(value) || this.validate();//数组另处理
        return value;
        // if(this.$isValid===undefined)this.$validate();
    };
}


let wrapArr = (function () {
    const arrayProto = Array.prototype;
    const wrapProto  = Object.create(arrayProto);
    [
        "push",
        "pop",
        "shift",
        "unshift",
        "splice",
        "sort",
        "reverse"
    ].forEach(method => {
        let m             = arrayProto[method];
        wrapProto[method] = function mutator() {
            let _arr_ = [...this];
            let $ctx  = this.$ctx;
            m.apply(this, arguments);
            // this.$ctx.$ref[this.$ctx.$name]=this;
            $ctx.emit("valueChg", this, _arr_, $ctx);
            $ctx.ref && $ctx.ref.emit("fieldValueChg", $ctx.name, this);
        };
    });
    let _valChgHandler_ = function (initVal, val, ctx) {
        // let ctx=nval.$ctx;
        ctx.validate(val);
        let isMod = _wrapArr_.isDiff(initVal, val);
        if (isMod === ctx.isModified) return;
        ctx.isModified = isMod;
        ctx.emit("modChg", isMod);
        ctx.ref && ctx.ref.emit("fieldModChg", ctx.name, isMod);
    };

    // _valChgHandler_.promiseble(false);
    function _wrapArr_(initVal = [], ctx) {
        let _val_       = [...initVal];
        _val_.__proto__ = wrapProto;
        Object.defineProperty(_val_, "$ctx", {value: ctx});
        ctx.on("valueChg", (newVal, preVal, ctx) => _valChgHandler_(initVal, newVal, ctx));
        return _val_;
    }

    _wrapArr_.isDiff = function (a1, a2) {
        // if (a1 === a2) return false;
        if ((a1 && !a2) || (!a1 || a2) || a1.length !== a2.length) return true;
        for (let i = 0, n = a1.length; i < n; i++)
            if (!a2.includes(a1[i])) return true;
        return false;
    };
    return _wrapArr_;
})();


/**
 * generate a Field Type
 * @param conf 字段属性配置
 * @return {F}
 * @constructor
 */
function __(isValid) {
    let flag     = this.isValid !== isValid;
    this.isValid = isValid;
    if (flag) {
        this.emit("validChg", isValid);
        this.ref && this.ref.emit("fieldValidChg", this.name, isValid);
    }
    return isValid;
}

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

FieldPrototype.prototype.validate = function () {
    let val       = this.value;
    let isValid   = undefined;
    let validator = this.validator;
    if (val === this.defaultValue || (Array.isArray(val) && !wrapArr.isDiff(val, this.defaultValue))) {
        isValid = true;
    } else if (val === undefined || val === "") {
        isValid = !this.required;
    } else {
        isValid = typeof validator === "function" ? this.validator(val) : validator && this.validator.test(val);
    }
    isValid = isValid && isValid.then ? isValid : Promise.resolve(isValid);
    return isValid;
};
FieldPrototype.prototype.on       = function () {
    this.evt || (this.evt = new Evt());
    this.evt.subscribe(...arguments);
};

FieldPrototype.prototype.emit = function () {
    this.evt && this.evt.trigger(...arguments);
};
module.exports                = function defineField(conf) {
    function F(value, isValid) {
        if (value === undefined) {
            this.required && (value = this.defaultValue);
        }
        if (isValid === undefined) {
            //值不能为空
            if (this.required && value === undefined) {
                isValid = false;
            } else {
                if ((value === undefined && !this.required) || (this.defaultValue === value)) isValid = true;
            }
        }

        Object.defineProperty(this, "value", new Destor(Array.isArray(value) ? wrapArr(value, this) : value));
        this.isValid    = isValid;
        this.isModified = false;
        let validateFn  = debounce(this.validate, 100, {immediate: true, promise: true});
        let validCache;
        this.validate   = function (flag) {
            //flag表示可以利用上一次的验证结果；
            if (flag === true&&validCache) return validCache.then?validCache:Promise.resolve(validCache);
            let valid  = validateFn.call(this, this.value);
            validCache = valid.then((val) => {
                validCache = val;
                return __.call(this, val);
            });
            return validCache;
        }
    }

    F.prototype             = new FieldPrototype(conf);
    F.prototype.constructor = F;
    Object.defineProperty(F, "name", {value: conf.name});
    F.isField = true;
    return F;
};

let Evt      = require("../assets/evt");
let debounce = require("../assets/throttle").debounce;

/**
 *
 * @param initVal
 * @constructor
 */
function Destor(initVal) {
    let val  = initVal;
    this.get = () => val;
    this.set = function (newVal) {
        let isMod = this.$isA ? wrapArr.isDiff(newVal, val) : val !== newVal;
        if (!isMod) return val;
        this.$emit("valChg", newVal, val, this);
        this.$ref && this.$ref.$emit("fieldValChg", this.$name, newVal, val);
        if (!this.$isA && this.$isMod !== (newVal !== initVal)) {
            this.$isMod = !this.$isMod;
            this.$emit("modChg", this.$isMod);
            this.$ref && this.$ref.$emit("fieldModChg", this.$name, this.$isMod);
        }
        val = newVal;
        this.$isA || this.$validate(newVal);//数组另处理
        return val;
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
            m.apply(this, arguments);
            let $ctx = this.$ctx;
            // this.$ctx.$ref[this.$ctx.$name]=this;
            $ctx.$evt && $ctx.$emit("valChg", this, _arr_, $ctx);
        };
    });
    let _valChgHandler_ = function (initVal, val, ctx) {
        // let ctx=nval.$ctx;
        ctx.$validate(val);
        let isMod = _wrapArr_.isDiff(initVal, val);
        if (isMod === ctx.$isMod) return;
        ctx.$isMod = isMod;
        ctx.$emit("modChg", isMod);
        ctx.$ref && ctx.$ref.$emit("fieldModChg", ctx.$name, isMod);
    };

    // _valChgHandler_.promiseble(false);
    function _wrapArr_(initVal = [], ctx) {
        let _val_       = [...initVal];
        _val_.__proto__ = wrapProto;
        Object.defineProperty(_val_, "$ctx", {value: ctx});
        ctx.$on("valChg", (newVal, preVal, ctx) => _valChgHandler_(initVal, newVal, ctx));
        return _val_;
    }

    _wrapArr_.isDiff = function (a1, a2) {
        // if (a1 === a2) return false;
        if (a1.length !== a2.length) return true;
        for (let i = 0, n = a1.length; i < n; i++)
            if (!a2.includes(a1[i])) return true;
        return false;
    };
    return _wrapArr_;
})();

/**
 *
 * @param name
 * @param alias
 * @param desc
 * @param validator
 * @param defaultVal
 * @param type
 * @param required
 * @return {FieldProto}
 * @constructor
 */
function FieldProto({name, alias, desc, validator, defaultVal, isA, required}) {
    this.$name       = name;
    this.$alias      = alias;
    this.$desc       = desc;
    this.$validator  = validator;
    this.$defaultVal = defaultVal;
    this.$isA        = isA;
    this.$isRequired = !!required;
    return this;
}

/**
 *
 */
FieldProto.prototype.$isField = true;
FieldProto.prototype.$required      = function (val) {
    return val !== undefined && val !== ""
};
FieldProto.prototype.$required.info = "该字段不能为空";
/**
 *
 */
FieldProto.prototype.$emit = function () {
    this.$evt && this.$evt.trigger(...arguments);
};
/**
 *
 */
FieldProto.prototype.$on = function () {
    this.$evt || (this.$evt = new Evt());
    this.$evt.subscribe(...arguments);
};

/**
 *
 * @param muse
 * @return {Field}
 *
 **/

/**
 *
 * @returns {Promise<boolean>}
 */
(function () {
    function _(isValid, token) {
        this.$validate.ing = undefined;
        if (this.$validate.token > token || isValid === this.$isValid) return isValid;
        if (this.$isValid !== undefined) {
            this.$emit("validChg", isValid);
            this.$ref && this.$ref.$emit("fieldValidChg", this.$name, isValid);
        } else {
            this.$ref && (this.$ref.$validation[this.$name] = isValid);
        }
        return this.$isValid = isValid;
    }

    /**
     *
     * @param val
     * @param token
     * @returns {boolean}
     */
    FieldProto.prototype.$validate = function (val, token) {
        val           = val||this.$val;
        let isValid   = undefined;
        let validator = this.$validator;
        let notEmpty  = this.$required(val);
        if (notEmpty) {
            if (!validator || val === this.$defaultVal || (this.$isA && !wrapArr.isDiff(val, this.$defaultVal))) {
                isValid = true;
            } else {
                isValid = typeof validator === "function" ? this.$validator(val) : validator && this.$validator.test(val);
            }
        } else {
            isValid = this.$isRequired !== true;
        }
        isValid = isValid.then ? isValid.then((val) => _.call(this, val, token)) : _.call(this, isValid, token);
        return isValid;
    };
})();

/**
 * generate a Field Type
 * @param conf 字段属性配置
 * @return {F}
 * @constructor
 */
module.exports = function (conf) {
    /**
     *
     * @param initValue
     * @param doNotUseDefaultValue
     * @param doNotNeedValidate
     * @constructor Field
     */

    function F(initValue, doNotUseDefaultValue, doNotNeedValidate) {
        this.$isMod = false;
        if (typeof this.$defaultVal === "function") this.$defaultVal = this.$defaultVal();
        if (initValue === undefined && doNotUseDefaultValue !== true) initValue = this.$defaultVal;
        Object.defineProperty(this, "$val", new Destor(conf.isA ? wrapArr(initValue, this) : initValue));
        Object.defineProperty(this, "$initVal", {enumerable: false, value: initValue});
        let $validateFn = debounce(this.$validate, 100, {immediate: true, promise: true});
        let isValid     = doNotNeedValidate ? this.$isValid = true : this.$validate();
        this.$validate  = function (val) {
            if (arguments.length === 0) return this.$validate.ing || Promise.resolve(this.$isValid);
            let token            = new Date().getTime();
            this.$validate.token = token;
            return this.$validate.ing = $validateFn.call(this, val, token);
        };
        if (this.$isValid !== isValid) this.$validate.ing = isValid;
    }

    if (typeof conf === "string") conf = {name: conf};
    F.prototype = new FieldProto(conf);
    Object.defineProperty(F, "name", {value: conf.name});
    return F;
};
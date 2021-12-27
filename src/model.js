let defineField   = require("./field");
let Evt           = require("../assets/evt");
let debounce      = require("../assets/throttle").debounce;
let {has, notAll} = require("../assets/object");

function ckValidationHelper(isValid, validation, ctx) {
    isValid && (isValid = !notAll(validation, true));
    if (isValid !== ctx.$isValid) {
        ctx.ref && (ctx.ref.$validation[ctx.name] = isValid);
        ctx.$emit("validChg", isValid);
        ctx.ref && ctx.ref.$emit('fieldValidChg', ctx.name, isValid);
    }
    return ctx.$isValid = isValid;
}

/**
 *
 * @param fieldsCfg
 * @constructor
 */
function ModelPrototype(fieldsCfg) {
    let fields = [];
    for (let field of fieldsCfg) {
        if (!field.isField && !field.$isModel) {
            field = field.$isModel ? defineModel(field) : defineField(field)
        }
        fields.push(field);
    }
    this.$fields = fields;
    return this;
}


/**
 *
 */
// ModelPrototype.prototype.$emit = function () {
//    this.$evt.trigger(...arguments);
// };
// /**
//  *
//  */
// ModelPrototype.prototype.$on = function () {
//     this.$evt.subscribe(...arguments);
// };
// /**
//  *
//  */
// ModelPrototype.prototype.$watch = function (name, fn) {
//     this.$evt.subscribe(...arguments);
// };
/**
 *
 * @param validateAll undefined,false,true
 * @return {Promise<any[]>}
 */
ModelPrototype.prototype.$validate = function (validateAll) {
    let ths       = this,
        fieldData = ths.$fields,
        varr      = [],
        fields    = Object.keys(fieldData);
    for (let fieldName of fields) {
        let field = fieldData[fieldName];
        let tmp   = field.$validate();
        varr.push(tmp);
    }
    return Promise.all(varr).then((ret) => ckValidationHelper(true, ths.$validation, this));
};

ModelPrototype.prototype.$isModel = true;

function fieldValidChgHandler(ctx) {
    let _ = debounce(
        function (isValid, validation) {
            return ckValidationHelper(isValid, validation, ctx);
        }, 80, {promise: true}
    );
    return function (fieldName, isValid) {
        ctx.$validation[fieldName] = isValid;
        if (isValid === ctx.$isValid) return;
        if (isValid === true) {
            _(isValid, ctx.$validation)
        } else {
            ctx.$isValid = false;
            ctx.$ref && ctx.$ref.$emit("fieldValidChg", ctx.constructor.name, false);
            ctx.$emit("validChg", isValid);
        }
    }
}

function fieldModChgHandler(ctx) {
    let _ = debounce(
        function (modified, isMod) {
            isMod = isMod || has(modified, true);
            if (isMod === ctx.$isModified) return;
            ctx.$isModified = isMod;
            ctx.$ref && ctx.$ref.$emit("fieldModChg", ctx.name, ctx.$isModified);
            ctx.$emit("modChg", ctx.$isModified);
            ctx.$emit('$isModified', ctx.$isModified);
            return isMod;
        }, 80, {promise: true, immediate: true}
    );
    return function (fieldName, isMod) {
        ctx.$modified[fieldName] = isMod;
        if (isMod === ctx.$isModified) return;
        _(ctx.$modified, isMod);
    }
}

/**
 *
 * @param cfg
 * @return {M}
 * @constructor
 */
function defineModel(cfg) {
    let fields  = cfg.fields || cfg;
    /**
     *
     * @param data
     * @param isValid
     * @private
     */
    let _       = function (data, isValid) {
        let flag          = data ? Array.isArray(data) : data = {},
            modified      = {},
            validateFlag  = 0,
            fields        = this.$fields;
        this.$validation  = {};
        this.$isModified  = false;
        this.$fields      = {};
        const evt         = new Evt();
        this.$onEvent     = (name, fn) => evt.subscribe(name, fn);
        this.$removeEvent = (name, fn) => evt.remove(name, fn);
        this.$emit        = function () {
            evt.trigger(...arguments);
        };
        for (let idx = 0, len = fields.length; idx < len; idx++) {
            let field,
                fieldCls            = fields[idx],
                fname               = fieldCls.name,
                initVal             = flag ? data[idx] : data[fname];
            field                   = new fieldCls(initVal, isValid, this);
            field.idx               = idx;
            modified[fname]         = false;
            this.$fields[fname]     = field;
            this.$validation[fname] = field.$isModel ? field.$validation : field.isValid;
            if (isValid === undefined && !field.isValid) validateFlag = validateFlag | (field.isValid === false ? 1 : 2);
            Object.defineProperty(this, fname, {
                set         : function (value) {
                    field.$isModel ? Object.assign(field, value) : field.value = value;
                },
                get         : () => field.value,
                enumerable  : true,
                configurable: true
            });
        }
        if (isValid === undefined) {
            this.$isValid = validateFlag ? (validateFlag & 1 ? false : undefined) : true;
        } else {
            this.$isValid = isValid;
        }
        this.$modified = modified;
        this.$onEvent("fieldValidChg", fieldValidChgHandler(this));
        this.$onEvent("fieldModChg", fieldModChgHandler(this));
        this.$onEvent("fieldValueChg", (fname, value) => {
            evt.trigger(fname, value);
        });
        this.$validate = debounce(this.$validate, 100, {immediate: true, promise: true});
    };
    _.prototype = new ModelPrototype(fields);
    _.$fields   = _.prototype.$fields;
    cfg.name && Object.defineProperty(_, "name", {value: cfg.name});
    _.prototype.constructor = _;
    return _;
}

module.exports = defineModel;
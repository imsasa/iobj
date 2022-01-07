import defineField   from "./field.js";
import Evt           from "../assets/evt.js";
import {debounce}    from "../assets/throttle.js"
import {has, notAll} from "../assets/object.js"


function ckValidationHelper(isValid, validation, ctx) {
    isValid && (isValid = !notAll(validation, true));
    if (isValid !== ctx.$isValid) {
        ctx.ref && (ctx.ref.$validation[ctx.name] = isValid);
        ctx.ref && ctx.ref.$emit('fieldValidChg', ctx.name, isValid);
        ctx.$emit("$isValidChg", isValid);
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
    return Promise.allSettled(varr).then((ret) => ckValidationHelper(true, ths.$validation, this));
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
            ctx.$emit("$isValidChg", isValid);
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
            // ctx.$emit("modChg", ctx.$isModified);
            ctx.$emit('$isModifiedChg', ctx.$isModified);
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
 * @param watch
 * @return {M}
 * @constructor
 */
export default function defineModel(cfg,watch) {
    let fields  = cfg.fields || cfg;
    /**
     *
     * @param data
     * @param isValid
     * @private
     */
    watch||(watch=cfg.watch);
    let _       = function (data) {
        let flag         = data ? Array.isArray(data) : data = {},
            modified     = {},
            fields       = this.$fields;
        this.$validation = {};
        this.$isModified = false;
        this.$fields     = {};
        this.$isValid    = undefined;
        new Evt(this);
        for (let idx = 0, len = fields.length; idx < len; idx++) {
            let field,
                fieldCls            = fields[idx],
                fname               = fieldCls.name,
                initVal             = flag ? data[idx] : data[fname];
            field                   = new fieldCls(initVal, this);
            field.idx               = idx;
            modified[fname]         = false;
            this.$fields[fname]     = field;
            this.$validation[fname] = field.$isModel ? field.$validation : field.isValid;
            Object.defineProperty(this, fname, {
                set         : function (value) {
                    field.$isModel ? Object.assign(field, value) : field.value = value;
                },
                get         : () => field.value,
                enumerable  : true,
                configurable: true
            });
        }
        this.$modified = modified;
        this.$on("fieldValidChg", fieldValidChgHandler(this));
        this.$on("fieldModChg", fieldModChgHandler(this));
        this.$on("fieldValueChg", (fname, value,preValue) => {
            if(watch&&watch[fname]){
                Reflect.apply(watch[fname],this,[value,preValue]);
            }
            // evt.trigger(fname, value);
        });
        this.$validate = debounce(this.$validate, 100, {immediate: true, promise: true});
    };
    _.prototype = new ModelPrototype(fields);
    _.$fields   = _.prototype.$fields;
    cfg.name && Object.defineProperty(_, "name", {value: cfg.name});
    _.prototype.constructor = _;
    return _;
}

// module.exports = defineModel;
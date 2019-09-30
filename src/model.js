let defineField   = require("./field");
let Evt           = require("../assets/evt");
let debounce      = require("../assets/throttle").debounce;
let {has, notAll} = require("../assets/object");

/**
 *
 * @param fields
 * @constructor
 */
function ModelProto(fields) {
    Object.defineProperty(this, "$fields", {
        value   : [],
        writable: true
    });
    let $fields = this.$fields;
    for (let field of fields) {
        !field.$isField && !field.$isModel && (field = field.fields ? defineModel(field) : defineField(field));
        $fields.push(field);
        $fields[field.name] = field;
    }
    return this;
}

/**
 *
 */
ModelProto.prototype.$emit = function () {
    this.$evt && this.$evt.trigger(...arguments);
};
/**
 *
 */
ModelProto.prototype.$on = function () {
    this.$evt || (Object.defineProperty(this, "$evt", {value: new Evt()}));
    this.$evt.subscribe(...arguments);
};

ModelProto.prototype.$set = function (key, val) {
    if (arguments.length === 2) {
        let f = this.$fields[key];
        f.$isField ? f.$val = val : f.$set(val);
        // if () {
        //
        // } else {
        //
        //     // f.$validate(true);
        // }
    } else {
        for (let item in key) {
            this.$set(item, key[item]);
        }
    }
    return this;
};
/**
 *
 */
Object.defineProperty(ModelProto.prototype, "$data", {
    get: function () {
        let ret    = {};
        let fields = this.$fields;
        for (let idx in fields) {
            let item        = fields[idx];
            ret[item.$name] = item.$val || item.$data;
        }
        return ret;
    }
});

/**
 *
 * @param [fieldNameArr]
 * @return {ModelProto}
 */

Object.defineProperty(ModelProto.prototype, "$modData", {
    get: function () {
        let ret = {};
        if (!this.$isMod) return ret;
        let modified = this.$modified;
        let fields   = this.$fields;
        for (let fName in modified) {
            let item = fields[fName];
            if (!modified[fName] || !item) continue;
            ret[fName] = item.$isModel ? item.$modData : item.$val;
        }
        return ret;
    }
});


/**
 *
 * @param validateAll undefined,false,true
 * @return {Promise<any[]>}
 */
ModelProto.prototype.$validate = function (validateAll) {
    let ths       = this,
        // $validate = this.$validate,
        allFields = ths.$fields,
        varr      = [];
    let fields    = Object.keys(ths.$fields);
    for (let fName of fields) {
        let tmp, field = allFields[fName];
        if (field.$isField && field.$isValid !== undefined && !field.$validate.ing) continue;
        tmp = field.$isField ? field.$validate() : field.$validate();
        tmp.then && varr.push(tmp);
    }
    return Promise.all(varr).then((ret) => {
        // if (this.$isValid === undefined) {
        let isValid = !notAll(ths.$validation, true);
        // ths.$ref && ();
        if(isValid!==ths.$isValid){
            ths.$ref&&(ths.$ref.$validation[ths.$name] = isValid);
            ths.$emit("validChg",isValid);
            ths.$ref&&ths.$ref.$emit('fieldValidChg',ths.$name,isValid);
        }
        ths.$isValid = isValid;
        // }
        return ths.$isValid;
    });
};

ModelProto.prototype.$isModel = true;

/**
 *
 * @param key
 * @return {ModelProto}
 */

function Destor(key) {
    this.get = function () {
        let f = this.$fields[key];
        return f.$isField ? f.$val : f;
    };
    this.set = function (nval) {
        this.$set(key, nval);
    };
}

Destor.prototype.enumerable   = true;
Destor.prototype.configurable = true;

/**
 *
 * @param arg
 */
function getFieldAlias(arg) {
    let ret    = {}, field,
        fields = this.prototype.$fields;
    if (Array.isArray(arg)) {
        for (let item of arg) {
            field = fields[item];
            field && (ret[item] = field.prototype.$isField ? field.prototype.$alias : field.$getAlias());
        }
    } else if (arg) {
        field = fields[arg];
        field && (ret = field.prototype.$isField ? field.prototype.$alias : field.$getAlias());
    } else {
        for (let field of fields)
            ret[field.name] = field.prototype.$isField ? field.prototype.$alias : field.$getAlias();
    }
    return ret;
}

function fieldValidChgHandler(ctx) {
    let _ = debounce(
        function (isValid, validation) {
            isValid && (isValid = !notAll(validation, true));
            if (isValid === ctx.$isValid) return;
            ctx.$isValid = isValid;
            ctx.$emit("validChg", isValid);
            ctx.$ref && ctx.$ref.$emit("fieldValidChg", ctx.constructor.name, isValid);
            return isValid;
        }, 80, {promise: true}
    );
    return function (fieldName, isValid) {
        let validation        = ctx.$validation;
        validation[fieldName] = isValid;
        if (isValid !== ctx.$isValid) _(isValid, validation);
    }
}

function fieldModChgHandler(ctx) {
    let _ = debounce(
        function (modified) {
            let isMod = has(modified, true);
            if (isMod === ctx.$isMod) return;
            ctx.$isMod = isMod;
            if (ctx.$ref) {
                ctx.$ref.$modified[ctx.$name] = true;
                ctx.$ref.$emit("fieldModChg", ctx.$name, ctx.$isMod);
            }
            ctx.$emit("modChg", ctx.$isMod);
            return isMod;
        }, 80, {promise: true}
    );
    return function (fieldName, isMod) {
        let modified        = ctx.$modified;
        modified[fieldName] = isMod;
        if (isMod !== ctx.$isMod) {
            fieldModChgHandler.ing = _(modified);
        }
    }
}

/**
 *
 * @param cfg
 * @return {M}
 * @constructor
 */
function defineModel(cfg) {
    let fields = cfg.fields || cfg;
    /**
     *
     * @param data
     * @param doNotUseDefaultValue
     * @param doNotNeedValidate
     * @private
     */
    let _      = function (data, doNotUseDefaultValue, doNotNeedValidate) {
        let flag         = data ? Array.isArray(data) : data = {},
            parr         = [],
            fields       = this.constructor.prototype.$fields,
            modified     = {};
        this.$validation = {};
        this.$isValid    = doNotNeedValidate;
        this.$isMod      = false;
        Object.defineProperty(_, "$name", {value: cfg.name});
        Object.defineProperty(this, "$fields", {value: {}});
        for (let idx = 0, len = fields.length; idx < len; idx++) {
            let field,
                fieldCls            = fields[idx],
                fname               = fieldCls.name,
                initVal             = flag ? data[idx] : data[fname];
            field                   = new fieldCls(initVal, doNotUseDefaultValue, doNotNeedValidate);
            field.$ref              = this;
            field.$idx              = idx;
            modified[fname]         = false;
            this.$fields[fname]     = field;
            this.$validation[fname] = field.$isValid;
            field.$isValid === undefined ? parr.push(field.$validate.ing) : (field.$isValid || (this.$isValid = false));
            Object.defineProperty(this, fname, new Destor(fname));
        }
        Object.defineProperty(this, "$modified", {value: modified});
        this.$on("fieldValidChg", fieldValidChgHandler(this));
        this.$on("fieldModChg", fieldModChgHandler(this));
        // let $validateFn = debounce(this.$validate, 100, {immediate: true, promise: true});
        // this.$validate  = $validateFn;
        if (doNotNeedValidate) {
            this.$emit("mounted", this.$isValid = true)
        } else {
            this.$validate().then((ret) => {this.$emit('mounted', ret);})
        }
    };

    _.prototype = new ModelProto(fields);
    Object.defineProperty(_.prototype, "$name", {value: cfg.name});
    _.prototype.constructor = _;
    _.$getAlias             = getFieldAlias;
    Object.defineProperty(_, "name", {value: cfg.name});
    return _;
}

module.exports = defineModel;
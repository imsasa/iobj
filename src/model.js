let defineField   = require("./field");
let Evt           = require("../assets/evt");
let debounce      = require("../assets/throttle").debounce;
let {has, notAll} = require("../assets/object");

/**
 *
 * @param fieldsCfg
 * @constructor
 */
function ModelPrototype(fieldsCfg) {
    Object.defineProperty(this, "fields", {
        value   : [],
        writable: true
    });
    let fields = [];
    for (let field of fieldsCfg) {
        if (!field.isField && !field.isModel) {
            field = field.fields ? defineModel(field) : defineField(field)
        }
        fields.push(field);
    }
    this.fields = fields;
    return this;
}

/**
 *
 */
ModelPrototype.prototype.emit = function () {
    this.evt && this.evt.trigger(...arguments);
};
/**
 *
 */
ModelPrototype.prototype.on = function () {
    this.evt || (Object.defineProperty(this, "evt", {value: new Evt()}));
    this.evt.subscribe(...arguments);
};


/**
 *
 * @param validateAll undefined,false,true
 * @return {Promise<any[]>}
 */
ModelPrototype.prototype.validate = function (validateAll) {
    let ths       = this,
        fieldData = ths.fieldData,
        varr      = [],
        fields    = Object.keys(fieldData);
    for (let fieldName of fields) {
        let field = fieldData[fieldName];
        // if (field.isField && field.isValid !== undefined && !field.validate.ing) continue;
        // tmp            = field.isValid;
        let tmp = field.validate(true);
        varr.push(tmp);
    }
    return Promise.all(varr).then((ret) => {
        let isValid = !notAll(ths.validation, true);
        if (isValid !== ths.isValid) {
            ths.ref && (ths.ref.validation[ths.name] = isValid);
            ths.emit("validChg", isValid);
            ths.ref && ths.ref.emit('fieldValidChg', ths.name, isValid);
        }
        ths.isValid = isValid;
        return ths.isValid;
    });
};

ModelPrototype.prototype.isModel = true;


/**
 *
 * @param arg
 */
function getFieldAlias(arg) {
    let ret    = {}, field,
        fields = this.prototype.fields;
    if (arg) {
        for (let field of fields)
            if (field.name === arg)
                return field.prototype.isField ? field.prototype.alias : field.getAlias()
    } else {
        for (let field of fields)
            ret[field.name] = field.prototype.isField ? field.prototype.alias : field.getAlias();
    }
    return ret;
}

function fieldValidChgHandler(ctx) {
    let _ = debounce(
        function (isValid, validation) {
            isValid && (isValid = !notAll(validation, true));
            if (isValid === ctx.isValid) return;
            ctx.isValid = isValid;
            ctx.emit("validChg", isValid);
            ctx.ref && ctx.ref.emit("fieldValidChg", ctx.constructor.name, isValid);
            return isValid;
        }, 80, {promise: true}
    );
    return function (fieldName, isValid) {
        ctx.validation[fieldName] = isValid;
        if (isValid === ctx.isValid) return;
        if (isValid === true) {
            _(isValid, ctx.validation)
        } else {
            ctx.isValid = false;
            ctx.ref && ctx.ref.emit("fieldValidChg", ctx.constructor.name, false);
            ctx.emit("validChg", isValid);
        }
    }
}

function fieldModChgHandler(ctx) {
    let _ = debounce(
        function (modified) {
            let isMod = has(modified, true);
            if (isMod === ctx.isModified) return;
            ctx.isModified = isMod;
            ctx.ref&&ctx.ref.emit("fieldModChg", ctx.name, ctx.isModified);
            // if (ctx.ref) {
            // ctx.ref.modified[ctx.name] = true;
            // }
            ctx.emit("modChg", ctx.isModified);
            return isMod;
        }, 80, {promise: true}
    );
    return function (fieldName, isMod) {
        ctx.modified[fieldName] = isMod;
        if (isMod === ctx.isModified) return;
        if(isMod===true){
            // if (ctx.ref) {
            // ctx.ref.modified[ctx.name] = true;
            // }
            ctx.ref&&ctx.ref.emit("fieldModChg", ctx.name, ctx.isModified);
            ctx.emit("modChg", true);
        }else{
            _(ctx.modified)
        }
        // if (isMod !== ctx.isModified) isMod ? ctx.isModified = true : _(ctx.modified);
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
        let flag         = data ? Array.isArray(data) : data = {},
            modified     = {},
            dataObj      = {},
            fieldData    = {},
            valueChgFlag = {},
            validateFlag = 0,
            fields       = this.fields;
        this.validation  = {};
        this.isModified  = false;
        for (let idx = 0, len = fields.length; idx < len; idx++) {
            let field,
                fieldCls           = fields[idx],
                fname              = fieldCls.name,
                initVal            = flag ? data[idx] : data[fname];
            field                  = new fieldCls(initVal, isValid);
            field.ref              = this;
            field.idx              = idx;
            modified[fname]        = false;
            fieldData[fname]       = field;
            this.validation[fname] = field.isModel ? field.validation : field.isValid;
            if (isValid === undefined && !field.isValid) validateFlag = validateFlag | (field.isValid === false ? 1 : 2);
            Object.defineProperty(dataObj, fname, {
                set         : function (value) {
                    if (valueChgFlag[fname]) {
                        return delete valueChgFlag[fname]
                    }
                    field.value = value;
                },
                get         : () => field.value,
                enumerable  : true,
                configurable: true
            });
        }
        this.fieldData = fieldData;
        if (isValid === undefined) {
            this.isValid = validateFlag ? (validateFlag & 1 ? false : undefined) : true;
        } else {
            this.isValid = isValid;
        }
        Object.defineProperty(this, "modified", {value: modified});
        Object.defineProperty(this, "value", {
            get         : () => dataObj,
            set         : function (data) {
                for (let name in data) {
                    if (!data.hasOwnProperty(name)) continue;
                    let field = this.fieldData[name];
                    field && (field.value = data[name]);
                }
            },
            enumerable  : true,
            configurable: true
        });
        this.on("fieldValidChg", fieldValidChgHandler(this));
        this.on("fieldModChg", fieldModChgHandler(this));
        this.on("fieldValueChg", (fname, value) => {
            valueChgFlag[fname] = true;
            dataObj[fname]      = value;
        });
        this.validate = debounce(this.validate, 100, {immediate: true, promise: true});
    };
    _.prototype = new ModelPrototype(fields);
    cfg.name && Object.defineProperty(_, "name", {value: cfg.name});
    _.prototype.constructor = _;
    _.getAlias              = getFieldAlias;
    return _;
}

module.exports = defineModel;
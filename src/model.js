import defineField   from "./field";
import Evt           from "../assets/evt";
import {has, notAll} from "../assets/object";
import throttle      from "../assets/throttle"

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
        f.$isField ? this.$fields[key].$val = val : f.$set(val);
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

/**
 *
 * @param fields
 * @return {ModelProto}
 */
// ModelProto.prototype.$reset = function (...fields) {
//     let $fields = this.$fields;
//     if (!fields.length || fields[0] === true) {
//         for (let item in $fields)$fields[item].$reset && $fields[item].$reset(true);
//         // let $metaCache = this.$metaCache;
//         // let isMod      = $metaCache.$isMod;
//         // let isValid    = $metaCache.$isValid;
//         if (isMod !== this.$isMod) {
//             this.$isMod = isMod;
//             this.$emit("modChg", isMod);
//             this.$ref && this.$ref.$emit("fieldModChg", this.constructor.$name, isMod);
//         }
//         if (isValid !== this.$isValid) {
//             this.$isValid = isValid;
//             this.$emit("validChg", isValid);
//             this.$ref && this.$ref.$emit("fieldValidChg", this.constructor.$name, isValid);
//         }
//     } else {
//         for (let item of fields)$fields[item].$reset();
//     }
//     return this;
// };
/**
 *
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
 * @param fields
 * @param force
 * @param muse
 * @return {Promise<any[]>}
 */
ModelProto.prototype.$validate = function (fields, force, muse) {
    let ths       = this,
        allFields = ths.$fields,
        ret       = [];
    if (this.$validate.ing) return this.$validate.ing;
    fields = fields || Object.keys(ths.$fields);
    for (let fName of fields) {
        let tmp, field = allFields[fName];
        if (field.$validate.ing) {
            ret.push(field.$validate.ing);
            continue;
        }
        if (field.$isValid !== undefined && !force) continue;
        tmp = field.$isField ? field.$validate(undefined, muse) : field.$validate(undefined, force, muse);
        ret.push(tmp);
    }
    return this.$validate.ing = Promise.all(ret).then(() => {
        // if (flag) return false;
        // let isValid = !has(this.$validation, false);
        // if (this.$isValid !== isValid) {
        //     this.$isValid = isValid;
        //     this.$emit("validChg", isValid);
        //     this.$ref && this.$ref.$emit("fieldValidChg", this.constructor.name, isValid);
        // }
        this.$validate.ing = undefined;
        return this.$isValid;
    });
};

ModelProto.prototype.$isModel = true;

/**
 *
 */


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
 */

function emitModChg() {
    this.$emit("modChg", this.$isMod);
    this.$ref && this.$ref.$emit("fieldModChg", this.constructor.name, this.$isMod);
    // isMod === false && (isMod = has(this.$modified, true));
    // if (this.$isMod !== isMod) {
    //     this.$isMod = isMod;
    //     this.$emit("modChg", isMod);
    //     this.$ref && this.$ref.$emit("fieldModChg", this.constructor.$name, isMod);
    // }
}


function emitValidChg(isValid) {
    this.$emit("validChg", isValid);
    this.$ref && this.$ref.$emit("fieldValidChg", this.constructor.name, isValid);
    // if (isValid !== this.$isValid && isValid) {
    //     let validation = this.$validation;
    //     isValid        = !has(validation, false);
    //     if (isValid && has(validation, undefined)) {
    //         isValid = undefined;
    //     }
    // }
    //
    // if (isValid !== this.$isValid) {
    //     this.$isValid = isValid;
    //     this.$emit("validChg", isValid);
    //     this.$ref && this.$ref.$emit("fieldValidChg", this.constructor.$name, isValid);
    // }
}


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


/**
 *
 * @param cfg
 * @return {M}
 * @constructor
 */
export default function defineModel(cfg) {
    let fields = cfg.fields || cfg;
    /**
     *
     * @param data
     * @param isStrict
     * @private
     */
    let _      = function (data, isStrict) {
        let flag = false, tmpP = [],
            fields             = this.constructor.prototype.$fields,
            validation         = {},
            modified           = {};
        data ? Array.isArray(data) : data = {};
        this.$isValid = true;
        this.$isMod   = false;
        Object.defineProperty(this, "$fields", {value: {}});
        this.$validate = throttle(this.$validate, 200, true);
        for (let idx = 0, len = fields.length; idx < len; idx++) {
            let field,
                fieldCls        = fields[idx],
                fname           = fieldCls.name,
                val             = flag ? data[idx] : data[fname];
            field               = new fieldCls(val, isStrict);
            validation[fname]   = field.$isValid;
            this.$fields[fname] = field;
            field.$ref          = this;
            field.$idx          = idx;
            modified[fname]     = false;
            Object.defineProperty(this, fname, new Destor(fname));
            if (field.$isValid === false && this.$isValid !== false) {
                this.$isValid = false
            } else if (field.$validate.ing) {
                tmpP.push(field.$validate.ing);
                this.$isValid && (this.$isValid = undefined);
            } else if (this.$isValid === true) {
                this.$isValid = field.$isValid;
            }
        }
        if (tmpP.length && this.$isValid !== false) {
            let ths            = this;
            this.$validate.ing = Promise.all(tmpP).then(function () {
                ths.$isValid      = !has(validation, false);
                ths.$validate.ing = undefined;
            });
        }
        this.$validation = validation;
        Object.defineProperty(this, "$modified", {value: modified});
        let _emitValidChg = throttle(emitValidChg, 80).promiseble(false);
        this.$on("fieldValidChg", (fieldName, isValid) => {
            let validation        = this.$validation;
            validation[fieldName] = isValid;
            isValid === true && (isValid = !notAll(validation, true));
            if (isValid !== this.$isValid) {
                this.$isValid = isValid;
                _emitValidChg.call(this, isValid);
            } else {
                _emitValidChg.clear();
            }
        });
        let _emitModChg = throttle(emitModChg, 80, true).promiseble(false);
        this.$on("fieldModChg", (fieldName, isMod) => {
            let modified        = this.$modified;
            modified[fieldName] = isMod;
            isMod === false && (isMod = has(this.$modified, true));
            if (this.$isMod !== isMod) {
                this.$isMod = isMod;
                this.$ref && (this.$ref.$modified[fieldName] = true);
                _emitModChg.call(this);
            } else {
                _emitModChg.clear();
            }
        });
        _emitModChg.$isMod = false;
    };
    Object.defineProperty(_, "$name", {value: cfg.name});
    _.prototype = new ModelProto(fields);
    Object.defineProperty(_.prototype, "$name", {value: cfg.name});
    _.prototype.constructor = _;
    _.$getAlias             = getFieldAlias;
    Object.defineProperty(_, "name", {value: cfg.name});
    return _;
}



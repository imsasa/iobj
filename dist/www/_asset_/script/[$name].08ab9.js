/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./assets/evt.js":
/*!***********************!*\
  !*** ./assets/evt.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * 创建一个订阅管理对象
 * @class Evt
 * @constructor
 */
function Evt() {
}
Evt.prototype={
    /**
     * 订阅
     * @param  {string} key 订阅名称
     * @param  {function} fn 触发的方法
     * @returns {Evt}
     */
    subscribe: function (key, fn) {
        this[key]||( this[key]=[]);
        this[key].push(fn);
        return this;
    },
    /**
     * 触发
     * @params {string} 订阅名称
     * @args {*...} 触发事件需传递的参数
     * @returns {Evt}
     */
    trigger: function (key,...args) {
        let len, fns;
        fns = this[key];
        for (len = fns ? fns.length : 0; len--;) {
            fns[len].apply(undefined, args);
        }
        return this;
    },
    /**
     * 移除某个订阅
     * @param key
     * @param fn
     * @returns {Evt}
     */
    remove: function( key, fn ){
        let fns = this[key], len;
        if(!fns||!fn){
            !fn&&(fns = []);
            return this;
        }
        for (len = fns.length; len--;) {
            fn === fns[len] && fns.splice(i=len, 1);
        }
        return this;
    }
};
Evt.prototype.constructor=Evt;
module.exports= Evt;


/***/ }),

/***/ "./assets/object.js":
/*!**************************!*\
  !*** ./assets/object.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * object 对象相关操作
 * @module Object
 */

/**
 * 将sourceObj中的属性拷贝到destObj中，如果destObj中属性存在则不拷贝
 * @param destObj
 * @param sourceObj
 * @return {Object}
 */
module.exports.copyIfNotExist = function (destObj, sourceObj) {
    let idx;
    destObj || (destObj = {});
    for (idx in sourceObj) {
        destObj[idx] === undefined && (destObj[idx] = sourceObj[idx])
    }
    return destObj;
};
/**
 * 判断是给定的参数否为数组
 * @param arg
 */

// export function isArray(arg) {
//     return Array.isArray ? Array.isArray(arg) : Object.prototype.toString.call(arg) === "[object Array]"
// }

/**
 *
 * @param obj
 * @param flag
 * @return {boolean}
 */
module.exports.has = function (obj, flag) {
    for (let i in obj) {
        if (flag === obj[i]) return true;
    }
    return false;
};
module.exports.notAll = function (obj, flag) {
    for (let i in obj) {
        if (flag !== obj[i]) return true;
    }
    return false;
};


/***/ }),

/***/ "./assets/throttle.js":
/*!****************************!*\
  !*** ./assets/throttle.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 *
 * @param fn
 * @param delay
 * @param opt
 * @param mode
 * @returns {retFn}
 * @private
 */
function _throttle_(fn, delay = 1000, opt, mode) {
    if (typeof delay === "object") {
        opt   = delay;
        delay = opt.delay || 1000;
    }
    let {immediate, leave, promise} = opt || {};
    let timer, t                    = 0, p, pres, prej, args;

    function _timer_(ctx, res, rej) {
        if (!mode && timer) return;
        mode && timer && clearTimeout(timer);
        prej  = rej;
        pres  = res;
        timer = setTimeout(() => {
            if (!timer) return;
            promise ? pres(fn.apply(ctx, args)) : fn.apply(ctx, args);
            timer = undefined;
            pres  = prej = p = undefined;
            t     = Date.now();
        }, delay);
    }

    function retFn() {
        if (!timer || !leave) args = arguments;
        if (!timer && Date.now() - t > delay && immediate) {
            t = Date.now();
            return promise ? Promise.resolve(fn.apply(this, args)) : fn.apply(this, args);
        }
        (!p && promise) ? p = new Promise((res, rej) => _timer_(this, res, rej))
            : _timer_(this, pres, prej);
        return p;
    }

    retFn.clear = () => {
        clearTimeout(timer) || (timer = undefined);
        pres = p = undefined;
        prej && prej("$rej$");
        prej = undefined;
        t    = 0;
        return retFn;
    };
    return retFn;
}

/**
 *
 * @param fn
 * @param {number} [delay=1000]
 * @param {object} [opt]
 * @returns {Function}
 */
module.exports.throttle = function throttle(fn, delay, opt) {
    return _throttle_(fn, delay, opt, 0)
};

/**
 *
 * @param fn
 * @param {number} [delay=1000]
 * @param {object} [opt]
 * @returns {Function}
 */
module.exports.debounce = function (fn, delay, opt) {
    return _throttle_(fn, delay, opt, 1);
};


/***/ }),

/***/ "./src/field.js":
/*!**********************!*\
  !*** ./src/field.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

let Evt      = __webpack_require__(/*! ../assets/evt */ "./assets/evt.js");
let debounce = __webpack_require__(/*! ../assets/throttle */ "./assets/throttle.js").debounce;

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
        debugger;
        if (value === undefined) {
            this.required?value = this.defaultValue:isValid=true;
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


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports.field=__webpack_require__(/*! ./field */ "./src/field.js");
module.exports.model=__webpack_require__(/*! ./model */ "./src/model.js");
// export model from './model';


/***/ }),

/***/ "./src/model.js":
/*!**********************!*\
  !*** ./src/model.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

let defineField   = __webpack_require__(/*! ./field */ "./src/field.js");
let Evt           = __webpack_require__(/*! ../assets/evt */ "./assets/evt.js");
let debounce      = __webpack_require__(/*! ../assets/throttle */ "./assets/throttle.js").debounce;
let {has, notAll} = __webpack_require__(/*! ../assets/object */ "./assets/object.js");

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


/***/ })

/******/ });
//# sourceMappingURL=[$name].08ab9.js.map
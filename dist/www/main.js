(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/evt.js":
/*!***********************!*\
  !*** ./assets/evt.js ***!
  \***********************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);

/**
 * 创建一个订阅管理对象
 * @class Evt
 * @constructor
 */
function Evt(ctx) {
    if(ctx){
        let evt   = this;
        ctx.$on   = (name, fn) => evt.subscribe(name, fn);
        ctx.$un   = (name, fn) => evt.remove(name, fn);
        ctx.$emit = (...arg) => evt.trigger(...arg);
    }
}

Evt.prototype             = {
    /**
     * 订阅
     * @param  {string} key 订阅名称
     * @param  {function} fn 触发的方法
     * @returns {Evt}
     */
    subscribe: function (key, fn) {
        this[key] || (this[key] = []);
        this[key].push(fn);
        return this;
    },
    /**
     * 触发
     * @params {string} 订阅名称
     * @args {*...} 触发事件需传递的参数
     * @returns {Evt}
     */
    trigger: function (key, ...args) {
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
    remove: function (key, fn) {
        let fns = this[key], len;
        if (!fns || !fn) {
            !fn && (fns = []);
            return this;
        }
        for (len = fns.length; len--;) {
            fn === fns[len] && fns.splice(i = len, 1);
        }
        return this;
    }
};
Evt.prototype.constructor = Evt;
/* harmony default export */ __webpack_exports__["default"] = (Evt);



/***/ }),

/***/ "./assets/object.js":
/*!**************************!*\
  !*** ./assets/object.js ***!
  \**************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "has": function() { return /* binding */ has; },
/* harmony export */   "notAll": function() { return /* binding */ notAll; }
/* harmony export */ });
/**
 * object 对象相关操作
 * @module Object
 */

// /**
//  * 将sourceObj中的属性拷贝到destObj中，如果destObj中属性存在则不拷贝
//  * @param destObj
//  * @param sourceObj
//  * @return {Object}
//  */
// export function copyIfNotExist(destObj, sourceObj) {
//     let idx;
//     destObj || (destObj = {});
//     for (idx in sourceObj) {
//         destObj[idx] === undefined && (destObj[idx] = sourceObj[idx])
//     }
//     return destObj;
// };


function has(obj, flag) {
    for (let i in obj) {
        if (flag === obj[i]) return true;
    }
    return false;
}

/**
 *
 * @param obj
 * @param flag
 * @return {boolean}
 */
function notAll(obj, flag,prop) {
    for (let i in obj) {
        let tmp=obj[i];
        if (flag !== tmp) return true;
    }
    return false;
}

/***/ }),

/***/ "./assets/throttle.js":
/*!****************************!*\
  !*** ./assets/throttle.js ***!
  \****************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "throttle": function() { return /* binding */ throttle; },
/* harmony export */   "debounce": function() { return /* binding */ debounce; }
/* harmony export */ });
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
function throttle(fn, delay, opt) {
    return _throttle_(fn, delay, opt, 0)
}

/**
 *
 * @param fn
 * @param {number} [delay=1000]
 * @param {object} [opt]
 * @returns {Function}
 */
function debounce(fn, delay, opt) {
    return _throttle_(fn, delay, opt, 1);
}

 // default {throttle, debounce}

/***/ }),

/***/ "./src/field.js":
/*!**********************!*\
  !*** ./src/field.js ***!
  \**********************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ defineField; }
/* harmony export */ });
/* harmony import */ var _assets_throttle_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../assets/throttle.js */ "./assets/throttle.js");


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
        //this.$emit('isModifiedChange', this.isModified,this);
    }
    this.$validate();
}

let computeFn;
let willComputed = (function () {
    let set       = new Set();
    let executeFn = function () {
        set.forEach(i => {
            set.delete(i);
            i()
        });
    }
    return {
        add(v) {
            set.add(v);
            executeFn();
        }
    }
})();

/**
 *
 * @param initVal
 * @param ctx
 * @constructor
 */

function Destor(initVal, ctx) {
    let value;
    let fn = (newVal, preVal) => ifDirtyFn.call(ctx, newVal, initVal, preVal)

    function setVal(newValue, preVal) {
        if (!isDiff(newValue, preVal)) return;
        Array.isArray(newValue) && (newValue = proxyArray(newValue, fn));
        value = newValue;
        fn(value = newValue, preVal);
    }

    if (ctx.type === 'compute') {
        this.get  = () => value;
        let cfn   = ctx.value;
        computeFn = () => {
            let newVal = Reflect.apply(cfn, ctx.$ref, []);
            setVal(newVal, value);
        }
        initVal   = Reflect.apply(cfn, ctx.$ref, []);
        computeFn = undefined;
    } else {
        let computeSet;
        this.get = () => {
            if (computeFn) {
                computeSet || (computeSet = new Set());
                computeSet.add(computeFn);
            }
            return value;
        }
        this.set = function (newVal) {
            setVal(newVal, value);
            if (!computeSet) return;
            for (let i of computeSet) {
                willComputed.add(i);
            }
        }
    }
    value = (initVal && Array.isArray(initVal)) ? proxyArray(initVal, fn) : initVal;
}

/**
 *
 * @param isValid
 * @returns {*}
 * @private
 */
function FieldPrototype({name, alias, desc, validator, defaultValue, required, type, value}) {
    this.name         = name || this.constructor.name;
    this.alias        = alias;
    this.desc         = desc;
    this.validator    = validator;
    this.defaultValue = defaultValue;
    this.required     = !!required;
    this.type         = type || '';
    this.value        = value;
    return this;
}

/**
 *
 */
FieldPrototype.prototype.isField = true;
const validateHelper               = function (isValid) {
    let validateMsg = isValid&&isValid.msg;
    isValid         =  typeof isValid!=='boolean'?isValid.isValid:isValid;
    if (this.isValid !== isValid) {
        this.isValid     = isValid;
        this.validateMsg = validateMsg;
        this.$ref && this.$ref.$emit("fieldValidChg", this.name, isValid,validateMsg);
        // this.$emit('$isValidChange', this.isValid, this);
    }
    return isValid;
}
FieldPrototype.prototype.$validate = function () {
    let isValid, val = this.value;
    let validator    = this.validator;
    if (this.required && val === undefined) {
        isValid = false
    } else if (val === this.defaultValue || (Array.isArray(val) && !isDiff(val, this.defaultValue))) {
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
function defineField(conf) {
    function F(value, ref) {
        if (value === undefined && this.required) {
            value = this.defaultValue;
        }
        this.isValid    = undefined;
        this.isModified = false;
        this.$ref       = ref;
        this.$validate  = (0,_assets_throttle_js__WEBPACK_IMPORTED_MODULE_0__.throttle)(this.$validate, 200, {immediate: false, promise: true});
        Object.defineProperty(this, "value", new Destor(value, this));
    }

    F.prototype             = new FieldPrototype(conf);
    F.prototype.constructor = F;
    Object.defineProperty(F, "name", {value: conf.name});
    F.isField = true;
    return F;
};


/***/ }),

/***/ "./src/model.js":
/*!**********************!*\
  !*** ./src/model.js ***!
  \**********************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ defineModel; }
/* harmony export */ });
/* harmony import */ var _field_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./field.js */ "./src/field.js");
/* harmony import */ var _assets_evt_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../assets/evt.js */ "./assets/evt.js");
/* harmony import */ var _assets_throttle_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../assets/throttle.js */ "./assets/throttle.js");
/* harmony import */ var _assets_object_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../assets/object.js */ "./assets/object.js");






function ckValidationHelper(isValid, validation, ctx) {
    if(isValid){
        for (let i in validation) {
            let tmp=validation[i].isValid;
            if (!tmp) isValid= tmp;
            if(isValid===false)break;
        }
    }
    ctx.ref && (ctx.ref.$validation[ctx.name] = {isValid});
    ctx.ref && ctx.ref.$emit('fieldValidChg', ctx.name, isValid);
    ctx.$emit("$isValidChg", isValid);
    return ctx.$isValid = isValid;
}

/**
 *
 * @param fieldsCfg
 * @constructor
 */
function ModelPrototype(fieldsCfg) {
    let fields = [],computeFields=[];
    for (let field of fieldsCfg) {
        if (!field.isField && !field.$isModel) {
            field = field.$isModel ? defineModel(field) : (0,_field_js__WEBPACK_IMPORTED_MODULE_0__["default"])(field)
        }
       field.type==='compute'?computeFields.push(field):fields.push(field);
    }
    this.$fields=fields;
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
    let _ = (0,_assets_throttle_js__WEBPACK_IMPORTED_MODULE_2__.debounce)(
        function (isValid, validation) {
            return ckValidationHelper(isValid, validation, ctx);
        }, 80, {promise: true}
    );
    return function (fieldName, isValid,msg) {
        ctx.$validation[fieldName].isValid = isValid;
        ctx.$validation[fieldName].msg = msg;
        if (isValid !== ctx.$isValid) _(isValid, ctx.$validation);
        // if (isValid === true) {
        //
        // } else {
        //     ctx.$ref && ctx.$ref.$emit("fieldValidChg", ctx.constructor.name, false,ctx.$validation);
        //     ctx.$emit("$isValidChg", ctx.$isValid = false,ctx.validateMsg);
        // }
    }
}

function fieldModChgHandler(ctx) {
    let _ = (0,_assets_throttle_js__WEBPACK_IMPORTED_MODULE_2__.debounce)(
        function (modified, isMod) {
            isMod = isMod || (0,_assets_object_js__WEBPACK_IMPORTED_MODULE_3__.has)(modified, true);
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
function defineModel(cfg,watch) {
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
        new _assets_evt_js__WEBPACK_IMPORTED_MODULE_1__["default"](this);
        for (let idx = 0, len = fields.length; idx < len; idx++) {
            let field,
                fieldCls            = fields[idx],
                fname               = fieldCls.name,
                initVal             = flag ? data[idx] : data[fname];
            field                   = new fieldCls(initVal, this);
            field.idx               = idx;
            modified[fname]         = false;
            this.$fields[fname]     = field;
            this.$validation[fname] = field.$isModel ? field.$validation : {isValid:field.isValid,msg:field.validateMsg};
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
        this.$on("fieldModChg"  , fieldModChgHandler(this)  );
        this.$on("fieldValueChg", (fname, value,preValue) => {
            if(watch&&watch[fname]){
                Reflect.apply(watch[fname],this,[value,preValue]);
            }
            // evt.trigger(fname, value);
        });
        this.$validate = (0,_assets_throttle_js__WEBPACK_IMPORTED_MODULE_2__.debounce)(this.$validate, 100, {immediate: true, promise: true});
    };
    _.prototype = new ModelPrototype(fields);
    _.$fields   = _.prototype.$fields;
    cfg.name && Object.defineProperty(_, "name", {value: cfg.name});
    _.prototype.constructor = _;
    return _;
}

// module.exports = defineModel;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "field": function() { return /* reexport safe */ _field_js__WEBPACK_IMPORTED_MODULE_1__["default"]; },
/* harmony export */   "defineModel": function() { return /* reexport safe */ _model_js__WEBPACK_IMPORTED_MODULE_0__["default"]; }
/* harmony export */ });
/* harmony import */ var _model_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./model.js */ "./src/model.js");
/* harmony import */ var _field_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./field.js */ "./src/field.js");


/* harmony default export */ __webpack_exports__["default"] = (_model_js__WEBPACK_IMPORTED_MODULE_0__["default"]);

// export model from './model';

}();
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=main.js.map
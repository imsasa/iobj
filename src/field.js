import Evt      from "../assets/evt";
import throttle from "../assets/throttle"

/**
 *
 * @param initVal
 * @param initVal
 * @constructor
 */
function Destor(initVal) {
    let val=initVal;
    this.get = () => val;
    this.set = function (newVal) {
        let isMod = this.$isA ? wrapArr.compareArray(newVal, val) : val !== newVal;
        if (isMod){
            this.$evt && this.$emit("valChg", newVal,val, this);
            this.$ref && this.$ref.$emit("fieldValChg", this.$name, newVal,val);
            // if (this.$isA) return val;
            isMod=this.$isA ? wrapArr.compareArray(initVal, newVal) : newVal !== initVal;
            if (this.$isMod !== isMod) {
                this.$isMod = !this.$isMod;
                this.$emit("modChg", this.$isMod);
                this.$ref && this.$ref.$emit("fieldModChg", this.$name, this.$isMod);
            }
            this.$validate(newVal);
            val=newVal;
        }
        return val;
        // if(this.$isValid===undefined)this.$validate();
    };
}


let wrapArr = (
    function () {
        let _valChgHandler_ = function (initVal,val, ctx) {
            // let ctx=nval.$ctx;
            ctx.$validate();
            let isMod = wrapArr.compareArray(initVal, val);
            if (isMod === ctx.$isMod) return;
            ctx.$isMod = isMod;
            ctx.$emit("modChg", isMod);
            ctx.$ref && ctx.$ref.$emit("fieldModChg", ctx.$name, isMod);
        };

        // _valChgHandler_.promiseble(false);//todo
        function wrapArr(initVal = [], ctx) {
            let _val_       = [...initVal];
            _val_.__proto__ = wrapProto;
            Object.defineProperty(_val_, "$ctx", {value: ctx});
            ctx.$on("valChg",(newVal,preVal,ctx)=> _valChgHandler_(initVal,newVal,ctx));
            return _val_;
        }

        wrapArr.compareArray = function (a1, a2) {
            // if (a1 === a2) return false;
            if (a1.length !== a2.length) return true;
            for (let i = 0, n = a1.length; i < n; i++)
                if (!a2.includes(a1[i])) return true;
            return false;
        };
        return wrapArr;
    })();


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
        let _arr_=[...this];
        m.apply(this, arguments);
        let $ctx=this.$ctx;
        // this.$ctx.$ref[this.$ctx.$name]=this;
        $ctx.$evt && $ctx.$emit("valChg", this,_arr_, $ctx);
        // this.$ref && this.$ref.$emit("fieldValChg", this.$name, this,_arr_);
        // if (this.$isA) return val;
        // isMod=this.$isA ? wrapArr.compareArray(initVal, val) : val !== initVal;
        // if (this.$isMod !== isMod) {
        //     this.$isMod = !this.$isMod;
        //     this.$emit("modChg", this.$isMod);
        //     this.$ref && this.$ref.$emit("fieldModChg", this.$name, this.$isMod);
        // }
        // this.$validate();
        // ctx.$ref && (ctx.$ref.$modified[ctx.$name] = true);
        // return this.$ctx.$emit("valChg",this, this, ctx);
    };
});

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
    return val === undefined || val === ""
};
FieldProto.prototype.$required.info = "该字段不能为空";

/**
 *
 */
// Object.defineProperty(FieldProto.prototype, "$data", {
//     get: function () {
//         return this.$val;
//     }
// });
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

// FieldProto.prototype.$reset = function (muse) {
//     let $metaCache = this.$metaCache;
//     if ($metaCache.$val === this.$val) return this;
//     let isMod      = $metaCache.$isMod,
//         isValid    = $metaCache.$isValid;
//     let isModChg   = isMod !== this.$isMod;
//     let isValidChg = isValid !== this.$isValid;
//     this.$val      = $metaCache.$val === undefined ? this.$defaultVal : $metaCache.$val;
//     this.$isMod    = isMod;
//     this.$isValid  = isValid;
//     let ref        = this.$ref;
//     if (muse) {
//         if (!ref) return this;
//         isModChg && (ref.$modified[this.$name] = isMod);
//         isValidChg && (ref.$validation[this.$name] = isValid);
//         return this;
//     } else {
//         if (isModChg) {
//             this.$emit("modChg", this.$isMod);
//             this.$ref && this.$ref.$emit("fieldModChg", this.$name, this.$isMod);
//         }
//         if (isValidChg) {
//             this.$emit("validChg", this.$isValid);
//             this.$ref && this.$ref.$emit("fieldValidChg", this.$name, this.$isValid);
//         }
//     }
//     return this;
// };
/**
 *
 * @return {FieldProto}
 */

// FieldProto.prototype.$save = function () {
//     let $metaCache = this.$metaCache;
//     if (!this.$isMod || $metaCache.$val === this.$val) return;
//     $metaCache.$val     = this.$val;
//     $metaCache.$isValid = this.$isValid;
//     $metaCache.$isMod   = this.$isMod;
//     return this;
// };

/**
 *
 * @param muse
 * @returns {Promise<boolean>}
 */
(function () {
    function _(muse, isValid) {
        this.$validate.ing = undefined;
        let $isValid=this.$isValid;
        this.$isValid      = isValid;
        if (muse) {
            this.$ref && (this.$ref.$validation[this.$name] = isValid);
        } else if (isValid !== $isValid) {
            this.$emit("validChg", isValid);
            this.$ref && this.$ref.$emit("fieldValidChg", this.$name, isValid);
        }
    }

    /**
     *
     * @param val
     * @param muse
     * @returns {boolean}
     */
    FieldProto.prototype.$validate = function (val, muse) {
        let isValid   = false;
        let validator = this.$validator;
        val           = val || this.$val;
        if ((val && !validator) || (this.$isRequired !== true && this.$required(val)) || (val && val === this.$defaultVal))
            isValid=true;
        else if (val && validator)
            isValid = typeof validator === "function" ? this.$validator(val) : validator && this.$validator.test(val);
        isValid.then ? isValid.then((val) => _.call(this, muse, val)) : _.call(this, muse, isValid);
        isValid.then && (this.$validate.ing = isValid);
        return isValid;
    };

    // /**
    //  *
    //  * @return {Promise<{then}|*>}
    //  */
    // FieldProto.prototype.$validateSync = async function (muse) {
    //     let isValid = true;
    //     if (this.$validator) {
    //         isValid = typeof this.$validator === "function" ? this.$validator(this.val) : this.$validator && this.$validator.test(this.$val);
    //     }
    //
    //     if (isValid.then) isValid = await isValid;
    //     _.call(this,muse,isValid);
    //     return isValid;
    // };
})();

// FieldProto.prototype.$validate = async function (muse) {
//     let isValid = true;
//     if (this.$validator) {
//         isValid = typeof this.$validator === "function" ? this.$validator(this.val) : this.$validator && this.$validator.test(this.$val);
//     }
//
//     if (isValid.then) isValid = await isValid;
//     if (muse) {
//         this.$ref && (this.$ref.$validation[this.$name] = isValid);
//     } else if (isValid !== this.$isValid) {
//         this.$isValid = isValid;
//         this.$emit("validChg", isValid);
//         this.$ref && this.$ref.$emit("fieldValidChg", this.$name, isValid);
//     }
//     return isValid;
// };
/**
 * generate a Field Type
 * @param conf 字段属性配置
 * @return {F}
 * @constructor
 */
export default function defineField(conf) {
    /**
     *
     * @param val
     * @param isStrict
     * @constructor Field
     */

    function F(val, isStrict) {
        this.$validate = throttle(this.$validate, 200, true);
        this.$isMod    = false;
        if(typeof this.$defaultVal==="function")this.$defaultVal=this.$defaultVal();
        if(val===undefined &&isStrict!==true)val=this.$defaultVal;
        Object.defineProperty(this, "$val", new Destor(conf.isA ? wrapArr(val, this) : val));
        if(val!==undefined||isStrict!==false){
            isStrict?this.$isValid=true:this.$validate(val,true);
            // if(isStrict){
            //     this.$isValid=true;
            //     // this.$ref && (this.$ref.$validation[this.$name] = true);
            // }else{
            //     this.$validate(val,true);
            // }
        }
        // else {
        //     this.$ref && (this.$ref.$validation[this.$name] = undefined);
        // }
        // Object.defineProperty(this, "$metaCache", {enumerable: false, value: {$isMod: false}});
        Object.defineProperty(this, "$initVal", {enumerable: false, value:val});
    }

    if (typeof conf === "string") conf = {name: conf};
    F.prototype = new FieldProto(conf);
    Object.defineProperty(F, "name", {value: conf.name});
    // Object.defineProperty(F, "name", {value: conf.name});
    return F;
}
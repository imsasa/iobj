import defineField from "./field.js";
// import { debounce } from 'radash'
import mitt from 'mitt'
import instanceStateMap from "./instance-map.js";
import Base from "./base.js";

// 计算 isValid 聚合值（纯函数，不修改状态）
// validation 结构：undefined(未验证) | true(通过) | [](错误数组)
function calcIsValid(validation) {
  const values = Object.values(validation);
  // FIX: Handle empty validation (no fields)
  if (values.length === 0) return undefined;
  // 三态聚合：False(数组) > Undefined > True
  if (values.some(v => Array.isArray(v))) {
    return false;
  } else if (values.some(v => v === undefined)) {
    return undefined;
  } else {
    return true;
  }
}

// 计算 isDirty 聚合值（纯函数，不修改状态）
function calcIsDirty(modified) {
  return Object.values(modified).some((v) => v === true);
}

// 契约：直接映射 field 的 dirty 状态
let fieldModifiedChangeHandler = function (isDirty, f) {
  let ths = this;
  ths.modified[f.name] = isDirty;
  const _isDirty = calcIsDirty(ths.modified);
  if (ths.isDirty !== _isDirty) {
    ths.isDirty = _isDirty;
    instanceStateMap.get(ths).bus.emit('modifiedChange', _isDirty, ths);
  }
};

// 契约：三态聚合 (False > Undefined > True)
let fieldValidChangeHandler = function (isValid, f) {
  let ths = this;
  // 契约：简化结构 undefined | true | []
  if(isValid===false){
    ths.validation[f.name] = f.validation || [];
  } else {
    ths.validation[f.name] = isValid;
  }
  // ths.validation[f.name] = isValid === false ? (f.validation || []) : isValid;
  const _isValid = calcIsValid(ths.validation);
  if(_isValid!==this.isValid){
    ths.isValid = _isValid;
    instanceStateMap.get(ths).bus.emit('validChange', _isValid);
  }
};

function init($fields, $data = {}, ths) {
  const fields                   = {};
  const validation               = ths.validation;
  const modified                 = ths.modified;
  const _fieldModifiedChangeHandler = fieldModifiedChangeHandler.bind(ths);
  const _fieldValidChangeHandler = fieldValidChangeHandler.bind(ths);
  for (let Field of $fields) {
    let fieldName = Field.name;
    let val       = $data[fieldName];
    let field     = new Field(val);
    field.__ref__ = ths;
    // 初始化状态对齐 (undefined = 未验证)
    // FIX: Don't overwrite or initialize if we want sparse state for partial check
    if (validation[fieldName] === undefined) validation[fieldName] = undefined;
    if (modified[fieldName] === undefined) modified[fieldName] = false;
    let get               = () => field.value;
    let set               = (val) => field.value = val;
    field.on('modifiedChange',(isDirty) =>{
      _fieldModifiedChangeHandler(isDirty, field)
    });
    field.on('validChange', (isValid) =>{
      _fieldValidChangeHandler(isValid, field)
    });
    Object.defineProperty(ths.value, field.name, {get, set, enumerable: true, configurable: true});
    fields[field.name] = field;
  }
  return fields;
}

function validate(arg1, arg2) {
  let skipEmpty = false;
  let options = {};
  
  if (typeof arg1 === 'boolean') {
    skipEmpty = arg1;
    if (typeof arg2 === 'object') options = arg2;
  } else if (typeof arg1 === 'object') {
    options = arg1;
    if (options.skipEmpty !== undefined) skipEmpty = options.skipEmpty;
  }
  
  const force = options.force === true;
  const fieldsToValidate = options.fields; // array of names

  let ths  = this, fields = Object.values(ths.fields), varr   = [];
  for (let field of fields) {
    if (fieldsToValidate && !fieldsToValidate.includes(field.name)) {
      continue;
    }

    // Optimization: Skip if not forced, has result, and not dirty
    const isDirty = ths.modified[field.name];
    const fieldState = instanceStateMap.get(field);
    let validPromise = null;

    if (fieldState.pending) {
      validPromise = field.sync().then(() => {
        const currentIsDirty = ths.modified[field.name];
        // pending 结束后的二次检查逻辑...
        if (force || currentIsDirty || field.isValid === undefined) {
           return field.validate(skipEmpty);
        }
        return field.isValid;
      });
    }
    else if (force || isDirty || field.isValid === undefined) {
      validPromise = field.validate(skipEmpty);
    }
    validPromise && varr.push(validPromise);
  }
  return Promise.all(varr).then(() => {
    // 同步计算并更新缓存
    const isValid = calcIsValid(ths.validation);
    ths.isValid = isValid;
    return isValid;
  });
}

function defineFields(fieldsCfg = {}) {
  let fields = [];
  const _defineField = (name, opts) => {
    const realName = name !== undefined ? name : opts.name;
    const f = (opts.__field__ || opts.__model__) ? opts : defineField(realName, opts);
    fields.push(f);
  };
  if (Array.isArray(fieldsCfg)) {
    fieldsCfg.forEach(i => _defineField(undefined,i));
  } else {
    Object.entries(fieldsCfg).forEach(([k, cfg]) => {
      // FIX: Check if cfg is Model class
      let isModel = false;
      if (typeof cfg === 'function' && cfg.prototype) {
         if (cfg.prototype instanceof Base) isModel = true;
      }
      
      if (!isModel && (typeof cfg !== 'object' || cfg === null || Array.isArray(cfg) || cfg instanceof Date)) {
        cfg = {defaultValue: cfg};
      }
      _defineField(k, cfg);
    });
  }
  return fields;
}

/**
 *
 * @param {String||Object} [name]
 * @param fields
 * @return {Model}
 */
export default function defineModel(name, fields) {
  if (typeof name === 'object') {
    fields = name;
    name   = undefined;
  }
  class _ extends Model {
    constructor(obj, options) {
      super(obj, options);
    }
    $name          = name;
    static fields = defineFields(fields);
  }
  return _;
}
export class Model extends Base {
  constructor(data = {}, options = {}) {
    super();
    this.validation = options.validation || {};
    this.modified   = options.modified || {};
    this.value      = {};
    // 初始化 WeakMap 状态
    instanceStateMap.set(this, {
      bus: mitt(),
    });
    let fields      = this.constructor.fields;
    if (!fields) {
      fields = defineFields(data);
      data   = {};
    }
    Object.defineProperty(this, "fields", {
      value: init(fields, data, this),
      configurable: true
    });
  }
  set(k, v) {
    this.value[k] = v;
    return this;
  }

  validate      = validate;
  __model__      = true;
}

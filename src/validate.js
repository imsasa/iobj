const DEFAULT_VALIDATOR = 'zod';

// /**
//  * 验证器适配器列表
//  */
const adapters = [
  {
    name: DEFAULT_VALIDATOR,
    validate:  async (value, rule) => {
      return rule.parseAsync(value);
    }
  }
];

/**
 * 注册验证器适配器
 * @param name 适配器名称
 * @param validate 验证器函数
 */
export function registerValidateAdapter(name, validate) {
  ValidateAdapter.register(name, validate);
  return ValidateAdapter;
}

/**
 * 验证器适配器类
 */
export class ValidateAdapter {
  constructor(name, rule) {
    this.name = name || DEFAULT_VALIDATOR;
    this.rule = rule;
  }
  async validate(value) {
    const validateFn = ValidateAdapter.get(this.name).validate;
    this.validate = (value) => this.rule ? validateFn(value, this.rule) : true;
    return this.validate(value);
  }
  static register(name, validate) {
    adapters.unshift({name, validate});
    return ValidateAdapter;
  }
  static get(name) {
    return adapters.find(a => a.name === name);
  }
}



import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import defineField from '../src/field.js';

describe('Field Functionality', () => {
  it('should use defaultValue when initialized', () => {
    const F = defineField('test', { defaultValue: 'default' });
    const f = new F();
    expect(f.value).toBe('default');
  });

  it('should format values using format option', () => {
    const F = defineField('test', {
      defaultValue: 'default',
      format: (val) => val && val.toUpperCase()
    });
    const f = new F();
    expect(f.value).toBe('DEFAULT');
    f.value = 'changed';
    expect(f.value).toBe('CHANGED');
  });

  it('should support custom validator function', async () => {
    const F = defineField('test', {
      defaultValue: '',
      validator: async (val) => {
        if (val === 'error') throw new Error('this is invalid');
        return true;
      }
    });
    const f = new F();

    // Initial state
    expect(f.isValid).toBeUndefined();

    // Pass validation
    await expect(f.validate()).resolves.toBe(true);
    expect(f.isValid).toBe(true);

    // Fail validation
    f.value = 'error';
    await expect(f.validate()).resolves.toBe(false);
    expect(f.isValid).toBe(false);
  });

  it('should handle skipEmpty option', async () => {
    const F = defineField('test', {
      defaultValue: '',
      validator: async () => { throw new Error('fail'); }
    });
    const f = new F();
    // Empty value (''), skipEmpty=true -> 保持当前状态 (初始为 undefined)
    await expect(f.validate(true)).resolves.toBe(undefined);
    // Empty value (''), skipEmpty=false -> should fail
    await expect(f.validate(false)).resolves.toBe(false);
  });

  it('should detect dirty state changes', async () => {
    const F = defineField('test', { defaultValue: 'orig' });
    const f = new F();
    expect(f.isDirty).toBe(false);

    f.value = 'changed';
    await f.sync();
    expect(f.isDirty).toBe(true);

    // f.value = 'orig';
    // await f.sync();
    // expect(f.isDirty).toBe(false);
  });

  it('should fire modifiedChange event via on()', async () => {
    const spy = vi.fn();
    const F = defineField('test', { defaultValue: 'orig' });
    const f = new F();
    f.on('modifiedChange', (isDirty) => spy(isDirty));

    f.value = 'changed';
    await f.validate(); // 等待异步验证完成
    await f.sync();
    expect(spy).toHaveBeenCalledWith(true);

    f.value = 'orig';
    await f.validate();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should fire validChange event via on()', async () => {
    const spy = vi.fn();
    const F = defineField('test', {
      defaultValue: 'valid',
      validator: async (v) => { if(v==='inv') throw 'err'; }
    });
    const f = new F();
    f.on('validChange', (isValid) => spy(isValid));

    await f.validate();
    // isValid undefined -> true. Change!
    expect(spy).toHaveBeenCalledWith(true);
    spy.mockClear();

    f.value = 'inv';
    await f.validate();
    // isValid true -> false. Change!
    expect(spy).toHaveBeenCalledWith(false);
  });
});

describe('Field with Zod Validation', () => {
  it('should validate with zod string schema', async () => {
    const F = defineField('email', {
      defaultValue: '',
      rule: z.string().refine(val => val.length > 10, {
        message: '字符串长度必须大于 10',
      }) .refine(val => /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(val), {
        message: '必须是 Gmail 邮箱（@gmail.com）',
      })
    });
    const f = new F();

    // Empty string fails email validation
    await expect(f.validate()).resolves.toBe(false);
    expect(f.isValid).toBe(false);

    // Valid email passes
    f.value = 'tessssqqsst@gmail.com';
    await expect(f.validate()).resolves.toBe(true);
    expect(f.isValid).toBe(true);
  });

  it('should validate with zod min/max constraints', async () => {
    const F = defineField('username', {
      defaultValue: '',
      rule: z.string().min(3, 'Min 3 chars').max(10, 'Max 10 chars')
    });
    const f = new F();

    // Too short
    f.value = 'ab';
    await expect(f.validate()).resolves.toBe(false);

    // Valid length
    f.value = 'john';
    await expect(f.validate()).resolves.toBe(true);

    // Too long
    f.value = 'verylongusername';
    await expect(f.validate()).resolves.toBe(false);
  });

  it('should validate with zod number schema', async () => {
    const F = defineField('age', {
      defaultValue: 0,
      rule: z.number().int().min(0).max(120)
    });
    const f = new F();

    // Valid number
    f.value = 25;
    await expect(f.validate()).resolves.toBe(true);

    // Negative number fails
    f.value = -1;
    await expect(f.validate()).resolves.toBe(false);

    // Over max fails
    f.value = 150;
    await expect(f.validate()).resolves.toBe(false);
  });

  it('should validate with zod enum schema', async () => {
    const F = defineField('status', {
      defaultValue: 'active',
      rule: z.enum(['active', 'inactive', 'pending'])
    });
    const f = new F();

    await expect(f.validate()).resolves.toBe(true);

    f.value = 'unknown';
    await expect(f.validate()).resolves.toBe(false);
  });

  it('should work with skipEmpty and zod rule', async () => {
    const F = defineField('name', {
      defaultValue: '',
      rule: z.string().min(2)
    });
    const f = new F();

    // Empty value, skipEmpty=true -> 保持当前状态 (初始为 undefined)
    await expect(f.validate(true)).resolves.toBe(undefined);

    // Empty value, skipEmpty=false -> fails zod min(2)
    await expect(f.validate(false)).resolves.toBe(false);
  });

  it('should validate with chained zod rules (multiple constraints)', async () => {
    // 密码字段：多个约束链式调用
    const F = defineField('password', {
      defaultValue: '',
      rule: z.string()
        .min(8, 'At least 8 characters')
        .max(20, 'At most 20 characters')
        .regex(/[A-Z]/, 'Must contain uppercase letter')
        .regex(/[a-z]/, 'Must contain lowercase letter')
        .regex(/[0-9]/, 'Must contain digit')
    });
    const f = new F();

    // Too short
    f.value = 'Abc1';
    await expect(f.validate()).resolves.toBe(false);

    // Missing uppercase
    f.value = 'abcdefgh1';
    await expect(f.validate()).resolves.toBe(false);

    // Missing lowercase
    f.value = 'ABCDEFGH1';
    await expect(f.validate()).resolves.toBe(false);

    // Missing digit
    f.value = 'Abcdefghi';
    await expect(f.validate()).resolves.toBe(false);

    // Too long
    f.value = 'Abcdefgh123456789012345';
    await expect(f.validate()).resolves.toBe(false);

    // All constraints satisfied
    f.value = 'Abcdefgh1';
    await expect(f.validate()).resolves.toBe(true);
  });

  it('should validate with zod refine for custom logic', async () => {
    const F = defineField('confirmPassword', {
      defaultValue: '',
      rule: z.string()
        .min(6)
        .refine((val) => val !== 'password', { message: 'Cannot use "password" as password' })
        .refine((val) => !/^(.)\1+$/.test(val), { message: 'Cannot be all same characters' })
    });
    const f = new F();

    // Forbidden password
    f.value = 'password';
    await expect(f.validate()).resolves.toBe(false);

    // All same characters
    f.value = 'aaaaaa';
    await expect(f.validate()).resolves.toBe(false);

    // Valid password
    f.value = 'Secure123';
    await expect(f.validate()).resolves.toBe(true);
  });

  it('should validate with zod transform and multiple pipes', async () => {
    const F = defineField('code', {
      defaultValue: '',
      rule: z.string()
        .min(4)
        .max(10)
        .regex(/^[A-Za-z0-9]+$/, 'Only alphanumeric')
        .transform((val) => val.toUpperCase())
    });
    const f = new F();

    // Contains special chars - fails regex
    f.value = 'abc!';
    await expect(f.validate()).resolves.toBe(false);

    // Valid alphanumeric
    f.value = 'code123';
    await expect(f.validate()).resolves.toBe(true);
  });
});

describe('Field Event Contract for Model Synchronization', () => {
  it('should emit correct payload structure for dirty state synchronization', async () => {
    const F = defineField('testSync', { defaultValue: 'orig' });
    const f = new F();
    const spy = vi.fn();

    // 监听事件参数，验证结构
    f.on('modifiedChange', (isDirty) => spy(isDirty));

    f.value = 'changed';
    await f.sync();

    // 验证 modifiedChange 只传递 isDirty 值
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should emit correct payload structure for validation state synchronization', async () => {
    const F = defineField('testSyncValid', {
      defaultValue: '',
      validator: async () => true
    });
    const f = new F();
    const spy = vi.fn();

    f.on('validChange', (isValid) => spy(isValid));

    await f.validate();

    // 验证 validChange 只传递 isValid 值
    expect(spy).toHaveBeenCalledWith(true);
  });
});

describe('Field Reset Functionality', () => {
  it('should reset field to initial state', async () => {
    const F = defineField('test', {
      defaultValue: 'default',
      validator: async (val) => {
        if (val === 'invalid') throw new Error('Invalid value');
      }
    });
    const f = new F();

    // 修改值并验证
    f.value = 'changed';
    await f.sync();
    await f.validate();

    expect(f.isDirty).toBe(true);
    expect(f.isValid).toBe(true);
    expect(f.validation).toEqual([]);

    // 设置无效值并验证
    f.value = 'invalid';
    await f.validate();
    expect(f.isValid).toBe(false);
    expect(f.validation.length).toBeGreaterThan(0);

    // reset
    f.reset();

    expect(f.isDirty).toBe(false);
    expect(f.isValid).toBeUndefined();
    expect(f.validation).toEqual([]);
  });

  it('should return this for chaining', () => {
    const F = defineField('test', { defaultValue: '' });
    const f = new F();
    expect(f.reset()).toBe(f);
  });

  it('should reset value to initial value', () => {
    const F = defineField('test', { defaultValue: 'initial' });
    const f = new F();

    f.value = 'changed';
    expect(f.value).toBe('changed');

    f.reset();
    expect(f.value).toBe('initial');
  });

  it('should reset value with format option applied', () => {
    const F = defineField('test', {
      defaultValue: 'init',
      format: (val) => val.toUpperCase()
    });
    const f = new F();

    f.value = 'changed';
    expect(f.value).toBe('CHANGED');

    f.reset();
    expect(f.value).toBe('INIT');
  });

  it('should clear validation errors on reset', async () => {
    const F = defineField('test', {
      defaultValue: '',
      rule: z.string().min(5, 'Min 5 chars')
    });
    const f = new F();

    f.value = 'ab';
    await f.validate();
    expect(f.validation.length).toBeGreaterThan(0);
    expect(f.validation[0].message).toBe('Min 5 chars');

    f.reset();
    expect(f.validation).toEqual([]);
  });
});

describe('Field Validation Errors Synchronization', () => {
  it('should populate validation array with zod errors', async () => {
    const F = defineField('email', {
      defaultValue: 'invalid',
      rule: z.string().email('Invalid email format')
    });
    const f = new F();

    await f.validate();

    expect(f.isValid).toBe(false);
    expect(f.validation).toBeInstanceOf(Array);
    expect(f.validation.length).toBeGreaterThan(0);
    expect(f.validation[0].message).toBeDefined();
  });

  it('should update validation errors when value changes', async () => {
    const F = defineField('name', {
      defaultValue: '',
      rule: z.string().min(3, 'Min 3 chars')
    });
    const f = new F();

    // 初始值无效
    f.value = 'ab';
    await f.validate();
    expect(f.validation.length).toBeGreaterThan(0);

    // 修正后通过
    f.value = 'abc';
    await f.validate();
    expect(f.isValid).toBe(true);
  });

  it('should populate validation with custom validator errors', async () => {
    const F = defineField('custom', {
      defaultValue: '',
      validator: async (val) => {
        if (!val) throw new Error('Value is required');
      }
    });
    const f = new F();

    await f.validate();

    expect(f.isValid).toBe(false);
    expect(f.validation).toBeInstanceOf(Array);
    expect(f.validation[0].message).toBe('Value is required');
  });
});

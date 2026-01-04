
import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import defineModel from '../src/model.js';

describe('Model Performance Optimizations', () => {
  it('should only validate modified fields when force=false', async () => {
    const M = defineModel({
      f1: { defaultValue: 'a', validator: async () => true },
      f2: { defaultValue: 'b', validator: async () => true },
      f3: { defaultValue: 'c', validator: async () => true }
    });
    const m = new M();
    
    // 初始全量验证
    await m.validate();
    expect(m.isValid).toBe(true);
    
    // 只修改 f1，应该只验证 f1
    m.value.f1 = 'changed';
    await m.sync();
    
    // 使用默认选项（force=false），应该只验证已修改的字段
    const validateSpy = vi.spyOn(m.fields.f1, 'validate');
    const validateSpy2 = vi.spyOn(m.fields.f2, 'validate');
    const validateSpy3 = vi.spyOn(m.fields.f3, 'validate');
    
    await m.validate();
    
    // f1 被修改，应该被验证
    expect(validateSpy).toHaveBeenCalled();
    // f2, f3 未修改且已验证，不应该被验证
    expect(validateSpy2).not.toHaveBeenCalled();
    expect(validateSpy3).not.toHaveBeenCalled();
    
    validateSpy.mockRestore();
    validateSpy2.mockRestore();
    validateSpy3.mockRestore();
  });

  it('should validate all fields when force=true', async () => {
    const M = defineModel({
      f1: { defaultValue: 'a', validator: async () => true },
      f2: { defaultValue: 'b', validator: async () => true }
    });
    const m = new M();
    
    await m.validate();
    m.value.f1 = 'changed';
    await m.sync();
    
    const validateSpy1 = vi.spyOn(m.fields.f1, 'validate');
    const validateSpy2 = vi.spyOn(m.fields.f2, 'validate');
    
    await m.validate({ force: true });
    
    // force=true 时，所有字段都应该被验证
    expect(validateSpy1).toHaveBeenCalled();
    expect(validateSpy2).toHaveBeenCalled();
    
    validateSpy1.mockRestore();
    validateSpy2.mockRestore();
  });

  it('should validate only specified fields when fields option provided', async () => {
    const M = defineModel({
      f1: { defaultValue: 'a', validator: async () => true },
      f2: { defaultValue: 'b', validator: async () => true },
      f3: { defaultValue: 'c', validator: async () => true }
    });
    const m = new M();
    
    const validateSpy1 = vi.spyOn(m.fields.f1, 'validate');
    const validateSpy2 = vi.spyOn(m.fields.f2, 'validate');
    const validateSpy3 = vi.spyOn(m.fields.f3, 'validate');
    
    await m.validate(false, { fields: ['f1', 'f2'] });
    
    expect(validateSpy1).toHaveBeenCalled();
    expect(validateSpy2).toHaveBeenCalled();
    expect(validateSpy3).not.toHaveBeenCalled();
    
    validateSpy1.mockRestore();
    validateSpy2.mockRestore();
    validateSpy3.mockRestore();
  });

  it('should skip validation if no fields need validation', async () => {
    const M = defineModel({
      f1: { defaultValue: 'a', validator: async () => true },
      f2: { defaultValue: 'b', validator: async () => true }
    });
    const m = new M();
    
    // 初始验证
    await m.validate();
    expect(m.isValid).toBe(true);
    
    // 不修改任何字段，再次验证应该直接返回
    const validateSpy1 = vi.spyOn(m.fields.f1, 'validate');
    const validateSpy2 = vi.spyOn(m.fields.f2, 'validate');
    
    const result = await m.validate();
    
    // 应该直接返回，不调用字段验证
    expect(validateSpy1).not.toHaveBeenCalled();
    expect(validateSpy2).not.toHaveBeenCalled();
    expect(result).toBe(true);
    
    validateSpy1.mockRestore();
    validateSpy2.mockRestore();
  });

  it('should handle large number of fields efficiently', async () => {
    // 创建包含大量字段的模型
    const fieldsConfig = {};
    for (let i = 0; i < 100; i++) {
      fieldsConfig[`field${i}`] = { 
        defaultValue: `value${i}`, 
        validator: async () => true 
      };
    }
    
    const M = defineModel(fieldsConfig);
    const m = new M();
    
    const startTime = performance.now();
    await m.validate();
    const endTime = performance.now();
    
    // 验证应该在合理时间内完成（例如 < 1秒）
    expect(endTime - startTime).toBeLessThan(1000);
    expect(m.isValid).toBe(true);
  });
});



import { describe, it, expect, vi } from 'vitest';
import defineModel from '../src/model.js';
import defineField from '../src/field.js';

// 模拟延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Field Async Validation', () => {
  it('should handle long-running async validation correctly', async () => {
    let validateCount = 0;
    const F = defineField('f1', {
      defaultValue: '',
      validator: async (val) => {
        validateCount++;
        // 模拟耗时操作 (50ms)
        await delay(50);
        return val === 'valid';
      }
    });

    const f = new F();

    // 1. 触发变更 (notifyChange -> pending=true -> queueMicrotask)
    f.value = 'valid';
    
    // 2. 立即调用 validate
    // 此时 state.pending 应为 true，validate 应进入排队逻辑
    const p1 = f.validate();

    // 验证此时尚未完成
    expect(validateCount).toBe(0);

    // 等待 p1 完成
    const result = await p1;

    // 3. 验证结果
    // 此时 notifyChange 的微任务应该已经执行，触发了一次内部 validate
    // 手动调用的 p1 也执行了一次 validate
    // 总共可能会调用 2 次，或者如果实现优化好可能是 1 次
    // 但最重要的是结果必须正确
    expect(result).toBe(true);
    expect(f.isValid).toBe(true);
    // 确保至少调用了一次
    expect(validateCount).toBeGreaterThan(0);
  });

  it('should handle race conditions with multiple rapid changes and validations', async () => {
    const results = [];
    const F = defineField('f2', {
      defaultValue: '',
      validator: async (val) => {
        await delay(20);
        return val.length > 3; // 长度大于3才有效
      }
    });

    const f = new F();

    // 快速变更和验证
    f.value = 'a'; // invalid
    const p1 = f.validate().then(res => results.push({ id: 1, res }));
    
    f.value = 'ab'; // invalid
    const p2 = f.validate().then(res => results.push({ id: 2, res }));
    
    f.value = 'abcd'; // valid
    const p3 = f.validate().then(res => results.push({ id: 3, res }));

    await Promise.all([p1, p2, p3]);

    // 最终状态应该是有效的
    expect(f.isValid).toBe(true);
    expect(f.value).toBe('abcd');
    
    // 最后一个请求的结果必须是 true
    expect(results.find(r => r.id === 3).res).toBe(true);
  });

  it('should ensure pending state protects against stale data validation', async () => {
     // 这个测试专门验证 queueMicrotask 是否生效
     // 如果没有排队，validate 可能会在 value 更新前执行（取决于实现细节）
     // 或者在 pending 状态下直接返回错误的缓存值
     
     let lastValidatedValue = null;
     const F = defineField('f3', {
       defaultValue: 'initial',
       validator: async (val) => {
         lastValidatedValue = val;
         return true;
       }
     });
     
     const f = new F();
     
     // 变更值
     f.value = 'updated';
     
     // 立即验证
     // 如果没有 pending 保护，这里可能会基于旧值 'initial' 验证，或者直接返回旧的 isValid
     // 如果有 pending 保护，应该等待 'updated' 写入 state 后再验证
     await f.validate();
     
     expect(lastValidatedValue).toBe('updated');
  });

  it('should handle race condition where earlier request finishes last (out-of-order completion)', async () => {
    // 场景：先发起的验证请求耗时很长，后发起的验证请求耗时很短
    // 预期：状态应该反映“最后一次调用”的结果，而不是“最后一次完成”的结果
    // 注意：目前的实现如果没有 AbortController 或版本控制，可能会出现此测试失败的情况
    // 这将暴露出当前 queueMicrotask 方案的局限性

    const F = defineField('f4', {
      defaultValue: '',
      validator: async (val) => {
        if (val === 'slow') {
          await delay(100); // 先发起的请求，很慢
          return false; // 期望结果是 false
        }
        if (val === 'fast') {
          await delay(10);  // 后发起的请求，很快
          return true;  // 期望结果是 true
        }
        return true;
      }
    });

    const f = new F();

    // 1. 发起慢请求 (value='slow') -> 期望 false
    f.value = 'slow';
    const p1 = f.validate(); 

    // 2. 发起快请求 (value='fast') -> 期望 true
    // 由于排队机制，validate 会在微任务后执行
    f.value = 'fast';
    const p2 = f.validate();

    // p2 (fast) 会先完成
    // p1 (slow) 会后完成

    await Promise.all([p1, p2]);

    // 最终状态应该是快请求的结果 (true)，因为 'fast' 是最后设置的值
    // 但如果 slow 请求后完成并覆盖了状态，这里就会失败
    // 当前实现中，每个 validate 都会触发一次 async validator
    // 如果没有取消机制，后完成的 slow 请求可能会覆盖 fast 的结果
    
    // 此处我们验证现状：
    // 如果 p1 后完成，它会写入 false，覆盖 p2 的 true
    // 这通常是不可接受的竞态问题，但在简单实现中常见
    
    // 如果这个测试失败（isValid 为 false），说明我们需要更高级的竞态保护
    expect(f.value).toBe('fast');
    // 如果这里的期望是 true，且代码没有竞态保护，这个断言可能会失败
    // 在理想的鲁棒系统中，这里必须是 true
    expect(f.isValid).toBe(true);
  });
});

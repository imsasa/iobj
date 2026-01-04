// 工具函数

/**
 * 深度克隆对象
 * @param obj - 要克隆的对象
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof RegExp) {
    return new RegExp(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    }
  }
  
  return cloned;
}

/**
 * 深度比较两个值是否相等
 * @param a - 第一个值
 * @param b - 第二个值
 * @param customEqual - 自定义比较函数
 * @returns 是否相等
 */
export function deepEqual(
  a: any, 
  b: any, 
  customEqual?: (a: any, b: any) => boolean | undefined
): boolean {
  if (customEqual) {
    const result = customEqual(a, b);
    if (result !== undefined) return result;
  }
  
  if (a === b) return true;
  
  if (a === null || b === null) return false;
  if (a === undefined || b === undefined) return false;
  
  if (typeof a !== typeof b) return false;
  
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], customEqual)) return false;
    }
    
    return true;
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key], customEqual)) return false;
    }
    
    return true;
  }
  
  return false;
}

/**
 * 检查值是否为空
 * @param value - 要检查的值
 * @param isArray - 是否为数组字段
 * @returns 是否为空
 */
export function isEmptyValue(value: any, isArray: boolean = false): boolean {
  if (value === undefined || value === null || value === '') {
    return true;
  }
  
  if (isArray && Array.isArray(value) && value.length === 0) {
    return true;
  }
  
  return false;
}

/**
 * 根据路径获取对象属性值
 * @param obj - 目标对象
 * @param path - 属性路径，如 'a.b.c'
 * @returns 属性值
 */
export function getByPath(obj: any, path: string): any {
  if (!path) return obj;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }
    result = result[key];
  }
  
  return result;
}

/**
 * 根据路径设置对象属性值
 * @param obj - 目标对象
 * @param path - 属性路径，如 'a.b.c'
 * @param value - 要设置的值
 */
export function setByPath(obj: any, path: string, value: any): void {
  if (!path) return;
  
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  
  let current = obj;
  for (const key of keys) {
    if (current[key] === null || current[key] === undefined || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

/**
 * 检查是否为对象
 * @param value - 要检查的值
 * @returns 是否为对象
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 检查是否为数组
 * @param value - 要检查的值
 * @returns 是否为数组
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param func - 要节流的函数
 * @param limit - 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
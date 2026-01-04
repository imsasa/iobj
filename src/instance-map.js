const STATE_SYM = Symbol('iobj_state');
const map = new WeakMap();

export default {
  get(key) {
    return map.get(key) || (key && key[STATE_SYM]);
  },
  
  set(key, value) {
    map.set(key, value);
    // 尝试挂载 Symbol 属性以支持 Proxy 穿透
    if (key && (typeof key === 'object' || typeof key === 'function')) {
      try {
        Object.defineProperty(key, STATE_SYM, {
          value: value,
          enumerable: false,
          writable: false,
          configurable: true
        });
      } catch (e) {
        // 忽略不可扩展对象等错误
      }
    }
    return this;
  },

  has(key) {
    return map.has(key) || (key && !!key[STATE_SYM]);
  },

  delete(key) {
    const res = map.delete(key);
    if (key && key[STATE_SYM]) {
      try {
        delete key[STATE_SYM];
      } catch (e) {}
    }
    return res;
  }
};

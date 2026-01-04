export default function (initVal = [], fn) {
    const proxyCache = new WeakMap();

    const handler = {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === 'object' && value !== null) {
                let existing = proxyCache.get(value);
                if (existing) return existing;
                
                const p = new Proxy(value, handler);
                proxyCache.set(value, p);
                return p;
            }
            return value;
        },
        set(target, prop, value, receiver) {
            const oldValue = target[prop];
            const result = Reflect.set(target, prop, value, receiver);
            if (oldValue !== value) {
                fn();
            }
            return result;
        },
        deleteProperty(target, prop) {
            const result = Reflect.deleteProperty(target, prop);
            fn();
            return result;
        }
    };

    // Use Proxy instead of proto hack
    return new Proxy(initVal, handler);
}

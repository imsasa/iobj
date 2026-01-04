
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
export default Evt;


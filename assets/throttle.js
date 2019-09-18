/**
 * @typedef {Function} throttled
 * @property {clear} clear the execute line.
 * @property {delay} modify the wait time.
 * @return Promise
 */

/**
 * @function throttle
 * @param fn {function} the function you want to limit execute
 * @param delay {number} delay time ,default 1000ms
 * @param i {boolean} default false. if true, fn will execute  immediately and ignore the call within delay time;
 * @returns {throttled}
 */
export default function (fn, delay = 1000, i) {
    let timer, t     = 0, p, pres, promiseble = true;
    let retFn        = function () {
        if (i) {
            let nt = Date.now();
            if (nt - t > delay) {
                t = Date.now();
                let ret=fn.apply(this, arguments);
                return promiseble ? Promise.resolve(ret) : ret;
            }
        }
        if (timer) clearTimeout(timer);
        if (promiseble && !p) p = new Promise(function (res) {pres = res;});
        let args = arguments;
        let ths  = this;
        timer    = setTimeout(function () {
            timer   = undefined;
            p       = undefined;
            let res = fn.apply(ths, args);
            pres && pres(res);
        }, delay);
        return p;
    };
    retFn.clear      = () => {
        timer = timer && clearTimeout(timer);
        promiseble&&((p=undefined)||pres());
        return retFn;
    };
    retFn.delay      = (arg) => {
        delay = arg;
        return retFn;
    };
    retFn.promiseble = (arg) => {
        promiseble = !!arg;
        return retFn;
    };
    return retFn;
}

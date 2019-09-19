/**
 * object 对象相关操作
 * @module Object
 */

/**
 * 将sourceObj中的属性拷贝到destObj中，如果destObj中属性存在则不拷贝
 * @param destObj
 * @param sourceObj
 * @return {Object}
 */
module.exports.copyIfNotExist = function (destObj, sourceObj) {
    let idx;
    destObj || (destObj = {});
    for (idx in sourceObj) {
        destObj[idx] === undefined && (destObj[idx] = sourceObj[idx])
    }
    return destObj;
};
/**
 * 判断是给定的参数否为数组
 * @param arg
 */

// export function isArray(arg) {
//     return Array.isArray ? Array.isArray(arg) : Object.prototype.toString.call(arg) === "[object Array]"
// }

/**
 *
 * @param obj
 * @param flag
 * @return {boolean}
 */
module.exports.has = function (obj, flag) {
    for (let i in obj) {
        if (flag === obj[i]) return true;
    }
    return false;
};
module.exports.notAll = function (obj, flag) {
    for (let i in obj) {
        if (flag !== obj[i]) return true;
    }
    return false;
};

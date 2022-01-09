/**
 * object 对象相关操作
 * @module Object
 */

// /**
//  * 将sourceObj中的属性拷贝到destObj中，如果destObj中属性存在则不拷贝
//  * @param destObj
//  * @param sourceObj
//  * @return {Object}
//  */
// export function copyIfNotExist(destObj, sourceObj) {
//     let idx;
//     destObj || (destObj = {});
//     for (idx in sourceObj) {
//         destObj[idx] === undefined && (destObj[idx] = sourceObj[idx])
//     }
//     return destObj;
// };


export function has(obj, flag) {
    for (let i in obj) {
        if (flag === obj[i]) return true;
    }
    return false;
}

/**
 *
 * @param obj
 * @param flag
 * @return {boolean}
 */
export function notAll(obj, flag,prop) {
    for (let i in obj) {
        let tmp=obj[i];
        if (flag !== tmp) return true;
    }
    return false;
}
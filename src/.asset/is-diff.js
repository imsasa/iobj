function isDate(d) { return d instanceof Date; }

export function clone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (isDate(obj)) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(clone);
  const copy = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = clone(obj[key]);
    }
  }
  return copy;
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (obj1 === null || typeof obj1 !== 'object' || 
      obj2 === null || typeof obj2 !== 'object') {
    return false;
  }
  
  if (isDate(obj1) && isDate(obj2)) return obj1.getTime() === obj2.getTime();
  if (isDate(obj1) !== isDate(obj2)) return false;

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
}

export default function isDiff(a1, a2) {
  return !deepEqual(a1, a2);
}

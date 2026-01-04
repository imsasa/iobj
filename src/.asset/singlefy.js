export default function singlefy(fn) {
  let result;
  return function () {
      return result || (result = fn.apply(this, arguments));
  }
}

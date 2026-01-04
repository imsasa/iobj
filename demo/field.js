import defineField from 'iobj/field.js'
import { z } from 'zod'

const Email = defineField('email', {
  defaultValue: '',
  format: (v) => String(v ?? '').trim(),
  rule: z.string().email('邮箱格式不正确'), // 未指定 validator 时默认使用 zod 适配器
})

const f = new Email('  a@b.com ')
await f.sync?.()
await f.validate()
console.log("f.value", f.value)       // 'a@b.com'
console.log("f.isDirty", f.isDirty)     // true/false
console.log("f.isValid", f.isValid)     // undefined | true | false
console.log("f.validation", f.validation)  // [] | [ { message }, ... ]

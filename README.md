# ivalid
> 希望能帮到你


## 怎么用
0. 安装`npm i ivalid`;
1. `import defineModel from ivalid`，或者直接引用dist/www中的main.js文件
2. 定义一个model并使用
    ```javascript
    let M = defineModel(
        [
           {
            name        : "fname",
            required    : true,
            validator   : function () {
              return this.value.length > 3;
            }          
          },
          {
             name        : "fage",
             defaultValue: 28,
             validator   : function () {
                return this.value > 25;
             }
          }
        ]
    );
    let ins=new M();
    ```
   defineModel传入数组中的每一项将用来生成`field`。 实例`ins`可通过field的name访问所有field的值，比如`ins.fname`。
   如果对field的值进行修改，ins将会自动对修改后的值进行验证，同时，ins会记验所有的证结果，以及哪些字段有修改。 另外，也可也与vue一起使用，参考demo/use-with-vue.html
## defineModel(fieldOpt,watchOpt)
   - `fieldOpt` {array},field 配置项；
   -  watchOpt \[object\], 用来监听field值的变化，key为field的name值，value为监听函数。
## field配置项
- `name` {string}，字段名称；
- `type` \["compute"|undefined\]，字段类型,默认为undefined,如果值为compute,则表示该字段的值要通过其它字段计算得到；
- `value` \[function\],当type为compute,通过该配置来计算字段值；
- `required` \[boolean\], 如果为ture,则值不能为undefined,null;
- `defaultValue` \[any\]，生成实例时，如果值为空时则使用该值；
- `validator` \[function|regex\]，值修改时使用的验证方式，函数必须返回布尔值；
## model实例的属性
- 每个field属性name的值将会作为model的属性；
- `$isModified`,boolean,任一field发生修改则为true；
- `$isValid`,boolean,所有field能过validator验证成功则为ture;
- `$modified`,object,以key-value的形式记录每个field是否被修改；
- `$validation`,object,以key-value的形式记录每个field的验证结果；

## model实例的方法
- `$validate()` ，验证字段的值是否正确；
- `$on(eventName,callback)`，为事件绑定监听，可监听的事件有:
  - `$isModifiedChg`,model的修改状态改变时触发，即`$isModified`属性发生改变；
  - `$isValidChg`，model的验证状态改变触发，即`$isValid`属性发生改变；
- `$on(eventName,callback)`，解除事件绑定的函数；



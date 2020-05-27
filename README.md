# ivalid
> 希望能帮到你


##怎么用
1. 定义一个model

    ```javascript
      let M = modelDefine(
                [
                    {
                        name        : "fname",
                        alias       : "姓名",
                        defaultValue: "sasa",
                        required    : true,
                        validator   : function () {
                            return this.value.length > 3;
                        }
                    },
                    {
                        name        : "fage",
                        defaultValue: '28',
                        validator   : function () {
                            return this.value.length > 3;
                        }
                    }]
    );
    
    ```

2. 单独使用
    ```javascript
            let ins = new M();
            ins.value.fname= "saa";
            ins.validate().then(()=>{
                assert.equal(ins.isValid, false);
                done();
            });
    
    ```
3. 与vue一起使用
    ```javascript
      let foo=new M();
      let vobj = new Vue({
          data:foo.value
      });
      vobj.$data.fname='saaa';
      //foo.value.fname的值为sasa;
    ```
   
##自动响应数据变化

```html
  <form class="ui form">
         <label>姓名</label>：<input autocomplete="off" type="text" name="fname" v-model="ins.value.fname">
         <span>{{"姓名输入"+(ins.validation.fname?"正确":"不正确")}}</span>
         <br>
         <label>年龄</label>：<input autocomplete="off" type="text" name="fage" v-model="ins.value.fage">
         <span>{{"年龄输入"+(ins.validation.fage?"正确":"不正确")}}</span>
         <br>
         <br>
         <button type="button" :disabled="!ins.isValid">提交</button>
         <span>{{"表单输入"+(ins.isValid?"正确":"不正确")}}</span>
  </form>

```
  ```javascript
     new Vue({
       el     : '#app',
       data   : function () {
         let person = new P();
         return {
           ins : person
         }
       }
     });
   ```




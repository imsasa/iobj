import modelDefine from "../src/model.js";
import Vue         from "vue";
import assert      from 'assert';
let M = modelDefine(
    [
        {
            name        : "firstname",
            alias       : "姓",
            defaultValue: "mao",
            required    : true,
            validator   : function (value) {
                return value.length > 3;
            }
        },
        {
            name        : "secondname",
            defaultValue: "sasa",
            required    : true,
            validator   : function (value) {
                return value.length > 3;
            }
        },
        {
            name : "fullname",
            type : 'compute',
            value: function () {
                return this.secondname+this.firstname ;
            }
        }]
);
describe("验证isValid", function () {
    let ins = new M({});
    it("初始值", function () {
        assert.equal(ins.fullname, 'sasamao');
    });
    it("修改值", function () {
        ins.secondname ='evan'
        assert.equal(ins.fullname, 'evanmao');
    });
});
describe('vue',function(){
    let ins = new M({});
    let vobj = new Vue({
        data:ins
    });
    it("修改值", function () {
        vobj.secondname='evan';
        assert.equal(ins.fullname, 'evanmao');
    });
})



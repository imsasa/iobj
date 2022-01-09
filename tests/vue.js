import modelDefine from "../src/model.js";
import assert      from "assert";
import Vue         from "vue";

describe("配合vue使用", function () {
    let M    = modelDefine(
        {
            name  : "person",
            fields: [
                {
                    name        : "fname",
                    alias       : "姓名",
                    defaultValue: "sasa",
                    required    : true,
                    validator   : function () {
                        return this.length > 3;
                    }
                },
                {
                    name        : "fage",
                    defaultValue: 28,
                    validator   : function (val) {
                        return parseInt(val) > 20;
                    }
                }
            ]
        }
    );

    it("未变更值，也没有调用$validate", function () {
        let foo=new M();
        assert.equal(foo.$validation.fage.isValid, undefined);
    });
    it("修改值02", function () {
        let foo=new M();
        foo.fage=10;
        assert.equal(foo.$isModified, true);
    });
    it("修改值01", function () {
        let foo=new M();
        let vobj = new Vue({
            data:foo
        });
        vobj.fname='saaa';
        assert.equal(foo.fname, "saaa");
    });
    it("修改值02", function () {
        let foo=new M();
        let vobj = new Vue({
            data:foo
        });
        vobj.fname='saaa';
        assert.equal(foo.fname, "saaa");
        assert.equal(vobj.fname, "saaa");
    });

    it("修改值03", function () {
        let M = modelDefine(
            [
                {
                    name        : "fname",
                    alias       : "姓名",
                    defaultValue: "sasa",
                    required    : true,
                    validator   : function () {
                        return this.length > 3;
                    }
                },
                {
                    name        : "flist",
                    defaultValue: ["1", "3", "3", "5"],
                    isA         : true,
                    validator   : function () {
                        return this.length > 3;
                    }
                }]
        );
        let ins = new M();
        ins.fname= "saa";
        return ins.$validate().then(()=>{
            assert.equal(ins.$isValid, false);
        });
    });
});
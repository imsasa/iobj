import modelDefine from "../src/model.js";
import Vue from "vue";
import assert from 'assert';
describe("验证isValid", function () {
    it("默认值", function () {
        let M   = modelDefine(
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
        assert.equal(ins.$isValid, undefined);
    });
    let M = modelDefine(
        [
            {
                name        : "fname",
                alias       : "姓名",
                defaultValue: "sasa",
                required    : true,
                validator   : function (value) {
                    return value.length > 3;
                }
            },
            {
                name        : "flist",
                defaultValue: ["1", "3", "3", "5"],
                validator   : function (value) {
                    return value.length > 3;
                }
            }]
    );
    it("给定初始值", function () {
        let ins = new M({flist: [1, 2, 3]});
        return ins.$validate().then(function(){
            assert.equal(ins.$isValid, false);
            assert.equal(ins.$validation.fname, true);
        })
    });
    it("修改字段00", function (done) {
        let ins = new M({flist: [1, 2, 3]});
        ins.$on("fieldValueChg", function (name, val) {
            assert.equal(val[3], 4);
            assert.equal(name, 'flist');
            done();
        });
        ins.flist.push(4);
    });
    it("修改字段01", function (done) {
        let ins = new M({flist: [1, 2, 3]});
        ins.flist.push(4);
        ins.$validate().then(function () {
            // assert.equal(ins.$isValid, true);
            assert.equal(ins.$validation.flist, true);
            assert.equal(ins.$validation.fname, true);
            done();
        });
    });
    it("修改字段02", function (done) {
        let ins = new M({flist: [1, 2, 3]});
        ins.flist.push(4);
        ins.flist.splice(3, 1);
        ins.$validate().then(function () {
            assert.equal(ins.$isValid, false);
            assert.equal(ins.$validation.flist, false);
            assert.equal(ins.$validation.fname, true);
            done();
        });
    });
    it("修改字段03", function (done) {
        let ins = new M({flist: [1, 2, 3]});
        ins.flist.push(4);
        setTimeout(()=>{
            assert.equal(ins.$validation.flist, true);
            done()
        },200);

    });
    it("修改字段04", function (done) {
        let ins         = new M();
        ins.fname = "sa";
        ins.$validate().then(function () {
            assert.equal(ins.$validation.fname, false);
            done();
        });

    });
});
// describe("配合vue使用", function () {
//     let M    = modelDefine(
//         {
//             name  : "person",
//             fields: [
//                 {
//                     name        : "fname",
//                     alias       : "姓名",
//                     defaultValue: "sasa",
//                     required    : true,
//                     validator   : function () {
//                         return this.length > 3;
//                     }
//                 },
//                 {
//                     name        : "fage",
//                     defaultValue: 28,
//                     validator   : function (val) {
//                         return parseInt(val) > 20;
//                     }
//                 }
//             ]
//         }
//     );
//
//     it("未变更值，也没有调用$validate", function () {
//         let foo=new M();
//         assert.equal(foo.$validation.fage, undefined);
//     });
//     it("修改值02", function () {
//         let foo=new M();
//         foo.fage=10;
//         assert.equal(foo.$isModified, true);
//     });
//     it("修改值01", function () {
//         let foo=new M();
//         let vobj = new Vue({
//             data:foo
//         });
//         vobj.fname='saaa';
//         assert.equal(foo.fname, "saaa");
//     });
//     it("修改值02", function () {
//         let foo=new M();
//         let vobj = new Vue({
//             data:foo
//         });
//         vobj.fname='saaa';
//         assert.equal(foo.fname, "saaa");
//         assert.equal(vobj.fname, "saaa");
//     });
//
//     it("修改值03", function () {
//         let M = modelDefine(
//             [
//                 {
//                     name        : "fname",
//                     alias       : "姓名",
//                     defaultValue: "sasa",
//                     required    : true,
//                     validator   : function () {
//                         return this.length > 3;
//                     }
//                 },
//                 {
//                     name        : "flist",
//                     defaultValue: ["1", "3", "3", "5"],
//                     isA         : true,
//                     validator   : function () {
//                         return this.length > 3;
//                     }
//                 }]
//         );
//         let ins = new M();
//         ins.fname= "saa";
//         return ins.$validate().then(()=>{
//             assert.equal(ins.$isValid, false);
//         });
//     });
// });
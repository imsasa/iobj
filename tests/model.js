import modelDefine from "../src/model";

var assert = require("assert");

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
                        return this.value.length > 3;
                    }
                },
                {
                    name        : "flist",
                    defaultValue: ["1", "3", "3", "5"],
                    isA         : true,
                    validator   : function () {
                        return this.value.length > 3;
                    }
                }]
        );
        let ins = new M();
        assert.equal(ins.isValid, true);
    });

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
                name        : "flist",
                defaultValue: ["1", "3", "3", "5"],
                isA         : true,
                validator   : function () {
                    return this.value.length > 3;
                }
            }]
    );
    it("给定初始值", function () {
        let ins = new M({flist: [1, 2, 3]});
        assert.equal(ins.isValid, undefined);
        assert.equal(ins.validation.fname, true);
    });
    it("修改字段00", function (done) {
        let ins = new M({flist: [1, 2, 3]});
        ins.on("fieldValueChg", function (name, val) {
            assert.equal(val[3], 4);
            assert.equal(name, 'flist');
            done();
        });
        ins.value.flist.push(4);
    });
    it("修改字段01", function (done) {
        let ins = new M({flist: [1, 2, 3]});
        ins.value.flist.push(4);
        ins.validate().then(function () {
            assert.equal(ins.isValid, true);
            assert.equal(ins.validation.flist, true);
            assert.equal(ins.validation.fname, true);
            done();
        });
    });
    it("修改字段02", function (done) {
        let ins = new M({flist: [1, 2, 3]});
        ins.value.flist.push(4);
        ins.value.flist.splice(3, 1);
        ins.validate().then(function () {
            assert.equal(ins.isValid, false);
            assert.equal(ins.validation.flist, false);
            assert.equal(ins.validation.fname, true);
            done();
        });
    });
    it("修改字段03", function () {
        let ins = new M({flist: [1, 2, 3]});
        ins.value.flist.push(4);
        assert.equal(ins.validation.fname, true);
    });
    it("修改字段04", function (done) {
        let ins = new M();
        ins.value.fname="sa";
        ins.validate().then(function () {
            assert.equal(ins.validation.fname, false);
            done();
        });

    });
});

describe("其他", function () {
    let M = modelDefine(
        {
            name:"person",
            fields:[
                {
                    name        : "fname",
                    alias       : "姓名",
                    defaultValue: "sasa",
                    required    : true,
                    validator   : function () {
                        return this.value.length > 3;
                    }
                }]
        }

    );
    it("类名", function () {
        assert.equal(M.name, "person");
    });
    it("别名", function () {
        assert.equal(M.getAlias()["fname"], "姓名");
        assert.equal(M.getAlias('fname'), "姓名");
    });
    it("给定初始验证状态", function () {
        let m=new M(undefined,true);
        assert.equal(m.isValid, true);
        assert.equal(m.validation.fname, true);
    });
    it("给定初始验证状态", function () {
        let m=new M(undefined,true);
        m.fieldData.fname.value="evan";
        assert.equal(m.value.fname, "evan");
    });
    it("对象方式赋值", function () {
        let m=new M(undefined,true);
        debugger;
        m.value={fname:'evan'};
        assert.equal(m.value.fname, "evan");
    });
});

// it("初始值", function () {
//     let ins = new M();
//     assert.equal(ins.value.fname, "sasa");
//     assert.equal(ins.value.flist, undefined);
// });
// assert.equal(ins.modified.fname, false);
// assert.equal(undefined, ins.isValid);
//
// setTimeout(function () {
//     assert.equal(true, ins.$isValid);
// }, 200)
// it("数据修改01", function () {
//     let ins   = new M();
//     ins.fname = "evan";
//     setTimeout(function () {
//         assert.equal(true, ins.$isMod);
//         assert.equal(true, ins.$modified.fname);
//         assert.equal(ins.$modData.fname, "evan");
//         assert.equal("evan", ins.fname);
//     }, 100);
// });
// it("数据修改02", function () {
//     let ins = new M();
//     ins.flist.pop();
//     setTimeout(function () {
//         assert.equal(true, ins.$isMod);
//         assert.equal(true, ins.$modified.flist);
//     }, 100);
// });
// it("数据修改后还原01", function () {
//     let ins   = new M();
//     ins.fname = "evan";
//     ins.fname = "sasa";
//     setTimeout(function () {
//         assert.equal(false, ins.$modified.fname);
//     }, 100);
// });
// it("数据修改后还原02", function () {
//     let ins = new M();
//     ins.flist.pop();
//     ins.flist.push("5");
//     setTimeout(function () {
//         assert.equal(false, ins.$modified.fname);
//     }, 100);
// });


// describe("mode02", function () {
//     let M = modelDefine(
//         [
//             {
//                 name      : "fname",
//                 alias     : "姓名",
//                 required  : true,
//                 defaultVal: "sasa",
//                 validator : function (val) {
//                     return new Promise(function (res) {
//                         setTimeout(function () {
//                             res(val.length > 3);
//                         }, 400);
//                     })
//                 }
//             },
//             {
//                 name     : "fage",
//                 alias    : "年龄",
//                 required : true,
//                 validator: function (val) {
//                     return val > 3;
//                 }
//             }
//         ]
//     );
//     it("检查验证", function (done) {
//         let ins = new M({fname: 'sas'}, false);
//         assert.equal(false, ins.$isValid);
//         setTimeout(function () {
//             assert.equal(false, ins.$isValid);
//             done();
//         }, 600);
//     });
// });

// describe("mode03", function () {
//     let M = modelDefine(
//         [
//             {
//                 name      : "fage",
//                 alias     : "年龄",
//                 defaultVal: 10,
//                 required  : true,
//                 validator : function (val) {
//                     return val > 3;
//                 }
//             },
//
//             {
//                 name  : "fch",
//                 fields: [
//                     {
//                         name      : "fage",
//                         defaultVal: 10
//                     }
//                 ]
//             }
//         ]
//     );
//     it("检查验证01", function (done) {
//         let ins = new M({fage: 2}, true);
//         ins.$validate().then(function () {
//             assert.equal(false, ins.$isValid);
//             done();
//         });
//     });
//     it("检查验证02", function (done) {
//         let ins = new M({}, true);
//         ins.$set({fage: 15});
//         ins.$validate().then(function () {
//             assert.equal(true, ins.$isValid);
//             done();
//         })
//     });
// });

// describe("mode04", function () {
//     let M = modelDefine(
//         [
//             {
//                 name      : "fage",
//                 alias     : "年龄",
//                 defaultVal: 10,
//                 required  : true,
//                 validator : function (val) {
//                     return val > 3;
//                 }
//             },
//
//             {
//                 name  : "fch",
//                 fields: [
//                     {
//                         name      : "fage",
//                         defaultVal: 10,
//                         validator : function (val) {
//                             return val > 5;
//                         }
//                     }
//                 ]
//             }
//         ]
//     );
//     it("检查验证01", function (done) {
//         let ins = new M({fage: 2}, true);
//         ins.$validate().then(function () {
//             assert.equal(false, ins.$isValid);
//             done()
//         })
//         // setTimeout(function () {
//         //
//         //     done();
//         // });
//     });
//     it("检查验证02", function (done) {
//         let ins = new M({}, true);
//         ins.$set({fage: 15, fch: {fage: 2}});
//         setTimeout(function () {
//             assert.equal(false, ins.$isValid);
//             assert.equal(false, ins.$fields.fch.$isValid);
//             done();
//         }, 200);
//     });
//     it("检查验证02", function (done) {
//         let ins = new M({}, true);
//         ins.$set({fage: 15, fch: {fage: 8}});
//         setTimeout(function () {
//             assert.equal(true, ins.$isValid);
//             done();
//         }, 200);
//     });
//     it("检查验证03", function (done) {
//         let ins = new M({}, true, true);
//         assert.equal(true, ins.$isValid);
//         setTimeout(function () {
//             assert.equal(true, ins.$isValid);
//             done();
//         }, 200);
//     });
//     it("检查修改", function (done) {
//         let ins = new M({}, true, true);
//         assert.equal(true, ins.$isValid);
//         setTimeout(function () {
//             assert.equal(true, ins.$isValid);
//             done();
//         }, 200);
//     });
// });
//
// describe("mode05", function () {
//     let M = modelDefine(
//         [
//             {
//                 name     : "fage",
//                 alias    : "年龄",
//                 required : true,
//                 validator: function (val) {
//                     return val > 3;
//                 }
//             },
//
//             {
//                 name  : "fch",
//                 fields: [
//                     {
//                         name      : "fage",
//                         alias     : "年龄2",
//                         defaultVal: 10
//                     }
//                 ]
//             }
//         ]
//     );
//
//     it("检查验证", function () {
//         new M({fage: 10}, false);
//         assert.equal("年龄", M.$getAlias()["fage"]);
//         assert.equal("年龄", M.$getAlias("fage"));
//         assert.equal("年龄", M.$getAlias(["fage"]).fage);
//         assert.equal("年龄2", M.$getAlias(["fage", "fch"]).fch.fage);
//         assert.equal("年龄2", M.$getAlias("fch").fage);
//     });
//
// });
// //
// describe("mode06", function () {
//     let M = modelDefine(
//         [
//             {
//                 name     : "fage",
//                 alias    : "年龄",
//                 required : true,
//                 validator: function (val) {
//                     return val > 3;
//                 }
//             }
//         ]
//     );
//     it("检查验证", function (done) {
//         let ins = new M({fage: 10}, undefined, true);
//         ins.$validate(true).then(function () {
//             assert.equal(true, ins.$isValid);
//             done();
//         })
//     });
// });
//
// describe("mode07", function () {
//     let M = modelDefine(
//         [
//             {
//                 name      : "fage",
//                 alias     : "年龄",
//                 defaultVal: 10,
//                 required  : true,
//                 validator : function (val) {
//                     return val > 3?true:'不正确';
//                 }
//             },
//
//             {
//                 name  : "fch",
//                 fields: [
//                     {
//                         name      : "fage",
//                         defaultVal: 10,
//                         validator : function (val) {
//                             return new Promise(function (res,rej) {
//                                 setTimeout(function () {
//                                     res(val > 5);
//                                 },340)
//                             });
//                         }
//                     }
//                 ]
//             }
//         ]
//     );
//     it("检查验证01", function (done) {
//         let ins = new M();
//         ins.$set({fch:{fage:3}});
//         ins.$validate().then(function (ret) {
//             assert.equal(false, ins.$isValid);
//             done();
//         });
//     });
// });
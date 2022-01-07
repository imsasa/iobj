import modelDefine from "../src/model.js";
import Vue         from "vue";
import assert      from 'assert';

describe("验证isValid", function () {
    it("watch", function (done) {
      let  M       = modelDefine(
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
                }], {
                fname: function (value,preValue) {
                    assert.equal(value, 'evanmao');
                    assert.equal(preValue, 'sasa');
                    done();
                }
            }
        );
        let ins = new M();
        ins.fname='evanmao';
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
        return ins.$validate().then(function () {
            assert.equal(ins.$isValid, false);
            assert.equal(ins.$validation.fname, true);
        })
    });
    it("修改字段00", function (done) {
        let ins = new M({flist: [1, 2, 3]});
        ins.$on("fieldValueChg", function (name, val) {
            assert.equal(val[3], 4);
            assert.equal(name, 'flist');
            done()
        });
        ins.flist.push(4);
    });
    it("修改字段01", function (done) {
        let ins = new M({flist: [1, 2, 3]});
        ins.flist.push(4);
        ins.$validate().then(function () {
            assert.equal(ins.$validation.flist, true);
            assert.equal(ins.$validation.fname, true);
            done()
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
        setTimeout(() => {
            assert.equal(ins.$validation.flist, true);
            done()
        }, 200);

    });
    it("修改字段04", function (done) {
        let ins   = new M();
        ins.fname = "sa";
        ins.$validate().then(function () {
            assert.equal(ins.$validation.fname, false);
            done();
        });

    });
});

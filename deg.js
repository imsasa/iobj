import modelDefine from "./src/model.js";
// import Vue from "vue";
import assert from 'assert';
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
});
import Field  from "./src/field.js";
import assert from "assert";

describe("数据验证", function () {
    let F = new Field({
        name     : "fage",
        required : true,
        validator: function () {
            return this.value > 3;
        }
    });
    it("验证数据的初始值01）", function () {
        let foo = new F();
        assert.equal(undefined, foo.value);
    });
    it("验证数据的初始值02）", function () {
        let F   = new Field({
            name        : "fage",
            defaultValue: 4,
            required    : true,
            validator   : function () {
                return this.value > 3;
            }
        });
        let foo = new F();
        assert.equal(4, foo.value);
    });
    it("验证数据的初始值（初始值给定错误）", function () {
        let foo = new F(2);
        return foo.$validate().then(
            (ret) => {
                assert.equal(false, foo.isValid);
            }
        );
    });
    it("验证数据的初始值（初始值给定正确）", function () {
        let foo = new F(8);
        return foo.$validate().then(
            (ret) => {
                assert.equal(true, ret);
            }
        );
    });
    it("赋值后验证数据(使用错误的初始值)", function () {
        let foo   = new F(3);
        foo.value = 6;
        return foo.$validate().then(
            (ret) => {
                assert.equal(true, foo.isValid);
            }
        );
    });
    it("赋值后验证数据(反复修改01)", function () {
        let foo   = new F(2);
        foo.value = 5;
        foo.value = 3;
        return foo.$validate().then(
            (ret) => {
                assert.equal(false, foo.isValid);
            }
        );
    });
    it("赋值后验证数据(反复修改02)", function () {
        let foo   = new F(2);
        foo.value = 5;
        foo.value = 7;
        foo.value = 8;
        return foo.$validate().then(
            (ret) => {
                assert.equal(true, foo.isValid);
            }
        );
    });

    it("赋值后验证数据(反复修改03)", function () {
        let foo   = new F();
        foo.value = 5;
        foo.value = 7;
        foo.value = 7;
        return foo.$validate().then(
            (ret) => {
                assert.equal(true, foo.isValid);
            }
        );
    });
});
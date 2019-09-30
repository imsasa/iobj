var assert = require("assert");
import Field from "../src/field";
import Vue   from "vue"
// required 默认为false


describe("数据验证", function () {
    let F = new Field({
        name      : "fage",
        defaultVal: 4,
        validator : function () {
            return this.$val > 3;
        }
    });

    it("使用默认值01", function () {
        let foo = new F();
        assert.equal(true, foo.$isValid);
        assert.equal(false, foo.$isMod);

    });
    it("使用默认值02", function () {
        let foo  = new F();
        foo.$val = 4;
        assert.equal(true, foo.$isValid);
        assert.equal(false, foo.$isMod);
    });
    it("值为undefined", function () {
        let foo = new F(1, false, true);
        assert.equal(true, foo.$isValid);
    });
    it("使用错误的初始值01", function () {
        let foo = new F(2);
        assert.equal(false, foo.$isValid);
    });

    it("使用错误的初始值02", function () {
        let foo  = new F(2);
        foo.$val = 5;
        assert.equal(true, foo.$isValid);
    });

    it("数据验证状态", function (done) {
        let foo  = new F();
        foo.$val = 2;
        foo.$validate().then(
            (ret) => {
                assert.equal(false, foo.$isValid);
                done();
            }
        );
    });
});

describe("不使用默认值01", function () {
    let F   = new Field({
        name      : "fage",
        defaultVal: 4,
        validator : function () {
            return this.$val > 3;
        }
    });
    let foo = new F(undefined, true);
    it("值为undefined", function () {
        assert.equal(undefined, foo.$val);
    });
    it("数据是否修改", function () {
        assert.equal(false, foo.$isMod);
    });
});
describe("节流效果01", function () {
    let cnt = 0;
    let F   = new Field({
        name      : "fage",
        defaultVal: 4,
        validator : function (val) {
            cnt++;
            return val > 3;
        }
    });
    let foo = new F();
    it("限制执行01", function () {
        assert.equal(true, foo.$isValid);
        assert.equal(0, cnt);
    });
    it("限制执行02", function (done) {
        foo.$val = 5;
        // assert.equal(1, cnt);
        foo.$validate();
        // assert.equal(1, cnt);
        foo.$validate();
        foo.$validate().then(
            () => {
                assert.equal(1, cnt);
                done();
            }
        )
    });
});
describe("数组01", function () {
    let F = new Field({
        name      : "farr",
        defaultVal: [1, 2, 3, 4],
        isA       : true,
        validator : function (val) {
            return new Promise(function (res) {
                setTimeout(function () {
                    res(val.length > 3);
                }, 600);
            })
        }
    });
    describe("使用默认值", function () {
        let foo = new F();
        it("数据是否正确", function () {
            assert.equal(true, foo.$isValid);
        });

        it("数据是否修改", function () {
            assert.equal(false, foo.$isMod);
        });
    });
    describe("使用初始值", function () {
        let foo = new F([1, 2]);
        assert.equal(undefined, foo.$isValid);
        it("数据是否修改", function () {
            assert.equal(false, foo.$isMod);
        });
    });
    describe("修改值01", function () {
        let foo = new F([1, 2]);
        assert.equal(undefined, foo.$isValid);
        foo.$val.push(3, 4);
        // assert.equal(true, foo.$isValid);
        it("数据是否有效", function () {
            setTimeout(function () {
                assert.equal(true, foo.$isValid);
            },300)
        });
        it("数据是否修改", function () {
            assert.equal(true, foo.$isMod);
        });

    });
    describe("修改值02", function () {
        let foo = new F([1, 2]);
        assert.equal(undefined, foo.$isValid);
        foo.$val.push(3,5);
        assert.equal(undefined, foo.$isValid);
        it("数据是否有效", function () {
            foo.$validate().then(function () {
                assert.equal(true, foo.$isValid);
            });
        });
        it("数据是否修改", function () {
            assert.equal(true, foo.$isMod);
        });

    });
    describe("修改值03", function () {
        let foo = new F([1, 2]);
        foo.$val=[1,2,3,4];
        // assert.equal(undefined, foo.$isValid);
        it("数据是否有效", function () {
            foo.$validate(function (ret) {
                assert.equal(true, foo.$isValid);
            })
        });
        it("数据是否修改", function () {
            setTimeout(function () {
                assert.equal(true, foo.$isMod);
            },800)

        });
    });
    describe("修改值04", function () {
        let foo = new F([1, 2]);
        foo.$val=[1,2,3,4];
        foo.$validate().then(function () {
            assert.equal(true, foo.$isValid);
        });
        it("数据是否修改", function () {
            setTimeout(function () {
                assert.equal(true, foo.$isMod);
            },800)

        });
    });
    describe("修改值05", function () {
        let foo = new F([1, 2]);
        // foo.$val=[1,2,3,4];
        foo.$val.push(3,4);
        // assert.equal(undefined, foo.$isValid);
        it("数据是否有效", function () {
            setTimeout(function () {
                assert.equal(true, foo.$isValid);
            },1600);

        });
        it("数据是否修改", function () {
            setTimeout(function () {
                assert.equal(true, foo.$isMod);
            },800)
        });
    });
});

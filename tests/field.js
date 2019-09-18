var assert = require("assert");
import Field from "../src/field";

// required 默认为false
let F = new Field({
    name      : "fage",
    defaultVal: 4,
    validator : function () {
        return this.$val > 3;
    }
});

describe("使用默认值", function () {
    let foo = new F();
    it("数据修改状态", function () {
        assert.equal(false, foo.$isMod);
        foo.$val = 4;
        assert.equal(false, foo.$isMod);
    });
    it("数据验证状态", function () {
        let foo  = new F();
        // assert.equal(true, foo.$isValid);
        // foo.$val = 4;
        assert.equal(true, foo.$isValid);
    });
});

describe("使用默认值2", function () {
    let foo = new F(5);
    it("数据修改状态", function () {
        assert.equal(false, foo.$isMod);
        foo.$val = 4;
        assert.equal(true, foo.$isMod);
    });
});

describe("使用默认值3", function () {
    let foo = new F(undefined,true);
    it("不会设置默认值", function () {
        assert.equal(undefined, foo.$val);
    });
    it("数据没有修改", function () {
        assert.equal(false, foo.$isMod);
    });
    it("数据已经修改", function () {
        foo.$val = 4;
        assert.equal(true, foo.$isMod);
    });
});

describe("使用默认值4", function () {
    let foo = new F(undefined,false);
    it("设置默认值", function () {
        assert.equal(4, foo.$val);
    });
    it("数据没有修改", function () {
        assert.equal(false, foo.$isMod);
    });
    it("数据没有修改", function () {
        foo.$val = 4;
        assert.equal(false, foo.$isMod);
    });
    it("验证状态为真", function () {
        assert.equal(true, foo.$isValid);
    });
});
describe("使用默认值5", function () {
    let F = new Field({
        name      : "fage",
        validator : function () {
            return this.$val > 3;
        }
    });
    let foo = new F(undefined,false);
    it("无默认值", function () {
        assert.equal(undefined, foo.$val);
    });
    it("无验证状态", function () {
        assert.equal(undefined, foo.$isValid);
    });
});
describe("使用默认值6", function () {
    let cnt=3;
    let F = new Field({
        name      : "fage",
        defaultVal:function(){
            return ++cnt;
        },
        validator : function () {
            return this.$val > 3;
        }
    });
    let foo = new F();
    it("无默认值", function () {
        assert.equal(4, foo.$val);
    });
    it("无验证状态", function () {
        assert.equal(true, foo.$isValid);
    });
});

describe("初始化", function () {
    let foo = new F();
    it("数据是否有效", function () {
        assert.equal(true, foo.$isValid);
    });
    it("数据是否修改", function () {
        assert.equal(false, foo.$isMod);
    });
});

describe("仅使用name", function () {
    let F = new Field("fage");
    let foo = new F();
    it("数据是否有效", function () {
        assert.equal(true, foo.$isValid);
    });
    it("数据是否有效", function () {
        assert.equal(undefined, foo.$val);
    });
    it("数据是否修改", function () {
        assert.equal(false, foo.$isMod);
    });
});
describe("初始化后修改值", function () {
    let foo  = new F(1);
    it("数据是否有效", function () {
        assert.equal(false, foo.$isValid);
    });
    it("数据是否修改", function () {
        assert.equal(false, foo.$isMod);
    });
});

describe("将修改后的值复原", function () {
    let foo  = new F(1);
    it("数据是否有效", function () {
        assert.equal(false, foo.$isValid);
    });
    it("数据是否修改", function () {
        assert.equal(false, foo.$isMod);
    });
});
describe("数组", function () {
    let F = new Field({
        name      : "farr",
        defaultVal: [1, 2,3,4],
        isA       : true,
        validator : function () {
            return this.$val.length > 3;
        }
    });
    describe("使用默认值", function () {
        let foo = new F();
        assert.equal(true, foo.$isValid);
        it("数据是否修改", function () {
            assert.equal(false, foo.$isMod);
        });
    });
    describe("初始化", function () {
        let foo = new F([1, 2, 3],true);
        foo.$validate();
        it("数据是否有效", function () {
            setTimeout(function () {
                assert.equal(false, foo.$isValid);
            },1000)
        });
        it("数据是否修改", function () {
            assert.equal(false, foo.$isMod);
        });
    });
    describe("初始化后修改值", function () {
        let F = new Field({
            name      : "farr",
            defaultVal: [1, 2, 3, 4],
            isA       : true,
            validator : function () {
                return this.$val.length > 3;
            }
        });
        let foo  = new F([1, 2]);
        foo.$val = [1, 2, 3];
        foo.$val = [1, 2];
        it("数据是否有效", function (done) {
            setTimeout(function () {
                assert.equal(false, foo.$isValid);
                done();
            },1000)
        });
        it("数据是否修改", function () {
            assert.equal(false, foo.$isMod);
        });
    });
    describe("将修改后的值复原", function () {
        let foo  = new F([1, 2]);
        foo.$val = [1, 2, 3];
        foo.$val = [1, 2];
        it("数据是否有效", function () {
            setTimeout(function () {
                assert.equal(false, foo.$isValid);
            },1000);

        });
        it("数据是否修改", function () {
            assert.equal(false, foo.$isMod);
        });
    });
    describe("push", function () {
        let foo = new F([1, 2]);
        foo.$val.push(3);
        it("数据是否有效", function () {
            setTimeout(function () {
                assert.equal(false, foo.$isValid);
            },200);
        });
        it("数据修改", function (done) {
            setTimeout(() => {
                assert.equal(true, foo.$isMod);
                done();
            }, 130);
        })
    });
    describe("push&slice", function () {
        let foo = new F([1, 2]);
        it("数据复原2", function () {
            foo.$val.push(3);
            foo.$val.splice(2, 1);
            assert.equal(false, foo.$isMod);
        });
    });
    describe("push&pop", function () {
        let foo = new F([1, 2]);
        it("数据复原2", function () {
            foo.$val.push(3);
            foo.$val.pop();
            assert.equal(false, foo.$isMod);
        });
    });
    describe("pop&push", function () {
        let foo = new F([1, 2]);
        it("数据复原2", function () {
            foo.$val.pop();
            foo.$val.push(2);
            assert.equal(false, foo.$isMod);
        });
    });
});
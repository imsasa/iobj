import modelDefine from "../src/model";

var assert = require("assert");

describe("mode01", function () {
    let M = modelDefine(
        [
            {
                name      : "fname",
                alias     : "姓名",
                defaultVal: "sasa",
                validator : function () {
                    return this.$val.length > 3;
                }
            },
            {
                name      : "flist",
                defaultVal: ["1", "3", "3", "5"],
                isA       : true,
                validator : function () {
                    return this.$val.length > 3;
                }
            }]
    );
    it("验证状态", function () {
        let ins = new M();
        assert.equal(true, ins.$isValid);
    });
    it("数据修改01", function () {
        let ins   = new M();
        ins.fname = "evan";
        assert.equal(true, ins.$isMod);
        assert.equal(true, ins.$modified.fname);
        assert.equal("evan", ins.fname);
    });
    it("数据修改02", function () {
        let ins = new M();
        ins.flist.pop();
        assert.equal(true, ins.$isMod);
        assert.equal(true, ins.$modified.flist);
    });
    it("数据修改后还原01", function () {
        let ins   = new M();
        ins.fname = "evan";
        ins.fname = "sasa";
        assert.equal(false, ins.$modified.fname);
    });
    it("数据修改后还原02", function () {
        let ins = new M();
        ins.flist.pop();
        ins.flist.push("5");
        assert.equal(false, ins.$modified.fname);
    });

    it("data", function () {
        let ins   = new M();
        ins.fname = "evan";
        assert.equal("evan", ins.$data.fname);
    });
    it("数据输入是否合法", function () {
        let ins   = new M();
        ins.fname = "evan";
        assert.equal(true, ins.$isValid);
    });
});

describe("mode02", function () {
    let M = modelDefine(
        [
            {
                name     : "fname",
                alias    : "姓名",
                required : true,
                validator: function () {
                    return this.$val.length > 3;
                }
            }]
    );
    it("状态", function () {
        let ins = new M();
        assert.equal(false, ins.$isMod);
        assert.equal(false, ins.$isValid);
    });

});
describe("mode03", function () {
    let M = modelDefine(
        [
            {
                name     : "fname",
                alias    : "姓名",
                required : true,
                validator: function () {
                    return this.$val.length > 3;
                }
            },
            {
                name      : "fage",
                alias     : "年龄",
                defaultVal: 10,
                required  : true,
                validator : function () {
                    return this.$val.length > 3;
                }
            }
        ]
    );
    it("检查状态", function () {
        let ins = new M({}, false);
        assert.equal(false, ins.$isMod);
        assert.equal(undefined, ins.$isValid);
    });
});

describe("mode04", function () {
    let M = modelDefine(
        [
            {
                name      : "fname",
                alias     : "姓名",
                required  : true,
                defaultVal: "sasa",
                validator : function () {
                    return this.$val.length > 3;
                }
            }
        ]
    );
    it("检查状态", function () {
        let ins = new M({}, false);
        assert.equal(true, ins.$isValid);
    });
    it("检查修改", function () {
        let ins = new M({}, false);
        assert.equal(false, ins.$isMod);
    });
});
describe("mode04", function () {
    let M = modelDefine(
        [
            {
                name      : "fname",
                alias     : "姓名",
                required  : true,
                defaultVal: "sasa",
                validator : function () {
                    return this.$val.length > 3;
                }
            }
        ]
    );
    it("检查验证", function () {
        let ins = new M({fname: "sas"}, false);
        assert.equal("sas", ins.$data.fname);
        assert.equal(false, ins.$isValid);
    });
    it("检查修改", function () {
        let ins = new M({fname: "sas"}, false);
        assert.equal(false, ins.$isMod);
    });
});
describe("mode05", function () {
    let M = modelDefine(
        [
            {
                name      : "fname",
                alias     : "姓名",
                required  : true,
                defaultVal: "sasa",
                validator : function () {
                    return this.$val.length > 3;
                }
            },
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return val > 3;
                }
            }
        ]
    );
    it("检查验证", function () {
        let ins = new M({fage: 10}, false);
        assert.equal(true, ins.$isValid);
    });
});
describe("mode05", function () {
    let M = modelDefine(
        [
            {
                name      : "fname",
                alias     : "姓名",
                required  : true,
                defaultVal: "sasa",
                validator : function () {
                    return this.$val.length > 3;
                }
            },
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return val > 3;
                }
            }
        ]
    );
    it("检查验证", function () {
        let ins = new M({fage: 2}, false);
        assert.equal(false, ins.$isValid);
        assert.equal(false, ins.$isMod);
    });
});
describe("mode06", function () {
    let M = modelDefine(
        [
            {
                name      : "fname",
                alias     : "姓名",
                required  : true,
                defaultVal: "sasa",
                validator : function (val) {
                    return new Promise(function (res) {
                        setTimeout(function () {
                            res(val.length > 3);
                        }, 400);
                    })
                }
            },
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return val > 3;
                }
            }
        ]
    );
    it("检查验证", function (done) {
        let ins = new M({fname: 'sas'}, false);
        assert.equal(undefined, ins.$isValid);
        setTimeout(function () {
            assert.equal(false, ins.$isValid);
            done();
        }, 1000)
    });
});

describe("mode07", function () {
    let M = modelDefine(
        [
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return val > 3;
                }
            }
        ]
    );
    it("检查验证", function (done) {
        let ins = new M({fage: 2}, false);
        assert.equal(false, ins.$isValid);
        assert.equal(ins.$modData.fage, undefined);
        ins.fage = 5;
        assert.equal(ins.$data.fage, 5);
        assert.equal(ins.$modData.fage, 5);
        assert.equal(ins.$modified.fage, true);
        assert.equal(false, ins.$isValid);
        setTimeout(function () {
            assert.equal(true, ins.$isValid);
            done();
        }, 1000)
    });
});

describe("mode08", function () {
    let M = modelDefine(
        [
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return val > 3;
                }
            },

            {
                name  : "fch",
                fields: [
                    {
                        name      : "fage",
                        defaultVal: 10
                    }
                ]
            }
        ]
    );
    it("检查验证", function (done) {
        let ins = new M({fage: 2}, false);
        assert.equal(false, ins.$isValid);
        ins.$set({fage: 5, fch: {fage: 15}});
        assert.equal(false, ins.$isValid);
        setTimeout(function () {
            assert.equal(true, ins.$isValid);
            done();
        }, 1000)
    });
});

describe("mode09", function () {
    let M = modelDefine(
        [
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return val > 3;
                }
            },
            {
                name      : "fname",
                alias     : "姓名",
                defaultVal: "sasa",
                validator : function () {
                    return this.$val.length > 3;
                }
            }

        ]
    );
    it("检查验证", function () {
        let ins = new M({}, false);
        assert.equal(undefined, ins.$isValid);
        ins.$validate();
        assert.equal(false, ins.$isValid);
        // setTimeout(function () {
        //     assert.equal(false, ins.$isValid);
        //     done();
        // }, 1000)
    });
});
describe("mode10", function () {
    let cnt = 0;
    let M   = modelDefine(
        [
            {
                name     : "fage",
                alias    : "年龄",
                required : 10,
                validator: function (val) {
                    cnt++;
                    return val > 3;
                }
            },
            {
                name  : "fch",
                fields: [
                    {
                        name      : "fage",
                        defaultVal: 10
                    }
                ]
            }
        ]
    );
    it("检查验证", function (done) {
        let ins = new M({fage: 5}, false);
        ins.$validate();
        assert.equal(1, cnt);
        setTimeout(function () {
            ins.$validate();
            assert.equal(1, cnt);
        }, 400);
        setTimeout(function () {
            ins.$validate(undefined, true);
            assert.equal(2, cnt);
            done();
        }, 800)

        // setTimeout(function () {
        //     assert.equal(false, ins.$isValid);
        //     done();
        // }, 1000)
    });
});
describe("mode11", function () {
    let M = modelDefine(
        [
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return val > 3;
                }
            }
        ]
    );
    it("检查验证", function (done) {
        let ins = new M({fage: 2}, false);
        assert.equal(false, ins.$isValid);
        ins.$set("fage", 5);
        assert.equal(false, ins.$isValid);
        setTimeout(function () {
            assert.equal(true, ins.$isValid);
            done();
        }, 1000)
    });
});

describe("mode12", function () {
    let M = modelDefine(
        [
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return new Promise(function (res) {
                        setTimeout(function () {
                            res(val > 3);
                        })
                    })
                }
            },
        ]
    );
    it("检查验证", function (done) {
        let ins = new M({fage: 2});
        assert.equal(undefined, ins.$isValid);
        ins.fage = 10;
        setTimeout(function () {
            assert.equal(true, ins.$isValid);
            done();
        }, 1000)
    });
});

describe("mode13", function () {
    let M = modelDefine(
        [
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return new Promise(function (res) {
                        setTimeout(function () {
                            res(val < 3);
                        })
                    })
                }
            },
        ]
    );
    it("检查验证", function (done) {
        let ins = new M({fage: 12});
        assert.equal(undefined, ins.$isValid);
        ins.fage = 2;
        ins.fage = 10;
        ins.$validate();
        ins.$validate().then(function () {
            assert.equal(false, ins.$isValid);
        });
        setTimeout(function () {
            assert.equal(false, ins.$isValid);
            done();
        }, 1000)
    });
});

describe("mode14", function () {
    let M = modelDefine(
        [
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return val > 3;
                }
            },

            {
                name  : "fch",
                fields: [
                    {
                        name      : "fage",
                        defaultVal: 10
                    }
                ]
            }
        ]
    );
    it("检查验证", function () {
        let ins = new M({fage: 10}, false);
        // assert.equal(10, ins.fch.fage);
        assert.equal(10, ins.$data.fch.fage);
    });
});
describe("mode15", function () {
    let M = modelDefine(
        [
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return val > 3;
                }
            },

            {
                name  : "fch",
                fields: [
                    {
                        name      : "fage",
                        alias     : "年龄2",
                        defaultVal: 10
                    }
                ]
            }
        ]
    );
    it("检查验证", function () {
        new M({fage: 10}, false);
        // assert.equal(10, ins.fch.fage);
        assert.equal("年龄", M.$getAlias()["fage"]);
        assert.equal("年龄", M.$getAlias("fage"));
        assert.equal("年龄", M.$getAlias(["fage"]).fage);
        assert.equal("年龄2", M.$getAlias(["fage", "fch"]).fch.fage);
        assert.equal("年龄2", M.$getAlias("fch").fage);
    });
});
describe("mode16", function () {
    let M = modelDefine(
        [
            {
                name      : "fname",
                alias     : "姓名",
                defaultVal: "sasa",
                validator : function () {
                    return this.$val.length > 3;
                }
            },
            {
                name  : "fch",
                fields: [
                    {
                        name      : "fage",
                        defaultVal: 10
                    }
                ]
            }]
    );

    it("检查验证", function () {
        let ins      = new M({fage: 10}, false);
        ins.fch.fage = 20;
        // assert.equal(10, ins.fch.fage);
        assert.equal(20, ins.$modData.fch.fage);
    });
});

describe("mode17", function () {
    let M = modelDefine(
        [
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return val > 3;
                }
            },

            {
                name  : "fch",
                fields: [
                    {
                        name      : "fage",
                        defaultVal: 10
                    }
                ]
            }
        ]
    );
    it("检查验证", function () {
        let ins = new M({fage: 10}, false);
        ins.$set({fch: {fage: 15}});
        assert.equal(15, ins.fch.fage);
    });
});
describe("mode18", function () {
    let M        = modelDefine(
        [
            {
                name     : "fage",
                alias    : "年龄",
                required : true,
                validator: function (val) {
                    return val > 3;
                }
            },

            {
                name  : "fch",
                fields: [
                    {
                        name     : "fname",
                        alias    : "姓名",
                        validator: function (val) {
                            return val.length > 3;
                        }
                    },
                    {
                        name      : "fage",
                        defaultVal: 10,
                        validator : function (val) {
                            return new Promise(function (res) {
                                setTimeout(function () {
                                    res(val > 8)
                                })
                            }, 800)
                        }
                    }
                ]
            }
        ]
    );
    let ins      = new M({fage: 2}, false);
    ins.$validate(undefined, true);
    it("检查验证", function () {
        assert.equal(false, ins.$isValid);
    });
});
describe("mode19", function () {
    let M        = modelDefine(
        [
            {
                name      : "fname",
                alias     : "姓名",
                defaultVal: "sasa",
                validator : function (val) {
                    return val.length > 3;
                }
            },

            {
                name      : "fage",
                defaultVal: 10,
                validator : function (val) {
                    return new Promise(function (res) {
                        setTimeout(function () {
                            res(val > 8)
                        })
                    }, 100)
                }
            }
        ]
    );
    let ins      = new M({fage: 10}, false);
    ins.fage = 8;
    ins.$validate(undefined, true).then(function () {
        assert.equal(false,ins.$isValid);
    });
});
import modelDefine from "./model";

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
console.log(ins.$isValid);
ins.$validate(undefined, true).then(function () {
    console.log(ins.$isValid);
});
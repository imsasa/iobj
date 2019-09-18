module.exports = {
    root           : true,
    env            : {
        browser: true,
        es6    : true,
        node   : true
    },
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType" : "module"
    },
    "globals"      : {
        "$": true,
        "it": true,
        "describe":true,
        "beforeEach":true
    },
    extends        : [
        "eslint:recommended",
        'plugin:vue/recommended'
    ],
    plugins        : [
        "vue"
    ],
    rules          : {
        'vue/max-attributes-per-line': ["warn", {
            "singleline": 6,
            "multiline": {
                "max": 1,
                "allowFirstLine": true
            }
        }],
        curly: [1, "multi", "consistent"]
    }
};

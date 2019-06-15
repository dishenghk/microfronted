import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import babel from "rollup-plugin-babel"
export default [
    {
        input:"src/exports.js",
        output:{
            file:"dist/micro-front.js",
            format:"umd",
            name:"bunndle-name"
        },
        plugin:[
            resolve(),
            commonjs(),
            babel({
                exclude:"node_moudles/**",
                runtimeHelpers:true
            })

        ]
    },
    {
        input:"src/index.js",
        output:{
            file:"dist/index.js",
            format:"umd",
            name:"bunndle-index"
        },
        plugin:[
            resolve(),
            commonjs(),
            babel({
                exclude:"node_moudles/**",
                runtimeHelpers:true
            })

        ]
    },
    {
        input:"src/test.js",
        output:{
            file:"dist/test.js",
            format:"es",
            name:"bunndle-test"
        },
        plugin:[
            resolve(),
            commonjs(),
            babel({
                exclude:"node_moudles/**",
                runtimeHelpers:true
            })

        ]
    },
    {
        input:"src/vuetest.js",
        output:{
            file:"dist/vuetest.js",
            format:"es",
            name:"bunndle-vuetest"
        },
        plugin:[
            resolve(),
            commonjs(),
            babel({
                exclude:"node_moudles/**",
                runtimeHelpers:true
            })

        ]
    }
]
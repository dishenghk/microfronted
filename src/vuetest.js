export default {
    render:()=>{
        document.getElementById("app").innerHTML="<div><p>{{message}}</p></div>";
        new Vue({
            el: '#app',
            data: {
                message: 'Hello Vue.js!'
            }
        })

    },
    destory:()=>{
        document.getElementById("app").innerHTML=""
    }
}
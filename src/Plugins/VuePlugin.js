import BasePlugin from "./../Core/Plugin";
import loader from "./../Utils/loader"
class VuePlugin extends BasePlugin{
    lifeMethod(moudle,lifeName){
        switch(lifeName){
            case "beforeload":
                return new Promise((resolve,reject)=>{
                    /** 避免基础环境无效的加载 */
                    if(window.Vue) {
                        resolve()
                        return
                    }
                    loader.load("https://cdn.staticfile.org/vue/2.2.2/vue.min.js",()=>{
                        resolve()
                    })
                })
        }
    }
}
export default VuePlugin
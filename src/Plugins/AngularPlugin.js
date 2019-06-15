import BasePlugin from "./../Core/Plugin";
import loader from "./../Utils/loader"
class VuePlugin extends BasePlugin{
    lifeMethod(moudle,lifeName){
        switch(lifeName){
            case "beforeload":
                return new Promise((resolve,reject)=>{
                    /** 避免基础环境无效的加载 */
                    // if(window.Vue) return
                    loader.load("https://cdn.staticfile.org/angular.js/1.4.6/angular.min.js",()=>{
                        resolve()
                    })
                })
        }
    }
}
export default VuePlugin
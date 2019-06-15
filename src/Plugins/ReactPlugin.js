import BasePlugin from "./../Core/Plugin"
import loader from "./../Utils/loader"
class ReactPlugin extends BasePlugin{
    lifeMethod(moudle,lifeName){
        switch(lifeName){
            case "beforeload":
                return new Promise((resolve,reject)=>{
                    /** 避免基础环境无效的加载 */
                    if(window.React && window.ReactDOM){
                        resolve()
                        return
                    }
                    loader.load("./react16.development.js",()=>{
                        resolve()
                    })
                })
        }

    }
}
export default ReactPlugin
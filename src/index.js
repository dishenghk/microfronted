import BaseEntry from "./Core/Entry.js";
import {start} from "./Core/app"
class ReactEntry extends BaseEntry{
    //合适加载
    checkShouldLoad(event){
        console.log(event)
        return event.target && event.target.dataset && event.target.dataset.show==="react" 
    }
    //合适卸载
    checkShouldUnload(event){
        return event.type==='hashchange'
    }
    //其他模块发送的信息,当其他模块加载时的动作
    onEntryNotice(entry,notice){
        //当其他的模块被加载时候我们destroy即可
        console.log(entry,notice,this.module)
        if(notice && notice.type ==='loaded'){
            this.module && this.module.destory();
        }
    }
}
class VueEntry extends BaseEntry{
    onEntryNotice(entry,notice){
        if(notice && notice.type ==='loaded'){
           this.module &&  this.module.destory();
        }
    }
}
//默认加载React和Vue环境的加载
const microService=start();
microService.registerEntry(new ReactEntry("./test.js","test",["ReactPlugin"]))
microService.registerEntry(new VueEntry("./vuetest.js","vuetest",["VuePlugin"]))

//注册全局加载时机
microService.registerWindowLoadChance("onclick","test")
microService.registerWindowLoadChance("onhashchange","test")
window.microService=microService
//也可以直接加载模块
window.loadVueTest=function loadVueTest(){
    microService.loadMoudle("vuetest");
}


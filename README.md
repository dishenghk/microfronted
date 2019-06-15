[toc]
# 使用方式

```
npm i
yarn start
```
在线DEMO : http://microfront.dishenghk.cn
# 0. 前言
在Tob项目如火如荼的今天,越来越多的前端项目规模开始急剧扩大,多团队分模块开发迭代是越来越不可以避免,微前端的形式也越来越有必要.
# 1.微前端的核心介绍
## 1.1 模块服务
管理模块和插件的核心服务.
## 1.2 模块
用户开发的统一模块.对外提供统一方法.可以称为应用
## 1.3 插件
平台或生态开发的插件机制,对模块的加载和业务开发起到辅助作用.

## 1.3 微前端服务核心
### 1.3.1 模块如何载入?何时载入?
**如何载入?**   
目前腾讯云NMC中采用Seajs统一管理组织所有的核心或应用模块. 
新产品的接入都是打包成一个CMD的模块通过script标签引入.SeaJs 使用起来较为方便.有明确的api.
我们这里采用何种的组织形势呢?**requirejs/systemjs/es6?**     考虑到微前端的重要优势之一,就是大项目的可以分粒度,技术选型灵活.对于旧的模块可以做到兼容.
新的技术项目使用ES6 import,老的模块化项目进行使用Seajs,RequireJs或Iframe的加载.
所以这里设计将模块的**载入方法和时机都交给模块去定义**.     
**服务核心仅调用用来注册模块名称载入方法和载入时机.**   
**关于载入时机的问题?**     
**事件点击?hashchange?onpopstate....**
等等都可以注册到服务核心中去.当捕捉到事件之后去遍历所有已注册的载入时机,如果满足模块的载入时机,则调用模块的载入方法.不局限与路由切换,菜单点击等情况.同时我们也提供一些核心插件用于一些机制的注册. 



### 1.3.2 具体实现

```
class Services{
    constructor(pluginService){
        this.entrys=new Map();
        this.plguinService=pluginService;
        //监听事件类型的注册
        this.eventTypeMoudles=new Map();

    }
    /**
     * 服务注册入口
     * @param {*} entry
     * @memberof Services
     */
    registerEntry(entry){
        console.log(entry.getName())
        this.entrys.set(entry.getName(),entry);       
    }
    
    getPluginService(){
        return this.plguinService;
    }
    registerPlugin(plugin){
        this.plguinService.register(plugin)
    }
    
    /**
     * 注册全局加载时机
     */
    registerWindowLoadChance(eventType,moudleName){
        if(this.eventTypeMoudles.has(eventType)){
            this.eventTypeMoudles.get(eventType).add(moudleName);
        }else{
            this.eventTypeMoudles.set(eventType,new Set([moudleName]));
        }
        //更新监听方法
        window[eventType]=(event)=>{
            //触发set中所有的moudle的checkload方法
            [...this.eventTypeMoudles.get(eventType)].forEach((moudleName)=>{
                this.entrys.get(moudleName) && this.entrys.get(moudleName).onEvent(event,this)
            })
        }
    }
    /**
     * 直接开启某个模块
     */
    loadMoudle(moudleName){
        this.entrys.get(moudleName) && this.entrys.get(moudleName).start(this)
    }
    /** 
     * 通知其他模块.本模块被加载了
    */
   noticeOtherEntry(sendEntry,notice){
        for(let [entryName,entry] of this.entrys){
            if(entryName!==sendEntry.getName()){
                entry.onEntryNotice(sendEntry,notice)
            }
        }
   }
    
}
```


# 3.关于模块
*关于微前端,网上有许多的文章描述和见解,微前端中的核心就是子应用被实现的方式.不外有以下三种方式*  
1. 三大框架(React,Vue,Angular)
2. iframe 
3. web-component
4. ~~原生(好像没看到)~~ 

**所以如何设计出一个好的模块设计,可以去适应不同的框架,不同的开发方式.**
## 3.1 模块的目标

模块最终的目标是在指定位置渲染dom结构.  
所以不管是什么类型的应用,本质上就是渲染dom结构,只是可能加载方式的,加载的前提,运行的时机不同罢了.这些都可以通过插件去解决.

## 3.2 模块的本质
模块的本质是一个被封装统一方法的前端资源集.     
这里可以抽象一个模块为Entry和App  

**Entry**   
Entry 接受注册的全局监听事件去判断对于自身模块加载和卸载.且接受其他模块发送的信息.Entry就是App的管理者
```
class Entry{
    constructor(jsUrl,name,plugins){
    }
    checkShouldLoad(event){
    }
    checkShouldUnload(event){
    }
    onEntryNotice(entry,notice){
    }
}
```
**App**     
app 就是模块的主要内容,满足以下接口设定即可
```
class App{
    render=()=>{
         ReactDOM.render(
          React.createElement('div', null, 'Hello Micro Front For React'),
            document.getElementById('root')
        );
    },
    destory=()=>{
        ReactDOM.unmountComponentAtNode(document.getElementById("root"))
    }
}
```

分离Moudle为Entry和App最主要的原因就是减少网页第一次被加载时,减少加载资源的体积大小.

### 2.3.1 加载方式
**requirejs**
### 2.3.2 加载时机
可以由模块统一确定.无论是点击菜单,路由切换.
# 3. 关于插件
## 3.1 插件的作用   
**为模块的加载做环境准备**  
**监控模块的运行情况**  
**优化模块加载,如增加loading,避免重复加载基础环境** 

**...**

## 3.2 ReactPlugin实现demo

```
import BasePlugin from "./../Core/Plugin"
import loader from "./../Utils/loader"
class ReactPlugin extends BasePlugin{
    lifeMethod(moudle,lifeName){
        switch(lifeName){
            case "beforeload":
                return new Promise((resolve,reject)=>{
                    /** 避免基础环境多次的加载 */
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
```

# 4.整体DEMO
http://microfront.dishenghk.cn

```
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

```



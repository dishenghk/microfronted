(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}(function () { 'use strict';

    //最终注册在核心的模块
    class Entry{
        /**
         * 
         * @param {*} jsUrl 
         * @param {*} name 
         * @param {*} otherOptions 
         */
        constructor(jsUrl,name,plugins){
            this.jsUrl=jsUrl;
            this.name=name;
            this.plugins=plugins;
            //引入的moudle
            this.module=null;
        }
        checkShouldLoad(event){
            return false;
        }
        checkShouldUnload(event){
            return false;
        }
        getName(){
            return this.name;
        }

        /**
         * 载入的时机,也是入口方法
         */
        onEvent(event,microService){
            //此处可以读取一些全局信息去判断是否满足
            //外部事件对于moudle的影响为加载和卸载
            //获取插件服务
            let pluginService=microService.getPluginService();
            if(this.checkShouldLoad(event)) {
                this.start(microService);
                return
            }
            if(this.checkShouldUnload(event)){
                pluginService.applyPluginsLifeMethod(this,"beforeunmount");
                if(this.module && this.module.destory){
                    this.module.destory();
                }
            }
           
            
        }
        
        getPlugins(){
            return this.plugins;
        }
        start(microService){
            microService.noticeOtherEntry(this,{type:"loaded"});
            let pluginService=microService.getPluginService();
            //调用插件的before load生命周期方法
            Promise.all(pluginService.applyPluginsLifeMethod(this,"beforeload")).then(result=>{
                import(this.jsUrl).then(result=>{
                    if(result.default && result.default.render){
                        this.module=result.default;
                        this.module.render();
                    }
                });
            });
        }
        onEntryNotice(entry,notice){

        }
        
        

    }

    class Plugin{
        /**
         * 初始化插件
         * @param {*} id 插件唯一ID
         */  
        constructor(name,version){
            this.name=name;
        }
        getName(){
            return this.name
        }
        lifeMethod(module,lifeName){
            //针对不同的生命周期函数
            switch(lifeName){
                case "beforeload":
                    // 此时的moudle的是plugin
                    console.log("beforeload");
                    break
                case "beforeunmount":
                    console.log("beforeunmount");
            }
        }

        
    }

    class PluginService{
        constructor(){
            this.plugins=new Map();
        }
        /**
         * 注册插件到服务中
         * @param {*} plugin 
         */
        register(plugin){
            console.log(plugin.getName());
            this.plugins.set(plugin.getName(),plugin);
        }
        /**
         * 模块调用关联模块的生命周期方法
         */
        applyPluginsLifeMethod(entry,lifeName){
            const pluginNames=entry.getPlugins();
            return pluginNames.map(pluginName => {
                let plugin=this.plugins.get(pluginName);
                if(plugin){
                    return plugin.lifeMethod(entry,lifeName);
                }
            });
        }

    }

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
            console.log(entry.getName());
            this.entrys.set(entry.getName(),entry);       
        }
        
        getPluginService(){
            return this.plguinService;
        }
        registerPlugin(plugin){
            this.plguinService.register(plugin);
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
                    this.entrys.get(moudleName) && this.entrys.get(moudleName).onEvent(event,this);
                });
            };
        }
        /**
         * 直接开启某个模块
         */
        loadMoudle(moudleName){
            this.entrys.get(moudleName) && this.entrys.get(moudleName).start(this);
        }
        /** 
         * 通知其他模块.本模块被加载了
        */
       noticeOtherEntry(sendEntry,notice){
            for(let [entryName,entry] of this.entrys){
                if(entryName!==sendEntry.getName()){
                    entry.onEntryNotice(sendEntry,notice);
                }
            }
       }
        
    }

    window.microfront= {
        BaseEntry: Entry,
        BasePlugin: Plugin,
        PluginService,
        Service: Services
    };

}));

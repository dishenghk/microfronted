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
        this.plugins=plugins
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
        let pluginService=microService.getPluginService()
        if(this.checkShouldLoad(event)) {
            this.start(microService)
            return
        }
        if(this.checkShouldUnload(event)){
            pluginService.applyPluginsLifeMethod(this,"beforeunmount");
            if(this.module && this.module.destory){
                this.module.destory()
            }
        }
       
        
    }
    
    getPlugins(){
        return this.plugins;
    }
    start(microService){
        microService.noticeOtherEntry(this,{type:"loaded"})
        let pluginService=microService.getPluginService()
        //调用插件的before load生命周期方法
        Promise.all(pluginService.applyPluginsLifeMethod(this,"beforeload")).then(result=>{
            import(this.jsUrl).then(result=>{
                if(result.default && result.default.render){
                    this.module=result.default
                    this.module.render()
                }
            })
        })
    }
    onEntryNotice(entry,notice){

    }
    
    

}
export default Entry;
class PluginService{
    constructor(){
        this.plugins=new Map();
    }
    /**
     * 注册插件到服务中
     * @param {*} plugin 
     */
    register(plugin){
        console.log(plugin.getName())
        this.plugins.set(plugin.getName(),plugin)
    }
    /**
     * 模块调用关联模块的生命周期方法
     */
    applyPluginsLifeMethod(entry,lifeName){
        const pluginNames=entry.getPlugins();
        return pluginNames.map(pluginName => {
            let plugin=this.plugins.get(pluginName)
            if(plugin){
                return plugin.lifeMethod(entry,lifeName);
            }
        });
    }

}
export default PluginService
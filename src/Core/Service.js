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
export default Services
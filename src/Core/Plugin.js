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
                console.log("beforeload")
                break
            case "beforeunmount":
                console.log("beforeunmount")
        }
    }

    
}
export default Plugin;
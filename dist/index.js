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

    var loader = {
        load: function(url, cb) {
          var urlArr = [];
          if (typeof url == 'string') {
            urlArr.push(url);
          } else {
            urlArr = url;
          }
          var len = urlArr.length,
            callback = function() {
              if (!--len) {
                cb && cb();
              }
            };
          for (var i = 0, url; (url = urlArr[i]); i++) {
            this._load(url, callback);
          }
        },
        _load: function(url, cb) {
          var oldIe = /msie [\w.]+/.test(navigator.userAgent.toLowerCase());
          if (oldIe) {
            this._iframeLoad(url, cb);
          } else {
            this._scriptLoad(url, cb);
          }
        },
        _scriptLoad: function(url, cb) {
          var el = document.createElement('script');
          el.setAttribute('type', 'text/javascript');
          el.setAttribute('src', url + '?max_age=20000000');
          el.setAttribute('async', true);
          el.onerror = function() {
            cb();
            el.onerror = null;
          };
          el.onload = el.onreadystatechange = function() {
            if (
              !this.readyState ||
              this.readyState === 'loaded' ||
              this.readyState === 'complete'
            ) {
              cb();
              el.onload = el.onreadystatechange = null;
            }
          };
          document.getElementsByTagName('head')[0].appendChild(el);
        },
        _iframeLoad: function(url, cb) {
          var iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src =
            'javascript:void(function(){document.open();' +
            'document.domain = "' +
            document.domain +
            '";document.close();}());';

          iframe.callback = function(jsStr) {
            eval(jsStr);
            //                    if (storeMode) {
            //                        try {
            //                            clearLocal(url);
            //                            localStorage[url] = jsStr;
            //                        } catch (e) {}
            //                    }
            cb();
            setTimeout(function() {
              document.body.removeChild(iframe);
              iframe = null;
            }, 1000);
          };
          var iframeLoad = function() {
            var iframeDoc =
              iframe.contentDocument || iframe.contentWindow.document;
            var iframeHtm = [
              '<html><head><meta charset="utf-8"></head><body onload="callback()">',
              '<script type="text/javascript">',
              'var jsStr = "", cb = false;',
              'var define = function (id, factory) {',
              'if (typeof(factory) == "function") {',
              'var factoryStr = factory.toString();',
              'jsStr += "define(\'" + id + "\'," + factoryStr + ");"',
              '}',
              '};<\/script>',
              '<script type="text/javascript" src="' +url +
                '?max_age=20000000' +
                '"><\/script>',
              '<script type="text/javascript">',
              'function callback() {',
              'if (jsStr && !cb) {',
              'frameElement.callback(jsStr);',
              'cb = true;',
              '}',
              '};',
              'callback();',
              '<\/script>',
              '</body></html>'
            ].join('');
            iframeDoc.open();
            iframeDoc.domain = document.domain;
            iframeDoc.write(iframeHtm);
            iframeDoc.close();
          };

          if (iframe.attachEvent) {
            var _ifmLoad = function() {
              iframe.detachEvent('onload', _ifmLoad);
              iframeLoad();
            };
            iframe.attachEvent('onload', _ifmLoad);
          } else {
            iframe.onload = function() {
              iframe.onload = null;
              iframeLoad();
            };
          }

          document.body.appendChild(iframe);
        }
      };

    class ReactPlugin extends Plugin{
        lifeMethod(moudle,lifeName){
            switch(lifeName){
                case "beforeload":
                    return new Promise((resolve,reject)=>{
                        /** 避免基础环境无效的加载 */
                        if(window.React && window.ReactDOM){
                            resolve();
                            return
                        }
                        loader.load("./react16.development.js",()=>{
                            resolve();
                        });
                    })
            }

        }
    }

    class VuePlugin extends Plugin{
        lifeMethod(moudle,lifeName){
            switch(lifeName){
                case "beforeload":
                    return new Promise((resolve,reject)=>{
                        /** 避免基础环境无效的加载 */
                        if(window.Vue) {
                            resolve();
                            return
                        }
                        loader.load("https://cdn.staticfile.org/vue/2.2.2/vue.min.js",()=>{
                            resolve();
                        });
                    })
            }
        }
    }

    class VuePlugin$1 extends Plugin{
        lifeMethod(moudle,lifeName){
            switch(lifeName){
                case "beforeload":
                    return new Promise((resolve,reject)=>{
                        /** 避免基础环境无效的加载 */
                        // if(window.Vue) return
                        loader.load("https://cdn.staticfile.org/angular.js/1.4.6/angular.min.js",()=>{
                            resolve();
                        });
                    })
            }
        }
    }

    function start(){
        const pluginSevice=new PluginService();
        const runService=new Services(pluginSevice);
        runService.registerPlugin(new ReactPlugin("ReactPlugin","1.0.1"));
        runService.registerPlugin(new VuePlugin("VuePlugin","1.0.1"));
        runService.registerPlugin(new VuePlugin$1("AngularPlugin","1.0.1"));

        return runService
    }

    class ReactEntry extends Entry{
        //合适加载
        checkShouldLoad(event){
            console.log(event);
            return event.target && event.target.dataset && event.target.dataset.show==="react" 
        }
        //合适卸载
        checkShouldUnload(event){
            return event.type==='hashchange'
        }
        //其他模块发送的信息,当其他模块加载时的动作
        onEntryNotice(entry,notice){
            //当其他的模块被加载时候我们destroy即可
            console.log(entry,notice,this.module);
            if(notice && notice.type ==='loaded'){
                this.module && this.module.destory();
            }
        }
    }
    class VueEntry extends Entry{
        onEntryNotice(entry,notice){
            if(notice && notice.type ==='loaded'){
               this.module &&  this.module.destory();
            }
        }
    }
    //默认加载React和Vue环境的加载
    const microService=start();
    microService.registerEntry(new ReactEntry("./test.js","test",["ReactPlugin"]));
    microService.registerEntry(new VueEntry("./vuetest.js","vuetest",["VuePlugin"]));

    //注册全局加载时机
    microService.registerWindowLoadChance("onclick","test");
    microService.registerWindowLoadChance("onhashchange","test");
    window.microService=microService;
    //也可以直接加载模块
    window.loadVueTest=function loadVueTest(){
        microService.loadMoudle("vuetest");
    };

}));

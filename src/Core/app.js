import Service from "./Service"
import PluginService from "./PluginService"
import ReactPlugin from "../Plugins/ReactPlugin"
import VuePlugin from "../Plugins/VuePlugin"
import AngularPlugin from "../Plugins/AngularPlugin"
function start(){
    const pluginSevice=new PluginService();
    const runService=new Service(pluginSevice);
    runService.registerPlugin(new ReactPlugin("ReactPlugin","1.0.1"))
    runService.registerPlugin(new VuePlugin("VuePlugin","1.0.1"))
    runService.registerPlugin(new AngularPlugin("AngularPlugin","1.0.1"))

    return runService
}
export {start}
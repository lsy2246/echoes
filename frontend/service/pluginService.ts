import { PluginConfig ,PluginType ,PluginConfiguration} from "types/pluginType";



export class PluginService {
    private static pluginInstance: PluginService | null   = null; // 单例实例
    private pluginComponents: Map<PluginType, Set<{
        name:string,
        configuration?:PluginConfiguration,
        managePath?: string,
        

    }>> = new Map(); // 插件组件缓存
    private constructor (){};
    
    public static getInstance(): PluginService {
        if (!this.pluginInstance) {
            this.pluginInstance = new PluginService();
        }
        return this.pluginInstance;
    }

     
}
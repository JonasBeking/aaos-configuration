import type { AutomotiveCapacitorConfig } from "../common/AutomotiveCapacitorConfig";
import type { AutomotiveDataPluginConfiguration } from "../plugin/AutomotiveDataPluginConfiguration";
/**
 * Certainly
 */
export declare class AndroidAutomotiveManifest {
    /**
     * Can be arrays as they are resolved to sets in the update method anyways
     * @private
     */
    private applicationPermissions;
    private applicationFeatures;
    private applicationMetaData;
    private automotivePluginConfigurations;
    private project;
    private readonly automotiveConfig;
    constructor(config: AutomotiveCapacitorConfig);
    /**
     * Every plugin used must provide a config that is added to this
     * It will register the plugin to capacitor as an 'included plugin' and apply the given configurations and alterfications
     * to the files in order to provide a dynamic but safe security concept for SystemService access
     * @param pluginConfig A plugin configuration that each AAOS-Capacitor-Plugin provides
     */
    addPlugin(pluginConfig: AutomotiveDataPluginConfiguration): AndroidAutomotiveManifest;
    addPermission(permission: string): AndroidAutomotiveManifest;
    addFeature(feature: string, required: boolean): AndroidAutomotiveManifest;
    addMetaData(name: string, value: string): AndroidAutomotiveManifest;
    private getHighestRequiredCarApiLevel;
    update(): Promise<void>;
}

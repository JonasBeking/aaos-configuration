import type { MobileProjectConfig} from "@trapezedev/project";
import {MobileProject} from "@trapezedev/project";
import fs from "fs";

import {ApplicationFeature} from "../common/ApplicationFeature";
import {ApplicationMetaData} from "../common/ApplicationMetaData";
import {ApplicationPermission} from "../common/ApplicationPermission";
import type {AutomotiveCapacitorConfig} from "../common/AutomotiveCapacitorConfig";
import {ConfigurationError} from "../common/ConfigurationError";
import type {AutomotiveDataPluginConfiguration} from "../plugin/AutomotiveDataPluginConfiguration";



/**
 * Certainly
 */
export class AndroidAutomotiveManifest {

    /**
     * Can be arrays as they are resolved to sets in the update method anyways
     * @private
     */
    private applicationPermissions : ApplicationPermission[] = []
    private applicationFeatures : ApplicationFeature[] = []
    private applicationMetaData : ApplicationMetaData[] = []
    private automotivePluginConfigurations : AutomotiveDataPluginConfiguration[] = []
    private project : MobileProject
    private readonly automotiveConfig : AutomotiveCapacitorConfig

    constructor(config : AutomotiveCapacitorConfig) {
        const trapezeConfig: MobileProjectConfig = {
            android: {
                path: 'android',
            },
        };

        this.automotiveConfig = config
        this.project = new MobileProject("./",trapezeConfig)

    }

    /**
     * Every plugin used must provide a config that is added to this
     * It will register the plugin to capacitor as an 'included plugin' and apply the given configurations and alterfications
     * to the files in order to provide a dynamic but safe security concept for SystemService access
     * @param pluginConfig A plugin configuration that each AAOS-Capacitor-Plugin provides
     */
    addPlugin(pluginConfig : AutomotiveDataPluginConfiguration) : AndroidAutomotiveManifest {
        if(!this.automotiveConfig) {
            throw new ConfigurationError("Automotive Config has not been initialized")
        }
        this.automotivePluginConfigurations.push(pluginConfig)
        const pluginName = pluginConfig.getName()
        console.log("Registering plugin with name: ", pluginName)

        this.automotiveConfig.includePlugins.push(pluginName)
        return this
    }

    addPermission(permission : string) : AndroidAutomotiveManifest{
        this.applicationPermissions.push(new ApplicationPermission(permission))
        return this
    }

    addFeature(feature : string, required : boolean) : AndroidAutomotiveManifest {
        this.applicationFeatures.push(new ApplicationFeature(feature,required))
        return this
    }

    addMetaData(name : string, value : string) : AndroidAutomotiveManifest {
        this.applicationMetaData.push(new ApplicationMetaData(name,value))
        return this
    }

    private getHighestRequiredCarApiLevel() : number{
        let minCarApi = -1

        for(const config of this.automotivePluginConfigurations) {
            const configCarApiLevel = config.getMinCarApiLevel()
            minCarApi = configCarApiLevel > minCarApi ? configCarApiLevel : minCarApi
        }

        return minCarApi
    }

    async update() : Promise<void>{

        const cummulativeRequiredPermissions = new Set<ApplicationPermission>()
        const cummulativeRequiredFeatures = new Set<ApplicationFeature>()

        for(const config of this.automotivePluginConfigurations) {
            config.updateAnnotation((path) => {
                return fs.readFileSync(path,"utf-8")
            }, (path,content) => {
                fs.writeFileSync(path,content)
            })

            for(const permission of config.getRequiredPermissions()) {
                cummulativeRequiredPermissions.add(permission)
            }

            for(const feature of config.getRequiredFeatures()) {
                cummulativeRequiredFeatures.add(feature)
            }

        }

        for(const permission of this.applicationPermissions) {
            cummulativeRequiredPermissions.add(permission)
        }

        for(const feature of this.applicationFeatures) {
            cummulativeRequiredFeatures.add(feature)
        }

        await this.project.load()
        await this.project.android?.getAndroidManifest().load()

        this.project.android?.getAndroidManifest().deleteNodes("manifest/uses-permission")

        for(const permission of cummulativeRequiredPermissions) {
            this.project.android?.getAndroidManifest().injectFragment("manifest",permission.toManifestString())
        }

        this.project.android?.getAndroidManifest().deleteNodes("manifest/uses-feature")

        for(const feature of cummulativeRequiredFeatures) {
            this.project.android?.getAndroidManifest().injectFragment("manifest",feature.toManifestString())
        }

        this.project.android?.getAndroidManifest().deleteNodes("manifest/application/meta-data")

        for(const metaData of this.applicationMetaData) {
            this.project.android?.getAndroidManifest().injectFragment("manifest/application",metaData.toManifestString())
        }

        if(this.automotiveConfig.automotive.distractionOptimized) {
            console.warn("CAREFUL: Application must adhere to Driver Distraction Guidelines in order to activate the 'distractionOptimized' flag")
        }

        const distractionOptimizedMetaData = new ApplicationMetaData("distractionOptimized",`${this.automotiveConfig.automotive.distractionOptimized}`)
        this.project.android?.getAndroidManifest().injectFragment("manifest/application",distractionOptimizedMetaData.toManifestString() )

        const minCarApiLevel = this.getHighestRequiredCarApiLevel()
        if(minCarApiLevel < 0) {
            console.log("No CarApi required")
        }
        else{
            console.log(`Requires minimum CarApi ${minCarApiLevel}`)
            const carApiMeta = new ApplicationMetaData("androidx.car.app.minCarApiLevel",minCarApiLevel.toString())
            this.project.android?.getAndroidManifest().injectFragment("manifest/application",carApiMeta.toManifestString())
        }

        await this.project.commit()
    }
}

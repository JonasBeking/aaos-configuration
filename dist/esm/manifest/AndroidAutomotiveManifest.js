import { MobileProject } from "@trapezedev/project";
import fs from "fs";
import { ApplicationFeature } from "../common/ApplicationFeature";
import { ApplicationMetaData } from "../common/ApplicationMetaData";
import { ApplicationPermission } from "../common/ApplicationPermission";
import { ConfigurationError } from "../common/ConfigurationError";
import { DataUtilsPluginConfiguration } from "../DataUtilsPluginConfiguration/DataUtilsPluginConfiguration";
/**
 * Certainly
 */
export class AndroidAutomotiveManifest {
    constructor(config) {
        /**
         * Can be arrays as they are resolved to sets in the update method anyways
         * @private
         */
        this.applicationPermissions = [];
        this.applicationFeatures = [];
        this.applicationMetaData = [];
        this.automotivePluginConfigurations = [];
        const trapezeConfig = {
            android: {
                path: 'android',
            },
        };
        this.automotiveConfig = config;
        this.project = new MobileProject("./", trapezeConfig);
        this.addPlugin(new DataUtilsPluginConfiguration());
    }
    /**
     * Every plugin used must provide a config that is added to this
     * It will register the plugin to capacitor as an 'included plugin' and apply the given configurations and alterfications
     * to the files in order to provide a dynamic but safe security concept for SystemService access
     * @param pluginConfig A plugin configuration that each AAOS-Capacitor-Plugin provides
     */
    addPlugin(pluginConfig) {
        if (!this.automotiveConfig) {
            throw new ConfigurationError("Automotive Config has not been initialized");
        }
        this.automotivePluginConfigurations.push(pluginConfig);
        const pluginPackage = pluginConfig.getPackage();
        console.log("Registering plugin with package-name: ", pluginPackage);
        this.automotiveConfig.includePlugins.push(pluginPackage);
        return this;
    }
    addPermission(permission) {
        this.applicationPermissions.push(new ApplicationPermission(permission));
        return this;
    }
    addFeature(feature, required) {
        this.applicationFeatures.push(new ApplicationFeature(feature, required));
        return this;
    }
    addMetaData(name, value) {
        this.applicationMetaData.push(new ApplicationMetaData(name, value));
        return this;
    }
    getHighestRequiredCarApiLevel() {
        let minCarApi = -1;
        for (const config of this.automotivePluginConfigurations) {
            const configCarApiLevel = config.getMinCarApiLevel();
            minCarApi = configCarApiLevel > minCarApi ? configCarApiLevel : minCarApi;
        }
        return minCarApi;
    }
    async update() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const cumulativeRequiredPermissions = new Set();
        const cumulativeRequiredFeatures = new Set();
        for (const config of this.automotivePluginConfigurations) {
            config.updateAnnotation((path) => {
                return fs.readFileSync(path, "utf-8");
            }, (path, content) => {
                fs.writeFileSync(path, content);
            });
            for (const permission of config.getRequiredPermissions()) {
                cumulativeRequiredPermissions.add(permission.toManifestString());
            }
            for (const feature of config.getRequiredFeatures()) {
                cumulativeRequiredFeatures.add(feature.toManifestString());
            }
        }
        for (const permission of this.applicationPermissions) {
            cumulativeRequiredPermissions.add(permission.toManifestString());
        }
        for (const feature of this.applicationFeatures) {
            cumulativeRequiredFeatures.add(feature.toManifestString());
        }
        await this.project.load();
        await ((_a = this.project.android) === null || _a === void 0 ? void 0 : _a.getAndroidManifest().load());
        (_b = this.project.android) === null || _b === void 0 ? void 0 : _b.getAndroidManifest().deleteNodes("manifest/uses-permission");
        for (const permission of cumulativeRequiredPermissions) {
            (_c = this.project.android) === null || _c === void 0 ? void 0 : _c.getAndroidManifest().injectFragment("manifest", permission);
        }
        (_d = this.project.android) === null || _d === void 0 ? void 0 : _d.getAndroidManifest().deleteNodes("manifest/uses-feature");
        for (const feature of cumulativeRequiredFeatures) {
            (_e = this.project.android) === null || _e === void 0 ? void 0 : _e.getAndroidManifest().injectFragment("manifest", feature);
        }
        (_f = this.project.android) === null || _f === void 0 ? void 0 : _f.getAndroidManifest().deleteNodes("manifest/application/meta-data");
        for (const metaData of this.applicationMetaData) {
            (_g = this.project.android) === null || _g === void 0 ? void 0 : _g.getAndroidManifest().injectFragment("manifest/application", metaData.toManifestString());
        }
        if (this.automotiveConfig.automotive.distractionOptimized) {
            console.warn("CAREFUL: Application must adhere to Driver Distraction Guidelines in order to activate the 'distractionOptimized' flag");
        }
        const distractionOptimizedMetaData = new ApplicationMetaData("distractionOptimized", `${this.automotiveConfig.automotive.distractionOptimized}`);
        (_h = this.project.android) === null || _h === void 0 ? void 0 : _h.getAndroidManifest().injectFragment("manifest/application", distractionOptimizedMetaData.toManifestString());
        const minCarApiLevel = this.getHighestRequiredCarApiLevel();
        if (minCarApiLevel < 0) {
            console.log("No CarApi required");
        }
        else {
            console.log(`Requires minimum CarApi ${minCarApiLevel}`);
            const carApiMeta = new ApplicationMetaData("androidx.car.app.minCarApiLevel", minCarApiLevel.toString());
            (_j = this.project.android) === null || _j === void 0 ? void 0 : _j.getAndroidManifest().injectFragment("manifest/application", carApiMeta.toManifestString());
        }
        await this.project.commit();
    }
}
//# sourceMappingURL=AndroidAutomotiveManifest.js.map
import { ApplicationFeature } from "../common/ApplicationFeature";
import { ApplicationPermission } from "../common/ApplicationPermission";
import { AutomotiveDataPluginConfiguration } from "../plugin/AutomotiveDataPluginConfiguration";
export class DataUtilsPluginConfiguration extends AutomotiveDataPluginConfiguration {
    constructor() {
        super();
        this.name = "DataPlugin";
        this.package = "@capacitor-community/aaos-data-utils";
        this.javaPackage = "io.ionic.plugins.aaosdatautils";
        this.minCarApiLevel = 1;
    }
    addAllowedDataIds(allowedDataIds) {
        return super.addAllowedDataIds(allowedDataIds);
    }
    getRequiredPermissions() {
        return new Set().add(new ApplicationPermission("android.permission.INTERNET"));
    }
    getRequiredFeatures() {
        const features = new Set();
        features.add(new ApplicationFeature("android.hardware.type.automotive", true));
        return features;
    }
}
//# sourceMappingURL=DateUtilsPluginConfiguration.js.map
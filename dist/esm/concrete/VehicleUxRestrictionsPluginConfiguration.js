import { ApplicationFeature } from "../common/ApplicationFeature";
import { AutomotiveDataPluginConfiguration } from "../plugin/AutomotiveDataPluginConfiguration";
export class VehicleUxRestrictionsPluginConfiguration extends AutomotiveDataPluginConfiguration {
    constructor() {
        super();
        this.name = "VehicleUxRestrictionsPlugin";
        this.package = "@capacitor-community/aaos-ux-restrictions";
        this.javaPackage = "io.ionic.plugins.aaosuxrestrictions";
        this.minCarApiLevel = 4;
        this.addAllowedDataIds([-1]);
    }
    getRequiredFeatures() {
        const features = new Set();
        features.add(new ApplicationFeature("android.hardware.type.automotive", true));
        return features;
    }
    getRequiredPermissions() {
        return new Set();
    }
}
//# sourceMappingURL=VehicleUxRestrictionsPluginConfiguration.js.map
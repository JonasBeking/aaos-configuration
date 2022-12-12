import {ApplicationFeature} from "../common/ApplicationFeature";
import type {ApplicationPermission} from "../common/ApplicationPermission";
import {AutomotiveDataPluginConfiguration} from "../plugin/AutomotiveDataPluginConfiguration";

export class VehicleUxRestrictionsPluginConfiguration extends AutomotiveDataPluginConfiguration{
    name = "VehicleUxRestrictionsPlugin"
    package = "@capacitor-community/aaos-ux-restrictions"
    javaPackage = "io.ionic.plugins.aaosuxrestrictions"
    minCarApiLevel = 4

    constructor() {
        super();
        this.addAllowedDataIds([-1])
    }

    getRequiredFeatures(): Set<ApplicationFeature> {
        const features = new Set<ApplicationFeature>()
        features.add(new ApplicationFeature("android.hardware.type.automotive",true))
        return features
    }

    getRequiredPermissions(): Set<ApplicationPermission> {
        return new Set<ApplicationPermission>()
    }
}
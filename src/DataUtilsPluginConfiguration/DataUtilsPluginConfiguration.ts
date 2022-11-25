import {ApplicationFeature} from "../common/ApplicationFeature";
import {ApplicationPermission} from "../common/ApplicationPermission";
import {AutomotiveDataPluginConfiguration} from "../plugin/AutomotiveDataPluginConfiguration";

export class DataUtilsPluginConfiguration extends AutomotiveDataPluginConfiguration{

    name = "DataPlugin"
    package = "@capacitor-community/aaos-data-utils"
    javaPackage = "io.ionic.plugins.aaosdatautils"
    minCarApiLevel = 1

    constructor() {
        super()
    }

    addAllowedDataIds(allowedDataIds: number[]) : DataUtilsPluginConfiguration {
        return super.addAllowedDataIds(allowedDataIds) as DataUtilsPluginConfiguration;
    }

    getRequiredPermissions(): Set<ApplicationPermission> {
        return new Set<ApplicationPermission>().add(new ApplicationPermission("android.permission.INTERNET"))
    }

    getRequiredFeatures(): Set<ApplicationFeature> {
        const features = new Set<ApplicationFeature>()
        features.add(new ApplicationFeature("android.hardware.type.automotive",true))
        return features
    }
}

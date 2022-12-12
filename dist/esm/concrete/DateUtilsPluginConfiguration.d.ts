import { ApplicationFeature } from "../common/ApplicationFeature";
import { ApplicationPermission } from "../common/ApplicationPermission";
import { AutomotiveDataPluginConfiguration } from "../plugin/AutomotiveDataPluginConfiguration";
export declare class DataUtilsPluginConfiguration extends AutomotiveDataPluginConfiguration {
    name: string;
    package: string;
    javaPackage: string;
    minCarApiLevel: number;
    constructor();
    addAllowedDataIds(allowedDataIds: number[]): DataUtilsPluginConfiguration;
    getRequiredPermissions(): Set<ApplicationPermission>;
    getRequiredFeatures(): Set<ApplicationFeature>;
}

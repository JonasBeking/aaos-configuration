import { ApplicationFeature } from "../common/ApplicationFeature";
import type { ApplicationPermission } from "../common/ApplicationPermission";
import { AutomotiveDataPluginConfiguration } from "../plugin/AutomotiveDataPluginConfiguration";
export declare class VehicleUxRestrictionsPluginConfiguration extends AutomotiveDataPluginConfiguration {
    name: string;
    package: string;
    javaPackage: string;
    minCarApiLevel: number;
    constructor();
    getRequiredFeatures(): Set<ApplicationFeature>;
    getRequiredPermissions(): Set<ApplicationPermission>;
}

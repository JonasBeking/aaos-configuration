import { ApplicationFeature } from "../common/ApplicationFeature";
import { ApplicationPermission } from "../common/ApplicationPermission";
import type { AutomotiveCapacitorConfig } from "../common/AutomotiveCapacitorConfig";
import { AutomotiveDataPluginConfiguration } from "../plugin/AutomotiveDataPluginConfiguration";
export declare class VehiclePropertyPluginConfiguration extends AutomotiveDataPluginConfiguration {
    name: string;
    package: string;
    javaPackage: string;
    minCarApiLevel: number;
    constructor(automotiveCapacitorConfig: AutomotiveCapacitorConfig);
    addAllowedDataIds(allowedDataIds: number[]): VehiclePropertyPluginConfiguration;
    getRequiredPermissions(): Set<ApplicationPermission>;
    getRequiredFeatures(): Set<ApplicationFeature>;
}

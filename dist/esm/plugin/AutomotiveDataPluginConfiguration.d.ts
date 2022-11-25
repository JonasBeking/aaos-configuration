import type { ApplicationFeature } from "../common/ApplicationFeature";
import type { ApplicationPermission } from "../common/ApplicationPermission";
export declare abstract class AutomotiveDataPluginConfiguration {
    protected readonly name: string;
    protected readonly package: string;
    protected readonly javaPackage: string;
    protected readonly minCarApiLevel: number;
    protected readonly allowedDataIds: number[];
    protected constructor();
    abstract getRequiredPermissions(): Set<ApplicationPermission>;
    abstract getRequiredFeatures(): Set<ApplicationFeature>;
    getAllowedDataIds(): number[];
    getPackage(): string;
    getMinCarApiLevel(): number;
    /**
     * Can be used to add allowed Properties that are not supposed to be discovered during runtime by checking the
     * capacitor config
     * @param allowedDataIds The data IDs the Plugin is allowed to access from the system
     */
    addAllowedDataIds(allowedDataIds: number[]): AutomotiveDataPluginConfiguration;
    private getAnnotation;
    private getPackagePath;
    private getPluginPath;
    updateAnnotation(filereader: (path: string) => string, filewriter: (path: string, content: string) => void): void;
}

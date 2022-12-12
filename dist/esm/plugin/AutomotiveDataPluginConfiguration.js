import { AutomotiveDataAnnotation } from "./AutomotiveDataAnnotation";
import { CapacitorPluginAnnotation } from "./CapacitorPluginAnnotation";
export class AutomotiveDataPluginConfiguration {
    constructor() {
        this.name = "DataPlugin";
        this.package = "@capacitor-community/aaos-data-utils";
        this.javaPackage = "io.ionic.plugins.aaosdatautils";
        this.minCarApiLevel = 1;
        this.allowedDataIds = [];
    }
    getAllowedDataIds() {
        return this.allowedDataIds;
    }
    getPackage() {
        return this.package;
    }
    getMinCarApiLevel() {
        return this.minCarApiLevel;
    }
    /**
     * Can be used to add allowed Properties that are not supposed to be discovered during runtime by checking the
     * capacitor config
     * @param allowedDataIds The data IDs the Plugin is allowed to access from the system
     */
    addAllowedDataIds(allowedDataIds) {
        this.getAllowedDataIds().push(...allowedDataIds);
        return this;
    }
    getAnnotation() {
        const automotiveDataAnnotation = new AutomotiveDataAnnotation(this.getAllowedDataIds());
        const capacitorPluginAnnotation = new CapacitorPluginAnnotation(this.name, Array.from(this.getRequiredPermissions()));
        return `${automotiveDataAnnotation}\n${capacitorPluginAnnotation}`;
    }
    getPackagePath() {
        return `./node_modules/${this.package}`;
    }
    getPluginPath() {
        return `${this.getPackagePath()}/android/src/main/java/${this.javaPackage.replaceAll(".", "/")}/${this.name}.java`;
    }
    updateAnnotation(filereader, filewriter) {
        let fileContent = filereader(this.getPluginPath());
        const previousAnnotation = fileContent.match(/@AutomotiveData([\s\S]*?)public class/g);
        if (previousAnnotation == null || previousAnnotation.length == 0 || previousAnnotation.length > 1) {
            console.error(`Annotations of Plugin: ${this.name} are malformed or missing`);
            return;
        }
        fileContent = fileContent.replace(previousAnnotation[0], this.getAnnotation() + "\npublic class");
        filewriter(this.getPluginPath(), fileContent);
    }
}
//# sourceMappingURL=AutomotiveDataPluginConfiguration.js.map
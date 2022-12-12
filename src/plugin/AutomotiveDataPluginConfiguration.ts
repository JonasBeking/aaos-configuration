import type {ApplicationFeature} from "../common/ApplicationFeature";
import type {ApplicationPermission} from "../common/ApplicationPermission";

import {AutomotiveDataAnnotation} from "./AutomotiveDataAnnotation";
import {CapacitorPluginAnnotation} from "./CapacitorPluginAnnotation";

export abstract class AutomotiveDataPluginConfiguration{

    protected readonly name : string = "DataPlugin"
    protected readonly package : string = "@capacitor-community/aaos-data-utils"
    protected readonly javaPackage : string = "io.ionic.plugins.aaosdatautils"
    protected readonly minCarApiLevel : number = 1
    protected readonly allowedDataIds : number[]

    protected constructor() {
        this.allowedDataIds = []
    }

    abstract getRequiredPermissions() : Set<ApplicationPermission>

    abstract getRequiredFeatures() : Set<ApplicationFeature>

    public getAllowedDataIds() : number[] {
        return this.allowedDataIds
    }

    public getPackage() : string {
        return this.package
    }

    public getMinCarApiLevel() : number {
        return this.minCarApiLevel
    }

    /**
     * Can be used to add allowed Properties that are not supposed to be discovered during runtime by checking the
     * capacitor config
     * @param allowedDataIds The data IDs the Plugin is allowed to access from the system
     */
    addAllowedDataIds(allowedDataIds : number[]) : AutomotiveDataPluginConfiguration {
        this.getAllowedDataIds().push(...allowedDataIds)
        return this
    }

    private getAnnotation() : string{
        const automotiveDataAnnotation = new AutomotiveDataAnnotation(this.getAllowedDataIds())
        const capacitorPluginAnnotation = new CapacitorPluginAnnotation(this.name,Array.from(this.getRequiredPermissions()))
        return `${automotiveDataAnnotation}\n${capacitorPluginAnnotation}`
    }

    private getPackagePath() : string{
        return `./node_modules/${this.package}`
    }

    private getPluginPath() : string {
        return `${this.getPackagePath()}/android/src/main/java/${this.javaPackage.replaceAll(".","/")}/${this.name}.java`
    }

    public updateAnnotation(filereader : (path : string) => string, filewriter : (path : string,content : string) => void) : void{
        let fileContent : string = filereader(this.getPluginPath())
        const previousAnnotation = fileContent.match(/@AutomotiveData([\s\S]*?)public class/g)
        if(previousAnnotation == null || previousAnnotation.length == 0 || previousAnnotation.length > 1) {
            console.error(`Annotations of Plugin: ${this.name} are malformed or missing`)
            return
        }
        fileContent = fileContent.replace(previousAnnotation[0],this.getAnnotation()+ "\npublic class")
        filewriter(this.getPluginPath(),fileContent)
    }
}

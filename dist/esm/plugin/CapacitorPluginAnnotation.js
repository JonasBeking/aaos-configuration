import { PermissionAnnotation } from "./PermissionAnnotation";
export class CapacitorPluginAnnotation {
    constructor(name, permissions) {
        this.permissions = [];
        this.name = "";
        this.permissions.push(...permissions);
        this.name = name;
    }
    toString() {
        const permissionsList = [];
        for (const permission of this.permissions) {
            permissionsList.push(new PermissionAnnotation(permission));
        }
        return `@CapacitorPlugin(name = "${this.name}",permissions = {${permissionsList}})`;
    }
}
//# sourceMappingURL=CapacitorPluginAnnotation.js.map
import type {ApplicationPermission} from "../common/ApplicationPermission";

import {PermissionAnnotation} from "./PermissionAnnotation";

export class CapacitorPluginAnnotation{
    private readonly permissions : ApplicationPermission[] = []
    private readonly name : string = ""
    constructor(name : string, permissions : ApplicationPermission[]) {
        this.permissions.push(...permissions)
        this.name = name
    }

    toString() : string {

        const permissionsList = []

        for(const permission of this.permissions) {
            permissionsList.push(new PermissionAnnotation(permission))
        }

        return `@CapacitorPlugin(name = "${this.name}",permissions = {${permissionsList}})`
    }
}

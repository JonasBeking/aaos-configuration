import type {ApplicationPermission} from "../common/ApplicationPermission";

export class PermissionAnnotation{

    private readonly permission : ApplicationPermission

    constructor(permission : ApplicationPermission) {
        this.permission = permission
    }

    toString() : string {
        return `@Permission(strings = {"${this.permission}"},alias = "${this.permission}")`
    }
}

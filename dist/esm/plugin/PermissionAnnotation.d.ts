import type { ApplicationPermission } from "../common/ApplicationPermission";
export declare class PermissionAnnotation {
    private readonly permission;
    constructor(permission: ApplicationPermission);
    toString(): string;
}

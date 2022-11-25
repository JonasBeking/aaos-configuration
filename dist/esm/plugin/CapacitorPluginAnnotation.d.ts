import type { ApplicationPermission } from "../common/ApplicationPermission";
export declare class CapacitorPluginAnnotation {
    private readonly permissions;
    private readonly name;
    constructor(name: string, permissions: ApplicationPermission[]);
    toString(): string;
}

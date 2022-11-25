export class PermissionAnnotation {
    constructor(permission) {
        this.permission = permission;
    }
    toString() {
        return `@Permission(strings = {"${this.permission}"},alias = "${this.permission}")`;
    }
}
//# sourceMappingURL=PermissionAnnotation.js.map
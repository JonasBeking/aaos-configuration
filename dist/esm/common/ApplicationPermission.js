export class ApplicationPermission {
    constructor(permission) {
        this.permission = permission;
    }
    toString() {
        return this.permission;
    }
    toManifestString() {
        return `<uses-permission android:name="${this.permission}" />`;
    }
}
//# sourceMappingURL=ApplicationPermission.js.map
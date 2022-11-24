export class ApplicationPermission{
    private readonly permission : string
    constructor(permission : string) {
        this.permission = permission
    }

    toString() : string{
        return this.permission
    }

    toManifestString() : string {
        return `<uses-permission android:name="${this.permission}" />`
    }
}

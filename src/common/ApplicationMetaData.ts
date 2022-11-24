export class ApplicationMetaData {
    private readonly name : string;
    private readonly value : string

    constructor(name : string, value : string) {
        this.name = name
        this.value = value
    }

    toManifestString() : string {
        return `<meta-data android:name="${this.name}" android:value="${this.value}"/>`
    }
}

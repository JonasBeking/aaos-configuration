export class ApplicationMetaData {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    toManifestString() {
        return `<meta-data android:name="${this.name}" android:value="${this.value}"/>`;
    }
}
//# sourceMappingURL=ApplicationMetaData.js.map
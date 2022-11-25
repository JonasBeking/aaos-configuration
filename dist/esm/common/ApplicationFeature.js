export class ApplicationFeature {
    constructor(feature, required) {
        this.feature = feature;
        this.required = required;
    }
    toString() {
        return this.feature;
    }
    toManifestString() {
        return `<uses-feature android:name="${this.feature}" android:required="${this.required}"/>`;
    }
}
//# sourceMappingURL=ApplicationFeature.js.map
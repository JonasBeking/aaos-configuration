export class ApplicationFeature{
    private readonly feature : string
    private readonly required : boolean
    constructor(feature : string,required : boolean) {
        this.feature = feature
        this.required = required
    }

    toString() : string {
        return this.feature
    }

    toManifestString() : string {
        return `<uses-feature android:name="${this.feature}" android:required="${this.required}"/>`
    }
}

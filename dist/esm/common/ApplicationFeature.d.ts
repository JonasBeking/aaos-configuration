export declare class ApplicationFeature {
    private readonly feature;
    private readonly required;
    constructor(feature: string, required: boolean);
    toString(): string;
    toManifestString(): string;
}

export class AutomotiveDataAnnotation {
    constructor(dataIds) {
        this.allowedDataIds = [];
        this.allowedDataIds.push(...dataIds);
    }
    toString() {
        return `@AutomotiveData(allowedIds = {${this.allowedDataIds.toString()}})`;
    }
}
//# sourceMappingURL=AutomotiveDataAnnotation.js.map
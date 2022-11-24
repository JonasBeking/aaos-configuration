export class AutomotiveDataAnnotation{

    private readonly allowedDataIds : number[] = []
    constructor(dataIds : number[]) {
        this.allowedDataIds.push(...dataIds);
    }

    toString() : string{
        return `@AutomotiveData(allowedIds = {${this.allowedDataIds.toString()}})`
    }
}

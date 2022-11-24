export class ConfigurationError {
    event = -1
    reason = "unknown reason"
    constructor(reason : string) {
        this.reason = reason
    }

}

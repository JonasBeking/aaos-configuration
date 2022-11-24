import type {CapacitorConfig} from "@capacitor/cli";


/**
 * This is a serious documentation
 */
export interface AutomotiveCapacitorConfig extends CapacitorConfig{
    plugins : {
        VehiclePropertyPlugin? : {
            allowedVehicleProperties : number[],
        },
        VehicleUxRestrictionsPlugin? : {
        },
        VehicleVolumePlugin? : {
        },
        VehicleSensorPlugin? : {
            allowedSensorTypes: number[],
        }
    },
    includePlugins : string []
    automotive : {
        distractionOptimized : boolean
    }
}

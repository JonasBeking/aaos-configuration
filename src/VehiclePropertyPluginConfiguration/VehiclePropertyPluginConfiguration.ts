import {VehiclePermissions, VehiclePropertyIds} from "@capacitor-community/aaos-vehicle-property";

import {ApplicationFeature} from "../common/ApplicationFeature";
import {ApplicationPermission} from "../common/ApplicationPermission";
import type {AutomotiveCapacitorConfig} from "../common/AutomotiveCapacitorConfig";
import {ConfigurationError} from "../common/ConfigurationError";
import {AutomotiveDataPluginConfiguration} from "../plugin/AutomotiveDataPluginConfiguration";




type VehiclePropertyToPermissionMapType = {
    [key: number] : string
}

const VehiclePropertyToPermissionMap : VehiclePropertyToPermissionMapType = {

}

VehiclePropertyToPermissionMap[VehiclePropertyIds.CABIN_LIGHTS_STATE] = VehiclePermissions.PERMISSION_READ_INTERIOR_LIGHTS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.CABIN_LIGHTS_SWITCH] = VehiclePermissions.PERMISSION_CONTROL_INTERIOR_LIGHTS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.CURRENT_GEAR] = VehiclePermissions.PERMISSION_POWERTRAIN
VehiclePropertyToPermissionMap[VehiclePropertyIds.DISTANCE_DISPLAY_UNITS] = VehiclePermissions.PERMISSION_READ_DISPLAY_UNITS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.ENV_OUTSIDE_TEMPERATURE] = VehiclePermissions.PERMISSION_EXTERIOR_ENVIRONMENT;
VehiclePropertyToPermissionMap[VehiclePropertyIds.EV_BATTERY_DISPLAY_UNITS] = VehiclePermissions.PERMISSION_READ_DISPLAY_UNITS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.EV_BATTERY_INSTANTANEOUS_CHARGE_RATE] = VehiclePermissions.PERMISSION_ENERGY;
VehiclePropertyToPermissionMap[VehiclePropertyIds.EV_BATTERY_LEVEL] = VehiclePermissions.PERMISSION_ENERGY;
VehiclePropertyToPermissionMap[VehiclePropertyIds.EV_CHARGE_PORT_CONNECTED] = VehiclePermissions.PERMISSION_ENERGY_PORTS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.EV_CHARGE_PORT_OPEN] = VehiclePermissions.PERMISSION_ENERGY_PORTS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.FUEL_CONSUMPTION_UNITS_DISTANCE_OVER_VOLUME] = VehiclePermissions.PERMISSION_READ_DISPLAY_UNITS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.FUEL_DOOR_OPEN] = VehiclePermissions.PERMISSION_ENERGY_PORTS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.FUEL_LEVEL] = VehiclePermissions.PERMISSION_ENERGY;
VehiclePropertyToPermissionMap[VehiclePropertyIds.FUEL_VOLUME_DISPLAY_UNITS] = VehiclePermissions.PERMISSION_READ_DISPLAY_UNITS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.IGNITION_STATE] = VehiclePermissions.PERMISSION_POWERTRAIN;
VehiclePropertyToPermissionMap[VehiclePropertyIds.INFO_DRIVER_SEAT] = VehiclePermissions.PERMISSION_CAR_INFO;
VehiclePropertyToPermissionMap[VehiclePropertyIds.INFO_FUEL_CAPACITY] = VehiclePermissions.PERMISSION_CAR_INFO;
VehiclePropertyToPermissionMap[VehiclePropertyIds.INFO_FUEL_TYPE] = VehiclePermissions.PERMISSION_CAR_INFO;
VehiclePropertyToPermissionMap[VehiclePropertyIds.INFO_MAKE] = VehiclePermissions.PERMISSION_CAR_INFO;
VehiclePropertyToPermissionMap[VehiclePropertyIds.INFO_MODEL] = VehiclePermissions.PERMISSION_CAR_INFO;
VehiclePropertyToPermissionMap[VehiclePropertyIds.INFO_VIN] = VehiclePermissions.PERMISSION_IDENTIFICATION;
VehiclePropertyToPermissionMap[VehiclePropertyIds.NIGHT_MODE] = VehiclePermissions.PERMISSION_EXTERIOR_ENVIRONMENT;
VehiclePropertyToPermissionMap[VehiclePropertyIds.PERF_VEHICLE_SPEED] = VehiclePermissions.PERMISSION_SPEED;
VehiclePropertyToPermissionMap[VehiclePropertyIds.READING_LIGHTS_STATE] = VehiclePermissions.PERMISSION_READ_INTERIOR_LIGHTS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.READING_LIGHTS_SWITCH] = VehiclePermissions.PERMISSION_CONTROL_INTERIOR_LIGHTS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.TIRE_PRESSURE_DISPLAY_UNITS] = VehiclePermissions.PERMISSION_READ_DISPLAY_UNITS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.WHEEL_TICK] = VehiclePermissions.PERMISSION_SPEED;


export class VehiclePropertyPluginConfiguration extends AutomotiveDataPluginConfiguration{

    name = "VehiclePropertyPlugin"
    package = "@capacitor-community/aaos-vehicle-property"
    javaPackage = "io.ionic.plugins.aaosvehicleproperty"
    minCarApiLevel = 4

    constructor(automotiveCapacitorConfig : AutomotiveCapacitorConfig) {
        super()
        if(!automotiveCapacitorConfig.plugins.VehiclePropertyPlugin) {
            throw new ConfigurationError("AutomotiveCapacitorConfig is unexpectedly missing the VehiclePropertyPlugin property")
        }
        this.addAllowedDataIds(automotiveCapacitorConfig.plugins.VehiclePropertyPlugin.allowedVehicleProperties)
    }

    addAllowedDataIds(allowedDataIds: number[]) : VehiclePropertyPluginConfiguration {
        return super.addAllowedDataIds(allowedDataIds) as VehiclePropertyPluginConfiguration;
    }

    getRequiredPermissions(): Set<ApplicationPermission> {
        const permissions = new Set<ApplicationPermission>()
        for(const vehicleProperty of this.getAllowedDataIds()) {
            const permissionString : string = VehiclePropertyToPermissionMap[vehicleProperty]
            if(permissionString) {
                permissions.add(new ApplicationPermission(permissionString))
            }
        }
        return permissions
    }

    getRequiredFeatures(): Set<ApplicationFeature> {
        const features = new Set<ApplicationFeature>()
        features.add(new ApplicationFeature("android.hardware.type.automotive",true))
        return features
    }
}

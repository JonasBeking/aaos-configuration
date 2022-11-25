'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var project = require('@trapezedev/project');
var fs = require('fs');
var core = require('@capacitor/core');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

class ApplicationFeature {
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

class ApplicationMetaData {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    toManifestString() {
        return `<meta-data android:name="${this.name}" android:value="${this.value}"/>`;
    }
}

class ApplicationPermission {
    constructor(permission) {
        this.permission = permission;
    }
    toString() {
        return this.permission;
    }
    toManifestString() {
        return `<uses-permission android:name="${this.permission}" />`;
    }
}

class ConfigurationError {
    constructor(reason) {
        this.event = -1;
        this.reason = "unknown reason";
        this.reason = reason;
    }
}

class AutomotiveDataAnnotation {
    constructor(dataIds) {
        this.allowedDataIds = [];
        this.allowedDataIds.push(...dataIds);
    }
    toString() {
        return `@AutomotiveData(allowedIds = {${this.allowedDataIds.toString()}})`;
    }
}

class PermissionAnnotation {
    constructor(permission) {
        this.permission = permission;
    }
    toString() {
        return `@Permission(strings = {"${this.permission}"},alias = "${this.permission}")`;
    }
}

class CapacitorPluginAnnotation {
    constructor(name, permissions) {
        this.permissions = [];
        this.name = "";
        this.permissions.push(...permissions);
        this.name = name;
    }
    toString() {
        const permissionsList = [];
        for (const permission of this.permissions) {
            permissionsList.push(new PermissionAnnotation(permission));
        }
        return `@CapacitorPlugin(name = "${this.name}",permissions = {${permissionsList}})`;
    }
}

class AutomotiveDataPluginConfiguration {
    constructor() {
        this.name = "DataPlugin";
        this.package = "@capacitor-community/aaos-data-utils";
        this.javaPackage = "io.ionic.plugins.aaosdatautils";
        this.minCarApiLevel = 1;
        this.allowedDataIds = [];
    }
    getAllowedDataIds() {
        return this.allowedDataIds;
    }
    getPackage() {
        return this.package;
    }
    getMinCarApiLevel() {
        return this.minCarApiLevel;
    }
    /**
     * Can be used to add allowed Properties that are not supposed to be discovered during runtime by checking the
     * capacitor config
     * @param allowedDataIds The data IDs the Plugin is allowed to access from the system
     */
    addAllowedDataIds(allowedDataIds) {
        this.getAllowedDataIds().push(...allowedDataIds);
        return this;
    }
    getAnnotation() {
        const automotiveDataAnnotation = new AutomotiveDataAnnotation(this.getAllowedDataIds());
        const capacitorPluginAnnotation = new CapacitorPluginAnnotation(this.name, Array.from(this.getRequiredPermissions()));
        return `${automotiveDataAnnotation}\n${capacitorPluginAnnotation}`;
    }
    getPackagePath() {
        return `./node_modules/${this.package}`;
    }
    getPluginPath() {
        return `${this.getPackagePath()}/android/src/main/java/${this.javaPackage.replaceAll(".", "/")}/${this.name}.java`;
    }
    updateAnnotation(filereader, filewriter) {
        let fileContent = filereader(this.getPluginPath());
        const previousAnnotation = fileContent.match(/@AutomotiveData([\s\S]*?)public class/g);
        if (previousAnnotation == null || previousAnnotation.length == 0 || previousAnnotation.length > 1) {
            console.error(`Annotations of Plugin: ${this.name} are malformed`);
            return;
        }
        fileContent = fileContent.replace(previousAnnotation[0], this.getAnnotation() + "\npublic class");
        filewriter(this.getPluginPath(), fileContent);
    }
}

class DataUtilsPluginConfiguration extends AutomotiveDataPluginConfiguration {
    constructor() {
        super();
        this.name = "DataPlugin";
        this.package = "@capacitor-community/aaos-data-utils";
        this.javaPackage = "io.ionic.plugins.aaosdatautils";
        this.minCarApiLevel = 1;
    }
    addAllowedDataIds(allowedDataIds) {
        return super.addAllowedDataIds(allowedDataIds);
    }
    getRequiredPermissions() {
        return new Set().add(new ApplicationPermission("android.permission.INTERNET"));
    }
    getRequiredFeatures() {
        const features = new Set();
        features.add(new ApplicationFeature("android.hardware.type.automotive", true));
        return features;
    }
}

/**
 * Certainly
 */
class AndroidAutomotiveManifest {
    constructor(config) {
        /**
         * Can be arrays as they are resolved to sets in the update method anyways
         * @private
         */
        this.applicationPermissions = [];
        this.applicationFeatures = [];
        this.applicationMetaData = [];
        this.automotivePluginConfigurations = [];
        const trapezeConfig = {
            android: {
                path: 'android',
            },
        };
        this.automotiveConfig = config;
        this.project = new project.MobileProject("./", trapezeConfig);
        this.addPlugin(new DataUtilsPluginConfiguration());
    }
    /**
     * Every plugin used must provide a config that is added to this
     * It will register the plugin to capacitor as an 'included plugin' and apply the given configurations and alterfications
     * to the files in order to provide a dynamic but safe security concept for SystemService access
     * @param pluginConfig A plugin configuration that each AAOS-Capacitor-Plugin provides
     */
    addPlugin(pluginConfig) {
        if (!this.automotiveConfig) {
            throw new ConfigurationError("Automotive Config has not been initialized");
        }
        this.automotivePluginConfigurations.push(pluginConfig);
        const pluginPackage = pluginConfig.getPackage();
        console.log("Registering plugin with package-name: ", pluginPackage);
        this.automotiveConfig.includePlugins.push(pluginPackage);
        return this;
    }
    addPermission(permission) {
        this.applicationPermissions.push(new ApplicationPermission(permission));
        return this;
    }
    addFeature(feature, required) {
        this.applicationFeatures.push(new ApplicationFeature(feature, required));
        return this;
    }
    addMetaData(name, value) {
        this.applicationMetaData.push(new ApplicationMetaData(name, value));
        return this;
    }
    getHighestRequiredCarApiLevel() {
        let minCarApi = -1;
        for (const config of this.automotivePluginConfigurations) {
            const configCarApiLevel = config.getMinCarApiLevel();
            minCarApi = configCarApiLevel > minCarApi ? configCarApiLevel : minCarApi;
        }
        return minCarApi;
    }
    async update() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const cumulativeRequiredPermissions = new Set();
        const cumulativeRequiredFeatures = new Set();
        for (const config of this.automotivePluginConfigurations) {
            config.updateAnnotation((path) => {
                return fs__default["default"].readFileSync(path, "utf-8");
            }, (path, content) => {
                fs__default["default"].writeFileSync(path, content);
            });
            for (const permission of config.getRequiredPermissions()) {
                cumulativeRequiredPermissions.add(permission.toManifestString());
            }
            for (const feature of config.getRequiredFeatures()) {
                cumulativeRequiredFeatures.add(feature.toManifestString());
            }
        }
        for (const permission of this.applicationPermissions) {
            cumulativeRequiredPermissions.add(permission.toManifestString());
        }
        for (const feature of this.applicationFeatures) {
            cumulativeRequiredFeatures.add(feature.toManifestString());
        }
        await this.project.load();
        await ((_a = this.project.android) === null || _a === void 0 ? void 0 : _a.getAndroidManifest().load());
        (_b = this.project.android) === null || _b === void 0 ? void 0 : _b.getAndroidManifest().deleteNodes("manifest/uses-permission");
        for (const permission of cumulativeRequiredPermissions) {
            (_c = this.project.android) === null || _c === void 0 ? void 0 : _c.getAndroidManifest().injectFragment("manifest", permission);
        }
        (_d = this.project.android) === null || _d === void 0 ? void 0 : _d.getAndroidManifest().deleteNodes("manifest/uses-feature");
        for (const feature of cumulativeRequiredFeatures) {
            (_e = this.project.android) === null || _e === void 0 ? void 0 : _e.getAndroidManifest().injectFragment("manifest", feature);
        }
        (_f = this.project.android) === null || _f === void 0 ? void 0 : _f.getAndroidManifest().deleteNodes("manifest/application/meta-data");
        for (const metaData of this.applicationMetaData) {
            (_g = this.project.android) === null || _g === void 0 ? void 0 : _g.getAndroidManifest().injectFragment("manifest/application", metaData.toManifestString());
        }
        if (this.automotiveConfig.automotive.distractionOptimized) {
            console.warn("CAREFUL: Application must adhere to Driver Distraction Guidelines in order to activate the 'distractionOptimized' flag");
        }
        const distractionOptimizedMetaData = new ApplicationMetaData("distractionOptimized", `${this.automotiveConfig.automotive.distractionOptimized}`);
        (_h = this.project.android) === null || _h === void 0 ? void 0 : _h.getAndroidManifest().injectFragment("manifest/application", distractionOptimizedMetaData.toManifestString());
        const minCarApiLevel = this.getHighestRequiredCarApiLevel();
        if (minCarApiLevel < 0) {
            console.log("No CarApi required");
        }
        else {
            console.log(`Requires minimum CarApi ${minCarApiLevel}`);
            const carApiMeta = new ApplicationMetaData("androidx.car.app.minCarApiLevel", minCarApiLevel.toString());
            (_j = this.project.android) === null || _j === void 0 ? void 0 : _j.getAndroidManifest().injectFragment("manifest/application", carApiMeta.toManifestString());
        }
        await this.project.commit();
    }
}

var VehiclePermissions;
(function (VehiclePermissions) {
    VehiclePermissions["PERMISSION_CAR_CONTROL_AUDIO_VOLUME"] = "android.car.permission.CAR_CONTROL_AUDIO_VOLUME";
    VehiclePermissions["PERMISSION_CAR_CONTROL_AUDIO_SETTINGS"] = "android.car.permission.CAR_CONTROL_AUDIO_SETTINGS";
    VehiclePermissions["PERMISSION_SPEED"] = "android.car.permission.CAR_SPEED";
    VehiclePermissions["PERMISSION_READ_DISPLAY_UNITS"] = "android.car.permission.READ_CAR_DISPLAY_UNITS";
    VehiclePermissions["PERMISSION_POWERTRAIN"] = "android.car.permission.CAR_POWERTRAIN";
    VehiclePermissions["PERMISSION_ENERGY"] = "android.car.permission.CAR_ENERGY";
    VehiclePermissions["PERMISSION_ENERGY_PORTS"] = "android.car.permission.CAR_ENERGY_PORTS";
    VehiclePermissions["PERMISSION_CAR_INFO"] = "android.car.permission.CAR_INFO";
    VehiclePermissions["PERMISSION_EXTERIOR_ENVIRONMENT"] = "android.car.permission.CAR_EXTERIOR_ENVIRONMENT";
    VehiclePermissions["PERMISSION_CAR_NAVIGATION_MANAGER"] = "android.car.permission.CAR_NAVIGATION_MANAGER";
    VehiclePermissions["PERMISSION_CONTROL_DISPLAY_UNITS"] = "android.car.permission.CONTROL_CAR_DISPLAY_UNITS";
    VehiclePermissions["PERMISSION_CONTROL_INTERIOR_LIGHTS"] = "android.car.permission.CONTROL_CAR_INTERIOR_LIGHTS";
    VehiclePermissions["PERMISSION_IDENTIFICATION"] = "android.car.permission.CAR_IDENTIFICATION";
    VehiclePermissions["PERMISSION_READ_INTERIOR_LIGHTS"] = "android.car.permission.READ_CAR_INTERIOR_LIGHTS";
    VehiclePermissions["PERMISSION_READ_STEERING_STATE"] = "android.car.permission.READ_CAR_STEERING";
    VehiclePermissions["PERMISSION_CONTROL_CAR_CLIMATE"] = "android.car.Car.PERMISSION_CONTROL_CAR_CLIMATE";
})(VehiclePermissions || (VehiclePermissions = {}));
var VehiclePropertyIds;
(function (VehiclePropertyIds) {
    VehiclePropertyIds[VehiclePropertyIds["ABS_ACTIVE"] = 287310858] = "ABS_ACTIVE";
    VehiclePropertyIds[VehiclePropertyIds["AP_POWER_BOOTUP_REASON"] = 289409538] = "AP_POWER_BOOTUP_REASON";
    VehiclePropertyIds[VehiclePropertyIds["AP_POWER_STATE_REPORT"] = 289475073] = "AP_POWER_STATE_REPORT";
    VehiclePropertyIds[VehiclePropertyIds["AP_POWER_STATE_REQ"] = 289475072] = "AP_POWER_STATE_REQ";
    VehiclePropertyIds[VehiclePropertyIds["CABIN_LIGHTS_STATE"] = 289410817] = "CABIN_LIGHTS_STATE";
    VehiclePropertyIds[VehiclePropertyIds["CABIN_LIGHTS_SWITCH"] = 289410818] = "CABIN_LIGHTS_SWITCH";
    VehiclePropertyIds[VehiclePropertyIds["CRITICALLY_LOW_TIRE_PRESSURE"] = 392168202] = "CRITICALLY_LOW_TIRE_PRESSURE";
    VehiclePropertyIds[VehiclePropertyIds["CURRENT_GEAR"] = 289408001] = "CURRENT_GEAR";
    VehiclePropertyIds[VehiclePropertyIds["DISPLAY_BRIGHTNESS"] = 289409539] = "DISPLAY_BRIGHTNESS";
    VehiclePropertyIds[VehiclePropertyIds["DISTANCE_DISPLAY_UNITS"] = 289408512] = "DISTANCE_DISPLAY_UNITS";
    VehiclePropertyIds[VehiclePropertyIds["DOOR_LOCK"] = 371198722] = "DOOR_LOCK";
    VehiclePropertyIds[VehiclePropertyIds["DOOR_MOVE"] = 373295873] = "DOOR_MOVE";
    VehiclePropertyIds[VehiclePropertyIds["DOOR_POS"] = 373295872] = "DOOR_POS";
    VehiclePropertyIds[VehiclePropertyIds["ELECTRONIC_TOLL_COLLECTION_CARD_STATUS"] = 289410874] = "ELECTRONIC_TOLL_COLLECTION_CARD_STATUS";
    VehiclePropertyIds[VehiclePropertyIds["ELECTRONIC_TOLL_COLLECTION_CARD_TYPE"] = 289410873] = "ELECTRONIC_TOLL_COLLECTION_CARD_TYPE";
    VehiclePropertyIds[VehiclePropertyIds["ENGINE_COOLANT_TEMP"] = 291504897] = "ENGINE_COOLANT_TEMP";
    VehiclePropertyIds[VehiclePropertyIds["ENGINE_OIL_LEVEL"] = 289407747] = "ENGINE_OIL_LEVEL";
    VehiclePropertyIds[VehiclePropertyIds["ENGINE_OIL_TEMP"] = 291504900] = "ENGINE_OIL_TEMP";
    VehiclePropertyIds[VehiclePropertyIds["ENGINE_RPM"] = 291504901] = "ENGINE_RPM";
    VehiclePropertyIds[VehiclePropertyIds["ENV_OUTSIDE_TEMPERATURE"] = 291505923] = "ENV_OUTSIDE_TEMPERATURE";
    VehiclePropertyIds[VehiclePropertyIds["EPOCH_TIME"] = 290457094] = "EPOCH_TIME";
    VehiclePropertyIds[VehiclePropertyIds["EV_BATTERY_DISPLAY_UNITS"] = 289408515] = "EV_BATTERY_DISPLAY_UNITS";
    VehiclePropertyIds[VehiclePropertyIds["EV_BATTERY_INSTANTANEOUS_CHARGE_RATE"] = 291504908] = "EV_BATTERY_INSTANTANEOUS_CHARGE_RATE";
    VehiclePropertyIds[VehiclePropertyIds["EV_BATTERY_LEVEL"] = 291504905] = "EV_BATTERY_LEVEL";
    VehiclePropertyIds[VehiclePropertyIds["EV_CHARGE_PORT_CONNECTED"] = 287310603] = "EV_CHARGE_PORT_CONNECTED";
    VehiclePropertyIds[VehiclePropertyIds["EV_CHARGE_PORT_OPEN"] = 287310602] = "EV_CHARGE_PORT_OPEN";
    VehiclePropertyIds[VehiclePropertyIds["FOG_LIGHTS_STATE"] = 289410562] = "FOG_LIGHTS_STATE";
    VehiclePropertyIds[VehiclePropertyIds["FOG_LIGHTS_SWITCH"] = 289410578] = "FOG_LIGHTS_SWITCH";
    VehiclePropertyIds[VehiclePropertyIds["FUEL_CONSUMPTION_UNITS_DISTANCE_OVER_VOLUME"] = 287311364] = "FUEL_CONSUMPTION_UNITS_DISTANCE_OVER_VOLUME";
    VehiclePropertyIds[VehiclePropertyIds["FUEL_DOOR_OPEN"] = 287310600] = "FUEL_DOOR_OPEN";
    VehiclePropertyIds[VehiclePropertyIds["FUEL_LEVEL"] = 291504903] = "FUEL_LEVEL";
    VehiclePropertyIds[VehiclePropertyIds["FUEL_LEVEL_LOW"] = 287310853] = "FUEL_LEVEL_LOW";
    VehiclePropertyIds[VehiclePropertyIds["FUEL_VOLUME_DISPLAY_UNITS"] = 289408513] = "FUEL_VOLUME_DISPLAY_UNITS";
    VehiclePropertyIds[VehiclePropertyIds["GEAR_SELECTION"] = 289408000] = "GEAR_SELECTION";
    VehiclePropertyIds[VehiclePropertyIds["HAZARD_LIGHTS_STATE"] = 289410563] = "HAZARD_LIGHTS_STATE";
    VehiclePropertyIds[VehiclePropertyIds["HAZARD_LIGHTS_SWITCH"] = 289410579] = "HAZARD_LIGHTS_SWITCH";
    VehiclePropertyIds[VehiclePropertyIds["HEADLIGHTS_STATE"] = 289410560] = "HEADLIGHTS_STATE";
    VehiclePropertyIds[VehiclePropertyIds["HEADLIGHTS_SWITCH"] = 289410576] = "HEADLIGHTS_SWITCH";
    VehiclePropertyIds[VehiclePropertyIds["HIGH_BEAM_LIGHTS_STATE"] = 289410561] = "HIGH_BEAM_LIGHTS_STATE";
    VehiclePropertyIds[VehiclePropertyIds["HIGH_BEAM_LIGHTS_SWITCH"] = 289410577] = "HIGH_BEAM_LIGHTS_SWITCH";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_ACTUAL_FAN_SPEED_RPM"] = 356517135] = "HVAC_ACTUAL_FAN_SPEED_RPM";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_AC_ON"] = 354419973] = "HVAC_AC_ON";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_AUTO_ON"] = 354419978] = "HVAC_AUTO_ON";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_AUTO_RECIRC_ON"] = 354419986] = "HVAC_AUTO_RECIRC_ON";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_DEFROSTER"] = 320865540] = "HVAC_DEFROSTER";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_DUAL_ON"] = 354419977] = "HVAC_DUAL_ON";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_FAN_DIRECTION"] = 356517121] = "HVAC_FAN_DIRECTION";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_FAN_DIRECTION_AVAILABLE"] = 356582673] = "HVAC_FAN_DIRECTION_AVAILABLE";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_FAN_SPEED"] = 356517120] = "HVAC_FAN_SPEED";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_MAX_AC_ON"] = 354419974] = "HVAC_MAX_AC_ON";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_MAX_DEFROST_ON"] = 354419975] = "HVAC_MAX_DEFROST_ON";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_POWER_ON"] = 354419984] = "HVAC_POWER_ON";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_RECIRC_ON"] = 354419976] = "HVAC_RECIRC_ON";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_SEAT_TEMPERATURE"] = 356517131] = "HVAC_SEAT_TEMPERATURE";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_SEAT_VENTILATION"] = 356517139] = "HVAC_SEAT_VENTILATION";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_SIDE_MIRROR_HEAT"] = 339739916] = "HVAC_SIDE_MIRROR_HEAT";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_STEERING_WHEEL_HEAT"] = 289408269] = "HVAC_STEERING_WHEEL_HEAT";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_TEMPERATURE_CURRENT"] = 358614274] = "HVAC_TEMPERATURE_CURRENT";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_TEMPERATURE_DISPLAY_UNITS"] = 289408270] = "HVAC_TEMPERATURE_DISPLAY_UNITS";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_TEMPERATURE_SET"] = 358614275] = "HVAC_TEMPERATURE_SET";
    VehiclePropertyIds[VehiclePropertyIds["HVAC_TEMPERATURE_VALUE_SUGGESTION"] = 291570965] = "HVAC_TEMPERATURE_VALUE_SUGGESTION";
    VehiclePropertyIds[VehiclePropertyIds["HW_KEY_INPUT"] = 289475088] = "HW_KEY_INPUT";
    VehiclePropertyIds[VehiclePropertyIds["IGNITION_STATE"] = 289408009] = "IGNITION_STATE";
    VehiclePropertyIds[VehiclePropertyIds["INFO_DRIVER_SEAT"] = 356516106] = "INFO_DRIVER_SEAT";
    VehiclePropertyIds[VehiclePropertyIds["INFO_EV_BATTERY_CAPACITY"] = 291504390] = "INFO_EV_BATTERY_CAPACITY";
    VehiclePropertyIds[VehiclePropertyIds["INFO_EV_CONNECTOR_TYPE"] = 289472775] = "INFO_EV_CONNECTOR_TYPE";
    VehiclePropertyIds[VehiclePropertyIds["INFO_EV_PORT_LOCATION"] = 289407241] = "INFO_EV_PORT_LOCATION";
    VehiclePropertyIds[VehiclePropertyIds["INFO_EXTERIOR_DIMENSIONS"] = 289472779] = "INFO_EXTERIOR_DIMENSIONS";
    VehiclePropertyIds[VehiclePropertyIds["INFO_FUEL_CAPACITY"] = 291504388] = "INFO_FUEL_CAPACITY";
    VehiclePropertyIds[VehiclePropertyIds["INFO_FUEL_DOOR_LOCATION"] = 289407240] = "INFO_FUEL_DOOR_LOCATION";
    VehiclePropertyIds[VehiclePropertyIds["INFO_FUEL_TYPE"] = 289472773] = "INFO_FUEL_TYPE";
    VehiclePropertyIds[VehiclePropertyIds["INFO_MAKE"] = 286261505] = "INFO_MAKE";
    VehiclePropertyIds[VehiclePropertyIds["INFO_MODEL"] = 286261506] = "INFO_MODEL";
    VehiclePropertyIds[VehiclePropertyIds["INFO_MODEL_YEAR"] = 289407235] = "INFO_MODEL_YEAR";
    VehiclePropertyIds[VehiclePropertyIds["INFO_MULTI_EV_PORT_LOCATIONS"] = 289472780] = "INFO_MULTI_EV_PORT_LOCATIONS";
    VehiclePropertyIds[VehiclePropertyIds["INFO_VIN"] = 286261504] = "INFO_VIN";
    VehiclePropertyIds[VehiclePropertyIds["INVALID"] = 0] = "INVALID";
    VehiclePropertyIds[VehiclePropertyIds["MIRROR_FOLD"] = 287312709] = "MIRROR_FOLD";
    VehiclePropertyIds[VehiclePropertyIds["MIRROR_LOCK"] = 287312708] = "MIRROR_LOCK";
    VehiclePropertyIds[VehiclePropertyIds["MIRROR_Y_MOVE"] = 339741507] = "MIRROR_Y_MOVE";
    VehiclePropertyIds[VehiclePropertyIds["MIRROR_Y_POS"] = 339741506] = "MIRROR_Y_POS";
    VehiclePropertyIds[VehiclePropertyIds["MIRROR_Z_MOVE"] = 339741505] = "MIRROR_Z_MOVE";
    VehiclePropertyIds[VehiclePropertyIds["MIRROR_Z_POS"] = 339741504] = "MIRROR_Z_POS";
    VehiclePropertyIds[VehiclePropertyIds["NIGHT_MODE"] = 287310855] = "NIGHT_MODE";
    VehiclePropertyIds[VehiclePropertyIds["OBD2_FREEZE_FRAME"] = 299896065] = "OBD2_FREEZE_FRAME";
    VehiclePropertyIds[VehiclePropertyIds["OBD2_FREEZE_FRAME_CLEAR"] = 299896067] = "OBD2_FREEZE_FRAME_CLEAR";
    VehiclePropertyIds[VehiclePropertyIds["OBD2_FREEZE_FRAME_INFO"] = 299896066] = "OBD2_FREEZE_FRAME_INFO";
    VehiclePropertyIds[VehiclePropertyIds["OBD2_LIVE_FRAME"] = 299896064] = "OBD2_LIVE_FRAME";
    VehiclePropertyIds[VehiclePropertyIds["PARKING_BRAKE_AUTO_APPLY"] = 287310851] = "PARKING_BRAKE_AUTO_APPLY";
    VehiclePropertyIds[VehiclePropertyIds["PARKING_BRAKE_ON"] = 287310850] = "PARKING_BRAKE_ON";
    VehiclePropertyIds[VehiclePropertyIds["PERF_ODOMETER"] = 291504644] = "PERF_ODOMETER";
    VehiclePropertyIds[VehiclePropertyIds["PERF_REAR_STEERING_ANGLE"] = 291504656] = "PERF_REAR_STEERING_ANGLE";
    VehiclePropertyIds[VehiclePropertyIds["PERF_STEERING_ANGLE"] = 291504649] = "PERF_STEERING_ANGLE";
    VehiclePropertyIds[VehiclePropertyIds["PERF_VEHICLE_SPEED"] = 291504647] = "PERF_VEHICLE_SPEED";
    VehiclePropertyIds[VehiclePropertyIds["PERF_VEHICLE_SPEED_DISPLAY"] = 291504648] = "PERF_VEHICLE_SPEED_DISPLAY";
    VehiclePropertyIds[VehiclePropertyIds["RANGE_REMAINING"] = 291504904] = "RANGE_REMAINING";
    VehiclePropertyIds[VehiclePropertyIds["READING_LIGHTS_STATE"] = 356519683] = "READING_LIGHTS_STATE";
    VehiclePropertyIds[VehiclePropertyIds["READING_LIGHTS_SWITCH"] = 356519684] = "READING_LIGHTS_SWITCH";
    VehiclePropertyIds[VehiclePropertyIds["TIRE_PRESSURE_DISPLAY_UNITS"] = 289408514] = "TIRE_PRESSURE_DISPLAY_UNITS";
    VehiclePropertyIds[VehiclePropertyIds["TRACTION_CONTROL_ACTIVE"] = 287310859] = "TRACTION_CONTROL_ACTIVE";
    VehiclePropertyIds[VehiclePropertyIds["TURN_SIGNAL_STATE"] = 289408008] = "TURN_SIGNAL_STATE";
    VehiclePropertyIds[VehiclePropertyIds["VEHICLE_MAP_SERVICE"] = 299895808] = "VEHICLE_MAP_SERVICE";
    VehiclePropertyIds[VehiclePropertyIds["WHEEL_TICK"] = 290521862] = "WHEEL_TICK";
    VehiclePropertyIds[VehiclePropertyIds["WINDOW_LOCK"] = 320867268] = "WINDOW_LOCK";
    VehiclePropertyIds[VehiclePropertyIds["WINDOW_MOVE"] = 322964417] = "WINDOW_MOVE";
    VehiclePropertyIds[VehiclePropertyIds["WINDOW_POS"] = 322964416] = "WINDOW_POS";
})(VehiclePropertyIds || (VehiclePropertyIds = {}));

core.registerPlugin('VehiclePropertyPlugin');

const VehiclePropertyToPermissionMap = {};
VehiclePropertyToPermissionMap[VehiclePropertyIds.CABIN_LIGHTS_STATE] = VehiclePermissions.PERMISSION_READ_INTERIOR_LIGHTS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.CABIN_LIGHTS_SWITCH] = VehiclePermissions.PERMISSION_CONTROL_INTERIOR_LIGHTS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.CURRENT_GEAR] = VehiclePermissions.PERMISSION_POWERTRAIN;
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
VehiclePropertyToPermissionMap[VehiclePropertyIds.PERF_VEHICLE_SPEED_DISPLAY] = VehiclePermissions.PERMISSION_READ_DISPLAY_UNITS;
VehiclePropertyToPermissionMap[VehiclePropertyIds.PERF_STEERING_ANGLE] = VehiclePermissions.PERMISSION_READ_STEERING_STATE;
class VehiclePropertyPluginConfiguration extends AutomotiveDataPluginConfiguration {
    constructor(automotiveCapacitorConfig) {
        super();
        this.name = "VehiclePropertyPlugin";
        this.package = "@capacitor-community/aaos-vehicle-property";
        this.javaPackage = "io.ionic.plugins.aaosvehicleproperty";
        this.minCarApiLevel = 4;
        if (!automotiveCapacitorConfig.plugins.VehiclePropertyPlugin) {
            throw new ConfigurationError("AutomotiveCapacitorConfig is unexpectedly missing the VehiclePropertyPlugin property");
        }
        this.addAllowedDataIds(automotiveCapacitorConfig.plugins.VehiclePropertyPlugin.allowedVehicleProperties);
    }
    addAllowedDataIds(allowedDataIds) {
        return super.addAllowedDataIds(allowedDataIds);
    }
    getRequiredPermissions() {
        const permissions = new Set();
        for (const vehicleProperty of this.getAllowedDataIds()) {
            const permissionString = VehiclePropertyToPermissionMap[vehicleProperty];
            if (permissionString) {
                permissions.add(new ApplicationPermission(permissionString));
            }
        }
        return permissions;
    }
    getRequiredFeatures() {
        const features = new Set();
        features.add(new ApplicationFeature("android.hardware.type.automotive", true));
        return features;
    }
}

exports.AndroidAutomotiveManifest = AndroidAutomotiveManifest;
exports.ApplicationFeature = ApplicationFeature;
exports.ApplicationMetaData = ApplicationMetaData;
exports.ApplicationPermission = ApplicationPermission;
exports.AutomotiveDataAnnotation = AutomotiveDataAnnotation;
exports.AutomotiveDataPluginConfiguration = AutomotiveDataPluginConfiguration;
exports.CapacitorPluginAnnotation = CapacitorPluginAnnotation;
exports.ConfigurationError = ConfigurationError;
exports.DataUtilsPluginConfiguration = DataUtilsPluginConfiguration;
exports.PermissionAnnotation = PermissionAnnotation;
exports.VehiclePropertyPluginConfiguration = VehiclePropertyPluginConfiguration;
//# sourceMappingURL=plugin.cjs.js.map

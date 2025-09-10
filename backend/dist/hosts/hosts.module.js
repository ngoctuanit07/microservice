"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostsModule = void 0;
const common_1 = require("@nestjs/common");
const hosts_service_1 = require("./hosts.service");
const hosts_controller_1 = require("./hosts.controller");
const hosts_export_controller_1 = require("./hosts-export.controller");
const hosts_check_controller_1 = require("./hosts-check.controller");
const hosts_notify_controller_1 = require("./hosts-notify.controller");
let HostsModule = class HostsModule {
};
exports.HostsModule = HostsModule;
exports.HostsModule = HostsModule = __decorate([
    (0, common_1.Module)({
        controllers: [hosts_controller_1.HostsController, hosts_export_controller_1.HostsExportController, hosts_check_controller_1.HostsCheckController, hosts_notify_controller_1.HostsNotifyController],
        providers: [hosts_service_1.HostsService],
    })
], HostsModule);
//# sourceMappingURL=hosts.module.js.map
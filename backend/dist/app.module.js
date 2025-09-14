"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const hosts_module_1 = require("./hosts/hosts.module");
const users_module_1 = require("./users/users.module");
const common_module_1 = require("./common/common.module");
const organization_module_1 = require("./organization/organization.module");
const subscription_module_1 = require("./subscription/subscription.module");
const team_module_1 = require("./team/team.module");
const stats_controller_1 = require("./common/stats.controller");
const stats_export_controller_1 = require("./common/stats-export.controller");
const security_health_controller_1 = require("./common/security-health.controller");
const backup_controller_1 = require("./common/backup.controller");
const system_status_controller_1 = require("./common/system-status.controller");
const config_controller_1 = require("./common/config.controller");
const security_scan_controller_1 = require("./common/security-scan.controller");
const access_log_history_controller_1 = require("./common/access-log-history.controller");
const dependency_controller_1 = require("./common/dependency.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            hosts_module_1.HostsModule,
            users_module_1.UsersModule,
            organization_module_1.OrganizationModule,
            subscription_module_1.SubscriptionModule,
            team_module_1.TeamModule
        ],
        controllers: [
            stats_controller_1.StatsController,
            stats_export_controller_1.StatsExportController,
            security_health_controller_1.SecurityHealthController,
            backup_controller_1.BackupController,
            system_status_controller_1.SystemStatusController,
            config_controller_1.ConfigController,
            dependency_controller_1.DependencyController,
            security_scan_controller_1.SecurityScanController,
            access_log_history_controller_1.AccessLogHistoryController
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const access_log_middleware_1 = require("./common/access-log.middleware");
const access_log_history_service_1 = require("./common/access-log-history.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const express_1 = __importDefault(require("express"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    try {
        const accessLogHistoryService = app.get(access_log_history_service_1.AccessLogHistoryService);
        const accessLogMiddleware = new access_log_middleware_1.AccessLogMiddleware(accessLogHistoryService);
        app.use((req, res, next) => {
            try {
                accessLogMiddleware.use(req, res, next);
            }
            catch (error) {
                console.error('Error in access log middleware:', error);
                next();
            }
        });
    }
    catch (error) {
        console.error('Failed to setup access log middleware:', error);
    }
    app.enableCors({
        origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:5173'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: true,
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    try {
        const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
        const devIndex = path.join(__dirname, '..', '..', 'frontend', 'index.html');
        const server = app.getHttpAdapter().getInstance();
        if (fs.existsSync(distPath)) {
            server.use(express_1.default.static(distPath));
            server.get('*', (req, res, next) => {
                if (req.path.startsWith('/api'))
                    return next();
                res.sendFile(path.join(distPath, 'index.html'));
            });
            console.log('Serving frontend from', distPath);
        }
        else if (fs.existsSync(devIndex)) {
            const frontendRoot = path.join(__dirname, '..', '..', 'frontend');
            server.use(express_1.default.static(frontendRoot));
            server.get('*', (req, res, next) => {
                if (req.path.startsWith('/api'))
                    return next();
                res.sendFile(devIndex);
            });
            console.log('Serving frontend index.html from', devIndex);
        }
        else {
            console.log('No frontend found at', distPath, 'or', devIndex);
        }
    }
    catch (err) {
        console.error('Error while configuring static frontend serving:', err);
    }
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
    console.log(`API running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const helmet_1 = require("helmet");
const compression = require("compression");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const access_log_middleware_1 = require("./common/access-log.middleware");
const access_log_history_service_1 = require("./common/access-log-history.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.use((0, helmet_1.default)());
    app.use(compression());
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
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
    console.log(`API running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map
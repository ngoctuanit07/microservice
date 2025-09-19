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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AccessLogHistoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessLogHistoryService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ACCESS_LOG_DIR = 'logs';
const ACCESS_LOG_PATH = path.join(ACCESS_LOG_DIR, 'access-history.log');
let AccessLogHistoryService = AccessLogHistoryService_1 = class AccessLogHistoryService {
    constructor() {
        this.logger = new common_1.Logger(AccessLogHistoryService_1.name);
        this.ensureLogDirectory();
    }
    ensureLogDirectory() {
        try {
            if (!fs.existsSync(ACCESS_LOG_DIR)) {
                fs.mkdirSync(ACCESS_LOG_DIR, { recursive: true });
                this.logger.log(`Created log directory: ${ACCESS_LOG_DIR}`);
            }
        }
        catch (error) {
            this.logger.error(`Error creating log directory: ${error.message || String(error)}`);
        }
    }
    logAccess(entry) {
        try {
            fs.appendFileSync(ACCESS_LOG_PATH, entry + '\n', 'utf8');
        }
        catch (error) {
            this.logger.error(`Error logging access: ${error.message || String(error)}`);
        }
    }
    getHistory() {
        try {
            if (!fs.existsSync(ACCESS_LOG_PATH))
                return [];
            return fs.readFileSync(ACCESS_LOG_PATH, 'utf8');
        }
        catch (error) {
            this.logger.error(`Error reading access history: ${error.message || String(error)}`);
            return [];
        }
    }
};
exports.AccessLogHistoryService = AccessLogHistoryService;
exports.AccessLogHistoryService = AccessLogHistoryService = AccessLogHistoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AccessLogHistoryService);
//# sourceMappingURL=access-log-history.service.js.map
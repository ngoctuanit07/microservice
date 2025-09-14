"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TaskService = class TaskService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBoards() {
        return this.prisma.board.findMany({ include: { tasks: true } });
    }
    async createBoard(name) {
        return this.prisma.board.create({ data: { name } });
    }
    async getTasks(boardId) {
        return this.prisma.task.findMany({ where: { boardId } });
    }
    async createTask(boardId, title, description) {
        return this.prisma.task.create({ data: { boardId, title, description, status: 'todo' } });
    }
    async updateTask(id, data) {
        return this.prisma.task.update({ where: { id }, data });
    }
    async moveTask(id, boardId, status) {
        return this.prisma.task.update({ where: { id }, data: { boardId, status } });
    }
    async deleteTask(id) {
        return this.prisma.task.delete({ where: { id } });
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskService);
//# sourceMappingURL=task.service.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const task_service_1 = require("./task.service");
let TaskController = class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
    }
    getBoards() {
        return this.taskService.getBoards();
    }
    createBoard(name) {
        return this.taskService.createBoard(name);
    }
    getTasks(boardId) {
        return this.taskService.getTasks(Number(boardId));
    }
    createTask(boardId, body) {
        return this.taskService.createTask(Number(boardId), body.title, body.description);
    }
    updateTask(id, body) {
        return this.taskService.updateTask(Number(id), body);
    }
    moveTask(id, body) {
        return this.taskService.moveTask(Number(id), body.boardId, body.status);
    }
    deleteTask(id) {
        return this.taskService.deleteTask(Number(id));
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Get)('boards'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "getBoards", null);
__decorate([
    (0, common_1.Post)('boards'),
    __param(0, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "createBoard", null);
__decorate([
    (0, common_1.Get)('boards/:boardId/tasks'),
    __param(0, (0, common_1.Param)('boardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Post)('boards/:boardId/tasks'),
    __param(0, (0, common_1.Param)('boardId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "createTask", null);
__decorate([
    (0, common_1.Put)('tasks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Put)('tasks/:id/move'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "moveTask", null);
__decorate([
    (0, common_1.Delete)('tasks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "deleteTask", null);
exports.TaskController = TaskController = __decorate([
    (0, common_1.Controller)('task'),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
//# sourceMappingURL=task.controller.js.map